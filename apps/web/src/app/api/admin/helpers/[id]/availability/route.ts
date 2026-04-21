import { headers } from "next/headers";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/db";
import { helperProfile, notificationEvent } from "@/db/schema";
import { auth } from "@/lib/auth/server";
import { NO_STORE_HEADERS } from "@/lib/http/cache";

const updateAvailabilitySchema = z.object({
  availabilityStatus: z.enum(["online", "busy", "offline"]),
});

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session?.user || session.user.role !== "admin") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401, headers: NO_STORE_HEADERS });
    }

    const { id } = await params;
    const body = await request.json().catch(() => null);
    const parsed = updateAvailabilitySchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { message: "Invalid availability payload.", errors: parsed.error.flatten() },
        { status: 400, headers: NO_STORE_HEADERS },
      );
    }

    const existing = await db.query.helperProfile.findFirst({
      where: eq(helperProfile.id, id),
      columns: {
        id: true,
        userId: true,
        availabilityStatus: true,
      },
    });

    if (!existing) {
      return NextResponse.json(
        { message: "Helper profile not found." },
        { status: 404, headers: NO_STORE_HEADERS },
      );
    }

    const now = new Date();

    const [updated] = await db.transaction(async (tx) => {
      const [updatedHelper] = await tx
        .update(helperProfile)
        .set({
          availabilityStatus: parsed.data.availabilityStatus,
          updatedAt: now,
        })
        .where(eq(helperProfile.id, id))
        .returning({
          id: helperProfile.id,
          availabilityStatus: helperProfile.availabilityStatus,
          updatedAt: helperProfile.updatedAt,
        });

      if (!updatedHelper) {
        return [null as unknown as typeof updatedHelper];
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
          templateKey: "admin.helper.availability_updated",
          status: "queued",
          payload: {
            action: "helper_availability_updated",
            helperProfileId: existing.id,
            helperUserId: existing.userId,
            previousAvailabilityStatus: existing.availabilityStatus,
            nextAvailabilityStatus: parsed.data.availabilityStatus,
            updatedAt: now.toISOString(),
          },
        },
        {
          id: crypto.randomUUID(),
          userId: existing.userId,
          channel: "in_app",
          templateKey: "helper.availability_updated",
          status: "queued",
          payload: {
            previousAvailabilityStatus: existing.availabilityStatus,
            nextAvailabilityStatus: parsed.data.availabilityStatus,
            message: `Your availability was updated to ${parsed.data.availabilityStatus} by admin.`,
          },
        },
      ];

      await tx.insert(notificationEvent).values(events);

      return [updatedHelper];
    });

    if (!updated) {
      return NextResponse.json(
        { message: "Helper profile not found." },
        { status: 404, headers: NO_STORE_HEADERS },
      );
    }

    return NextResponse.json(
      { message: "Helper availability updated.", helper: updated },
      { status: 200, headers: NO_STORE_HEADERS },
    );
  } catch (error) {
    console.error("Helper availability update error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500, headers: NO_STORE_HEADERS });
  }
}
