import { headers } from "next/headers";
import { asc, eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/db";
import { helperProfile, videoKycSession } from "@/db/schema";
import { auth } from "@/lib/auth/server";
import { NO_STORE_HEADERS } from "@/lib/http/cache";
import { scheduleVideoKYC } from "@/lib/kyc/video-kyc";
import { enqueueHelperNotification } from "@/lib/notifications/helper-events";

const updateVideoKycSchema = z.object({
  session_id: z.string().min(1),
  outcome: z.enum(["passed", "failed", "no_show"]),
  admin_notes: z.string().trim().optional(),
});

export async function GET() {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user || session.user.role !== "admin") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401, headers: NO_STORE_HEADERS });
    }

    const sessions = await db.query.videoKycSession.findMany({
      where: eq(videoKycSession.status, "scheduled"),
      orderBy: asc(videoKycSession.scheduledAt),
      with: {
        helperProfile: {
          columns: {
            id: true,
            userId: true,
          },
          with: {
            user: {
              columns: {
                name: true,
                email: true,
              },
            },
          },
        },
      },
    });

    return NextResponse.json({ sessions }, { status: 200, headers: NO_STORE_HEADERS });
  } catch (error) {
    console.error("Video KYC list error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500, headers: NO_STORE_HEADERS });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user || session.user.role !== "admin") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401, headers: NO_STORE_HEADERS });
    }

    const body = await request.json().catch(() => null);
    const parsed = updateVideoKycSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { message: "Invalid request.", errors: parsed.error.flatten() },
        { status: 400, headers: NO_STORE_HEADERS },
      );
    }

    const kycSession = await db.query.videoKycSession.findFirst({
      where: eq(videoKycSession.id, parsed.data.session_id),
      with: {
        helperProfile: {
          columns: {
            id: true,
            userId: true,
          },
        },
      },
    });

    if (!kycSession) {
      return NextResponse.json({ message: "Video KYC session not found." }, { status: 404, headers: NO_STORE_HEADERS });
    }

    await db
      .update(videoKycSession)
      .set({
        status: parsed.data.outcome,
        completedAt: new Date(),
        adminNotes: parsed.data.admin_notes ?? null,
        adminUserId: session.user.id,
      })
      .where(eq(videoKycSession.id, parsed.data.session_id));

    if (parsed.data.outcome === "passed") {
      await db
        .update(helperProfile)
        .set({
          videoKycStatus: "passed",
          isActive: true,
          blockResubmission: false,
          updatedAt: new Date(),
        })
        .where(eq(helperProfile.id, kycSession.helperProfileId));

      await enqueueHelperNotification({
        helperUserId: kycSession.helperProfile.userId,
        event: "video_kyc_passed",
        meta: {},
      });
    } else if (parsed.data.outcome === "failed") {
      await db
        .update(helperProfile)
        .set({
          videoKycStatus: "failed",
          isActive: false,
          blockResubmission: true,
          updatedAt: new Date(),
        })
        .where(eq(helperProfile.id, kycSession.helperProfileId));

      await enqueueHelperNotification({
        helperUserId: kycSession.helperProfile.userId,
        event: "video_kyc_failed",
        meta: { adminNotes: parsed.data.admin_notes },
      });
    } else {
      if (kycSession.attemptNumber < 3) {
        await scheduleVideoKYC(kycSession.helperProfileId, kycSession.attemptNumber + 1);
      } else {
        await db
          .update(helperProfile)
          .set({
            videoKycStatus: "failed",
            isActive: false,
            blockResubmission: true,
            updatedAt: new Date(),
          })
          .where(eq(helperProfile.id, kycSession.helperProfileId));

        await enqueueHelperNotification({
          helperUserId: kycSession.helperProfile.userId,
          event: "video_kyc_failed",
          meta: { adminNotes: "3 consecutive no-shows" },
        });
      }
    }

    return NextResponse.json({ ok: true }, { status: 200, headers: NO_STORE_HEADERS });
  } catch (error) {
    console.error("Video KYC update error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500, headers: NO_STORE_HEADERS });
  }
}
