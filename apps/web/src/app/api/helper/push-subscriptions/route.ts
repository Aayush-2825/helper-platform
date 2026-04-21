import crypto from "crypto";
import { headers } from "next/headers";
import { and, eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { z } from "zod";

import { db } from "@/db";
import { helperProfile, helperWebPushSubscription } from "@/db/schema";
import { auth } from "@/lib/auth/server";
import { NO_STORE_HEADERS } from "@/lib/http/cache";

const subscriptionSchema = z.object({
  endpoint: z.string().url(),
  expirationTime: z.number().nullable().optional(),
  keys: z.object({
    p256dh: z.string().min(1),
    auth: z.string().min(1),
  }),
});

const deleteSchema = z.object({
  endpoint: z.string().url(),
});

async function requireHelperProfile(userId: string) {
  return db.query.helperProfile.findFirst({
    where: eq(helperProfile.userId, userId),
    columns: { id: true },
  });
}

export async function GET() {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401, headers: NO_STORE_HEADERS });
    }

    if (session.user.role !== "helper") {
      return NextResponse.json({ message: "Forbidden" }, { status: 403, headers: NO_STORE_HEADERS });
    }

    const profile = await requireHelperProfile(session.user.id);
    if (!profile) {
      return NextResponse.json({ message: "Helper profile not found." }, { status: 404, headers: NO_STORE_HEADERS });
    }

    const subscriptions = await db.query.helperWebPushSubscription.findMany({
      where: and(
        eq(helperWebPushSubscription.userId, session.user.id),
        eq(helperWebPushSubscription.helperProfileId, profile.id),
        eq(helperWebPushSubscription.isActive, true),
      ),
      columns: {
        endpoint: true,
        expirationTime: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json({ subscriptions }, { status: 200, headers: NO_STORE_HEADERS });
  } catch (error) {
    console.error("Failed to fetch push subscriptions:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500, headers: NO_STORE_HEADERS });
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401, headers: NO_STORE_HEADERS });
    }

    if (session.user.role !== "helper") {
      return NextResponse.json({ message: "Forbidden" }, { status: 403, headers: NO_STORE_HEADERS });
    }

    const profile = await requireHelperProfile(session.user.id);
    if (!profile) {
      return NextResponse.json({ message: "Helper profile not found." }, { status: 404, headers: NO_STORE_HEADERS });
    }

    const body = await request.json();
    const parsed = subscriptionSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ message: "Invalid subscription payload." }, { status: 400, headers: NO_STORE_HEADERS });
    }

    const { endpoint, expirationTime, keys } = parsed.data;
    const expirationDate = typeof expirationTime === "number" ? new Date(expirationTime) : null;

    await db
      .insert(helperWebPushSubscription)
      .values({
        id: crypto.randomUUID(),
        userId: session.user.id,
        helperProfileId: profile.id,
        endpoint,
        p256dh: keys.p256dh,
        auth: keys.auth,
        expirationTime: expirationDate,
        userAgent: request.headers.get("user-agent"),
        isActive: true,
      })
      .onConflictDoUpdate({
        target: [helperWebPushSubscription.helperProfileId, helperWebPushSubscription.endpoint],
        set: {
          p256dh: keys.p256dh,
          auth: keys.auth,
          expirationTime: expirationDate,
          userAgent: request.headers.get("user-agent"),
          isActive: true,
          updatedAt: new Date(),
        },
      });

    return NextResponse.json({ message: "Push subscription saved." }, { status: 200, headers: NO_STORE_HEADERS });
  } catch (error) {
    console.error("Failed to save push subscription:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500, headers: NO_STORE_HEADERS });
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401, headers: NO_STORE_HEADERS });
    }

    if (session.user.role !== "helper") {
      return NextResponse.json({ message: "Forbidden" }, { status: 403, headers: NO_STORE_HEADERS });
    }

    const profile = await requireHelperProfile(session.user.id);
    if (!profile) {
      return NextResponse.json({ message: "Helper profile not found." }, { status: 404, headers: NO_STORE_HEADERS });
    }

    const body = await request.json();
    const parsed = deleteSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ message: "Invalid unsubscribe payload." }, { status: 400, headers: NO_STORE_HEADERS });
    }

    await db
      .update(helperWebPushSubscription)
      .set({
        isActive: false,
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(helperWebPushSubscription.userId, session.user.id),
          eq(helperWebPushSubscription.helperProfileId, profile.id),
          eq(helperWebPushSubscription.endpoint, parsed.data.endpoint),
        ),
      );

    return NextResponse.json({ message: "Push subscription removed." }, { status: 200, headers: NO_STORE_HEADERS });
  } catch (error) {
    console.error("Failed to remove push subscription:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500, headers: NO_STORE_HEADERS });
  }
}
