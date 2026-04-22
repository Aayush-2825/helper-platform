import { headers } from "next/headers";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/db";
import { user, videoKycSession } from "@/db/schema";
import { auth } from "@/lib/auth/server";
import { NO_STORE_HEADERS } from "@/lib/http/cache";
import { cancelVideoKYC } from "@/lib/kyc/video-kyc";

const cancelSchema = z.object({
  session_id: z.string().min(1),
  admin_notes: z.string().trim().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user || session.user.role !== "admin") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401, headers: NO_STORE_HEADERS });
    }

    const body = await request.json().catch(() => null);
    const parsed = cancelSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { message: "Invalid request.", errors: parsed.error.flatten() },
        { status: 400, headers: NO_STORE_HEADERS },
      );
    }

    const current = await db.query.videoKycSession.findFirst({
      where: eq(videoKycSession.id, parsed.data.session_id),
      columns: {
        adminUserId: true,
      },
    });

    const calendarOwnerUserId = current?.adminUserId ?? session.user.id;
    const admin = await db.query.user.findFirst({
      where: eq(user.id, calendarOwnerUserId),
      columns: {
        email: true,
      },
    });

    if (!admin?.email) {
      return NextResponse.json({ message: "Admin email not found." }, { status: 400, headers: NO_STORE_HEADERS });
    }

    await cancelVideoKYC({
      sessionId: parsed.data.session_id,
      adminEmail: admin.email,
      adminUserId: session.user.id,
      adminNotes: parsed.data.admin_notes,
    });

    return NextResponse.json({ ok: true }, { status: 200, headers: NO_STORE_HEADERS });
  } catch (error) {
    console.error("Video KYC cancel error:", error);
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Internal server error" },
      { status: 500, headers: NO_STORE_HEADERS },
    );
  }
}

