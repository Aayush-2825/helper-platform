import { headers } from "next/headers";
import { and, eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/db";
import { booking, paymentTransaction } from "@/db/schema";
import { auth } from "@/lib/auth/server";
import { NO_STORE_HEADERS } from "@/lib/http/cache";
import { canTransitionPaymentStatus } from "@/lib/payments/status";
import { ensureBookingReceipt } from "@/lib/receipts";
import { publishPaymentUpdate } from "@/lib/realtime/client";
import { verifyRazorpayPaymentSignature } from "@/lib/payments/razorpay";

const verifySchema = z.object({
  razorpayOrderId: z.string().min(1),
  razorpayPaymentId: z.string().min(1),
  razorpaySignature: z.string().min(1),
});

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
    const parsed = verifySchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { message: "Invalid payment verification payload", errors: parsed.error.flatten() },
        { status: 400, headers: NO_STORE_HEADERS },
      );
    }

    const { razorpayOrderId, razorpayPaymentId, razorpaySignature } = parsed.data;

    const paymentRecord = await db.query.paymentTransaction.findFirst({
      where: and(
        eq(paymentTransaction.providerOrderId, razorpayOrderId),
        eq(paymentTransaction.customerId, session.user.id),
      ),
    });

    if (!paymentRecord) {
      return NextResponse.json(
        { message: "Payment order not found." },
        { status: 404, headers: NO_STORE_HEADERS },
      );
    }

    const isValid = verifyRazorpayPaymentSignature({
      orderId: razorpayOrderId,
      paymentId: razorpayPaymentId,
      signature: razorpaySignature,
    });

    const bookingRecord = await db.query.booking.findFirst({
      where: eq(booking.id, paymentRecord.bookingId),
      columns: {
        status: true,
        helperId: true,
      },
    });

    if (!bookingRecord) {
      return NextResponse.json(
        { message: "Booking not found." },
        { status: 404, headers: NO_STORE_HEADERS },
      );
    }

    const targets = [paymentRecord.customerId, bookingRecord?.helperId]
      .filter(Boolean) as string[];

    const isAlreadyCaptured =
      paymentRecord.status === "captured" &&
      paymentRecord.providerPaymentId === razorpayPaymentId;

    if (isAlreadyCaptured) {
      return NextResponse.json(
        {
          message: "Payment already verified.",
          payment: paymentRecord,
        },
        { status: 200, headers: NO_STORE_HEADERS },
      );
    }

    if (
      paymentRecord.status === "captured" &&
      paymentRecord.providerPaymentId &&
      paymentRecord.providerPaymentId !== razorpayPaymentId
    ) {
      return NextResponse.json(
        { message: "Payment already captured with a different provider payment id." },
        { status: 409, headers: NO_STORE_HEADERS },
      );
    }

    if (!isValid) {
      if (!canTransitionPaymentStatus(paymentRecord.status, "failed")) {
        return NextResponse.json(
          { message: "Payment verification failed." },
          { status: 400, headers: NO_STORE_HEADERS },
        );
      }

      const [failedPayment] = await db
        .update(paymentTransaction)
        .set({
          status: "failed",
          providerPaymentId: razorpayPaymentId,
          failedAt: new Date(),
          failureCode: "INVALID_SIGNATURE",
          failureReason: "Payment signature verification failed.",
          updatedAt: new Date(),
        })
        .where(
          and(
            eq(paymentTransaction.id, paymentRecord.id),
            eq(paymentTransaction.updatedAt, paymentRecord.updatedAt),
          ),
        )
        .returning();

      if (!failedPayment) {
        return NextResponse.json(
          { message: "Payment verification failed." },
          { status: 400, headers: NO_STORE_HEADERS },
        );
      }

      await publishPaymentUpdate({
        bookingId: failedPayment.bookingId,
        paymentId: failedPayment.id,
        status: failedPayment.status,
        targetUserIds: targets,
        amount: failedPayment.amount,
        currency: failedPayment.currency,
        providerOrderId: razorpayOrderId,
        providerPaymentId: razorpayPaymentId,
        failureCode: "INVALID_SIGNATURE",
        failureReason: "Payment signature verification failed.",
      });

      return NextResponse.json(
        { message: "Payment verification failed." },
        { status: 400, headers: NO_STORE_HEADERS },
      );
    }

    if (!canTransitionPaymentStatus(paymentRecord.status, "captured")) {
      return NextResponse.json(
        { message: "Payment transition rejected." },
        { status: 409, headers: NO_STORE_HEADERS },
      );
    }

    if (bookingRecord.status !== "completed") {
      return NextResponse.json(
        { message: "Payment cannot be captured before booking completion." },
        { status: 409, headers: NO_STORE_HEADERS },
      );
    }

    const [updatedPayment] = await db
      .update(paymentTransaction)
      .set({
        status: "captured",
        providerPaymentId: razorpayPaymentId,
        capturedAt: new Date(),
        failedAt: null,
        failureCode: null,
        failureReason: null,
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(paymentTransaction.id, paymentRecord.id),
          eq(paymentTransaction.updatedAt, paymentRecord.updatedAt),
        ),
      )
      .returning();

    if (!updatedPayment) {
      return NextResponse.json(
        { message: "Payment already verified." },
        { status: 200, headers: NO_STORE_HEADERS },
      );
    }

    await ensureBookingReceipt({
      bookingId: updatedPayment.bookingId,
      paymentTransactionId: updatedPayment.id,
    });

    await publishPaymentUpdate({
      bookingId: updatedPayment.bookingId,
      paymentId: updatedPayment.id,
      status: updatedPayment.status,
      targetUserIds: targets,
      amount: updatedPayment.amount,
      currency: updatedPayment.currency,
      providerOrderId: razorpayOrderId,
      providerPaymentId: razorpayPaymentId,
    });

    return NextResponse.json(
      {
        message: "Payment verified successfully.",
        payment: updatedPayment,
      },
      { status: 200, headers: NO_STORE_HEADERS },
    );
  } catch (error) {
    console.error("Verify payment error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500, headers: NO_STORE_HEADERS },
    );
  }
}
