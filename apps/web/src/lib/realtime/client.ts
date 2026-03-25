type JsonRecord = Record<string, unknown>;

export type RealtimeOpEventType =
  | "booking_request"
  | "booking_update"
  | "helper_presence"
  | "location_update"
  | "message"
  | "notification"
  | "payment_update";

const DEFAULT_HTTP_BASE = "http://localhost:3001";
const DEFAULT_WS_PATH = "/api/realtime/ws";

function trimTrailingSlash(value: string): string {
  return value.endsWith("/") ? value.slice(0, -1) : value;
}

export function getRealtimeHttpBaseUrl(): string {
  const configured = process.env.NEXT_PUBLIC_REALTIME_HTTP_BASE_URL;
  if (configured && configured.trim().length > 0) {
    return trimTrailingSlash(configured.trim());
  }

  return DEFAULT_HTTP_BASE;
}

export function getRealtimeWsUrl(): string {
  const configured = process.env.NEXT_PUBLIC_REALTIME_WS_URL;
  if (configured && configured.trim().length > 0) {
    return configured.trim();
  }

  const httpUrl = getRealtimeHttpBaseUrl();
  const wsProtocol = httpUrl.startsWith("https://") ? "wss://" : "ws://";
  const host = httpUrl.replace(/^https?:\/\//, "");
  return `${wsProtocol}${host}${DEFAULT_WS_PATH}`;
}

async function postJson(path: string, payload: JsonRecord): Promise<Response> {
  const baseUrl = getRealtimeHttpBaseUrl();
  return fetch(`${baseUrl}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
}

export async function publishHelperPresence(input: {
  helperUserId: string;
  status: "online" | "offline" | "busy" | "away";
  latitude?: number;
  longitude?: number;
  availableSlots?: number;
}) {
  return postJson("/api/realtime/ops/helper-presence", input);
}

export async function publishLocationUpdate(input: {
  helperUserId: string;
  bookingId: string;
  latitude: number;
  longitude: number;
  accuracy?: number;
  speed?: number;
  heading?: number;
}) {
  return postJson("/api/realtime/ops/location-updates", input);
}

export async function publishBookingEvent(input: {
  bookingId: string;
  customerId: string;
  helperId?: string;
  eventType:
    | "created"
    | "accepted"
    | "rejected"
    | "in_progress"
    | "completed"
    | "cancelled"
    | "matching_timeout";
  data?: JsonRecord;
}) {
  return postJson("/api/realtime/ops/booking-events", input);
}

export async function createIncomingJob(input: {
  bookingId: string;
  helperId: string;
  status?: "pending" | "accepted" | "rejected" | "timeout";
}) {
  return postJson("/api/realtime/ops/incoming-jobs", input);
}

export async function createRealtimeSubscription(input: {
  userId: string;
  connectionId: string;
  eventType: RealtimeOpEventType;
  resourceId?: string;
}) {
  return postJson("/api/realtime/ops/subscriptions", input);
}

export async function unsubscribeRealtimeSubscription(input: {
  connectionId: string;
  eventType: RealtimeOpEventType;
  resourceId?: string;
}) {
  return postJson("/api/realtime/ops/subscriptions/unsubscribe", input);
}
