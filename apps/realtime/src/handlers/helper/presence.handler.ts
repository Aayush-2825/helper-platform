import { broadcastEvent } from "../../index.js";
import { db } from "../../db/index.js";
import { helperPresence } from "../../db/schema.js";

export async function presenceHandler(_userId: string, data: any) {
  const { helperUserId, status, latitude, longitude, availableSlots } = data;

  // Persist to DB so the matching service can find this helper via /api/helpers/nearby
  if (helperUserId && status) {
    try {
      await db
        .insert(helperPresence)
        .values({
          id: `presence-${helperUserId}`,
          helperUserId,
          status,
          latitude: latitude ?? null,
          longitude: longitude ?? null,
          availableSlots: availableSlots ?? null,
          lastHeartbeat: new Date(),
        })
        .onConflictDoUpdate({
          target: helperPresence.helperUserId,
          set: {
            status,
            latitude: latitude ?? null,
            longitude: longitude ?? null,
            availableSlots: availableSlots ?? null,
            lastHeartbeat: new Date(),
          },
        });
      console.log(`👤 [Presence] Updated for helper: ${helperUserId} (${status})`);
    } catch (err) {
      console.error("[presenceHandler] DB upsert failed:", err);
    }
  }

  // Broadcast to all connected clients so the map can show live helper positions
  broadcastEvent({
    event: "helper_presence",
    data: { helperUserId, status, latitude, longitude, availableSlots },
  });
}
