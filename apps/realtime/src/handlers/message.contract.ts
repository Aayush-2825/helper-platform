import { ValidationError, validateRequired, validateTypes } from "../utils/validation.js";

function assertRecord(data: unknown): asserts data is Record<string, unknown> {
  if (!data || typeof data !== "object" || Array.isArray(data)) {
    throw new ValidationError("Message payload must be an object", "INVALID_MESSAGE");
  }
}

function validateMessageByType(data: Record<string, unknown>) {
  switch (data.type) {
    case "helper_search":
      validateRequired(data, ["categoryID", "latitude", "longitude"], "helper_search");
      break;
    case "helper_presence":
      validateRequired(data, ["helperUserId", "status"], "helper_presence");
      break;
    case "location_update":
      validateRequired(data, ["helperUserId", "bookingId", "latitude", "longitude"], "location_update");
      break;
    default:
      throw new ValidationError(`Unsupported message type: ${String(data.type)}`, "UNSUPPORTED_TYPE");
  }
}

export function assertMessageContract(data: unknown): asserts data is Record<string, unknown> {
  assertRecord(data);
  validateTypes(data, { type: "string" }, "websocket_message");
  validateMessageByType(data);
}
