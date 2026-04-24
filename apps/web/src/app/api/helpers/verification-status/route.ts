import { headers } from "next/headers";
import { and, desc, eq, isNull } from "drizzle-orm";
import { NextResponse } from "next/server";
import { db } from "@/db";
import { helperKycDocument, helperProfile, videoKycSession } from "@/db/schema";
import { auth } from "@/lib/auth/server";
import { NO_STORE_HEADERS } from "@/lib/http/cache";

export async function GET() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401, headers: NO_STORE_HEADERS });
  }

  const profile = await db.query.helperProfile.findFirst({
    where: eq(helperProfile.userId, session.user.id),
    columns: {
      id: true,
      verificationStatus: true,
      videoKycStatus: true,
      isActive: true,
      submittedAt: true,
    },
  });

  if (!profile) {
    return NextResponse.json(
      {
        profile_status: "pending",
        video_kyc_status: "not_required",
        is_active: false,
        submitted_at: null,
        docs: [],
        video_kyc_session: null,
      },
      { status: 200, headers: NO_STORE_HEADERS },
    );
  }

  const docs = await db.query.helperKycDocument.findMany({
    where: and(
      eq(helperKycDocument.helperProfileId, profile.id),
      isNull(helperKycDocument.supersededAt),
    ),
    columns: {
      documentType: true,
      status: true,
      rejectionReason: true,
      expiresAt: true,
    },
    orderBy: desc(helperKycDocument.createdAt),
  });

  const latestSession = await db.query.videoKycSession.findFirst({
    where: eq(videoKycSession.helperProfileId, profile.id),
    orderBy: desc(videoKycSession.createdAt),
    columns: {
      id: true,
      scheduledAt: true,
      attemptNumber: true,
      status: true,
    },
  });

  return NextResponse.json(
    {
      profile_status: profile.verificationStatus,
      video_kyc_status: profile.videoKycStatus,
      is_active: profile.isActive,
      submitted_at: profile.submittedAt?.toISOString() ?? null,
      docs: docs.map((doc) => ({
        type: doc.documentType,
        status: doc.status,
        rejection_reason: doc.rejectionReason,
        expires_at: doc.expiresAt?.toISOString() ?? null,
      })),
      video_kyc_session: latestSession
        ? {
            id: latestSession.id,
            scheduled_at: latestSession.scheduledAt.toISOString(),
            attempt_number: latestSession.attemptNumber,
            status: latestSession.status,
          }
        : null,
    },
    { status: 200, headers: NO_STORE_HEADERS },
  );
}
