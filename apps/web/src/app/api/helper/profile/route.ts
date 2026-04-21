import { headers } from "next/headers";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { connection } from "next/server";
import { db } from "@/db";
import { helperProfile } from "@/db/schema";
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
    await connection();
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401, headers: NO_STORE_HEADERS });
    }

    if (session.user.role !== "helper") {
      return NextResponse.json({ message: "Forbidden" }, { status: 403, headers: NO_STORE_HEADERS });
    }

    const profile = await db.query.helperProfile.findFirst({
      where: eq(helperProfile.userId, session.user.id),
      columns: {
        id: true,
        primaryCategory: true,
        availabilityStatus: true,
        verificationStatus: true,
        serviceCity: true,
        yearsExperience: true,
        averageRating: true,
        totalRatings: true,
        completedJobs: true,
        bio: true,
        headline: true,
        phoneForBookings: true,
        verifiedPhone: true,
        verifiedPhoneDate: true,
        emergencyContactName: true,
        emergencyContactPhone: true,
      },
    });

    if (!profile) {
      return NextResponse.json({ message: "Helper profile not found." }, { status: 404, headers: NO_STORE_HEADERS });
    }

    return NextResponse.json({ profile }, { status: 200, headers: NO_STORE_HEADERS });
  } catch (err) {
    if (!isPrerenderHangError(err)) {
      console.error("Helper profile fetch error:", err);
    }
    return NextResponse.json({ message: "Internal server error" }, { status: 500, headers: NO_STORE_HEADERS });
  }
}
