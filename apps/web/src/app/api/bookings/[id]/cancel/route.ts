import { headers } from "next/headers";
import { and, eq } from "drizzle-orm";
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
      where: (bookingRecord: any, { eq: equals }: any) =>
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

    // Security: Customer, assigned helper, or admin can cancel
    const isCustomer = existingBooking.customerId === session.user.id;
    const isAdmin = (session.user as any)?.role === "admin";
    let isAssignedHelper = existingBooking.helperId === session.user.id;
    if (!isAssignedHelper && existingBooking.helperProfileId) {
      const hp = await db.query.helperProfile.findFirst({
        where: (hpRecord: any, { eq: equals }: any) =>
          equals(hpRecord.userId, session.user.id),
        columns: { id: true },
      });
      if (hp && hp.id === existingBooking.helperProfileId) {
        isAssignedHelper = true;
      }
    }

    if (!isCustomer && !isAdmin && !isAssignedHelper) {
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

    if (!isCustomerCancellableBookingStatus(existingBooking.status) && !isAdmin) {
      return apiError({
        requestId,
        message: `Cancellation is not allowed once a booking is ${existingBooking.status}.`,
        code: "BOOKING_CANCEL_WINDOW_CLOSED",
        status: 409,
      });
    }

    const cancellerRole = isCustomer ? "customer" : isAdmin ? "admin" : "helper";
    const now = new Date();
    const updatedBooking = await (typeof db.transaction === "function"
      ? db.transaction(async (tx: typeof db) => {
          const [row] = await tx
            .update(booking)
            .set({
              status: "cancelled",
              cancelledAt: now,
              cancelledBy: cancellerRole,
              cancellationReason: reason,
              updatedAt: now,
            })
            .where(
              and(
                eq(booking.id, bookingId),
                eq(booking.status, existingBooking.status),
              ),
            )
            .returning();

          if (!row) {
            return null;
          }

          await tx.insert(bookingStatusEvent).values({
            id: crypto.randomUUID(),
            bookingId,
            status: "cancelled",
            actorUserId: session.user.id,
            note: `${cancellerRole.charAt(0).toUpperCase() + cancellerRole.slice(1)} cancelled booking`,
            metadata: {
              cancelledBy: cancellerRole,
              reason,
            },
          });

          return row;
        })
      : (async (tx: typeof db) => {
          const [row] = await tx
            .update(booking)
            .set({
              status: "cancelled",
              cancelledAt: now,
              cancelledBy: cancellerRole,
              cancellationReason: reason,
              updatedAt: now,
            })
            .where(
              and(
                eq(booking.id, bookingId),
                eq(booking.status, existingBooking.status),
              ),
            )
            .returning();

          if (!row) {
            return null;
          }

          await tx.insert(bookingStatusEvent).values({
            id: crypto.randomUUID(),
            bookingId,
            status: "cancelled",
            actorUserId: session.user.id,
            note: `${cancellerRole.charAt(0).toUpperCase() + cancellerRole.slice(1)} cancelled booking`,
            metadata: {
              cancelledBy: cancellerRole,
              reason,
            },
          });

          return row;
        })(db));

    if (!updatedBooking) {
      return apiError({
        requestId,
        message: "Booking state changed. Please refresh and try again.",
        code: "BOOKING_STATE_CONFLICT",
        status: 409,
      });
    }

    // Notify realtime
    await publishBookingEvent({
      bookingId,
      customerId: existingBooking.customerId,
      helperId: existingBooking.helperId ?? undefined,
      eventType: "cancelled",
      data: {
        cancelledBy: cancellerRole,
        reason,
        booking: updatedBooking,
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
