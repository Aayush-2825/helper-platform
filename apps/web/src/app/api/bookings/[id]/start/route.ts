import { headers } from "next/headers";
import { eq, and } from "drizzle-orm";
import { NextResponse } from "next/server";
import { db } from "@/db";
import { booking, helperProfile } from "@/db/schema";
import { auth } from "@/lib/auth/server";
import { NO_STORE_HEADERS } from "@/lib/http/cache";
import { publishBookingEvent } from "@/lib/realtime/client";

export async function POST(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const { id: bookingId } = await context.params;
    const now = new Date();

    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401, headers: NO_STORE_HEADERS },
      );
    }

    const profile = await db.query.helperProfile.findFirst({
      where: eq(helperProfile.userId, session.user.id),
      columns: { id: true },
    });

    if (!profile) {
      return NextResponse.json(
        { message: "Helper profile not found." },
        { status: 404, headers: NO_STORE_HEADERS },
      );
    }

    const existingBooking = await db.query.booking.findFirst({
      where: (bookingRecord, { eq: equals }) =>
        equals(bookingRecord.id, bookingId),
    });

    if (!existingBooking) {
      return NextResponse.json(
        { message: "Booking not found." },
        { status: 404, headers: NO_STORE_HEADERS },
      );
    }

    if (existingBooking.helperId !== session.user.id) {
      return NextResponse.json(
        { message: "You are not the assigned helper for this booking." },
        { status: 403, headers: NO_STORE_HEADERS },
      );
    }

    if (existingBooking.status !== "accepted") {
      return NextResponse.json(
        { message: "Booking must be in accepted state to start." },
        { status: 400, headers: NO_STORE_HEADERS },
      );
    }

    const updatedRows = await db
      .update(booking)
      .set({
        status: "in_progress",
        startedAt: now,
        updatedAt: now,
      })
      .where(and(eq(booking.id, bookingId), eq(booking.status, "accepted")))
      .returning();

    if (updatedRows.length === 0) {
      return NextResponse.json(
        { message: "Booking not found or not in accepted state." },
        { status: 400, headers: NO_STORE_HEADERS },
      );
    }

    publishBookingEvent({
      bookingId,
      customerId: existingBooking.customerId,
      helperId: session.user.id,
      eventType: "in_progress",
      data: { startedAt: updatedRows[0].startedAt?.toISOString() },
    });

    return NextResponse.json(
      {
        message: "Booking started successfully.",
        booking: updatedRows[0],
      },
      { status: 200, headers: NO_STORE_HEADERS },
    );
  } catch (err) {
    console.error("Start booking error:", err);

    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500, headers: NO_STORE_HEADERS },
    );
  }
}
