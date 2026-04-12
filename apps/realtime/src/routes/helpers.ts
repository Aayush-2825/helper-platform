import { Router } from "express";
import { db } from "../db/index.js";
import { sql } from "drizzle-orm";
import { helperPresence } from "../db/schema.js";
import { randomUUID } from "crypto";

const router: Router = Router();

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
      .where(
        sql`
        ${haversineFormula} <= ${rad}
        AND ${helperPresence.status} = 'online'
        AND ${helperPresence.lastHeartbeat} > NOW() - INTERVAL '60 seconds'
        AND ${helperPresence.latitude} IS NOT NULL
        AND ${helperPresence.longitude} IS NOT NULL
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
