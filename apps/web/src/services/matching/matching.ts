import crypto from "crypto";
import { and, eq, inArray, sql } from "drizzle-orm";

import { db } from "@/db";
import {
  booking,
  bookingCandidate,
  bookingStatusEvent,
} from "@/db/schema";
import { isMatchableBookingStatus } from "@/lib/bookings/lifecycle";
import { publishBookingEvent } from "@/lib/realtime/client";
import { db as realtimeDb } from "@repo/db/realtime";
import { helperPresence } from "@repo/db/schema/realtime";

type BookingDataForMatching = {
  id: string;
  customerId: string;
  categoryId: string;
  latitude?: number | string | null;
  longitude?: number | string | null;
  city?: string | null;
  addressLine?: string | null;
  quotedAmount?: number | null;
};

type MatchedHelperProfile = {
  id: string;
  userId: string;
  serviceCity: string | null;
  averageRating: string | number | null;
  completedJobs: number;
};

type HelperServiceCategory =
  | "driver"
  | "electrician"
  | "plumber"
  | "cleaner"
  | "chef"
  | "delivery_helper"
  | "caretaker"
  | "security_guard"
  | "other";

const PRESENCE_HEARTBEAT_WINDOW_MINUTES = 10;
const MIN_HELPERS_TO_NOTIFY = 10;
const REQUEST_TIMEOUT_MINUTES = 10;

function normalizeLocationToken(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]/g, "");
}

function cityMatches(bookingCity: string, helperCity: string | null) {
  if (!helperCity) return false;

  const bookingToken = normalizeLocationToken(bookingCity);
  const helperToken = normalizeLocationToken(helperCity);

  if (bookingToken.length === 0 || helperToken.length === 0) return false;

  return (
    bookingToken === helperToken ||
    bookingToken.includes(helperToken) ||
    helperToken.includes(bookingToken)
  );
}

function buildDistanceExpression(latitude: number, longitude: number) {
  return sql<number>`(
    6371 * acos(
      greatest(
        least(
          cos(radians(${latitude})) * cos(radians(${helperPresence.latitude})) *
          cos(radians(${helperPresence.longitude}) - radians(${longitude})) +
          sin(radians(${latitude})) * sin(radians(${helperPresence.latitude})),
          1
        ),
        -1
      )
    )
  )`;
}

export const startMatching = async (bookingData: BookingDataForMatching) => {
  try {
    console.log(
      `🔍 [Matching] Starting progressive match for booking: ${bookingData.id} (${bookingData.categoryId})`,
    );

    const latitude = Number(bookingData.latitude);
    const longitude = Number(bookingData.longitude);
    const hasCoordinates = Number.isFinite(latitude) && Number.isFinite(longitude);
    const notifiedHelperIds = new Set<string>();
    const now = new Date();

    const radiusSteps = [1, 3, 5, 10, 20, 50, 100];
    let allEligibleHelpers: MatchedHelperProfile[] = [];

    for (const radius of hasCoordinates ? radiusSteps : []) {
      console.log(`📡 [Matching] Searching within ${radius}km...`);

      await publishBookingEvent({
        bookingId: bookingData.id,
        customerId: bookingData.customerId,
        eventType: "matching_update",
        data: {
          bookingId: bookingData.id,
          radius,
          message: `Searching nearby helpers within ${radius}km...`,
        },
      });

      if (await isBookingNoLongerMatchable(bookingData.id)) {
        console.log(
          `🛑 [Matching] Booking ${bookingData.id} is no longer matchable. Stopping match loop.`,
        );
        return;
      }

      const nearbyHelperIds = hasCoordinates
        ? await findNearbyHelperIds(latitude, longitude, radius, notifiedHelperIds)
        : [];

      console.log(
        `📡 [Matching] Radius ${radius}km helper ids from presence: ${nearbyHelperIds.length}`,
        nearbyHelperIds,
      );

      if (nearbyHelperIds.length > 0) {
        const eligibleRadiusHelpers = (await db.query.helperProfile.findMany({
          where: (helper, { inArray: inArrayOp, eq: eqOp, and: andOp }) =>
            andOp(
              inArrayOp(helper.userId, nearbyHelperIds),
              eqOp(helper.primaryCategory, bookingData.categoryId as HelperServiceCategory),
              eqOp(helper.isActive, true),
              eqOp(helper.verificationStatus, "approved"),
            ),
        })) as MatchedHelperProfile[];

        console.log(
          `📡 [Matching] Radius ${radius}km eligible helper profiles: ${eligibleRadiusHelpers.length}`,
          eligibleRadiusHelpers.map((helper) => helper.userId),
        );

        if (eligibleRadiusHelpers.length > 0) {
          allEligibleHelpers = [...allEligibleHelpers, ...eligibleRadiusHelpers];
          eligibleRadiusHelpers.forEach((helper) => notifiedHelperIds.add(helper.userId));

          await createAndNotifyCandidates(bookingData, eligibleRadiusHelpers, now);

          if (allEligibleHelpers.length >= MIN_HELPERS_TO_NOTIFY) {
            console.log("✅ [Matching] Sufficient helpers found and notified.");
            break;
          }
        }
      }

      await new Promise((resolve) => setTimeout(resolve, 1500));

      const currentBooking = await db.query.booking.findFirst({
        where: (bookingRecord, { eq: eqOp }) => eqOp(bookingRecord.id, bookingData.id),
        columns: { status: true },
      });

      if (!currentBooking || !isMatchableBookingStatus(currentBooking.status)) {
        console.log(
          `🛑 [Matching] Booking ${bookingData.id} is no longer matchable (status: ${currentBooking?.status}).`,
        );
        return;
      }
    }

    if (allEligibleHelpers.length < MIN_HELPERS_TO_NOTIFY && bookingData.city) {
      console.log(`🏙️ [Matching] Falling back to city-wide search for: ${bookingData.city}`);

      await publishBookingEvent({
        bookingId: bookingData.id,
        customerId: bookingData.customerId,
        eventType: "matching_update",
        data: {
          bookingId: bookingData.id,
          radius: 100,
          message: `Expanding search across ${bookingData.city}...`,
        },
      });

      const onlineHelperIds = await findOnlineHelperIds();
      console.log(`🏙️ [Matching] City fallback online helper ids: ${onlineHelperIds.length}`, onlineHelperIds);

      let cityHelpers: MatchedHelperProfile[] = [];
      if (onlineHelperIds.length > 0) {
        cityHelpers = (await db.query.helperProfile.findMany({
          where: (helper, { eq: eqOp, and: andOp, inArray: inArrayOp }) =>
            andOp(
              inArrayOp(helper.userId, onlineHelperIds),
              eqOp(helper.primaryCategory, bookingData.categoryId as HelperServiceCategory),
              eqOp(helper.isActive, true),
              eqOp(helper.verificationStatus, "approved"),
            ),
        })) as MatchedHelperProfile[];
      }

      console.log(
        `🏙️ [Matching] City fallback eligible before city filter: ${cityHelpers.length}`,
        cityHelpers.map((helper) => helper.userId),
      );

      cityHelpers = cityHelpers.filter(
        (helper) => cityMatches(bookingData.city!, helper.serviceCity) && !notifiedHelperIds.has(helper.userId),
      );

      console.log(
        `🏙️ [Matching] City fallback eligible after city/notified filter: ${cityHelpers.length}`,
        cityHelpers.map((helper) => helper.userId),
      );

      if (cityHelpers.length > 0) {
        allEligibleHelpers = [...allEligibleHelpers, ...cityHelpers];
        await createAndNotifyCandidates(bookingData, cityHelpers, now);
      }
    }

    if (allEligibleHelpers.length === 0) {
      await markBookingExpired(bookingData.id, bookingData.customerId, bookingData.city ?? null, now);
      console.log("❌ [Matching] No eligible helpers found even after expansion.");
      return;
    }

    console.log(`✅ [Matching] Success: total ${allEligibleHelpers.length} helpers notified.`);
  } catch (err) {
    console.error("❌ Matching error:", err);
  }
};

async function createAndNotifyCandidates(
  bookingData: BookingDataForMatching,
  helpers: MatchedHelperProfile[],
  now: Date,
) {
  const existingBooking = await db.query.booking.findFirst({
    where: (bookingRecord, { eq: eqOp }) => eqOp(bookingRecord.id, bookingData.id),
    columns: {
      status: true,
      acceptanceDeadline: true,
      customerId: true,
    },
  });

  if (!existingBooking || !["requested", "matched"].includes(existingBooking.status)) {
    console.log(`🛑 [Matching] Skip candidate create, booking status is ${existingBooking?.status}`);
    return;
  }

  // Re-entrant safety: skip helpers that already have a candidate row for this booking.
  const existingCandidates = await db.query.bookingCandidate.findMany({
    where: (candidate, { eq: eqOp }) => eqOp(candidate.bookingId, bookingData.id),
    columns: { helperProfileId: true },
  });

  const existingHelperProfileIds = new Set(existingCandidates.map((candidate) => candidate.helperProfileId));
  const freshHelpers = helpers.filter((helper) => !existingHelperProfileIds.has(helper.id));

  if (freshHelpers.length === 0) {
    console.log(`ℹ️ [Matching] No fresh helpers to notify for booking ${bookingData.id}`);
    return;
  }

  const deadline = existingBooking.acceptanceDeadline ?? new Date(now.getTime() + REQUEST_TIMEOUT_MINUTES * 60 * 1000);
  const shouldPromoteToMatched = existingBooking.status === "requested";
  const candidateRecords = freshHelpers.map((helper) => ({
    id: crypto.randomUUID(),
    bookingId: bookingData.id,
    helperProfileId: helper.id,
    response: "pending" as const,
    rankScore: 100,
    expiresAt: deadline,
  }));

  await db.transaction(async (tx) => {
    if (shouldPromoteToMatched) {
      await tx
        .update(booking)
        .set({
          status: "matched",
          acceptanceDeadline: deadline,
          updatedAt: now,
        })
        .where(eq(booking.id, bookingData.id));

      await tx.insert(bookingStatusEvent).values({
        id: crypto.randomUUID(),
        bookingId: bookingData.id,
        status: "matched",
        actorUserId: bookingData.customerId,
        note: "Helpers notified for booking",
        metadata: {
          helperCount: freshHelpers.length,
          acceptanceDeadline: deadline.toISOString(),
        },
      });
    } else if (!existingBooking.acceptanceDeadline) {
      await tx
        .update(booking)
        .set({
          acceptanceDeadline: deadline,
          updatedAt: now,
        })
        .where(eq(booking.id, bookingData.id));
    }

    await tx.insert(bookingCandidate).values(candidateRecords);
  });

  let customerName = "Customer";
  try {
    const customerRow = await db.query.user.findFirst({
      where: (userRecord, { eq: eqOp }) => eqOp(userRecord.id, bookingData.customerId),
      columns: { name: true },
    });

    if (customerRow?.name) {
      customerName = customerRow.name;
    }
  } catch {
    // Keep the default label if the user lookup fails.
  }

  console.log(
    `📨 [Matching] Publishing booking_request to helpers: ${freshHelpers.length}`,
    freshHelpers.map((helper) => helper.userId),
  );

  await publishBookingEvent({
    bookingId: bookingData.id,
    customerId: bookingData.customerId,
    eventType: "matching_update",
    data: {
      status: "matched",
      customerId: bookingData.customerId,
      candidates: freshHelpers.map((helper) => ({
        helperId: helper.userId,
        candidateId: candidateRecords.find((candidate) => candidate.helperProfileId === helper.id)?.id,
      })),
      categoryId: bookingData.categoryId,
      addressLine: bookingData.addressLine ?? "",
      city: bookingData.city ?? "",
      quotedAmount: bookingData.quotedAmount ?? 0,
      customerName,
      helperCount: freshHelpers.length,
      acceptanceDeadline: deadline.toISOString(),
      message: `Found ${freshHelpers.length} professional${freshHelpers.length > 1 ? "s" : ""} for your request.`,
    },
  });
}

export async function resumeMatchingIfNeeded(bookingId: string) {
  const now = new Date();

  await db
    .update(bookingCandidate)
    .set({
      response: "timeout",
      respondedAt: now,
    })
    .where(
      and(
        eq(bookingCandidate.bookingId, bookingId),
        eq(bookingCandidate.response, "pending"),
        sql`${bookingCandidate.expiresAt} IS NOT NULL`,
        sql`${bookingCandidate.expiresAt} <= NOW()`,
      ),
    );

  const bookingRow = await db.query.booking.findFirst({
    where: (bookingRecord, { eq: eqOp }) => eqOp(bookingRecord.id, bookingId),
    columns: {
      id: true,
      customerId: true,
      categoryId: true,
      latitude: true,
      longitude: true,
      city: true,
      addressLine: true,
      quotedAmount: true,
      status: true,
      helperId: true,
    },
  });

  if (!bookingRow) {
    return false;
  }

  if (!isMatchableBookingStatus(bookingRow.status) || bookingRow.helperId) {
    return false;
  }

  const pendingCandidates = await db.query.bookingCandidate.findMany({
    where: and(eq(bookingCandidate.bookingId, bookingId), eq(bookingCandidate.response, "pending")),
    columns: {
      id: true,
      expiresAt: true,
    },
  });

  const hasActivePendingCandidates = pendingCandidates.some(
    (candidate) => !candidate.expiresAt || candidate.expiresAt > now,
  );

  if (hasActivePendingCandidates) {
    return false;
  }

  await startMatching({
    id: bookingRow.id,
    customerId: bookingRow.customerId,
    categoryId: bookingRow.categoryId,
    latitude: bookingRow.latitude,
    longitude: bookingRow.longitude,
    city: bookingRow.city,
    addressLine: bookingRow.addressLine,
    quotedAmount: bookingRow.quotedAmount,
  });

  return true;
}

async function findNearbyHelperIds(
  latitude: number,
  longitude: number,
  radiusKm: number,
  notifiedHelperIds: Set<string>,
) {
  const distanceKm = buildDistanceExpression(latitude, longitude);

  const nearbyHelpers = await realtimeDb
    .select({
      helperId: helperPresence.helperUserId,
      distanceKm,
    })
    .from(helperPresence)
    .where(
      and(
        eq(helperPresence.status, "online"),
        sql`${helperPresence.latitude} IS NOT NULL`,
        sql`${helperPresence.longitude} IS NOT NULL`,
        sql`${helperPresence.lastHeartbeat} > NOW() - (${PRESENCE_HEARTBEAT_WINDOW_MINUTES} * INTERVAL '1 minute')`,
        sql`${distanceKm} <= ${radiusKm}`,
      ),
    )
    .orderBy(distanceKm)
    .limit(20);

  return nearbyHelpers
    .map((helper) => helper.helperId)
    .filter((helperId) => !notifiedHelperIds.has(helperId));
}

async function findOnlineHelperIds() {
  const onlineHelpers = await realtimeDb
    .select({ helperId: helperPresence.helperUserId })
    .from(helperPresence)
    .where(
      and(
        eq(helperPresence.status, "online"),
        sql`${helperPresence.lastHeartbeat} > NOW() - (${PRESENCE_HEARTBEAT_WINDOW_MINUTES} * INTERVAL '1 minute')`,
      ),
    );

  return [...new Set(onlineHelpers.map((helper) => helper.helperId))];
}

async function isBookingNoLongerMatchable(bookingId: string) {
  const currentBooking = await db.query.booking.findFirst({
    where: (bookingRecord, { eq: eqOp }) => eqOp(bookingRecord.id, bookingId),
    columns: { status: true },
  });

  return !currentBooking || !isMatchableBookingStatus(currentBooking.status);
}

async function markBookingExpired(
  bookingId: string,
  customerId: string,
  city: string | null,
  now: Date,
) {
  await db.transaction(async (tx) => {
    const updatedRows = await tx
      .update(booking)
      .set({
        status: "expired",
        updatedAt: now,
      })
      .where(and(eq(booking.id, bookingId), inArray(booking.status, ["requested", "matched"])))
      .returning({ id: booking.id });

    if (updatedRows.length > 0) {
      await tx.insert(bookingStatusEvent).values({
        id: crypto.randomUUID(),
        bookingId,
        status: "expired",
        actorUserId: customerId,
        note: "No available helpers found during matching",
        metadata: { city },
      });
    }
  });

  await publishBookingEvent({
    bookingId,
    customerId,
    eventType: "matching_update",
    data: {
      status: "expired",
      city,
      message: city
        ? `No available helpers found in ${city} right now. Please try again shortly.`
        : "No available helpers found right now. Please try again shortly.",
    },
  });
}

