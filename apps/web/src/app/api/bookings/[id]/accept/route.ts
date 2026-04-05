import { headers } from "next/headers";
import { and, eq, inArray, ne } from "drizzle-orm";
import { NextResponse } from "next/server";
import { db } from "@/db";
import { booking, bookingCandidate, bookingStatusEvent, helperProfile, user } from "@/db/schema";
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

    const profile = await db.query.helperProfile.findFirst({
      where: eq(helperProfile.userId, session.user.id),
      columns: {
        id: true,
        verificationStatus: true,
        availabilityStatus: true,
        isActive: true,
      },
    });

    if (!profile) {
      return NextResponse.json(
        { message: "Helper profile not found." },
        { status: 404, headers: NO_STORE_HEADERS }
      );
    }

    if (profile.verificationStatus !== "approved") {
      return NextResponse.json(
        { message: "Finish verification before accepting jobs." },
        { status: 403, headers: NO_STORE_HEADERS }
      );
    }

    if (!profile.isActive || profile.availabilityStatus !== "online") {
      return NextResponse.json(
        { message: "Set your helper profile online before accepting jobs." },
        { status: 403, headers: NO_STORE_HEADERS }
      );
    }

    const existingBooking = await db.query.booking.findFirst({
      where: (bookingRecord, { eq: equals }) => equals(bookingRecord.id, bookingId),
    });

    if (!existingBooking) {
      return NextResponse.json({ message: "Booking not found." }, { status: 404, headers: NO_STORE_HEADERS });
    }

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

    if (!candidate) {
      return NextResponse.json(
        { message: "This booking was not assigned to your helper profile." },
        { status: 403, headers: NO_STORE_HEADERS }
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

    if (existingBooking.helperId && existingBooking.helperId !== session.user.id) {
      return NextResponse.json(
        { message: "Booking already assigned." },
        { status: 400, headers: NO_STORE_HEADERS }
      );
    }

    if (!["requested", "matched"].includes(existingBooking.status)) {
      return NextResponse.json(
        { message: "Booking is not in requested state." },
        { status: 400, headers: NO_STORE_HEADERS }
      );
    }

    if (existingBooking.acceptanceDeadline && existingBooking.acceptanceDeadline <= now) {
      return NextResponse.json(
        { message: "Booking acceptance window has expired." },
        { status: 400, headers: NO_STORE_HEADERS }
      );
    }

    const helperUser = await db.query.user.findFirst({
      where: eq(user.id, session.user.id),
      columns: {
        name: true,
        phone: true,
      },
    });

    const updatedRows = await db.transaction(async (tx) => {
      const rows = await tx
        .update(booking)
        .set({
          status: "accepted",
          helperId: session.user.id,
          helperProfileId: profile.id,
          helperName: helperUser?.name ?? null,
          helperPhone: helperUser?.phone ?? null,
          helperPhoneVisibleAt: null,
          acceptedAt: now,
          updatedAt: now,
        })
        .where(and(eq(booking.id, bookingId), inArray(booking.status, ["requested", "matched"])))
        .returning();

      if (rows.length === 0) {
        return rows;
      }

      await tx
        .update(bookingCandidate)
        .set({
          response: "accepted",
          respondedAt: now,
        })
        .where(eq(bookingCandidate.id, candidate.id));

      await tx
        .update(bookingCandidate)
        .set({
          response: "timeout",
          respondedAt: now,
        })
        .where(
          and(
            eq(bookingCandidate.bookingId, bookingId),
            ne(bookingCandidate.id, candidate.id),
            eq(bookingCandidate.response, "pending")
          )
        );

      await tx.insert(bookingStatusEvent).values({
        id: crypto.randomUUID(),
        bookingId,
        status: "accepted",
        actorUserId: session.user.id,
        note: "Helper accepted booking",
        metadata: {
          candidateId: candidate.id,
        },
      });

      return rows;
    });

    if (updatedRows.length === 0) {
      return NextResponse.json(
        { message: "Booking not found or no longer available for acceptance." },
        { status: 400, headers: NO_STORE_HEADERS }
      );
    }

    await publishBookingEvent({
      bookingId,
      customerId: existingBooking.customerId,
      helperId: session.user.id,
      eventType: "accepted",
      data: {
        candidateId: candidate.id,
      },
    });

    return NextResponse.json(
      {
        message: "Booking accepted successfully.",
        booking: updatedRows[0],
      },
      { status: 200, headers: NO_STORE_HEADERS }
    );
  } catch (err) {
    console.error("Accept booking error:", err);

    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500, headers: NO_STORE_HEADERS }
    );
  }
}
