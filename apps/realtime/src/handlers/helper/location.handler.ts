import { broadcastEvent } from "../../index.js";

export function locationHandler(_userId: string, data: unknown) {
  const payload = data as Record<string, unknown>;
  const { helperUserId, bookingId, latitude, longitude, accuracy, speed, heading } = payload;
  broadcastEvent({
    event: "location_update",
    data: { helperUserId, bookingId, latitude, longitude, accuracy, speed, heading },
  });
}
