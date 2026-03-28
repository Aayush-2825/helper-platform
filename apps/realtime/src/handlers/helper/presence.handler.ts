import { broadcastEvent } from "../../index.js";
import { db, webDb } from "../../db/index.js";
import { helperPresence, booking, helperProfile } from "../../db/schema.js";
import { and, eq, inArray } from "drizzle-orm";

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

  // Broadcast to all connected clients
  broadcastEvent({
    event: "helper_presence",
    data: { helperUserId, status, latitude, longitude, availableSlots },
  });

  // ✅ NEW: If helper goes online, sync pending jobs
  if (status === "online") {
    try {
      // 1. Get helper profile to know their category
      const profile = await webDb.query.helperProfile.findFirst({
        where: eq(helperProfile.userId, helperUserId),
        columns: { primaryCategory: true, id: true }
      });

      if (profile) {
        // 2. Find 'requested' bookings in their category
        // TODO: Add distance filter if needed, but for MVP let's show all in category
        const pendingBookings = await webDb.query.booking.findMany({
          where: and(
            eq(booking.status, "requested"),
            eq(booking.categoryId, profile.primaryCategory as any)
          ),
          orderBy: (b: any, { desc }: any) => [desc(b.requestedAt)],
          limit: 10
        });

        if (pendingBookings.length > 0) {
          console.log(`📡 [Job-Sync] Notifying helper ${helperUserId} about ${pendingBookings.length} pending jobs`);
          
          for (const b of pendingBookings) {
            // Re-use logic from matching.ts or notify directly
            broadcastEvent({
              event: "booking_request",
              data: {
                bookingId: b.id,
                eventType: "created", // So the UI treats it as a new request
                categoryId: b.categoryId,
                addressLine: b.addressLine,
                city: b.city,
                quotedAmount: b.quotedAmount,
                expiresAt: b.acceptanceDeadline?.toISOString(),
                // Distance could be calculated here or in the UI
              },
              targetUserIds: [helperUserId]
            });
          }
        }
      }
    } catch (err) {
      console.error("❌ [Job-Sync] Failed:", err);
    }
  }
}
