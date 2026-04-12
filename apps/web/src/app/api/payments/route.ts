import { headers } from "next/headers";
import { and, desc, eq, inArray } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { NO_STORE_HEADERS } from "@/lib/http/cache";
import { db } from "@/db";
import { booking, helperProfile, paymentTransaction } from "@/db/schema";
import { auth } from "@/lib/auth/server";
import { getRazorpayClient, getRazorpaySecrets } from "@/lib/payments/razorpay";
import { z } from "zod";

const createPaymentSchema = z.object({
  bookingId: z.string().uuid(),
  method: z.enum(["upi", "card", "wallet"]),
});

function computePlatformFee(amount: number, commissionRate?: number | null): number {
  const safeRate = Math.min(Math.max(commissionRate ?? 15, 0), 100);
  return Math.round((amount * safeRate) / 100);
}

function toRazorpayAmount(amountInRupees: number): number {
  return amountInRupees * 100;
}

export async function GET(request: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) {
    return NextResponse.json(
      { message: "Unauthorized" },
      { status: 401, headers: NO_STORE_HEADERS },
    );
  }

  const searchParams = request.nextUrl.searchParams;
  const limit = Math.min(Math.max(Number(searchParams.get("limit") ?? "20"), 1), 100);
  const offset = Math.max(Number(searchParams.get("offset") ?? "0"), 0);
  const bookingId = searchParams.get("bookingId") || undefined;

  if (session.user.role === "admin") {
    const query = db
      .select()
      .from(paymentTransaction)
      .orderBy(desc(paymentTransaction.createdAt))
      .limit(limit)
      .offset(offset);

    const transactions = bookingId
      ? await db
          .select()
          .from(paymentTransaction)
          .where(eq(paymentTransaction.bookingId, bookingId))
          .orderBy(desc(paymentTransaction.createdAt))
          .limit(limit)
          .offset(offset)
      : await query;

    return NextResponse.json(
      { message: "Payments fetched successfully", payments: transactions },
      { status: 200, headers: NO_STORE_HEADERS },
    );
  }

  if (session.user.role === "helper") {
    const profile = await db.query.helperProfile.findFirst({
      where: eq(helperProfile.userId, session.user.id),
      columns: { id: true },
    });

    if (!profile) {
      return NextResponse.json(
        { message: "Helper profile not found." },
        { status: 404, headers: NO_STORE_HEADERS },
      );
    }

    const transactions = await db
      .select()
      .from(paymentTransaction)
      .where(
        bookingId
          ? and(
              eq(paymentTransaction.helperProfileId, profile.id),
              eq(paymentTransaction.bookingId, bookingId),
            )
          : eq(paymentTransaction.helperProfileId, profile.id),
      )
      .orderBy(desc(paymentTransaction.createdAt))
      .limit(limit)
      .offset(offset);

    return NextResponse.json(
      { message: "Payments fetched successfully", payments: transactions },
      { status: 200, headers: NO_STORE_HEADERS },
    );
  }

  const transactions = await db
    .select()
    .from(paymentTransaction)
    .where(
      bookingId
        ? and(
            eq(paymentTransaction.customerId, session.user.id),
            eq(paymentTransaction.bookingId, bookingId),
          )
        : eq(paymentTransaction.customerId, session.user.id),
    )
    .orderBy(desc(paymentTransaction.createdAt))
    .limit(limit)
    .offset(offset);

  return NextResponse.json(
    { message: "Payments fetched successfully", payments: transactions },
    { status: 200, headers: NO_STORE_HEADERS }
  );
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401, headers: NO_STORE_HEADERS },
      );
    }

    const body = await request.json().catch(() => null);
    const parsed = createPaymentSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { message: "Invalid payment request", errors: parsed.error.flatten() },
        { status: 400, headers: NO_STORE_HEADERS },
      );
    }

    const { bookingId, method } = parsed.data;
    const bookingRecord = await db.query.booking.findFirst({
      where: and(eq(booking.id, bookingId), eq(booking.customerId, session.user.id)),
    });

    if (!bookingRecord) {
      return NextResponse.json(
        { message: "Booking not found." },
        { status: 404, headers: NO_STORE_HEADERS },
      );
    }

    if (bookingRecord.status !== "completed") {
      return NextResponse.json(
        { message: "Payment is available only after booking completion." },
        { status: 409, headers: NO_STORE_HEADERS },
      );
    }

    const amount = bookingRecord.finalAmount ?? bookingRecord.quotedAmount;
    if (!amount || amount <= 0) {
      return NextResponse.json(
        { message: "Invalid booking amount for payment." },
        { status: 422, headers: NO_STORE_HEADERS },
      );
    }

    const existingCaptured = await db.query.paymentTransaction.findFirst({
      where: and(
        eq(paymentTransaction.bookingId, bookingId),
        eq(paymentTransaction.customerId, session.user.id),
        eq(paymentTransaction.status, "captured"),
      ),
      columns: { id: true },
    });

    if (existingCaptured) {
      return NextResponse.json(
        { message: "Booking is already paid." },
        { status: 409, headers: NO_STORE_HEADERS },
      );
    }

    const [existingOpenOrder] = await db
      .select()
      .from(paymentTransaction)
      .where(
        and(
          eq(paymentTransaction.bookingId, bookingId),
          eq(paymentTransaction.customerId, session.user.id),
          inArray(paymentTransaction.status, ["created", "authorized"]),
        ),
      )
      .orderBy(desc(paymentTransaction.createdAt))
      .limit(1);

    if (existingOpenOrder?.providerOrderId) {
      const { keyId } = getRazorpaySecrets();
      return NextResponse.json(
        {
          message: "Existing payment order found.",
          payment: existingOpenOrder,
          razorpay: {
            keyId,
            orderId: existingOpenOrder.providerOrderId,
            amount: toRazorpayAmount(existingOpenOrder.amount),
            currency: existingOpenOrder.currency,
          },
        },
        { status: 200, headers: NO_STORE_HEADERS },
      );
    }

    const platformFee = computePlatformFee(amount, bookingRecord.commissionRate);
    const helperEarning = Math.max(amount - platformFee, 0);
    const razorpay = getRazorpayClient();

    const order = await razorpay.orders.create({
      amount: toRazorpayAmount(amount),
      currency: bookingRecord.currency || "INR",
      receipt: `booking_${bookingId.slice(0, 18)}_${Date.now()}`,
      notes: {
        bookingId,
        customerId: session.user.id,
      },
    });

    const [createdPayment] = await db
      .insert(paymentTransaction)
      .values({
        id: crypto.randomUUID(),
        bookingId,
        customerId: session.user.id,
        helperProfileId: bookingRecord.helperProfileId,
        method,
        status: "created",
        provider: "razorpay",
        providerOrderId: order.id,
        amount,
        platformFee,
        helperEarning,
        currency: bookingRecord.currency || "INR",
        metadata: {
          source: "api/payments",
          idempotencyKey: request.headers.get("x-idempotency-key") || null,
          razorpayOrderStatus: order.status,
        },
      })
      .returning();

    const { keyId } = getRazorpaySecrets();

    return NextResponse.json(
      {
        message: "Payment order created successfully.",
        payment: createdPayment,
        razorpay: {
          keyId,
          orderId: order.id,
          amount: order.amount,
          currency: order.currency,
        },
      },
      { status: 201, headers: NO_STORE_HEADERS },
    );
  } catch (error) {
    console.error("Create payment error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500, headers: NO_STORE_HEADERS },
    );
  }
}

