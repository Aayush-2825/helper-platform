
import { broadcastEvent } from "../../index.js";
import { webDb } from "../../db/index.js";
import { booking } from "../../db/schema.js";
import { and, eq } from "drizzle-orm";

function generateStartCode() {
	// 4-digit numeric OTP
	return Math.floor(1000 + Math.random() * 9000).toString();
}

export async function bookingAcceptHandler(userId: string, data: unknown) {
	const payload = data as Record<string, unknown>;
	const bookingId = typeof payload.bookingId === "string" ? payload.bookingId : null;
	if (!bookingId) return;
	try {
		const now = new Date();
		const startCode = generateStartCode();
		const updated = await webDb
			.update(booking)
			.set({ status: "accepted", acceptedAt: now, startCode })
			.where(
				and(
					eq(booking.id, bookingId),
					eq(booking.helperId, userId),
					eq(booking.status, "requested")
				)
			)
			.returning({ id: booking.id, customerId: booking.customerId, startCode: booking.startCode });

		if (updated.length > 0) {
			const b = updated[0]!;
			broadcastEvent({
				event: "booking_update",
				data: { bookingId: b.id, status: "accepted", eventType: "accepted", startCode: b.startCode },
				targetUserIds: [b.customerId, userId],
			});
		}
	} catch (err) {
		console.error("[Accept] Failed to accept booking:", err);
	}
}
