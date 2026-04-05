import { broadcastEvent } from "../../index.js";
import { webDb } from "../../db/index.js";
import { booking } from "../../db/schema.js";
import { and, eq } from "drizzle-orm";

export async function bookingCancelHandler(userId: string, data: unknown) {
  const payload = data as Record<string, unknown>;
  const bookingId = typeof payload.bookingId === "string" ? payload.bookingId : null;
  const reason = typeof payload.reason === "string" ? payload.reason : "User requested cancellation";
  const targetUserIds = Array.isArray(payload.targetUserIds)
    ? payload.targetUserIds.filter((id): id is string => typeof id === "string" && id.length > 0)
    : [];

  if (!bookingId) return;

  try {
    const now = new Date();
    const updated = await webDb
      .update(booking)
      .set({ 
        status: "cancelled", 
        cancelledAt: now, 
        cancelledBy: "customer", 
        cancellationReason: reason || "User requested cancellation" 
      })
      .where(
        and(eq(booking.id, bookingId), eq(booking.customerId, userId), eq(booking.status, "requested"))
      )
      .returning({ id: booking.id, customerId: booking.customerId, helperId: booking.helperId });

    if (updated.length > 0) {
      console.log(`🚫 [Manual-Cancel] User ${userId} cancelled booking ${bookingId}`);
      const bookingRow = updated[0]!;
      const resolvedTargets = new Set<string>([bookingRow.customerId]);

      if (bookingRow.helperId) {
        resolvedTargets.add(bookingRow.helperId);
      }

      targetUserIds.forEach((id) => resolvedTargets.add(id));
      
      broadcastEvent({
        event: "booking_update",
        data: { 
          bookingId, 
          status: "cancelled", 
          eventType: "cancelled",
          cancelledBy: "customer",
          reason
        },
        targetUserIds: Array.from(resolvedTargets)
      });
    }
  } catch (err) {
    console.error("❌ [Manual-Cancel] Failed:", err);
  }
}
