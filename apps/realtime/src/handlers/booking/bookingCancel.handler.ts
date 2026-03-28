import { broadcastEvent } from "../../index.js";
import { webDb } from "../../db/index.js";
import { booking } from "../../db/schema.js";
import { and, eq } from "drizzle-orm";

export async function bookingCancelHandler(userId: string, data: any) {
  const { bookingId, reason } = data;

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
        and(
          eq(booking.id, bookingId),
          eq(booking.customerId, userId), // Security check
          eq(booking.status, "requested")
        )
      )
      .returning({ id: booking.id });

    if (updated.length > 0) {
      console.log(`🚫 [Manual-Cancel] User ${userId} cancelled booking ${bookingId}`);
      
      broadcastEvent({
        event: "booking_update",
        data: { 
          bookingId, 
          status: "cancelled", 
          cancelledBy: "customer",
          reason: reason || "User requested cancellation"
        },
        targetUserIds: [userId] // Notify the user back for confirmation
      });
    }
  } catch (err) {
    console.error("❌ [Manual-Cancel] Failed:", err);
  }
}
