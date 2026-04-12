// Booking update handler
import { broadcastEvent } from "../../index.js";

export function bookingUpdateHandler(_userId: string, data: unknown) {
  const payload = data as Record<string, unknown>;
  const bookingId = typeof payload.bookingId === "string" ? payload.bookingId : undefined;
  const targetUserIds = Array.isArray(payload.targetUserIds)
    ? payload.targetUserIds.filter((userId): userId is string => typeof userId === "string" && userId.length > 0)
    : undefined;
  const eventType = typeof payload.eventType === "string" ? payload.eventType : undefined;
  const rest = { ...payload };
  delete rest.bookingId;
  delete rest.targetUserIds;
  delete rest.eventType;

  broadcastEvent({
    event: "booking_update",
    data: { bookingId, eventType, ...rest },
    targetUserIds,
  });
}
