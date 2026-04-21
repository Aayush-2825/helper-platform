import { helperSearchHandler } from "./helper/search.handler.js";
import { presenceHandler } from "./helper/presence.handler.js";
import { locationHandler } from "./helper/location.handler.js";
import { assertMessageContract } from "./message.contract.js";

export function routeMessage(userId: string, data: unknown) {
  assertMessageContract(data);

  switch (data.type) {
    case "helper_search":   return helperSearchHandler(userId, data);
    case "helper_presence": return presenceHandler(userId, data);
    case "location_update": return locationHandler(userId, data);
    default:
      console.warn(`[WS] Unrecognized message type: ${data.type}`);
  }
}
