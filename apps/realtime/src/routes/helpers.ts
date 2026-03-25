import { Router } from "express";
import { db } from "../db/index.js";
import { sql } from "drizzle-orm";
import { helperPresence } from "../db/schema.js";

const router: Router = Router();

router.get("/nearby", async (req, res) => {
    const { latitude, longitude, radius } = req.query;
    if (!latitude || !longitude || !radius) {
        return res.status(400).json({ message: "Missing required query parameters" });
    }
    const lat = parseFloat(latitude as string);
    const lng = parseFloat(longitude as string);
    const rad = parseFloat(radius as string);
    if (isNaN(lat) || isNaN(lng) || isNaN(rad)) {
        return res.status(400).json({ message: "Invalid query parameters" });
    }
    const haversineFormula = sql<number>`
      (
        6371 * acos(
          cos(radians(${lat})) * cos(radians(${helperPresence.latitude})) *
          cos(radians(${helperPresence.longitude}) - radians(${lng})) +
          sin(radians(${lat})) * sin(radians(${helperPresence.latitude}))
        )
      )
    `;
    
    try {

        const nearbyHelpers = await db
            .select({
                helperId: helperPresence.helperUserId,
                distanceKm: haversineFormula,
            })
            .from(helperPresence)
            .where(sql`${haversineFormula} <= ${radius} AND ${helperPresence.status} = 'online'`)
            .orderBy(haversineFormula)
            .limit(20);

        return res.json({ helpers: nearbyHelpers });
    } catch (err) {
        console.error("Error fetching nearby helpers:", err);
        return res.status(500).json({ message: "Internal server error" });
    }
});

export default router;