import { headers } from "next/headers";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { booking, bookingStatusEvent } from "@/db/schema";
import { auth } from "@/lib/auth/server";
import {
  isCustomerCancellableBookingStatus,
  isTerminalBookingStatus,
} from "@/lib/bookings/lifecycle";
import { apiError, apiSuccess, getRequestId, logApiError } from "@/lib/http/responses";
import { publishBookingEvent } from "@/lib/realtime/client";

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const requestId = getRequestId(request.headers);

  try {
    const { id: bookingId } = await context.params;
    const body = await request.json().catch(() => ({}));
    const reason = body.reason || "User requested cancellation";

    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return apiError({
        requestId,
        message: "Unauthorized",
        code: "AUTH_UNAUTHORIZED",
        status: 401,
      });
    }

    const existingBooking = await db.query.booking.findFirst({
      where: (bookingRecord, { eq: equals }) =>
        equals(bookingRecord.id, bookingId),
    });

    if (!existingBooking) {
      return apiError({
        requestId,
        message: "Booking not found.",
        code: "BOOKING_NOT_FOUND",
        status: 404,
      });
    }

    // Security: Only customer can cancel their own 'requested' or 'accepted' booking
    if (existingBooking.customerId !== session.user.id) {
       return apiError({
        requestId,
        message: "You are not authorized to cancel this booking.",
        code: "BOOKING_CANCEL_FORBIDDEN",
        status: 403,
      });
    }

    if (isTerminalBookingStatus(existingBooking.status)) {
       return apiError({
        requestId,
        message: `Cannot cancel a booking that is already ${existingBooking.status}.`,
        code: "BOOKING_ALREADY_TERMINAL",
        status: 400,
      });
    }

    if (!isCustomerCancellableBookingStatus(existingBooking.status)) {
      return apiError({
        requestId,
        message: `Cancellation is not allowed once a booking is ${existingBooking.status}.`,
        code: "BOOKING_CANCEL_WINDOW_CLOSED",
        status: 409,
      });
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

    await db.insert(bookingStatusEvent).values({
      id: crypto.randomUUID(),
      bookingId,
      status: "cancelled",
      actorUserId: session.user.id,
      note: "Customer cancelled booking",
      metadata: {
        cancelledBy: "customer",
        reason,
      },
    });

    // Notify realtime
    await publishBookingEvent({
      bookingId,
      customerId: session.user.id,
      helperId: existingBooking.helperId ?? undefined,
      eventType: "cancelled",
      data: { 
          cancelledBy: "customer", 
          reason 
      },
    });

    return apiSuccess(
      {
        message: "Booking cancelled successfully.",
        booking: updatedBooking,
      },
      { requestId, status: 200 },
    );
  } catch (err) {
    logApiError("Cancel booking error", err, { requestId });
    return apiError({
      requestId,
      message: "Internal server error",
      code: "INTERNAL_SERVER_ERROR",
      status: 500,
    });
  }
}
