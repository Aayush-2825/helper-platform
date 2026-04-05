import { randomUUID } from "crypto";

import { and, eq, inArray } from "drizzle-orm";

import { db, webDb } from "../db/index.js";
import { booking, bookingEvents, notificationQueue } from "../db/schema.js";

type PersistArgs = {
  event: string;
  data: Record<string, unknown>;
  targetUserIds?: string[];
};

const notificationEventTypes = new Set([
  "booking_request",
  "booking_update",
  "helper_presence",
  "location_update",
  "message",
  "notification",
  "payment_update",
]);

const bookingEventTypes = new Set([
  "created",
  "accepted",
  "rejected",
  "in_progress",
  "completed",
  "cancelled",
  "matching_timeout",
]);

function normalizeBookingEventType(event: string, eventType: unknown): string | null {
  const rawType = typeof eventType === "string"
    ? eventType
    : event === "booking_request"
      ? "created"
      : null;

  if (!rawType) return null;

  if (rawType === "expired") {
    return "matching_timeout";
  }

  return rawType;
}

async function resolveBookingParticipants(bookingId: string, payload: Record<string, unknown>) {
  const customerId = typeof payload?.customerId === "string" ? payload.customerId : null;
  const helperId = typeof payload?.helperId === "string" ? payload.helperId : null;

  if (customerId) {
    return { customerId, helperId };
  }

  const rows = await webDb
    .select({ customerId: booking.customerId, helperId: booking.helperId })
    .from(booking)
    .where(eq(booking.id, bookingId))
    .limit(1);

  if (rows.length === 0) {
    return null;
  }

  return {
    customerId: rows[0]!.customerId,
    helperId: rows[0]!.helperId,
  };
}

export async function persistOutboundEvent({ event, data, targetUserIds }: PersistArgs) {
  try {
    if (notificationEventTypes.has(event) && Array.isArray(targetUserIds) && targetUserIds.length > 0) {
      const uniqueTargets = Array.from(
        new Set(targetUserIds.filter((id): id is string => typeof id === "string" && id.length > 0)),
      );

      if (uniqueTargets.length > 0) {
        const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

        await db.insert(notificationQueue).values(
          uniqueTargets.map((userId) => ({
            id: randomUUID(),
            userId,
            eventType: event as typeof notificationQueue.$inferInsert.eventType,
            payload: JSON.stringify({ event, data }),
            expiresAt,
          })),
        );
      }
    }

    if ((event === "booking_request" || event === "booking_update") && typeof data?.bookingId === "string") {
      const normalizedType = normalizeBookingEventType(event, data?.eventType);

      if (normalizedType && bookingEventTypes.has(normalizedType)) {
        const participants = await resolveBookingParticipants(data.bookingId, data);

        if (participants?.customerId) {
          await db.insert(bookingEvents).values({
            id: randomUUID(),
            bookingId: data.bookingId,
            eventType: normalizedType as typeof bookingEvents.$inferInsert.eventType,
            customerId: participants.customerId,
            helperId: participants.helperId ?? null,
            data: JSON.stringify(data),
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          });
        }
      }
    }
  } catch (err) {
    console.warn("[Realtime] Event persistence skipped:", err);
  }
}

export async function flushQueuedNotificationsForUser(
  userId: string,
  sendEvent: (message: { type: "event"; event: string; data: unknown }) => void,
) {
  try {
    const queued = await db
      .select({ id: notificationQueue.id, payload: notificationQueue.payload })
      .from(notificationQueue)
      .where(and(eq(notificationQueue.userId, userId), eq(notificationQueue.sent, false)))
      .limit(100);

    if (queued.length === 0) {
      return;
    }

    const deliveredIds: string[] = [];

    for (const item of queued) {
      try {
        const parsed = JSON.parse(item.payload) as { event?: unknown; data?: unknown };

        if (typeof parsed.event !== "string") {
          continue;
        }

        sendEvent({
          type: "event",
          event: parsed.event,
          data: parsed.data,
        });

        deliveredIds.push(item.id);
      } catch {
        // Skip malformed payload rows without breaking replay for valid rows.
      }
    }

    if (deliveredIds.length > 0) {
      await db
        .update(notificationQueue)
        .set({ sent: true, sentAt: new Date() })
        .where(inArray(notificationQueue.id, deliveredIds));
    }
  } catch (err) {
    console.warn("[Realtime] Failed to flush queued notifications:", err);
  }
}
