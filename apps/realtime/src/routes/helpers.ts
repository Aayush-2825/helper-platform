import { Router } from "express";
import { db } from "../db/index.js";
import { eq, sql } from "drizzle-orm";
import { helperPresence, helperProfile } from "../db/schema.js";
import { randomUUID } from "crypto";

const router: Router = Router();

function getActivationFailureReason(profile: {
  verificationStatus: "pending" | "approved" | "rejected" | "resubmission_required";
  videoKycStatus: "not_required" | "pending_schedule" | "scheduled" | "passed" | "failed";
  isActive: boolean;
} | null) {
  if (!profile) {
    return "helper_profile_missing";
  }

  if (profile.verificationStatus !== "approved") {
    return "verification_status_not_approved";
  }

  if (profile.videoKycStatus !== "passed") {
    return "video_kyc_not_passed";
  }

  if (!profile.isActive) {
    return "helper_not_active";
  }

  return null;
}

router.get("/nearby", async (req, res) => {
  try {
    const { latitude, longitude, radius } = req.query;

    // ✅ 1. Validate input
    if (!latitude || !longitude || !radius) {
      return res.status(400).json({
        message:
          "Missing required query parameters: latitude, longitude, radius",
      });
    }

    const lat = parseFloat(latitude as string);
    const lng = parseFloat(longitude as string);
    const rad = parseFloat(radius as string);

    if (isNaN(lat) || isNaN(lng) || isNaN(rad)) {
      return res.status(400).json({
        message: "Invalid latitude, longitude, or radius",
      });
    }

    // ✅ 2. Haversine formula (distance in KM)
    const haversineFormula = sql<number>`
      (
        6371 * acos(
          cos(radians(${lat})) * cos(radians(${helperPresence.latitude})) *
          cos(radians(${helperPresence.longitude}) - radians(${lng})) +
          sin(radians(${lat})) * sin(radians(${helperPresence.latitude}))
        )
      )
    `;

    // ✅ 3. Query nearby helpers
    const nearbyHelpers = await db
      .select({
        helperId: helperPresence.helperUserId,
        distanceKm: haversineFormula,
      })
      .from(helperPresence)
      .innerJoin(
        helperProfile,
        eq(helperProfile.userId, helperPresence.helperUserId),
      )
      .where(
        sql`
        ${haversineFormula} <= ${rad}
        AND ${helperPresence.status} = 'online'
        AND ${helperPresence.lastHeartbeat} > NOW() - INTERVAL '60 seconds'
        AND ${helperPresence.latitude} IS NOT NULL
        AND ${helperPresence.longitude} IS NOT NULL
        AND ${helperProfile.verificationStatus} = 'approved'
        AND ${helperProfile.videoKycStatus} = 'passed'
        AND ${helperProfile.isActive} = true
      `,
      )
      .orderBy(haversineFormula)
      .limit(20);

    // ✅ 4. Response
    return res.json({
      success: true,
      count: nearbyHelpers.length,
      helpers: nearbyHelpers,
    });
  } catch (err) {
    console.error("[Helpers Nearby Error]:", err);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

router.post("/helper-presence", async (req, res) => {
  try {
    const { helperUserId, status, latitude, longitude, availableSlots } =
      req.body;

    if (!helperUserId || !status) {
      return res.status(400).json({ error: "Missing fields" });
    }

    const [profile] = await db
      .select({
        verificationStatus: helperProfile.verificationStatus,
        videoKycStatus: helperProfile.videoKycStatus,
        isActive: helperProfile.isActive,
      })
      .from(helperProfile)
      .where(eq(helperProfile.userId, String(helperUserId)))
      .limit(1);

    const gateReason = getActivationFailureReason(profile ?? null);
    if (gateReason) {
      return res.status(403).json({
        error: "Helper is not eligible for realtime presence",
        reason: gateReason,
      });
    }

    await db
      .insert(helperPresence)
      .values({
        id: randomUUID(),
        helperUserId,
        status,
        latitude,
        longitude,
        availableSlots,
        lastHeartbeat: new Date(),
      })
      .onConflictDoUpdate({
        target: helperPresence.helperUserId,
        set: {
          status,
          latitude,
          longitude,
          availableSlots,
          lastHeartbeat: new Date(),
        },
      });

    return res.json({ success: true });
  } catch (err) {
    console.error("Presence error:", err);
    return res.status(500).json({ error: "Internal error" });
  }
});

export default router;
