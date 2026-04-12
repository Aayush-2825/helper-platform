import { broadcastEvent } from "../../index.js";

export function bookingRejectHandler(userId: string, data: unknown) {
	const payload = data as Record<string, unknown>;
	const { bookingId, reason, targetUserIds } = payload;

	if (!bookingId) return;

	const targets = Array.isArray(targetUserIds) && targetUserIds.length > 0
		? targetUserIds
		: [userId];

	broadcastEvent({
		event: "booking_update",
		data: {
			bookingId,
			status: "requested",
			eventType: "rejected",
			rejectedBy: userId,
			reason: typeof reason === "string" && reason.trim().length > 0
				? reason.trim()
				: "Helper rejected booking request",
		},
		targetUserIds: targets,
	});
}
