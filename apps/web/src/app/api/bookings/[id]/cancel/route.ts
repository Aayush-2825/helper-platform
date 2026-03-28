import { headers } from "next/headers";
import { eq, and } from "drizzle-orm";
import { NextResponse } from "next/server";
import { db } from "@/db";
import { booking } from "@/db/schema";
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
    const reason = body.reason || "User requested cancellation";

    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401, headers: NO_STORE_HEADERS },
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

    // Security: Only customer can cancel their own 'requested' or 'accepted' booking
    if (existingBooking.customerId !== session.user.id) {
       return NextResponse.json(
        { message: "You are not authorized to cancel this booking." },
        { status: 403, headers: NO_STORE_HEADERS },
      );
    }

    if (existingBooking.status === "completed" || existingBooking.status === "cancelled" || existingBooking.status === "expired") {
       return NextResponse.json(
        { message: `Cannot cancel a booking that is already ${existingBooking.status}.` },
        { status: 400, headers: NO_STORE_HEADERS },
      );
    }

    const now = new Date();
    const [updatedBooking] = await db
      .update(booking)
      .set({
        status: "cancelled",
        cancelledAt: now,
        cancelledBy: "customer",
        cancellationReason: reason,
        updatedAt: now,
      })
      .where(eq(booking.id, bookingId))
      .returning();

    // Notify realtime
    publishBookingEvent({
      bookingId,
      customerId: session.user.id,
      helperId: existingBooking.helperId ?? undefined,
      eventType: "cancelled",
      data: { 
          cancelledBy: "customer", 
          reason 
      },
    });

    return NextResponse.json(
      {
        message: "Booking cancelled successfully.",
        booking: updatedBooking,
      },
      { status: 200, headers: NO_STORE_HEADERS },
    );
  } catch (err) {
    console.error("Cancel booking error:", err);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500, headers: NO_STORE_HEADERS },
    );
  }
}
