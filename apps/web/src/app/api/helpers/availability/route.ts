import { headers } from "next/headers";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/db";
import { helperProfile } from "@/db/schema";
import { auth } from "@/lib/auth/server";
import { NO_STORE_HEADERS } from "@/lib/http/cache";

const schema = z.object({
  availabilityStatus: z.enum(["online", "offline", "busy"]),
});

export async function PATCH(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session?.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401, headers: NO_STORE_HEADERS });
    }

    if (session.user.role !== "helper") {
      return NextResponse.json({ message: "Forbidden" }, { status: 403, headers: NO_STORE_HEADERS });
    }

    const body = await request.json().catch(() => null);
    const parsed = schema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { message: "Invalid status value.", errors: parsed.error.flatten() },
        { status: 400, headers: NO_STORE_HEADERS },
      );
    }

    const updated = await db
      .update(helperProfile)
      .set({
        availabilityStatus: parsed.data.availabilityStatus,
        updatedAt: new Date(),
      })
      .where(eq(helperProfile.userId, session.user.id))
      .returning({
        id: helperProfile.id,
        availabilityStatus: helperProfile.availabilityStatus,
        updatedAt: helperProfile.updatedAt,
      });

    if (updated.length === 0) {
      return NextResponse.json(
        { message: "Helper profile not found." },
        { status: 404, headers: NO_STORE_HEADERS },
      );
    }

    return NextResponse.json(
      { message: "Status updated.", profile: updated[0] },
      { status: 200, headers: NO_STORE_HEADERS },
    );
  } catch (error) {
    console.error("Helper availability update error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500, headers: NO_STORE_HEADERS },
    );
  }
}

