import { broadcastEvent } from "../../index.js";
import { webDb } from "../../db/index.js";
import { booking } from "../../db/schema.js";
import { eq } from "drizzle-orm";

export async function bookingStartHandler(userId: string, data: unknown) {
  const payload = data as Record<string, unknown>;
  const bookingId = typeof payload.bookingId === "string" ? payload.bookingId : null;
  const otp = typeof payload.otp === "string" ? payload.otp : null;
  if (!bookingId || !otp) return;
  try {
    // Fetch booking to verify OTP and permissions
    const found = await webDb
      .select({ id: booking.id, customerId: booking.customerId, helperId: booking.helperId, startCode: booking.startCode })
      .from(booking)
      .where(eq(booking.id, bookingId));
    if (!found.length) return;
    const b = found[0]!;
    // Only customer or helper can start, must match OTP
    if ((userId !== b.customerId && userId !== b.helperId) || (b.startCode ?? "") !== otp) return;
    // Update status to in_progress
    const now = new Date();
    const updated = await webDb
      .update(booking)
      .set({ status: "in_progress", startedAt: now })
      .where(eq(booking.id, bookingId))
      .returning({ id: booking.id, customerId: booking.customerId, helperId: booking.helperId, status: booking.status, startedAt: booking.startedAt });
    if (updated.length > 0) {
      const u = updated[0]!;
      broadcastEvent({
        event: "booking_update",
        data: { bookingId: u.id, status: u.status, eventType: "in_progress", startedAt: u.startedAt },
        targetUserIds: [u.customerId, u.helperId ?? ""],
      });
    }
  } catch (err) {
    console.error("[Start] Failed to start booking:", err);
  }
}
