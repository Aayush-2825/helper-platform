import { headers } from "next/headers";
import { eq, and } from "drizzle-orm";
import { NextResponse } from "next/server";
import { db } from "@/db";
import { booking, bookingStatusEvent, helperProfile } from "@/db/schema";
import { auth } from "@/lib/auth/server";
import { NO_STORE_HEADERS } from "@/lib/http/cache";
import { publishBookingEvent } from "@/lib/realtime/client";

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const { id: bookingId } = await context.params;
    const body = await request.json().catch(() => ({}));
    const otp = body.otp;

    if (!otp) {
      return NextResponse.json(
        { message: "OTP is required to complete the booking." },
        { status: 400, headers: NO_STORE_HEADERS },
      );
    }
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

    if (existingBooking.status !== "in_progress") {
      return NextResponse.json(
        { message: "Booking must be in in_progress state to complete." },
        { status: 400, headers: NO_STORE_HEADERS },
      );
    }

    // ✅ OTP Verification
    if (existingBooking.completeCode !== otp) {
      return NextResponse.json(
        { message: "Invalid OTP. Please ask the customer for the correct Completion Code." },
        { status: 400, headers: NO_STORE_HEADERS },
      );
    }

    const updatedBooking = await db.transaction(async (tx) => {
      const [row] = await tx
        .update(booking)
        .set({
          status: "completed",
          completedAt: now,
          updatedAt: now,
        })
        .where(and(eq(booking.id, bookingId), eq(booking.status, "in_progress")))
        .returning();

      if (!row) {
        return null;
      }

      await tx.insert(bookingStatusEvent).values({
        id: crypto.randomUUID(),
        bookingId,
        status: "completed",
        actorUserId: session.user.id,
        note: "Helper completed booking",
        metadata: {
          completedAt: row.completedAt?.toISOString(),
        },
      });

      return row;
    });

    if (!updatedBooking) {
      return NextResponse.json(
        { message: "Booking not found or not in in_progress state." },
        { status: 400, headers: NO_STORE_HEADERS },
      );
    }

    await publishBookingEvent({
      bookingId,
      customerId: existingBooking.customerId,
      helperId: session.user.id,
      eventType: "completed",
      data: {
        completedAt: updatedBooking.completedAt?.toISOString(),
        booking: updatedBooking,
      },
    });

    return NextResponse.json(
      {
        message: "Booking completed successfully.",
        booking: updatedBooking,
      },
      { status: 200, headers: NO_STORE_HEADERS },
    );
  } catch (err) {
    console.error("Complete booking error:", err);

    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500, headers: NO_STORE_HEADERS },
    );
  }
}
