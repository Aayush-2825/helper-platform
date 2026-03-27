// Booking request handler
import { broadcastEvent } from "../../index.js";

export function bookingRequestHandler(_userId: string, data: any) {
  const { bookingId, targetUserIds, eventType, ...rest } = data;
  broadcastEvent({ event: "booking_request", data: { bookingId, eventType, ...rest }, targetUserIds });
}
