import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { booking, paymentTransaction } from "@/db/schema";
import { NO_STORE_HEADERS } from "@/lib/http/cache";
import { ensureBookingReceipt } from "@/lib/receipts";
import { verifyRazorpayWebhookSignature } from "@/lib/payments/razorpay";
import { publishPaymentUpdate } from "@/lib/realtime/client";

type RazorpayWebhookEntity = {
  id?: string;
  order_id?: string;
  amount?: number;
  currency?: string;
  status?: string;
  error_code?: string;
  error_description?: string;
  amount_refunded?: number;
};

function fromPaiseToRupees(value?: number): number | null {
  if (typeof value !== "number" || Number.isNaN(value)) {
    return null;
  }

  return Math.round(value / 100);
}

function mapStatusFromEvent(eventName: string, entity: RazorpayWebhookEntity) {
  if (eventName === "payment.authorized") {
    return "authorized" as const;
  }

  if (eventName === "payment.captured") {
    return "captured" as const;
  }

  if (eventName === "payment.failed") {
    return "failed" as const;
  }

  if (eventName === "refund.processed") {
    if ((entity.amount_refunded ?? 0) > 0 && entity.amount_refunded !== entity.amount) {
      return "partially_refunded" as const;
    }

    return "refunded" as const;
  }

  return null;
}

export async function POST(request: NextRequest) {
  try {
    const signature = request.headers.get("x-razorpay-signature");
    if (!signature) {
      return NextResponse.json(
        { message: "Missing webhook signature." },
        { status: 401, headers: NO_STORE_HEADERS },
      );
    }

    const payload = await request.text();
    const isValid = verifyRazorpayWebhookSignature({ payload, signature });
    if (!isValid) {
      return NextResponse.json(
        { message: "Invalid webhook signature." },
        { status: 401, headers: NO_STORE_HEADERS },
      );
    }

    const parsed = JSON.parse(payload) as {
      event?: string;
      payload?: {
        payment?: { entity?: RazorpayWebhookEntity };
        refund?: { entity?: RazorpayWebhookEntity };
      };
    };

    const eventName = parsed.event;
    if (!eventName) {
      return NextResponse.json(
        { message: "Invalid webhook payload." },
        { status: 400, headers: NO_STORE_HEADERS },
      );
    }

    const paymentEntity = parsed.payload?.payment?.entity ?? parsed.payload?.refund?.entity;
    if (!paymentEntity) {
      return NextResponse.json(
        { message: "Webhook payload has no payment entity." },
        { status: 200, headers: NO_STORE_HEADERS },
      );
    }

    const targetStatus = mapStatusFromEvent(eventName, paymentEntity);
    if (!targetStatus) {
      return NextResponse.json(
        { message: "Webhook event ignored." },
        { status: 200, headers: NO_STORE_HEADERS },
      );
    }

    const providerOrderId = paymentEntity.order_id;
    const providerPaymentId = paymentEntity.id;

    if (!providerOrderId && !providerPaymentId) {
      return NextResponse.json(
        { message: "Missing provider identifiers." },
        { status: 200, headers: NO_STORE_HEADERS },
      );
    }

    const paymentRecord = await db.query.paymentTransaction.findFirst({
      where: providerOrderId
        ? eq(paymentTransaction.providerOrderId, providerOrderId)
        : eq(paymentTransaction.providerPaymentId, providerPaymentId!),
    });

    if (!paymentRecord) {
      return NextResponse.json(
        { message: "Payment not found. Ignored." },
        { status: 200, headers: NO_STORE_HEADERS },
      );
    }

    const isAlreadyApplied =
      paymentRecord.status === targetStatus &&
      (!providerPaymentId || paymentRecord.providerPaymentId === providerPaymentId);

    if (isAlreadyApplied) {
      return NextResponse.json(
        { message: "Webhook already processed." },
        { status: 200, headers: NO_STORE_HEADERS },
      );
    }

    const now = new Date();
    const [updatedPayment] = await db
      .update(paymentTransaction)
      .set({
        status: targetStatus,
        providerPaymentId: providerPaymentId ?? paymentRecord.providerPaymentId,
        capturedAt:
          targetStatus === "captured" ? now : paymentRecord.capturedAt,
        failedAt: targetStatus === "failed" ? now : paymentRecord.failedAt,
        failureCode:
          targetStatus === "failed"
            ? (paymentEntity.error_code ?? paymentRecord.failureCode ?? null)
            : paymentRecord.failureCode,
        failureReason:
          targetStatus === "failed"
            ? (paymentEntity.error_description ?? paymentRecord.failureReason ?? null)
            : paymentRecord.failureReason,
        metadata: {
          webhookEvent: eventName,
          webhookProcessedAt: now.toISOString(),
          providerStatus: paymentEntity.status ?? null,
        },
        updatedAt: now,
      })
      .where(eq(paymentTransaction.id, paymentRecord.id))
      .returning();

    await ensureBookingReceipt({
      bookingId: paymentRecord.bookingId,
      paymentTransactionId: updatedPayment.id,
    });

    const bookingRecord = await db.query.booking.findFirst({
      where: eq(booking.id, paymentRecord.bookingId),
      columns: { helperId: true },
    });

    const targetUserIds = [paymentRecord.customerId, bookingRecord?.helperId]
      .filter(Boolean) as string[];

    await publishPaymentUpdate({
      bookingId: paymentRecord.bookingId,
      paymentId: paymentRecord.id,
      status: updatedPayment.status,
      targetUserIds,
      amount: fromPaiseToRupees(paymentEntity.amount) ?? paymentRecord.amount,
      currency: paymentEntity.currency ?? paymentRecord.currency,
      providerOrderId: providerOrderId ?? paymentRecord.providerOrderId ?? undefined,
      providerPaymentId: providerPaymentId ?? paymentRecord.providerPaymentId ?? undefined,
      failureCode: paymentEntity.error_code,
      failureReason: paymentEntity.error_description,
    });

    return NextResponse.json(
      { message: "Webhook processed successfully." },
      { status: 200, headers: NO_STORE_HEADERS },
    );
  } catch (error) {
    console.error("Razorpay webhook error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500, headers: NO_STORE_HEADERS },
    );
  }
}
