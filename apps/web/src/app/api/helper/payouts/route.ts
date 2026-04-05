import { headers } from "next/headers";
import { and, asc, desc, eq, inArray, sql } from "drizzle-orm";
import { NextRequest } from "next/server";
import { z } from "zod";
import { db } from "@/db";
import { helperProfile, paymentTransaction, payout } from "@/db/schema";
import { auth } from "@/lib/auth/server";
import { apiError, apiSuccess, getRequestId, logApiError } from "@/lib/http/responses";

const createPayoutSchema = z.object({
  amount: z.number().int().positive().optional(),
});

async function getHelperProfileId(userId: string) {
  const profile = await db.query.helperProfile.findFirst({
    where: eq(helperProfile.userId, userId),
    columns: { id: true },
  });

  return profile?.id ?? null;
}

async function getSummary(helperProfileId: string) {
  const [earnings] = await db
    .select({
      grossEarnings: sql<number>`coalesce(sum(${paymentTransaction.amount}), 0)`,
      platformFees: sql<number>`coalesce(sum(${paymentTransaction.platformFee}), 0)`,
      netEarnings: sql<number>`coalesce(sum(${paymentTransaction.helperEarning}), 0)`,
      capturedCount: sql<number>`count(*)`,
    })
    .from(paymentTransaction)
    .where(and(eq(paymentTransaction.helperProfileId, helperProfileId), eq(paymentTransaction.status, "captured")));

  const [reserved] = await db
    .select({
      reservedBalance: sql<number>`coalesce(sum(${payout.amount}), 0)`,
      activePayoutCount: sql<number>`count(*)`,
    })
    .from(payout)
    .where(
      and(
        eq(payout.helperProfileId, helperProfileId),
        inArray(payout.status, ["pending", "processing", "paid"]),
      ),
    );

  const [paidOut] = await db
    .select({
      paidOutAmount: sql<number>`coalesce(sum(${payout.amount}), 0)`,
    })
    .from(payout)
    .where(and(eq(payout.helperProfileId, helperProfileId), eq(payout.status, "paid")));

  const recentPayouts = await db.query.payout.findMany({
    where: eq(payout.helperProfileId, helperProfileId),
    orderBy: desc(payout.createdAt),
    limit: 20,
  });

  return {
    earnings: earnings ?? {
      grossEarnings: 0,
      platformFees: 0,
      netEarnings: 0,
      capturedCount: 0,
    },
    reserved: reserved ?? {
      reservedBalance: 0,
      activePayoutCount: 0,
    },
    paidOut: paidOut ?? {
      paidOutAmount: 0,
    },
    recentPayouts,
  };
}

export async function GET(request: NextRequest) {
  const requestId = getRequestId(request.headers);

  try {
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session?.user || session.user.role !== "helper") {
      return apiError({
        requestId,
        message: "Unauthorized",
        code: "AUTH_UNAUTHORIZED",
        status: 401,
      });
    }

    const helperProfileId = await getHelperProfileId(session.user.id);
    if (!helperProfileId) {
      return apiError({
        requestId,
        message: "Helper profile not found.",
        code: "HELPER_PROFILE_NOT_FOUND",
        status: 404,
      });
    }

    const summaryData = await getSummary(helperProfileId);
    const availableBalance = Math.max(summaryData.earnings.netEarnings - summaryData.reserved.reservedBalance, 0);

    return apiSuccess(
      {
        summary: {
          grossEarnings: summaryData.earnings.grossEarnings,
          platformFees: summaryData.earnings.platformFees,
          netEarnings: summaryData.earnings.netEarnings,
          capturedCount: summaryData.earnings.capturedCount,
          reservedBalance: summaryData.reserved.reservedBalance,
          activePayoutCount: summaryData.reserved.activePayoutCount,
          paidOutAmount: summaryData.paidOut.paidOutAmount,
          availableBalance,
        },
        payouts: summaryData.recentPayouts,
      },
      { requestId, status: 200 },
    );
  } catch (error) {
    logApiError("Helper payout summary error", error, { requestId });
    return apiError({
      requestId,
      message: "Internal server error",
      code: "INTERNAL_SERVER_ERROR",
      status: 500,
    });
  }
}

export async function POST(request: NextRequest) {
  const requestId = getRequestId(request.headers);

  try {
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session?.user || session.user.role !== "helper") {
      return apiError({
        requestId,
        message: "Unauthorized",
        code: "AUTH_UNAUTHORIZED",
        status: 401,
      });
    }

    const helperProfileId = await getHelperProfileId(session.user.id);
    if (!helperProfileId) {
      return apiError({
        requestId,
        message: "Helper profile not found.",
        code: "HELPER_PROFILE_NOT_FOUND",
        status: 404,
      });
    }

    const body = await request.json().catch(() => null);
    const parsed = createPayoutSchema.safeParse(body);
    if (!parsed.success) {
      return apiError({
        requestId,
        message: "Invalid payout request.",
        code: "INVALID_PAYLOAD",
        status: 400,
        details: parsed.error.flatten(),
      });
    }

    const summaryData = await getSummary(helperProfileId);
    const availableBalance = Math.max(summaryData.earnings.netEarnings - summaryData.reserved.reservedBalance, 0);
    const requestedAmount = parsed.data.amount ?? availableBalance;

    if (requestedAmount <= 0) {
      return apiError({
        requestId,
        message: "No available balance to withdraw.",
        code: "NO_AVAILABLE_BALANCE",
        status: 409,
      });
    }

    if (requestedAmount > availableBalance) {
      return apiError({
        requestId,
        message: "Requested payout exceeds available balance.",
        code: "INSUFFICIENT_AVAILABLE_BALANCE",
        status: 409,
      });
    }

    const earliestCaptured = await db.query.paymentTransaction.findFirst({
      where: and(eq(paymentTransaction.helperProfileId, helperProfileId), eq(paymentTransaction.status, "captured")),
      orderBy: asc(paymentTransaction.createdAt),
      columns: { createdAt: true },
    });

    const lastPaidPayout = await db.query.payout.findFirst({
      where: and(eq(payout.helperProfileId, helperProfileId), eq(payout.status, "paid")),
      orderBy: desc(payout.processedAt),
      columns: { processedAt: true, createdAt: true },
    });

    const now = new Date();
    const [createdPayout] = await db
      .insert(payout)
      .values({
        id: crypto.randomUUID(),
        helperProfileId,
        amount: requestedAmount,
        currency: "INR",
        status: "pending",
        provider: "razorpay",
        periodStart: lastPaidPayout?.processedAt ?? lastPaidPayout?.createdAt ?? earliestCaptured?.createdAt ?? now,
        periodEnd: now,
      })
      .returning();

    const nextSummary = await getSummary(helperProfileId);
    const nextAvailableBalance = Math.max(nextSummary.earnings.netEarnings - nextSummary.reserved.reservedBalance, 0);

    return apiSuccess(
      {
        message: "Payout requested successfully.",
        payout: createdPayout,
        summary: {
          grossEarnings: nextSummary.earnings.grossEarnings,
          platformFees: nextSummary.earnings.platformFees,
          netEarnings: nextSummary.earnings.netEarnings,
          capturedCount: nextSummary.earnings.capturedCount,
          reservedBalance: nextSummary.reserved.reservedBalance,
          activePayoutCount: nextSummary.reserved.activePayoutCount,
          paidOutAmount: nextSummary.paidOut.paidOutAmount,
          availableBalance: nextAvailableBalance,
        },
      },
      { requestId, status: 201 },
    );
  } catch (error) {
    logApiError("Helper payout request error", error, { requestId });
    return apiError({
      requestId,
      message: "Internal server error",
      code: "INTERNAL_SERVER_ERROR",
      status: 500,
    });
  }
}
