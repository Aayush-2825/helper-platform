import { headers } from "next/headers";
import { and, count, desc, eq, ilike, or, sql } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/db";
import { helperProfile, user } from "@/db/schema";
import { auth } from "@/lib/auth/server";
import { NO_STORE_HEADERS } from "@/lib/http/cache";

const querySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(50).default(20),
  search: z.string().trim().max(120).optional(),
  verificationStatus: z
    .enum(["all", "pending", "approved", "rejected", "resubmission_required"])
    .default("all"),
  availabilityStatus: z.enum(["all", "online", "busy", "offline"]).default("all"),
  active: z.enum(["all", "true", "false"]).default("all"),
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

    const { page, pageSize, search, verificationStatus, availabilityStatus, active } = parsed.data;

    const where = and(
      eq(user.role, "helper"),
      verificationStatus === "all" ? undefined : eq(helperProfile.verificationStatus, verificationStatus),
      availabilityStatus === "all" ? undefined : eq(helperProfile.availabilityStatus, availabilityStatus),
      active === "all" ? undefined : eq(helperProfile.isActive, active === "true"),
      search
        ? or(
            ilike(user.name, `%${search}%`),
            ilike(user.email, `%${search}%`),
            ilike(helperProfile.serviceCity, `%${search}%`),
            ilike(helperProfile.primaryCategory, `%${search}%`),
            ilike(helperProfile.id, `%${search}%`),
          )
        : undefined,
    );

    const [{ total }] = await db
      .select({ total: count() })
      .from(helperProfile)
      .innerJoin(user, eq(helperProfile.userId, user.id))
      .where(where);

    const rows = await db
      .select({
        id: helperProfile.id,
        userId: helperProfile.userId,
        name: user.name,
        email: user.email,
        phone: user.phone,
        primaryCategory: helperProfile.primaryCategory,
        serviceCity: helperProfile.serviceCity,
        verificationStatus: helperProfile.verificationStatus,
        availabilityStatus: helperProfile.availabilityStatus,
        isActive: helperProfile.isActive,
        averageRating: helperProfile.averageRating,
        totalRatings: helperProfile.totalRatings,
        completedJobs: helperProfile.completedJobs,
        qualityScore: helperProfile.qualityScore,
        createdAt: helperProfile.createdAt,
        updatedAt: helperProfile.updatedAt,
      })
      .from(helperProfile)
      .innerJoin(user, eq(helperProfile.userId, user.id))
      .where(where)
      .orderBy(desc(helperProfile.createdAt))
      .limit(pageSize)
      .offset((page - 1) * pageSize);

    const helpers = rows.map((row) => ({
      ...row,
      averageRating: Number(row.averageRating),
      jobsLabel: row.completedJobs > 0 ? `${row.completedJobs} jobs` : "New helper",
      statusLabel: row.isActive
        ? row.verificationStatus === "approved"
          ? "active"
          : "pending"
        : "suspended",
    }));

    const summary = await db
      .select({
        total: count(),
        active: sql<number>`count(*) filter (where ${helperProfile.isActive} = true)`,
        approved: sql<number>`count(*) filter (where ${helperProfile.verificationStatus} = 'approved')`,
        online: sql<number>`count(*) filter (where ${helperProfile.availabilityStatus} = 'online')`,
      })
      .from(helperProfile);

    return NextResponse.json(
      {
        helpers,
        summary: summary[0],
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
      console.error("Admin helpers list error:", error);
    }
    return NextResponse.json({ message: "Internal server error" }, { status: 500, headers: NO_STORE_HEADERS });
  }
}
