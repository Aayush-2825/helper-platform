import { broadcastEvent } from "../../index.js";

export function locationHandler(userId: string, data: unknown) {
  const payload = data as Record<string, unknown>;
  const payloadHelperId = typeof payload.helperUserId === "string" ? payload.helperUserId : null;
  if (payloadHelperId && payloadHelperId !== userId) {
    console.warn(`[locationHandler] Unauthorized location update attempt: user ${userId} tried to act as ${payloadHelperId}`);
    return;
  }
  const helperUserId = userId;
  const { bookingId, latitude, longitude, accuracy, speed, heading } = payload;
  broadcastEvent({
    event: "location_update",
    data: { helperUserId, bookingId, latitude, longitude, accuracy, speed, heading },
  });
}
