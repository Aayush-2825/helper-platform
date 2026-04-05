import { headers } from "next/headers";
import { and, count, desc, eq, ilike, inArray, or, sql } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/db";
import { booking, helperProfile, paymentTransaction, user } from "@/db/schema";
import { auth } from "@/lib/auth/server";
import { NO_STORE_HEADERS } from "@/lib/http/cache";

const querySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(50).default(20),
  search: z.string().trim().max(120).optional(),
  role: z.enum(["all", "admin", "helper", "customer", "user"]).default("all"),
});

function normalizeRole(value?: string | null) {
  if (value === "admin" || value === "helper" || value === "customer") {
    return value;
  }

  return "customer";
}

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

    const { page, pageSize, search, role } = parsed.data;
    const where = and(
      role === "all"
        ? undefined
        : role === "customer"
          ? or(eq(user.role, "customer"), eq(user.role, "user"))
          : eq(user.role, role),
      search
        ? or(
            ilike(user.name, `%${search}%`),
            ilike(user.email, `%${search}%`),
            ilike(user.id, `%${search}%`),
          )
        : undefined,
    );

    const [{ total }] = await db.select({ total: count() }).from(user).where(where);

    const rows = await db
      .select({
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        emailVerified: user.emailVerified,
        twoFactorEnabled: user.twoFactorEnabled,
        createdAt: user.createdAt,
      })
      .from(user)
      .where(where)
      .orderBy(desc(user.createdAt))
      .limit(pageSize)
      .offset((page - 1) * pageSize);

    const userIds = rows.map((row) => row.id);

    const helperProfiles = userIds.length
      ? await db
          .select({
            userId: helperProfile.userId,
            helperProfileId: helperProfile.id,
            isActive: helperProfile.isActive,
            verificationStatus: helperProfile.verificationStatus,
            availabilityStatus: helperProfile.availabilityStatus,
            serviceCity: helperProfile.serviceCity,
            averageRating: helperProfile.averageRating,
            completedJobs: helperProfile.completedJobs,
          })
          .from(helperProfile)
          .where(inArray(helperProfile.userId, userIds))
      : [];

    const bookingCounts = userIds.length
      ? await db
          .select({
            userId: booking.customerId,
            bookingCount: count(),
          })
          .from(booking)
          .where(inArray(booking.customerId, userIds))
          .groupBy(booking.customerId)
      : [];

    const spending = userIds.length
      ? await db
          .select({
            userId: paymentTransaction.customerId,
            totalSpent: sql<number>`coalesce(sum(${paymentTransaction.amount}), 0)`,
          })
          .from(paymentTransaction)
          .where(
            and(
              eq(paymentTransaction.status, "captured"),
              inArray(paymentTransaction.customerId, userIds),
            ),
          )
          .groupBy(paymentTransaction.customerId)
      : [];

    const helperByUserId = new Map(helperProfiles.map((profile) => [profile.userId, profile]));
    const bookingByUserId = new Map(bookingCounts.map((item) => [item.userId, item.bookingCount]));
    const spendByUserId = new Map(spending.map((item) => [item.userId, Number(item.totalSpent)]));

    const users = rows.map((row) => {
      const helper = helperByUserId.get(row.id);
      const normalizedRole = normalizeRole(row.role);
      const status = helper
        ? helper.isActive
          ? helper.verificationStatus === "approved"
            ? "active"
            : "pending"
          : "suspended"
        : "active";

      return {
        id: row.id,
        name: row.name,
        email: row.email,
        phone: row.phone,
        role: normalizedRole,
        emailVerified: row.emailVerified,
        twoFactorEnabled: Boolean(row.twoFactorEnabled),
        createdAt: row.createdAt,
        status,
        bookingCount: bookingByUserId.get(row.id) ?? 0,
        totalSpent: spendByUserId.get(row.id) ?? 0,
        helperProfile: helper
          ? {
              id: helper.helperProfileId,
              isActive: helper.isActive,
              verificationStatus: helper.verificationStatus,
              availabilityStatus: helper.availabilityStatus,
              serviceCity: helper.serviceCity,
              averageRating: Number(helper.averageRating),
              completedJobs: helper.completedJobs,
            }
          : null,
      };
    });

    return NextResponse.json(
      {
        users,
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
      console.error("Admin users list error:", error);
    }
    return NextResponse.json({ message: "Internal server error" }, { status: 500, headers: NO_STORE_HEADERS });
  }
}
