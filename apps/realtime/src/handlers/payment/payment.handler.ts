import { broadcastEvent } from "../../index.js";

export function paymentHandler(userId: string, data: unknown) {
	const payload = (data ?? {}) as Record<string, unknown>;
	const { bookingId, paymentId, status, targetUserIds, ...rest } = payload;

	if (!bookingId || !paymentId || !status) {
		throw new Error("payment_update requires bookingId, paymentId, and status");
	}

	const targets = Array.isArray(targetUserIds) && targetUserIds.length > 0
		? targetUserIds
		: [userId];

	broadcastEvent({
		event: "payment_update",
		data: {
			bookingId,
			paymentId,
			status,
			updatedBy: userId,
			...rest,
		},
		targetUserIds: targets,
	});
}
