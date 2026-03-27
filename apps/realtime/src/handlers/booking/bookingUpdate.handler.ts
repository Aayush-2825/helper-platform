// Booking update handler
import { broadcastEvent } from "../../index.js";

export function bookingUpdateHandler(_userId: string, data: any) {
  const { bookingId, targetUserIds, eventType, ...rest } = data;
  broadcastEvent({ event: "booking_update", data: { bookingId, eventType, ...rest }, targetUserIds });
}
