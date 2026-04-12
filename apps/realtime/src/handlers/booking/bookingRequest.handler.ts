// Booking request handler
import { broadcastEvent } from "../../index.js";
import { validateRequired, validateUUID } from "../../utils/validation.js";

export function bookingRequestHandler(_userId: string, data: unknown) {
  const payload = data as Record<string, unknown>;
  // Validate required fields
  validateRequired(payload, ["bookingId", "targetUserIds"], "booking_request");
  
  // Validate bookingId is UUID
  validateUUID(payload.bookingId, "bookingId");
  
  // Validate targetUserIds is array
  if (!Array.isArray(payload.targetUserIds)) {
    throw new Error("targetUserIds must be an array");
  }

  const { bookingId, targetUserIds, eventType, ...rest } = payload;
  broadcastEvent({ event: "booking_request", data: { bookingId, eventType, ...rest }, targetUserIds });
}
