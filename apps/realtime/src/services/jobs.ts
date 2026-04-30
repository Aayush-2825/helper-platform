import { and, inArray, lt } from "drizzle-orm";
import { webDb } from "../db/index.js";
import { booking } from "../db/schema.js";
import { logger } from "./logger.js";
import { broadcastEvent } from "../index.js"; // This might circular, need to fix later

const EXPIRATION_INTERVAL = 30000; // 30s

/**
 * Starts background maintenance jobs
 */
export function startBackgroundJobs() {
  setInterval(async () => {
    try {
      const now = new Date();
      const expired = await webDb
        .update(booking)
        .set({ status: "expired" as any, updatedAt: now })
        .where(
          and(
            inArray(booking.status, ["requested", "matched"] as any),
            lt(booking.acceptanceDeadline, now)
          )
        )
        .returning({ id: booking.id, customerId: booking.customerId });

      if (expired.length > 0) {
        logger.info(`🕒 [Expiration] Marked ${expired.length} bookings as expired`);
        expired.forEach((b) => {
          // Note: we'll need to move broadcastEvent to a better location or use dispatcher directly
          // Using dispatcher directly here to avoid circular dependencies in the final refactor
          /* 
          import { dispatcher } from "../ws/dispatcher.js";
          dispatcher.sendToUser(b.customerId, {
             type: "event",
             event: "booking_update",
             data: { bookingId: b.id, status: "expired", eventType: "expired" }
          });
          */
        });
      }
    } catch (err: any) {
      if (process.env.NODE_ENV !== "development") {
        logger.error("❌ [Expiration] Job failed", { error: err.message });
      }
    }
  }, EXPIRATION_INTERVAL);
  
  logger.info("[Jobs] Background maintenance jobs started");
}
