import { headers } from "next/headers";
import { and, eq } from "drizzle-orm";
import { NextRequest } from "next/server";
import { z } from "zod";
import { db } from "@/db";
import { payout } from "@/db/schema";
import { auth } from "@/lib/auth/server";
import { apiError, apiSuccess, getRequestId, logApiError } from "@/lib/http/responses";
import {
  canTransitionPayoutStatus,
  payoutStatusRequiresFailureReason,
  payoutStatusRequiresTransferReference,
  type PayoutStatus,
} from "@/lib/payouts/transitions";

const patchPayoutSchema = z.object({
  status: z.enum(["processing", "paid", "failed", "reversed"]),
  providerTransferId: z.string().trim().min(1).max(120).optional(),
  failedReason: z.string().trim().min(3).max(500).optional(),
});

function isPrerenderHangError(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "digest" in error &&
    (error as { digest?: string }).digest === "HANGING_PROMISE_REJECTION"
  );
}

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const requestId = getRequestId(request.headers);

  try {
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session?.user || session.user.role !== "admin") {
      return apiError({
        requestId,
        message: "Unauthorized",
        code: "AUTH_UNAUTHORIZED",
        status: 401,
      });
    }

    const { id } = await context.params;
    const body = await request.json().catch(() => null);
    const parsed = patchPayoutSchema.safeParse(body);

    if (!parsed.success) {
      return apiError({
        requestId,
        message: "Invalid payout update payload.",
        code: "INVALID_PAYLOAD",
        status: 400,
        details: parsed.error.flatten(),
      });
    }

    const existing = await db.query.payout.findFirst({
      where: eq(payout.id, id),
    });

    if (!existing) {
      return apiError({
        requestId,
        message: "Payout not found.",
        code: "PAYOUT_NOT_FOUND",
        status: 404,
      });
    }

    const nextStatus = parsed.data.status;
    const currentStatus = existing.status as PayoutStatus;

    if (!canTransitionPayoutStatus(currentStatus, nextStatus)) {
      return apiError({
        requestId,
        message: `Invalid payout transition: ${currentStatus} -> ${nextStatus}.`,
        code: "INVALID_PAYOUT_TRANSITION",
        status: 409,
      });
    }

    if (
      payoutStatusRequiresTransferReference(nextStatus) &&
      !parsed.data.providerTransferId?.trim() &&
      !existing.providerTransferId
    ) {
      return apiError({
        requestId,
        message: "providerTransferId is required when marking payout as paid.",
        code: "TRANSFER_REFERENCE_REQUIRED",
        status: 400,
      });
    }

    if (payoutStatusRequiresFailureReason(nextStatus) && !parsed.data.failedReason?.trim()) {
      return apiError({
        requestId,
        message: "failedReason is required for failed or reversed payouts.",
        code: "FAILED_REASON_REQUIRED",
        status: 400,
      });
    }

    const now = new Date();
    const shouldSetProcessedAt = nextStatus === "paid" || nextStatus === "failed" || nextStatus === "reversed";

    const [updated] = await db
      .update(payout)
      .set({
        status: nextStatus,
        providerTransferId: parsed.data.providerTransferId?.trim() ?? existing.providerTransferId,
        failedReason: payoutStatusRequiresFailureReason(nextStatus)
          ? parsed.data.failedReason?.trim() ?? existing.failedReason
          : null,
        processedAt: shouldSetProcessedAt ? now : null,
        updatedAt: now,
      })
      .where(and(eq(payout.id, id), eq(payout.status, currentStatus)))
      .returning();

    if (!updated) {
      return apiError({
        requestId,
        message: "Payout was updated by another admin. Refresh and try again.",
        code: "PAYOUT_CONFLICT",
        status: 409,
      });
    }

    return apiSuccess(
      {
        message: "Payout updated successfully.",
        payout: updated,
      },
      { requestId, status: 200 },
    );
  } catch (error) {
    if (!isPrerenderHangError(error)) {
      logApiError("Admin payout update error", error, { requestId });
    }
    return apiError({
      requestId,
      message: "Internal server error",
      code: "INTERNAL_SERVER_ERROR",
      status: 500,
    });
  }
}
