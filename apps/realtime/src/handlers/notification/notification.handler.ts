import { broadcastEvent } from "../../index.js";

export function notificationHandler(userId: string, data: unknown) {
	const payload = (data ?? {}) as Record<string, unknown>;
	const { targetUserIds, title, message, severity = "info", ...rest } = payload;

	const targets = Array.isArray(targetUserIds) && targetUserIds.length > 0
		? targetUserIds
		: [userId];

	broadcastEvent({
		event: "notification",
		data: {
			title: typeof title === "string" ? title : "Notification",
			message: typeof message === "string" ? message : "",
			severity,
			createdBy: userId,
			...rest,
		},
		targetUserIds: targets,
	});
}
