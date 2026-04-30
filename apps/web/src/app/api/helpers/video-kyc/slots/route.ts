import { eq } from "drizzle-orm";
import { connection, NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { helperProfile } from "@/db/schema";
import { auth } from "@/lib/auth/server";
import { NO_STORE_HEADERS } from "@/lib/http/cache";
import { getVideoKycAvailableSlots } from "@/lib/kyc/video-kyc";

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

    const session = await auth.api.getSession({ headers: request.headers });
    if (!session?.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401, headers: NO_STORE_HEADERS });
    }

    if (session.user.role !== "helper") {
      return NextResponse.json({ message: "Forbidden" }, { status: 403, headers: NO_STORE_HEADERS });
    }

    const profile = await db.query.helperProfile.findFirst({
      where: eq(helperProfile.userId, session.user.id),
      columns: {
        verificationStatus: true,
        videoKycStatus: true,
      },
    });

    if (!profile || profile.verificationStatus !== "approved") {
      return NextResponse.json(
        { message: "Video KYC scheduling is available only after documents are approved." },
        { status: 403, headers: NO_STORE_HEADERS },
      );
    }

    if (!["pending_schedule", "scheduled"].includes(profile.videoKycStatus)) {
      return NextResponse.json(
        { message: "Video KYC scheduling is not available for your current status." },
        { status: 403, headers: NO_STORE_HEADERS },
      );
    }

    const slots = await getVideoKycAvailableSlots();
    return NextResponse.json({ slots }, { status: 200, headers: NO_STORE_HEADERS });
  } catch (error) {
    if (!isPrerenderHangError(error)) {
      console.error("Video KYC slots error:", error);
    }
    return NextResponse.json({ message: "Internal server error" }, { status: 500, headers: NO_STORE_HEADERS });
  }
}
