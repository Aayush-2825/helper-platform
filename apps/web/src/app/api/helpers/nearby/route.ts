import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { eq, and, ilike } from "drizzle-orm";
import { connection } from "next/server";
import { db } from "@/db";
import { helperProfile, user } from "@/db/schema";
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

export async function GET(request: NextRequest) {
  try {
    await connection();
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401, headers: NO_STORE_HEADERS },
      );
    }

    const statusParam = request.nextUrl.searchParams.get("status");
    const cityParam = request.nextUrl.searchParams.get("city");
    const effectiveStatus = (statusParam ?? "online") as "online" | "offline" | "busy";

    // Only fully activated helpers should be discoverable.
    const conditions = [
      eq(helperProfile.verificationStatus, "approved"),
      eq(helperProfile.videoKycStatus, "passed"),
      eq(helperProfile.isActive, true),
    ];

    if (statusParam !== "all") {
      conditions.push(eq(helperProfile.availabilityStatus, effectiveStatus));
    }

    // Filter by serviceCity when a city param is provided (case-insensitive)
    if (cityParam && cityParam.trim().length > 0) {
      conditions.push(ilike(helperProfile.serviceCity, cityParam.trim()));
    }

    const helpers = await db
      .select({
        id: helperProfile.id,
        userId: helperProfile.userId,
        name: user.name,
        category: helperProfile.primaryCategory,
        rating: helperProfile.averageRating,
        completedJobs: helperProfile.completedJobs,
        availability: helperProfile.availabilityStatus,
        serviceCity: helperProfile.serviceCity,
      })
      .from(helperProfile)
      .innerJoin(user, eq(helperProfile.userId, user.id))
      .where(and(...conditions));

    return NextResponse.json({ helpers }, { status: 200, headers: NO_STORE_HEADERS });
  } catch (err) {
    if (!isPrerenderHangError(err)) {
      console.error("Nearby helpers error:", err);
    }
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500, headers: NO_STORE_HEADERS },
    );
  }
}
