import { and, inArray, lt } from "drizzle-orm";
import { webDb } from "../db/index.js";
import { booking } from "../db/schema.js";
import { logger } from "./logger.js";
import { broadcastEvent } from "../ws/dispatch.js";

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
          try {
            broadcastEvent({
              event: "booking_update",
              data: { bookingId: b.id, status: "expired", eventType: "expired" },
              targetUserIds: [b.customerId as string],
            });
          } catch (err: any) {
            logger.debug("[Expiration] broadcastEvent failed", { error: err?.message });
          }
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
