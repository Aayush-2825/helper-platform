import { headers } from "next/headers";
import { and, count, desc, eq, gte, ilike, lte, or, sql } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/db";
import { helperProfile, payout, user } from "@/db/schema";
import { auth } from "@/lib/auth/server";
import { NO_STORE_HEADERS } from "@/lib/http/cache";

const querySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(50).default(20),
  status: z.enum(["all", "pending", "processing", "paid", "failed", "reversed"]).default("all"),
  search: z.string().trim().max(120).optional(),
  from: z.string().date().optional(),
  to: z.string().date().optional(),
});

function isPrerenderHangError(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "digest" in error &&
    (error as { digest?: string }).digest === "HANGING_PROMISE_REJECTION"
  );
}

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session?.user || session.user.role !== "admin") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401, headers: NO_STORE_HEADERS });
    }

    const parsed = querySchema.safeParse(Object.fromEntries(request.nextUrl.searchParams.entries()));

    if (!parsed.success) {
      return NextResponse.json(
        { message: "Invalid query params.", errors: parsed.error.flatten() },
        { status: 400, headers: NO_STORE_HEADERS },
      );
    }

    const { page, pageSize, status, search, from, to } = parsed.data;

    const fromDate = from ? new Date(`${from}T00:00:00.000Z`) : undefined;
    const toDate = to ? new Date(`${to}T23:59:59.999Z`) : undefined;

    const where = and(
      status === "all" ? undefined : eq(payout.status, status),
      fromDate ? gte(payout.createdAt, fromDate) : undefined,
      toDate ? lte(payout.createdAt, toDate) : undefined,
      search
        ? or(
            ilike(payout.id, `%${search}%`),
            ilike(user.name, `%${search}%`),
            ilike(user.email, `%${search}%`),
            ilike(helperProfile.id, `%${search}%`),
            ilike(payout.providerTransferId, `%${search}%`),
          )
        : undefined,
    );

    const [{ total }] = await db
      .select({ total: count() })
      .from(payout)
      .innerJoin(helperProfile, eq(payout.helperProfileId, helperProfile.id))
      .innerJoin(user, eq(helperProfile.userId, user.id))
      .where(where);

    const payouts = await db
      .select({
        id: payout.id,
        amount: payout.amount,
        currency: payout.currency,
        status: payout.status,
        provider: payout.provider,
        providerTransferId: payout.providerTransferId,
        processedAt: payout.processedAt,
        failedReason: payout.failedReason,
        periodStart: payout.periodStart,
        periodEnd: payout.periodEnd,
        createdAt: payout.createdAt,
        helperProfileId: helperProfile.id,
        helperUserId: user.id,
        helperName: user.name,
        helperEmail: user.email,
        serviceCity: helperProfile.serviceCity,
        primaryCategory: helperProfile.primaryCategory,
      })
      .from(payout)
      .innerJoin(helperProfile, eq(payout.helperProfileId, helperProfile.id))
      .innerJoin(user, eq(helperProfile.userId, user.id))
      .where(where)
      .orderBy(desc(payout.createdAt))
      .limit(pageSize)
      .offset((page - 1) * pageSize);

    const summaryResult = await db
      .select({
        totalAmount: sql<number>`coalesce(sum(${payout.amount}), 0)`,
        pendingAmount: sql<number>`coalesce(sum(${payout.amount}) filter (where ${payout.status} in ('pending', 'processing')), 0)`,
        paidAmount: sql<number>`coalesce(sum(${payout.amount}) filter (where ${payout.status} = 'paid'), 0)`,
        failedCount: sql<number>`count(*) filter (where ${payout.status} in ('failed', 'reversed'))`,
      })
      .from(payout);

    return NextResponse.json(
      {
        payouts,
        summary: summaryResult[0],
        pagination: {
          page,
          pageSize,
          total,
          totalPages: Math.max(1, Math.ceil(total / pageSize)),
        },
      },
      { status: 200, headers: NO_STORE_HEADERS },
    );
  } catch (error) {
    if (!isPrerenderHangError(error)) {
      console.error("Admin payouts list error:", error);
    }
    return NextResponse.json({ message: "Internal server error" }, { status: 500, headers: NO_STORE_HEADERS });
  }
}
