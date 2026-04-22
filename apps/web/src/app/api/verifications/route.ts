import { headers } from "next/headers";
import { and, desc, eq, isNull } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/db";
import { helperKycDocument, helperProfile, notificationEvent } from "@/db/schema";
import { auth } from "@/lib/auth/server";
import { NO_STORE_HEADERS } from "@/lib/http/cache";
import { computeProfileStatus } from "@/lib/kyc/status";
import { enqueueHelperNotification } from "@/lib/notifications/helper-events";
import type { NotificationPayload } from "@/lib/notifications/helper-events";

const updateVerificationSchema = z.object({
  documentId: z.string().min(1),
  status: z.enum(["approved", "rejected", "resubmission_required"]),
  rejectionReason: z.string().trim().min(1).optional(),
});

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session?.user || session.user.role !== "admin") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401, headers: NO_STORE_HEADERS });
    }

    const includeHistory = request.nextUrl.searchParams.get("include_history") === "true";

    const documents = await db.query.helperKycDocument.findMany({
      where: includeHistory ? undefined : isNull(helperKycDocument.supersededAt),
      orderBy: desc(helperKycDocument.createdAt),
      with: {
        helperProfile: {
          columns: {
            id: true,
            userId: true,
            primaryCategory: true,
            serviceCity: true,
            verificationStatus: true,
            availabilityStatus: true,
            isActive: true,
            submittedAt: true,
            updatedAt: true,
          },
          with: {
            user: {
              columns: {
                id: true,
                name: true,
                email: true,
                phone: true,
              },
            },
          },
        },
        reviewedByUser: {
          columns: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return NextResponse.json(
      {
        documents: documents.map((document) => {
          const submittedAt = document.helperProfile?.submittedAt ?? null;
          const hoursInQueue =
            submittedAt instanceof Date
              ? Math.max(0, (Date.now() - submittedAt.getTime()) / (1000 * 60 * 60))
              : null;

          return {
            ...document,
            helperProfile: document.helperProfile
              ? {
                  ...document.helperProfile,
                  hoursInQueue,
                }
              : undefined,
          };
        }),
      },
      { status: 200, headers: NO_STORE_HEADERS },
    );
  } catch (error) {
    console.error("Verification list error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500, headers: NO_STORE_HEADERS },
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session?.user || session.user.role !== "admin") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401, headers: NO_STORE_HEADERS });
    }

    const body = await request.json().catch(() => null);
    const parsed = updateVerificationSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { message: "Invalid verification update.", errors: parsed.error.flatten() },
        { status: 400, headers: NO_STORE_HEADERS },
      );
    }

    const document = await db.query.helperKycDocument.findFirst({
      where: and(
        eq(helperKycDocument.id, parsed.data.documentId),
        isNull(helperKycDocument.supersededAt),
      ),
      with: {
        helperProfile: {
          columns: {
            id: true,
            userId: true,
            verificationStatus: true,
          },
        },
      },
    });

    if (!document) {
      return NextResponse.json(
        { message: "Verification document not found." },
        { status: 404, headers: NO_STORE_HEADERS },
      );
    }

    const now = new Date();

    const updated = await db.transaction(async (tx) => {
      const [updatedDocument] = await tx
        .update(helperKycDocument)
        .set({
          status: parsed.data.status,
          reviewedByUserId: session.user.id,
          reviewedAt: now,
          rejectionReason:
            parsed.data.status === "approved"
              ? null
              : parsed.data.rejectionReason ?? "Verification requires another submission.",
          updatedAt: now,
        })
        .where(eq(helperKycDocument.id, document.id))
        .returning();

      if (!updatedDocument) {
        return null;
      }

      let helperUserId = document.helperProfile?.userId ?? null;
      let nextProfileStatus:
        | "pending"
        | "approved"
        | "resubmission_required"
        | "rejected"
        | null = null;

      if (document.helperProfileId) {
        const profileDocs = await tx.query.helperKycDocument.findMany({
          where: and(
            eq(helperKycDocument.helperProfileId, document.helperProfileId),
            isNull(helperKycDocument.supersededAt),
          ),
          columns: { status: true },
        });

        const computed = computeProfileStatus(profileDocs.map((profileDoc) => profileDoc.status));
        nextProfileStatus = computed.verificationStatus;

        const [updatedProfile] = await tx
          .update(helperProfile)
          .set({
            verificationStatus: nextProfileStatus,
            isActive: computed.isActive,
            blockResubmission: computed.blockResubmission,
            videoKycStatus:
              nextProfileStatus === "approved" ? "pending_schedule" : "not_required",
            updatedAt: now,
          })
          .where(eq(helperProfile.id, document.helperProfileId))
          .returning({
            userId: helperProfile.userId,
          });

        helperUserId = updatedProfile?.userId ?? helperUserId;
      }

      const events: Array<{
        id: string;
        userId: string;
        channel: string;
        templateKey: string;
        status: string;
        payload: Record<string, unknown>;
      }> = [
        {
          id: crypto.randomUUID(),
          userId: session.user.id,
          channel: "admin_audit",
          templateKey: "verification.document.reviewed",
          status: "queued",
          payload: {
            action: "verification_document_reviewed",
            documentId: updatedDocument.id,
            helperProfileId: updatedDocument.helperProfileId,
            decision: updatedDocument.status,
            profileVerificationStatus: nextProfileStatus,
            reviewedAt: now.toISOString(),
          },
        },
      ];

      await tx.insert(notificationEvent).values(events);

      const helperNotification: NotificationPayload | null = helperUserId
        ? {
            helperUserId,
            event:
              parsed.data.status === "approved"
                ? "doc_approved"
                : parsed.data.status === "rejected"
                  ? "doc_rejected"
                  : "doc_resubmission_required",
            meta: {
              docTypes: [updatedDocument.documentType],
              rejectionReasons: updatedDocument.rejectionReason
                ? [updatedDocument.rejectionReason]
                : undefined,
            },
          }
        : null;

      return {
        document: updatedDocument,
        profileVerificationStatus: nextProfileStatus,
        helperProfileId: document.helperProfileId,
        helperNotification,
      };
    });

    if (!updated) {
      return NextResponse.json(
        { message: "Verification document not found." },
        { status: 404, headers: NO_STORE_HEADERS },
      );
    }

    if (updated.helperNotification) {
      await enqueueHelperNotification(updated.helperNotification);
    }

    return NextResponse.json(
      {
        message: "Verification updated successfully.",
        document: updated.document,
        profileVerificationStatus: updated.profileVerificationStatus,
      },
      { status: 200, headers: NO_STORE_HEADERS },
    );
  } catch (error) {
    console.error("Verification update error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500, headers: NO_STORE_HEADERS },
    );
  }
}
