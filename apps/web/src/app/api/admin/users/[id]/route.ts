import { headers } from "next/headers";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/db";
import { helperProfile, notificationEvent, user } from "@/db/schema";
import { auth } from "@/lib/auth/server";
import { NO_STORE_HEADERS } from "@/lib/http/cache";

const updateUserSchema = z.object({
  action: z.enum(["suspend", "activate"]),
});

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session?.user || session.user.role !== "admin") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401, headers: NO_STORE_HEADERS });
    }

    const { id } = await params;
    const body = await request.json().catch(() => null);
    const parsed = updateUserSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { message: "Invalid user update payload.", errors: parsed.error.flatten() },
        { status: 400, headers: NO_STORE_HEADERS },
      );
    }

    const existingUser = await db.query.user.findFirst({
      where: eq(user.id, id),
      columns: { id: true, role: true },
    });

    if (!existingUser) {
      return NextResponse.json({ message: "User not found." }, { status: 404, headers: NO_STORE_HEADERS });
    }

    if (existingUser.role !== "helper") {
      return NextResponse.json(
        { message: "Only helper accounts can be suspended or activated." },
        { status: 400, headers: NO_STORE_HEADERS },
      );
    }

    const helper = await db.query.helperProfile.findFirst({
      where: eq(helperProfile.userId, id),
      columns: { id: true, isActive: true },
    });

    if (!helper) {
      return NextResponse.json(
        { message: "Helper profile not found for this user." },
        { status: 404, headers: NO_STORE_HEADERS },
      );
    }

    const activate = parsed.data.action === "activate";

    const now = new Date();
    await db.transaction(async (tx) => {
      await tx
        .update(helperProfile)
        .set({
          isActive: activate,
          availabilityStatus: "offline",
          updatedAt: now,
        })
        .where(eq(helperProfile.id, helper.id));

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
          templateKey: "admin.helper.account_status_updated",
          status: "queued",
          payload: {
            action: activate ? "helper_account_activated" : "helper_account_suspended",
            helperUserId: id,
            helperProfileId: helper.id,
            updatedAt: now.toISOString(),
          },
        },
        {
          id: crypto.randomUUID(),
          userId: id,
          channel: "in_app",
          templateKey: "helper.account_status_updated",
          status: "queued",
          payload: {
            isActive: activate,
            availabilityStatus: "offline",
            message: activate
              ? "Your helper account has been reactivated by admin. Set your availability when ready."
              : "Your helper account has been suspended by admin. Contact support for details.",
          },
        },
      ];

      await tx.insert(notificationEvent).values(events);
    });

    return NextResponse.json(
      {
        message: activate ? "Helper account activated." : "Helper account suspended.",
      },
      { status: 200, headers: NO_STORE_HEADERS },
    );
  } catch (error) {
    console.error("Admin user update error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500, headers: NO_STORE_HEADERS });
  }
}
