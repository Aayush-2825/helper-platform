import { headers } from "next/headers";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { db } from "@/db";
import { helperProfile } from "@/db/schema";
import { auth } from "@/lib/auth/server";
import { NO_STORE_HEADERS } from "@/lib/http/cache";

export async function GET() {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401, headers: NO_STORE_HEADERS });
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
        completedJobs: true,
        bio: true,
        headline: true,
      },
    });

    if (!profile) {
      return NextResponse.json({ message: "Helper profile not found." }, { status: 404, headers: NO_STORE_HEADERS });
    }

    return NextResponse.json({ profile }, { status: 200, headers: NO_STORE_HEADERS });
  } catch (err) {
    console.error("Helper profile fetch error:", err);
    return NextResponse.json({ message: "Internal server error" }, { status: 500, headers: NO_STORE_HEADERS });
  }
}
