import { randomUUID } from "crypto";
import { headers } from "next/headers";
import { and, asc, eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/db";
import { helperAvailabilitySlot, helperProfile } from "@/db/schema";
import { auth } from "@/lib/auth/server";
import { NO_STORE_HEADERS } from "@/lib/http/cache";

const slotSchema = z
  .object({
    dayOfWeek: z.number().int().min(0).max(6),
    startMinute: z.number().int().min(0).max(1439),
    endMinute: z.number().int().min(0).max(1439),
    timezone: z.string().trim().min(1).max(64),
    isActive: z.boolean().default(true),
  })
  .refine((slot) => slot.startMinute !== slot.endMinute, {
    message: "startMinute and endMinute cannot be equal.",
  })
  .refine((slot) => {
    try {
      new Intl.DateTimeFormat("en-US", { timeZone: slot.timezone });
      return true;
    } catch {
      return false;
    }
  }, {
    message: "Invalid timezone.",
    path: ["timezone"],
  });

const upsertSchema = z.object({
  slots: z.array(slotSchema).max(84),
});

async function requireHelperProfile(userId: string) {
  const profiles = await db
    .select({ id: helperProfile.id })
    .from(helperProfile)
    .where(eq(helperProfile.userId, userId))
    .limit(1);

  return profiles[0] ?? null;
}

export async function GET() {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401, headers: NO_STORE_HEADERS });
    }

    const profile = await requireHelperProfile(session.user.id);
    if (!profile) {
      return NextResponse.json({ message: "Helper profile not found." }, { status: 404, headers: NO_STORE_HEADERS });
    }

    const slots = await db.query.helperAvailabilitySlot.findMany({
      where: and(eq(helperAvailabilitySlot.helperProfileId, profile.id)),
      orderBy: [
        asc(helperAvailabilitySlot.dayOfWeek),
        asc(helperAvailabilitySlot.startMinute),
      ],
      columns: {
        id: true,
        dayOfWeek: true,
        startMinute: true,
        endMinute: true,
        timezone: true,
        isActive: true,
      },
    });

    return NextResponse.json({ slots }, { status: 200, headers: NO_STORE_HEADERS });
  } catch (err) {
    console.error("Availability slots load error:", err);
    return NextResponse.json({ message: "Internal server error" }, { status: 500, headers: NO_STORE_HEADERS });
  }
}

export async function PUT(request: Request) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401, headers: NO_STORE_HEADERS });
    }

    const body = await request.json();
    const parsed = upsertSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ message: "Invalid availability slot payload." }, { status: 400, headers: NO_STORE_HEADERS });
    }

    const profile = await requireHelperProfile(session.user.id);
    if (!profile) {
      return NextResponse.json({ message: "Helper profile not found." }, { status: 404, headers: NO_STORE_HEADERS });
    }

    const duplicateKeySet = new Set<string>();
    for (const slot of parsed.data.slots) {
      const key = `${slot.dayOfWeek}:${slot.startMinute}:${slot.endMinute}`;
      if (duplicateKeySet.has(key)) {
        return NextResponse.json(
          { message: "Duplicate slots with the same day and time range are not allowed." },
          { status: 409, headers: NO_STORE_HEADERS },
        );
      }
      duplicateKeySet.add(key);
    }

    await db.transaction(async (tx) => {
      await tx
        .delete(helperAvailabilitySlot)
        .where(eq(helperAvailabilitySlot.helperProfileId, profile.id));

      if (parsed.data.slots.length > 0) {
        await tx.insert(helperAvailabilitySlot).values(
          parsed.data.slots.map((slot) => ({
            id: randomUUID(),
            helperProfileId: profile.id,
            dayOfWeek: slot.dayOfWeek,
            startMinute: slot.startMinute,
            endMinute: slot.endMinute,
            timezone: slot.timezone,
            isActive: slot.isActive,
          })),
        );
      }
    });

    const slots = await db.query.helperAvailabilitySlot.findMany({
      where: eq(helperAvailabilitySlot.helperProfileId, profile.id),
      orderBy: [
        asc(helperAvailabilitySlot.dayOfWeek),
        asc(helperAvailabilitySlot.startMinute),
      ],
      columns: {
        id: true,
        dayOfWeek: true,
        startMinute: true,
        endMinute: true,
        timezone: true,
        isActive: true,
      },
    });

    return NextResponse.json({ message: "Availability slots saved.", slots }, { status: 200, headers: NO_STORE_HEADERS });
  } catch (err) {
    console.error("Availability slots update error:", err);
    return NextResponse.json({ message: "Internal server error" }, { status: 500, headers: NO_STORE_HEADERS });
  }
}
