import { NextRequest, NextResponse } from "next/server";
import { and, inArray, isNull, sql } from "drizzle-orm";
import { db } from "@/db";
import { booking } from "@/db/schema";
import { NO_STORE_HEADERS } from "@/lib/http/cache";
import { resumeMatchingIfNeeded } from "@/services/matching/matching";

async function handle(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  const expected = process.env.CRON_SECRET?.trim();

  if (!expected) {
    console.error("CRON_SECRET is not configured on the server");
    return NextResponse.json(
      { message: "Server configuration error" },
      { status: 500, headers: NO_STORE_HEADERS }
    );
  }

  if (authHeader !== `Bearer ${expected}`) {
    return NextResponse.json(
      { message: "Unauthorized" },
      { status: 401, headers: NO_STORE_HEADERS }
    );
  }

  try {
    // Find unassigned matchable bookings created within the last 2 hours that need matching continuation
    const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000);
    const staleBookings = await db.query.booking.findMany({
      where: and(
        inArray(booking.status, ["requested", "matched"]),
        isNull(booking.helperId),
        sql`${booking.createdAt} >= ${twoHoursAgo}`
      ),
      columns: {
        id: true,
      },
      limit: 20,
    });

    let resumedCount = 0;
    for (const b of staleBookings) {
      const resumed = await resumeMatchingIfNeeded(b.id);
      if (resumed) {
        resumedCount++;
      }
    }

    return NextResponse.json(
      {
        ok: true,
        checked: staleBookings.length,
        resumedCount,
      },
      { status: 200, headers: NO_STORE_HEADERS }
    );
  } catch (error) {
    console.error("Resume matching cron failed:", error);
    return NextResponse.json(
      { message: "Resume matching cron failed" },
      { status: 500, headers: NO_STORE_HEADERS }
    );
  }
}

export async function GET(request: NextRequest) {
  return handle(request);
}

export async function POST(request: NextRequest) {
  return handle(request);
}
