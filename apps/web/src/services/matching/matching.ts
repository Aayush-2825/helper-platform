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

    const radiusSteps = [5, 10, 20, 50];
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
          message: `Expanding search area to ${radius}km...`,
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

      if (nearbyHelperIds.length > 0) {
        const eligibleRadiusHelpers = (await db.query.helperProfile.findMany({
          where: (helper, { inArray: inArrayOp, eq: eqOp, and: andOp }) =>
            andOp(
              inArrayOp(helper.userId, nearbyHelperIds),
              eqOp(helper.primaryCategory, bookingData.categoryId as HelperServiceCategory),
              eqOp(helper.isActive, true),
              eqOp(helper.verificationStatus, "approved"),
              eqOp(helper.availabilityStatus, "online"),
            ),
        })) as MatchedHelperProfile[];

        if (eligibleRadiusHelpers.length > 0) {
          console.log(
            `📍 [Matching] Found ${eligibleRadiusHelpers.length} NEW helpers at ${radius}km`,
          );
          allEligibleHelpers = [...allEligibleHelpers, ...eligibleRadiusHelpers];
          eligibleRadiusHelpers.forEach((helper) => notifiedHelperIds.add(helper.userId));

          await createAndNotifyCandidates(bookingData, eligibleRadiusHelpers, now);

          if (allEligibleHelpers.length >= 3) {
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

    if (allEligibleHelpers.length === 0 && bookingData.city) {
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

      const onlinePresence = await realtimeDb
        .select({ helperId: helperPresence.helperUserId })
        .from(helperPresence)
        .where(
          and(
            eq(helperPresence.status, "online"),
            sql`${helperPresence.lastHeartbeat} > NOW() - INTERVAL '60 seconds'`,
          ),
        );

      const onlineHelperIds = [...new Set(onlinePresence.map((row) => row.helperId))];

      if (onlineHelperIds.length > 0) {
        let cityHelpers = (await db.query.helperProfile.findMany({
          where: (helper, { eq: eqOp, and: andOp }) =>
            andOp(
              inArray(helper.userId, onlineHelperIds),
              eqOp(helper.primaryCategory, bookingData.categoryId as HelperServiceCategory),
              eqOp(helper.isActive, true),
              eqOp(helper.verificationStatus, "approved"),
            ),
        })) as MatchedHelperProfile[];

        const cityLower = bookingData.city.toLowerCase();
        cityHelpers = cityHelpers.filter(
          (helper) =>
            helper.serviceCity?.toLowerCase() === cityLower &&
            !notifiedHelperIds.has(helper.userId),
        );

        if (cityHelpers.length > 0) {
          allEligibleHelpers = [...allEligibleHelpers, ...cityHelpers];
          await createAndNotifyCandidates(bookingData, cityHelpers, now);
        }
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
    return;
  }

  const deadline = existingBooking.acceptanceDeadline ?? new Date(now.getTime() + 60 * 60 * 1000);
  const shouldPromoteToMatched = existingBooking.status === "requested";
  const candidateRecords = helpers.map((helper) => ({
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
          helperCount: helpers.length,
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

  await publishBookingEvent({
    bookingId: bookingData.id,
    customerId: bookingData.customerId,
    eventType: "matching_update",
    data: {
      status: "matched",
      customerId: bookingData.customerId,
      candidates: helpers.map((helper) => ({
        helperId: helper.userId,
        candidateId: candidateRecords.find((candidate) => candidate.helperProfileId === helper.id)?.id,
      })),
      categoryId: bookingData.categoryId,
      addressLine: bookingData.addressLine ?? "",
      city: bookingData.city ?? "",
      quotedAmount: bookingData.quotedAmount ?? 0,
      customerName,
      helperCount: helpers.length,
      acceptanceDeadline: deadline.toISOString(),
      message: `Found ${helpers.length} professional${helpers.length > 1 ? "s" : ""} for your request.`,
    },
  });
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
        sql`${helperPresence.lastHeartbeat} > NOW() - INTERVAL '60 seconds'`,
        sql`${distanceKm} <= ${radiusKm}`,
      ),
    )
    .orderBy(distanceKm)
    .limit(20);

  return nearbyHelpers
    .map((helper) => helper.helperId)
    .filter((helperId) => !notifiedHelperIds.has(helperId));
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

