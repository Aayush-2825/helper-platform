import { headers } from "next/headers";
import { and, eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { db } from "@/db";
import { booking, bookingCandidate, helperProfile } from "@/db/schema";
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
      return NextResponse.json({ message: "Unauthorized" }, { status: 401, headers: NO_STORE_HEADERS });
    }

    const existingBooking = await db.query.booking.findFirst({
      where: (bookingRecord, { eq: equals }) => equals(bookingRecord.id, bookingId),
    });

    if (!existingBooking) {
      return NextResponse.json({ message: "Booking not found." }, { status: 404, headers: NO_STORE_HEADERS });
    }

    const profile = await db.query.helperProfile.findFirst({
      where: eq(helperProfile.userId, session.user.id),
      columns: {
        id: true,
      },
    });

    if (profile) {
      const candidate = await db.query.bookingCandidate.findFirst({
        where: and(
          eq(bookingCandidate.bookingId, bookingId),
          eq(bookingCandidate.helperProfileId, profile.id)
        ),
        columns: {
          id: true,
          response: true,
          expiresAt: true,
        },
      });

      if (candidate) {
        if (existingBooking.status !== "requested") {
          return NextResponse.json(
            { message: "Booking is not in requested state." },
            { status: 400, headers: NO_STORE_HEADERS }
          );
        }

        if (candidate.response !== "pending") {
          return NextResponse.json(
            { message: "This booking request is no longer pending." },
            { status: 400, headers: NO_STORE_HEADERS }
          );
        }

        if (candidate.expiresAt && candidate.expiresAt <= now) {
          await db
            .update(bookingCandidate)
            .set({
              response: "timeout",
              respondedAt: now,
            })
            .where(eq(bookingCandidate.id, candidate.id));

          return NextResponse.json(
            { message: "This booking request has expired." },
            { status: 400, headers: NO_STORE_HEADERS }
          );
        }

        await db
          .update(bookingCandidate)
          .set({
            response: "rejected",
            respondedAt: now,
          })
          .where(eq(bookingCandidate.id, candidate.id));

        await publishBookingEvent({
          bookingId,
          customerId: existingBooking.customerId,
          helperId: session.user.id,
          eventType: "rejected",
          data: {
            candidateId: candidate.id,
          },
        });

        return NextResponse.json(
          { message: "Booking request rejected." },
          { status: 200, headers: NO_STORE_HEADERS }
        );
      }
    }

    if (existingBooking.customerId !== session.user.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 403, headers: NO_STORE_HEADERS });
    }

    if (existingBooking.status !== "requested") {
      return NextResponse.json(
        { message: "Booking is not in requested state." },
        { status: 400, headers: NO_STORE_HEADERS }
      );
    }

    const updatedRows = await db
      .update(booking)
      .set({
        status: "cancelled",
        cancelledAt: now,
        cancelledBy: "customer",
        updatedAt: now,
      })
      .where(and(eq(booking.id, bookingId), eq(booking.status, "requested")))
      .returning();

    if (updatedRows.length === 0) {
      return NextResponse.json(
        { message: "Booking not found or not in requested state." },
        { status: 400, headers: NO_STORE_HEADERS }
      );
    }

    await publishBookingEvent({
      bookingId,
      customerId: existingBooking.customerId,
      helperId: existingBooking.helperId ?? undefined,
      eventType: "cancelled",
    });

    return NextResponse.json(
      {
        message: "Booking cancelled successfully.",
        booking: updatedRows[0],
      },
      { status: 200, headers: NO_STORE_HEADERS }
    );
  } catch (err) {
    console.error("Cancel booking error:", err);

    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500, headers: NO_STORE_HEADERS }
    );
  }
}
