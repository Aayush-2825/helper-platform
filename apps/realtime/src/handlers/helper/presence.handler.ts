import { broadcastEvent } from "../../index.js";
import { db, webDb } from "../../db/index.js";
import { helperPresence, bookingCandidate, helperProfile } from "../../db/schema.js";
import { and, eq } from "drizzle-orm";

type PresenceStatus = "online" | "offline" | "busy" | "away";

export async function presenceHandler(_userId: string, data: unknown) {
  const payload = data as Record<string, unknown>;
  const helperUserId = typeof payload.helperUserId === "string" ? payload.helperUserId : null;
  const status = typeof payload.status === "string" && ["online", "offline", "busy", "away"].includes(payload.status)
    ? (payload.status as PresenceStatus)
    : null;
  const latitude = typeof payload.latitude === "number" ? payload.latitude : null;
  const longitude = typeof payload.longitude === "number" ? payload.longitude : null;
  const availableSlots = typeof payload.availableSlots === "number" ? payload.availableSlots : null;

  // Persist to DB so the matching service can find this helper via /api/helpers/nearby
  if (helperUserId && status) {
    try {
      await db
        .insert(helperPresence)
        .values({
          id: `presence-${helperUserId}`,
          helperUserId,
          status,
          latitude: latitude != null ? String(latitude) : null,
          longitude: longitude != null ? String(longitude) : null,
          availableSlots: availableSlots ?? null,
          lastHeartbeat: new Date(),
        })
        .onConflictDoUpdate({
          target: helperPresence.helperUserId,
          set: {
            status,
            latitude: latitude != null ? String(latitude) : null,
            longitude: longitude != null ? String(longitude) : null,
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
  if (status === "online" && helperUserId) {
    try {
      // 1. Get helper profile to know their category
      const profile = await webDb.query.helperProfile.findFirst({
        where: eq(helperProfile.userId, helperUserId),
        columns: { primaryCategory: true, id: true }
      });

      if (profile) {
        // 2. Only sync bookings where this helper already has a pending candidate
        // so helper can accept immediately and first-accept-wins logic stays valid.
        const pendingCandidates = await webDb.query.bookingCandidate.findMany({
          where: and(
            eq(bookingCandidate.helperProfileId, profile.id),
            eq(bookingCandidate.response, "pending"),
          ),
          with: {
            booking: {
              columns: {
                id: true,
                status: true,
                categoryId: true,
                addressLine: true,
                city: true,
                quotedAmount: true,
                acceptanceDeadline: true,
              },
              with: {
                customer: {
                  columns: {
                    id: true,
                    name: true,
                  },
                },
              },
            },
          },
          limit: 10,
        });

        const validCandidates = pendingCandidates.filter(
          (candidate) =>
            candidate.booking.status === "requested" &&
            (!candidate.expiresAt || candidate.expiresAt > new Date()),
        );

        if (validCandidates.length > 0) {
          console.log(`📡 [Job-Sync] Notifying helper ${helperUserId} about ${validCandidates.length} pending candidate jobs`);

          for (const candidate of validCandidates) {
            const b = candidate.booking;
            broadcastEvent({
              event: "booking_request",
              data: {
                bookingId: b.id,
                eventType: "created",
                categoryId: b.categoryId,
                addressLine: b.addressLine,
                city: b.city,
                quotedAmount: b.quotedAmount,
                customerId: b.customer.id,
                customerName: b.customer.name,
                expiresAt: candidate.expiresAt?.toISOString() ?? b.acceptanceDeadline?.toISOString(),
                candidates: [
                  {
                    helperId: helperUserId,
                    candidateId: candidate.id,
                  },
                ],
              },
              targetUserIds: [helperUserId],
            });
          }
        }
      }
    } catch (err) {
      console.error("❌ [Job-Sync] Failed:", err);
    }
  }
}
