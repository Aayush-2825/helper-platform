import { headers } from "next/headers";
import { count, gte, sql } from "drizzle-orm";
import { NextResponse } from "next/server";
import { db } from "@/db";
import { booking, dispute, helperProfile, paymentTransaction, review } from "@/db/schema";
import { auth } from "@/lib/auth/server";
import { NO_STORE_HEADERS } from "@/lib/http/cache";

function isPrerenderHangError(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "digest" in error &&
    (error as { digest?: string }).digest === "HANGING_PROMISE_REJECTION"
  );
}

export async function GET() {
  try {
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session?.user || session.user.role !== "admin") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401, headers: NO_STORE_HEADERS });
    }

    const since = new Date();
    since.setDate(since.getDate() - 30);

    const [bookingTotals] = await db
      .select({
        total: count(),
        completed: sql<number>`count(*) filter (where ${booking.status} = 'completed')`,
        cancelled: sql<number>`count(*) filter (where ${booking.status} = 'cancelled')`,
        accepted: sql<number>`count(*) filter (where ${booking.status} in ('accepted', 'in_progress', 'completed'))`,
      })
      .from(booking)
      .where(gte(booking.createdAt, since));

    const [paymentTotals] = await db
      .select({
        total: count(),
        captured: sql<number>`count(*) filter (where ${paymentTransaction.status} = 'captured')`,
        failed: sql<number>`count(*) filter (where ${paymentTransaction.status} = 'failed')`,
        gross: sql<number>`coalesce(sum(${paymentTransaction.amount}), 0)`,
      })
      .from(paymentTransaction)
      .where(gte(paymentTransaction.createdAt, since));

    const [helperTotals] = await db
      .select({
        total: count(),
        approved: sql<number>`count(*) filter (where ${helperProfile.verificationStatus} = 'approved')`,
        online: sql<number>`count(*) filter (where ${helperProfile.availabilityStatus} = 'online')`,
      })
      .from(helperProfile);

    const [disputeTotals] = await db
      .select({
        total: count(),
        open: sql<number>`count(*) filter (where ${dispute.status} = 'open')`,
        resolved: sql<number>`count(*) filter (where ${dispute.status} = 'resolved')`,
      })
      .from(dispute)
      .where(gte(dispute.createdAt, since));

    const [reviewTotals] = await db
      .select({
        total: count(),
        averageRating: sql<string>`coalesce(round(avg(${review.rating})::numeric, 2), 0)`,
      })
      .from(review)
      .where(gte(review.createdAt, since));

    return NextResponse.json(
      {
        metrics: {
          bookings: bookingTotals,
          payments: paymentTotals,
          helpers: helperTotals,
          disputes: disputeTotals,
          reviews: reviewTotals,
        },
      },
      { status: 200, headers: NO_STORE_HEADERS },
    );
  } catch (error) {
    if (!isPrerenderHangError(error)) {
      console.error("Admin analytics error:", error);
    }
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500, headers: NO_STORE_HEADERS },
    );
  }
}

