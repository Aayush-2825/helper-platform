import { bookingRequestHandler } from "./booking/bookingRequest.handler.js";
import { bookingUpdateHandler } from "./booking/bookingUpdate.handler.js";
import { helperSearchHandler } from "./helper/search.handler.js";
import { presenceHandler } from "./helper/presence.handler.js";
import { locationHandler } from "./helper/location.handler.js";
import { notificationHandler } from "./notification/notification.handler.js";
import { assertMessageContract } from "./message.contract.js";

export function routeMessage(userId: string, data: unknown) {
  assertMessageContract(data);
  console.log(`[WS] routeMessage user=${userId} type=${data.type}`);

  switch (data.type) {
    case "booking_request": return bookingRequestHandler(userId, data);
    case "booking_update":  return bookingUpdateHandler(userId, data);
    case "helper_search":   return helperSearchHandler(userId, data);
    case "helper_presence": return presenceHandler(userId, data);
    case "location_update": return locationHandler(userId, data);
    case "notification":    return notificationHandler(userId, data);
    default:
      console.warn(`[WS] Unrecognized message type: ${data.type}`);
  }
}
