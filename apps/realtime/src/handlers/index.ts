import { bookingRequestHandler } from "./booking/bookingRequest.handler.js";
import { bookingUpdateHandler } from "./booking/bookingUpdate.handler.js";
import { presenceHandler } from "./helper/presence.handler.js";
import { locationHandler } from "./helper/location.handler.js";

export function routeMessage(userId: string, data: any) {
  switch (data.type) {
    case "booking_request": return bookingRequestHandler(userId, data);
    case "booking_update":  return bookingUpdateHandler(userId, data);
    case "helper_presence": return presenceHandler(userId, data);
    case "location_update": return locationHandler(userId, data);
    default:
      console.warn(`[WS] Unrecognized message type: ${data.type}`);
  }
}
