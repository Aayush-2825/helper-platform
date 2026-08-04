import { headers } from "next/headers";
import { and, desc, eq, inArray, sql } from "drizzle-orm";
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
    const idempotencyKey =
      request.headers.get("x-idempotency-key")?.trim() ||
      `booking-payment:${bookingId}:${session.user.id}:${method}`;

    const paymentResult = await db.transaction(async (tx: typeof db) => {
      await tx.execute(sql`
        select 1
        from ${booking}
        where ${booking.id} = ${bookingId}
          and ${booking.customerId} = ${session.user.id}
        for update
      `);

      const bookingRecord = await tx.query.booking.findFirst({
        where: and(eq(booking.id, bookingId), eq(booking.customerId, session.user.id)),
      });

      if (!bookingRecord) {
        return { kind: "not_found" as const };
      }

      if (bookingRecord.status !== "completed") {
        return { kind: "not_ready" as const };
      }

      const amount = bookingRecord.finalAmount ?? bookingRecord.quotedAmount;
      if (!amount || amount <= 0) {
        return { kind: "invalid_amount" as const };
      }

      const existingCaptured = await tx.query.paymentTransaction.findFirst({
        where: and(
          eq(paymentTransaction.bookingId, bookingId),
          eq(paymentTransaction.customerId, session.user.id),
          eq(paymentTransaction.status, "captured"),
        ),
        columns: { id: true },
      });

      if (existingCaptured) {
        return { kind: "already_paid" as const };
      }

      const existingOpenOrder = await tx.query.paymentTransaction.findFirst({
        where: and(
          eq(paymentTransaction.bookingId, bookingId),
          eq(paymentTransaction.customerId, session.user.id),
          inArray(paymentTransaction.status, ["created", "authorized"]),
        ),
        orderBy: [desc(paymentTransaction.createdAt)],
      });

      if (existingOpenOrder?.providerOrderId) {
        return {
          kind: "existing_order" as const,
          payment: existingOpenOrder,
        };
      }

      const platformFee = computePlatformFee(amount, bookingRecord.commissionRate);
      const helperEarning = Math.max(amount - platformFee, 0);
      const razorpay = getRazorpayClient();

      const order = await razorpay.orders.create({
        amount: toRazorpayAmount(amount),
        currency: bookingRecord.currency || "INR",
        receipt: `booking_${bookingId.slice(0, 18)}_${idempotencyKey.slice(0, 24)}`,
        notes: {
          bookingId,
          customerId: session.user.id,
          idempotencyKey,
        },
      });

      const [createdPayment] = await tx
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
            idempotencyKey,
            razorpayOrderStatus: order.status,
          },
        })
        .returning();

      return {
        kind: "created" as const,
        payment: createdPayment,
        razorpay: {
          orderId: order.id,
          amount: order.amount,
          currency: order.currency,
        },
      };
    });

    if (paymentResult.kind === "not_found") {
      return NextResponse.json(
        { message: "Booking not found." },
        { status: 404, headers: NO_STORE_HEADERS },
      );
    }

    if (paymentResult.kind === "not_ready") {
      return NextResponse.json(
        { message: "Payment is available only after booking completion." },
        { status: 409, headers: NO_STORE_HEADERS },
      );
    }

    if (paymentResult.kind === "invalid_amount") {
      return NextResponse.json(
        { message: "Invalid booking amount for payment." },
        { status: 422, headers: NO_STORE_HEADERS },
      );
    }

    if (paymentResult.kind === "already_paid") {
      return NextResponse.json(
        { message: "Booking is already paid." },
        { status: 409, headers: NO_STORE_HEADERS },
      );
    }

    const { keyId } = getRazorpaySecrets();

    if (paymentResult.kind === "existing_order") {
      return NextResponse.json(
        {
          message: "Existing payment order found.",
          payment: paymentResult.payment,
          razorpay: {
            keyId,
            orderId: paymentResult.payment.providerOrderId,
            amount: toRazorpayAmount(paymentResult.payment.amount),
            currency: paymentResult.payment.currency,
          },
        },
        { status: 200, headers: NO_STORE_HEADERS },
      );
    }

    return NextResponse.json(
      {
        message: "Payment order created successfully.",
        payment: paymentResult.payment,
        razorpay: {
          keyId,
          orderId: paymentResult.razorpay.orderId,
          amount: paymentResult.razorpay.amount,
          currency: paymentResult.razorpay.currency,
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

