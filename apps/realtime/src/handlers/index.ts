import { bookingRequestHandler } from "./booking/bookingRequest.handler.js";
import { bookingUpdateHandler } from "./booking/bookingUpdate.handler.js";
import { bookingCancelHandler } from "./booking/bookingCancel.handler.js";
import { bookingAcceptHandler } from "./booking/bookingAccept.handler.js";
import { presenceHandler } from "./helper/presence.handler.js";
import { locationHandler } from "./helper/location.handler.js";
import { bookingStartHandler } from "./booking/bookingStart.handler.js";

export function routeMessage(userId: string, data: any) {
  switch (data.type) {
    case "booking_request": return bookingRequestHandler(userId, data);
    case "booking_update":  return bookingUpdateHandler(userId, data);
    case "booking_accept":  return bookingAcceptHandler(userId, data);
    case "booking_start":   return bookingStartHandler(userId, data);
    case "helper_presence": return presenceHandler(userId, data);
    case "location_update": return locationHandler(userId, data);
    case "cancel_search":   return bookingCancelHandler(userId, data);
    default:
      console.warn(`[WS] Unrecognized message type: ${data.type}`);
  }
}
