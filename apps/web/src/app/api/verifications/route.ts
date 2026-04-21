import { headers } from "next/headers";
import { desc, eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/db";
import { helperKycDocument, helperProfile, notificationEvent } from "@/db/schema";
import { auth } from "@/lib/auth/server";
import { NO_STORE_HEADERS } from "@/lib/http/cache";

const updateVerificationSchema = z.object({
  documentId: z.string().min(1),
  status: z.enum(["approved", "rejected", "resubmission_required"]),
  rejectionReason: z.string().trim().min(1).optional(),
});

export async function GET() {
  try {
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session?.user || session.user.role !== "admin") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401, headers: NO_STORE_HEADERS });
    }

    const documents = await db.query.helperKycDocument.findMany({
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
      { documents },
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
      where: eq(helperKycDocument.id, parsed.data.documentId),
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
      let nextProfileStatus: "pending" | "approved" | "resubmission_required" | null = null;

      if (document.helperProfileId) {
        const profileDocs = await tx.query.helperKycDocument.findMany({
          where: eq(helperKycDocument.helperProfileId, document.helperProfileId),
          columns: { status: true },
        });

        const hasResubmissionRequired = profileDocs.some(
          (profileDoc) =>
            profileDoc.status === "rejected" ||
            profileDoc.status === "resubmission_required",
        );
        const allApproved =
          profileDocs.length > 0 &&
          profileDocs.every((profileDoc) => profileDoc.status === "approved");

        nextProfileStatus = allApproved
          ? "approved"
          : hasResubmissionRequired
            ? "resubmission_required"
            : "pending";

        const [updatedProfile] = await tx
          .update(helperProfile)
          .set({
            verificationStatus: nextProfileStatus,
            isActive: nextProfileStatus === "approved",
            updatedAt: now,
          })
          .where(eq(helperProfile.id, document.helperProfileId))
          .returning({
            userId: helperProfile.userId,
          });

        helperUserId = updatedProfile?.userId ?? helperUserId;
      }

      const helperNotificationMessage =
        parsed.data.status === "approved"
          ? "One of your verification documents was approved. We will notify you once all required documents are approved."
          : parsed.data.rejectionReason ?? "A verification document needs resubmission.";

      const helperNotificationPayload = {
        documentId: updatedDocument.id,
        helperProfileId: updatedDocument.helperProfileId,
        documentType: updatedDocument.documentType,
        documentStatus: updatedDocument.status,
        profileVerificationStatus: nextProfileStatus,
        rejectionReason: updatedDocument.rejectionReason,
      };

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

      if (helperUserId) {
        events.push({
          id: crypto.randomUUID(),
          userId: helperUserId,
          channel: "in_app",
          templateKey: "verification.document.updated",
          status: "queued",
          payload: {
            message: helperNotificationMessage,
            ...helperNotificationPayload,
          },
        });
      }

      await tx.insert(notificationEvent).values(events);

      return {
        document: updatedDocument,
        profileVerificationStatus: nextProfileStatus,
      };
    });

    if (!updated) {
      return NextResponse.json(
        { message: "Verification document not found." },
        { status: 404, headers: NO_STORE_HEADERS },
      );
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

