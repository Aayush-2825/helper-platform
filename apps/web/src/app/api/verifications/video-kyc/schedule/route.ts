import { headers } from "next/headers";
import { desc, eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/db";
import { helperProfile, user, videoKycSession } from "@/db/schema";
import { auth } from "@/lib/auth/server";
import { NO_STORE_HEADERS } from "@/lib/http/cache";
import { scheduleVideoKYC } from "@/lib/kyc/video-kyc";

const scheduleSchema = z.object({
  helper_profile_id: z.string().min(1),
  scheduled_at: z.string().min(1),
});

export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user || session.user.role !== "admin") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401, headers: NO_STORE_HEADERS });
    }

    const body = await request.json().catch(() => null);
    const parsed = scheduleSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { message: "Invalid request.", errors: parsed.error.flatten() },
        { status: 400, headers: NO_STORE_HEADERS },
      );
    }

    const scheduledAt = new Date(parsed.data.scheduled_at);
    if (Number.isNaN(scheduledAt.getTime())) {
      return NextResponse.json({ message: "Invalid scheduled_at value." }, { status: 400, headers: NO_STORE_HEADERS });
    }

    if (scheduledAt.getTime() < Date.now() - 5 * 60 * 1000) {
      return NextResponse.json({ message: "scheduled_at must be in the future." }, { status: 400, headers: NO_STORE_HEADERS });
    }

    const admin = await db.query.user.findFirst({
      where: eq(user.id, session.user.id),
      columns: {
        email: true,
      },
    });

    if (!admin?.email) {
      return NextResponse.json({ message: "Admin email not found." }, { status: 400, headers: NO_STORE_HEADERS });
    }

    const profile = await db.query.helperProfile.findFirst({
      where: eq(helperProfile.id, parsed.data.helper_profile_id),
      columns: {
        id: true,
        verificationStatus: true,
        videoKycStatus: true,
      },
    });

    if (!profile) {
      return NextResponse.json({ message: "Helper profile not found." }, { status: 404, headers: NO_STORE_HEADERS });
    }

    if (profile.verificationStatus !== "approved") {
      return NextResponse.json(
        { message: "Video KYC can only be scheduled after documents are approved." },
        { status: 400, headers: NO_STORE_HEADERS },
      );
    }

    if (profile.videoKycStatus === "passed") {
      return NextResponse.json(
        { message: "Video KYC already passed for this helper." },
        { status: 400, headers: NO_STORE_HEADERS },
      );
    }

    if (profile.videoKycStatus === "failed") {
      return NextResponse.json(
        { message: "Video KYC already failed for this helper." },
        { status: 400, headers: NO_STORE_HEADERS },
      );
    }

    const latestSession = await db.query.videoKycSession.findFirst({
      where: eq(videoKycSession.helperProfileId, profile.id),
      orderBy: desc(videoKycSession.createdAt),
      columns: {
        status: true,
        attemptNumber: true,
      },
    });

    if (latestSession?.status === "scheduled") {
      return NextResponse.json(
        { message: "A video KYC session is already scheduled for this helper." },
        { status: 409, headers: NO_STORE_HEADERS },
      );
    }

    const nextAttempt = latestSession
      ? latestSession.status === "cancelled"
        ? latestSession.attemptNumber
        : latestSession.attemptNumber + 1
      : 1;

    if (nextAttempt > 3) {
      return NextResponse.json(
        { message: "This helper has exceeded the maximum number of video KYC attempts." },
        { status: 400, headers: NO_STORE_HEADERS },
      );
    }

    await scheduleVideoKYC({
      helperProfileId: profile.id,
      scheduledAt,
      attemptNumber: nextAttempt,
      adminEmail: admin.email,
      adminUserId: session.user.id,
    });

    return NextResponse.json({ ok: true }, { status: 200, headers: NO_STORE_HEADERS });
  } catch (error) {
    console.error("Video KYC schedule error:", error);
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Internal server error" },
      { status: 500, headers: NO_STORE_HEADERS },
    );
  }
}
