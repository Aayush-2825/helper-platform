import { headers } from "next/headers";
import { and, eq, sql } from "drizzle-orm";
import { NextResponse } from "next/server";

import { db } from "@/db";
import { auth } from "@/lib/auth/server";
import { booking, helperProfile, review } from "@/db/schema";
import { NO_STORE_HEADERS } from "@/lib/http/cache";

const REVIEW_SUBMISSION_WINDOW_DAYS = 30;

export async function GET() {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401, headers: NO_STORE_HEADERS },
      );
    }

    if (session.user.role !== "customer" && session.user.role !== "user") {
      return NextResponse.json(
        { message: "Forbidden" },
        { status: 403, headers: NO_STORE_HEADERS },
      );
    }

    const reviews = await db.query.review.findMany({
      where: eq(review.customerId, session.user.id),
      columns: {
        id: true,
        bookingId: true,
        rating: true,
        comment: true,
        createdAt: true,
      },
      orderBy: (reviewRecord, { desc }) => [desc(reviewRecord.createdAt)],
    });

    return NextResponse.json(
      { reviews },
      { status: 200, headers: NO_STORE_HEADERS },
    );
  } catch (error) {
    console.error("Reviews GET error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500, headers: NO_STORE_HEADERS },
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401, headers: NO_STORE_HEADERS },
      );
    }

    if (session.user.role !== "customer" && session.user.role !== "user") {
      return NextResponse.json(
        { message: "Forbidden" },
        { status: 403, headers: NO_STORE_HEADERS },
      );
    }

    const body = await request.json().catch(() => ({}));
    const bookingId = typeof body.bookingId === "string" ? body.bookingId : "";
    const rating = Number(body.rating);
    const comment = typeof body.comment === "string" ? body.comment.trim() : "";

    if (!bookingId) {
      return NextResponse.json(
        { message: "bookingId is required." },
        { status: 400, headers: NO_STORE_HEADERS },
      );
    }

    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
      return NextResponse.json(
        { message: "rating must be an integer between 1 and 5." },
        { status: 400, headers: NO_STORE_HEADERS },
      );
    }

    const bookingRecord = await db.query.booking.findFirst({
      where: and(eq(booking.id, bookingId), eq(booking.customerId, session.user.id)),
      columns: {
        id: true,
        status: true,
        helperProfileId: true,
        completedAt: true,
      },
    });

    if (!bookingRecord) {
      return NextResponse.json(
        { message: "Booking not found." },
        { status: 404, headers: NO_STORE_HEADERS },
      );
    }

    if (bookingRecord.status !== "completed") {
      return NextResponse.json(
        { message: "You can only review completed bookings." },
        { status: 400, headers: NO_STORE_HEADERS },
      );
    }

    if (!bookingRecord.helperProfileId) {
      return NextResponse.json(
        { message: "This booking has no helper profile to review." },
        { status: 400, headers: NO_STORE_HEADERS },
      );
    }

    if (!bookingRecord.completedAt) {
      return NextResponse.json(
        { message: "Completed bookings must include a completion timestamp." },
        { status: 409, headers: NO_STORE_HEADERS },
      );
    }

    const reviewWindowEndsAt = new Date(bookingRecord.completedAt);
    reviewWindowEndsAt.setDate(reviewWindowEndsAt.getDate() + REVIEW_SUBMISSION_WINDOW_DAYS);
    if (Date.now() > reviewWindowEndsAt.getTime()) {
      return NextResponse.json(
        {
          message: `Reviews can only be submitted within ${REVIEW_SUBMISSION_WINDOW_DAYS} days of booking completion.`,
        },
        { status: 409, headers: NO_STORE_HEADERS },
      );
    }

    const helperProfileId = bookingRecord.helperProfileId;

    const existing = await db.query.review.findFirst({
      where: eq(review.bookingId, bookingId),
      columns: { id: true },
    });

    if (existing) {
      return NextResponse.json(
        { message: "Review already submitted for this booking." },
        { status: 409, headers: NO_STORE_HEADERS },
      );
    }

    const reviewId = crypto.randomUUID();

    await db.transaction(async (tx) => {
      await tx.insert(review).values({
        id: reviewId,
        bookingId,
        customerId: session.user.id,
        helperProfileId,
        rating,
        comment: comment.length > 0 ? comment : undefined,
      });

      const aggregate = await tx
        .select({
          average: sql<string>`coalesce(avg(${review.rating}), 0)`,
          total: sql<number>`count(*)::int`,
        })
        .from(review)
        .where(eq(review.helperProfileId, helperProfileId));

      const average = Number(aggregate[0]?.average ?? 0).toFixed(2);
      const total = aggregate[0]?.total ?? 0;

      await tx
        .update(helperProfile)
        .set({
          averageRating: average,
          totalRatings: total,
          updatedAt: new Date(),
        })
        .where(eq(helperProfile.id, helperProfileId));
    });

    return NextResponse.json(
      {
        message: "Review submitted successfully.",
        review: {
          id: reviewId,
          bookingId,
          rating,
          comment,
        },
      },
      { status: 201, headers: NO_STORE_HEADERS },
    );
  } catch (error) {
    console.error("Reviews POST error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500, headers: NO_STORE_HEADERS },
    );
  }
}

