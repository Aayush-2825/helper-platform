import { headers } from "next/headers";
import { desc, eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/db";
import { helperKycDocument, helperProfile } from "@/db/schema";
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
    const nextProfileStatus =
      parsed.data.status === "approved" ? "approved" : "resubmission_required";

    const [updatedDocument] = await db
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

    if (document.helperProfileId) {
      await db
        .update(helperProfile)
        .set({
          verificationStatus: nextProfileStatus,
          isActive: parsed.data.status === "approved" ? true : document.helperProfile ? document.helperProfile.verificationStatus === "approved" : false,
          updatedAt: now,
        })
        .where(eq(helperProfile.id, document.helperProfileId));
    }

    return NextResponse.json(
      {
        message: "Verification updated successfully.",
        document: updatedDocument,
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

