import crypto from "crypto";

import { and, desc, eq, inArray, sql } from "drizzle-orm";

import { broadcastEvent } from "../../index.js";
import { db, webDb } from "../../db/index.js";
import { helperPresence } from "../../db/schema.js";
import { helperProfile, user } from "../../db/schema.js";
import { validateNumericRange, validateEnum } from "../../utils/validation.js";

type HelperSearchResult = {
  id: string;
  userId: string;
  name: string;
  category: string;
  rating: string | number | null;
  completedJobs: number;
  availability: "online" | "offline" | "busy";
  serviceCity: string | null;
  distanceKm: number | null;
  latitude: number | null;
  longitude: number | null;
};

const allowedCategories = [
  "driver",
  "electrician",
  "plumber",
  "cleaner",
  "chef",
  "delivery_helper",
  "caretaker",
  "security_guard",
  "other",
];
const PRESENCE_HEARTBEAT_WINDOW_MINUTES = 10;

function normalizeText(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function buildDistanceExpression(latitude: number, longitude: number) {
  return sql<number>`(
    6371 * acos(
      cos(radians(${latitude})) * cos(radians(${helperPresence.latitude})) *
      cos(radians(${helperPresence.longitude}) - radians(${longitude})) +
      sin(radians(${latitude})) * sin(radians(${helperPresence.latitude}))
    )
  )`;
}

async function findNearbyHelpers(
  categoryID: string,
  latitude: number,
  longitude: number,
  radiusKm: number,
) {
  const distanceKm = buildDistanceExpression(latitude, longitude);

  const nearbyHelpers = await db
    .select({
      helperUserId: helperPresence.helperUserId,
      distanceKm,
      availability: helperPresence.status,
      latitude: helperPresence.latitude,
      longitude: helperPresence.longitude,
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

  if (nearbyHelpers.length === 0) return [];

  const helperUserIds = nearbyHelpers.map((row) => row.helperUserId);
  const presenceByUserId = new Map(nearbyHelpers.map((row) => [row.helperUserId, row]));

  const helperProfiles = await webDb
    .select({
      id: helperProfile.id,
      userId: helperProfile.userId,
      name: user.name,
      category: helperProfile.primaryCategory,
      rating: helperProfile.averageRating,
      completedJobs: helperProfile.completedJobs,
      serviceCity: helperProfile.serviceCity,
    })
    .from(helperProfile)
    .innerJoin(user, eq(helperProfile.userId, user.id))
    .where(
      and(
        eq(helperProfile.verificationStatus, "approved"),
        sql`${helperProfile.primaryCategory} = ${categoryID}`,
        inArray(helperProfile.userId, helperUserIds),
      ),
    )
    .orderBy(desc(helperProfile.averageRating));

  return helperProfiles.map<HelperSearchResult>((profile) => {
    const presence = presenceByUserId.get(profile.userId);
    return {
      id: profile.id,
      userId: profile.userId,
      name: profile.name ?? "Helper",
      category: profile.category,
      rating: profile.rating,
      completedJobs: profile.completedJobs,
      availability: (presence?.availability ?? "online") as HelperSearchResult["availability"],
      serviceCity: profile.serviceCity,
      distanceKm: presence?.distanceKm != null ? Number(presence.distanceKm) : null,
      latitude: presence?.latitude != null ? Number(presence.latitude) : null,
      longitude: presence?.longitude != null ? Number(presence.longitude) : null,
    };
  });
}

async function findCityHelpers(categoryID: string, city: string) {
  const normalizedCity = city.toLowerCase();

  const helperProfiles = await webDb
    .select({
      id: helperProfile.id,
      userId: helperProfile.userId,
      name: user.name,
      category: helperProfile.primaryCategory,
      rating: helperProfile.averageRating,
      completedJobs: helperProfile.completedJobs,
      serviceCity: helperProfile.serviceCity,
    })
    .from(helperProfile)
    .innerJoin(user, eq(helperProfile.userId, user.id))
    .where(
      and(
        eq(helperProfile.verificationStatus, "approved"),
        sql`${helperProfile.primaryCategory} = ${categoryID}`,
      ),
    )
    .orderBy(desc(helperProfile.averageRating));

  const onlinePresence = await db
    .select({
      helperUserId: helperPresence.helperUserId,
      availability: helperPresence.status,
    })
    .from(helperPresence)
    .where(
      and(
        eq(helperPresence.status, "online"),
        sql`${helperPresence.lastHeartbeat} > NOW() - (${PRESENCE_HEARTBEAT_WINDOW_MINUTES} * INTERVAL '1 minute')`,
      ),
    );

  const presenceMap = new Map(onlinePresence.map((row) => [row.helperUserId, row]));

  return helperProfiles
    .filter((profile) => normalizeText(profile.serviceCity).toLowerCase() === normalizedCity)
    .filter((profile) => presenceMap.has(profile.userId))
    .map<HelperSearchResult>((profile) => ({
      id: profile.id,
      userId: profile.userId,
      name: profile.name ?? "Helper",
      category: profile.category,
      rating: profile.rating,
      completedJobs: profile.completedJobs,
      availability: (presenceMap.get(profile.userId)?.availability ?? "online") as HelperSearchResult["availability"],
      serviceCity: profile.serviceCity,
      distanceKm: null,
      latitude: null,
      longitude: null,
    }))
    .slice(0, 12);
}

export async function helperSearchHandler(userId: string, data: unknown) {
  const payload = (data ?? {}) as Record<string, unknown>;
  const requestId = normalizeText(payload.requestId) || crypto.randomUUID();

  try {
    const categoryID = normalizeText(payload.categoryID);
    const city = normalizeText(payload.city);
    const latitude = Number(payload.latitude);
    const longitude = Number(payload.longitude);
    const radiusKm = Number(payload.radiusKm ?? 10);

    if (!categoryID) {
      throw new Error("categoryID is required");
    }

    if (!Number.isFinite(latitude) || !Number.isFinite(longitude) || !Number.isFinite(radiusKm)) {
      throw new Error("latitude, longitude, and radiusKm must be numeric values");
    }

    validateEnum(categoryID, allowedCategories, "categoryID");
    validateNumericRange(latitude, { min: -90, max: 90, fieldName: "latitude" });
    validateNumericRange(longitude, { min: -180, max: 180, fieldName: "longitude" });
    validateNumericRange(radiusKm, { min: 1, max: 50, fieldName: "radiusKm" });

    const progressiveRadiusSteps = [1, 3, 5, 10, 20, 50].filter((step) => step <= radiusKm);
    let helpers: HelperSearchResult[] = [];
    let attemptedRadiusKm = radiusKm;

    for (const radius of progressiveRadiusSteps.length > 0 ? progressiveRadiusSteps : [radiusKm]) {
      attemptedRadiusKm = radius;
      const radiusHelpers = await findNearbyHelpers(categoryID, latitude, longitude, radius);
      console.log(
        `🔎 [HelperSearch] requestId=${requestId} radius=${radius}km results=${radiusHelpers.length}`,
      );

      if (radiusHelpers.length > 0) {
        helpers = radiusHelpers;
        break;
      }
    }

    if (helpers.length === 0 && city) {
      console.log(`🏙️ [HelperSearch] requestId=${requestId} falling back to city=${city}`);
      helpers = await findCityHelpers(categoryID, city);
    }

    console.log(
      `📤 [HelperSearch] requestId=${requestId} sending results=${helpers.length} to user=${userId}`,
      helpers.map((helper) => helper.userId),
    );

    broadcastEvent({
      event: "helper_search_results",
      data: {
        requestId,
        categoryID,
        city: city || null,
        latitude,
        longitude,
        radiusKm: attemptedRadiusKm,
        helpers,
        message:
          helpers.length > 0
            ? `Found ${helpers.length} live helper${helpers.length > 1 ? "s" : ""}.`
            : "No live helpers found right now.",
      },
      targetUserIds: [userId],
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unable to search for helpers right now.";
    console.error(`❌ [HelperSearch] requestId=${requestId} failed for user=${userId}:`, err);

    broadcastEvent({
      event: "helper_search_error",
      data: {
        requestId,
        message,
      },
      targetUserIds: [userId],
    });
  }
}