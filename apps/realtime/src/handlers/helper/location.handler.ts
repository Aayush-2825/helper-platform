import { broadcastEvent } from "../../index.js";

export function locationHandler(_userId: string, data: any) {
  const { helperUserId, bookingId, latitude, longitude, accuracy, speed, heading } = data;
  broadcastEvent({
    event: "location_update",
    data: { helperUserId, bookingId, latitude, longitude, accuracy, speed, heading },
  });
}
