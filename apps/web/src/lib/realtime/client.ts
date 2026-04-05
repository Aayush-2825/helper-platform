import { wsSend } from "./wsManager";

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

export function publishHelperPresence(input: {
  helperUserId: string;
  status: "online" | "offline" | "busy" | "away";
  latitude?: number;
  longitude?: number;
  availableSlots?: number;
}) {
  wsSend({ type: "helper_presence", ...input });
}

export function publishLocationUpdate(input: {
  helperUserId: string;
  bookingId: string;
  latitude: number;
  longitude: number;
  accuracy?: number;
  speed?: number;
  heading?: number;
}) {
  wsSend({ type: "location_update", ...input });
}

export function publishBookingEvent(input: {
  bookingId: string;
  customerId: string;
  helperId?: string; // single helper (updates)
  eventType:
    | "created"
    | "accepted"
    | "rejected"
    | "cancelled"
    | "in_progress"
    | "completed"
    | "matching_update";
  data?: {
    candidates?: Array<{ helperId: string }>;
    [key: string]: unknown;
  };
}) {
  let wsEvent = "";
  const data = input.data ?? {};
  const hasCandidateTargets = Array.isArray(data.candidates) && data.candidates.length > 0;

  // 🧠 Step 1: Map DB → WS event
  if (input.eventType === "created" || (input.eventType === "matching_update" && hasCandidateTargets)) {
    wsEvent = "booking_request";
  } else {
    wsEvent = "booking_update";
  }

  // 🧠 Step 2: Decide targets
  let targetUserIds: string[] = [];

  if (wsEvent === "booking_request") {
    // ✅ SUPPORT BATCH (from matching)
    if (Array.isArray(data.candidates) && data.candidates.length > 0) {
      targetUserIds = data.candidates.map((candidate) => candidate.helperId);
    }
    // ✅ fallback (single helper)
    else if (input.helperId) {
      targetUserIds = [input.helperId];
    }
  }

  if (wsEvent === "booking_update") {
    targetUserIds = [input.customerId, input.helperId].filter(
      Boolean,
    ) as string[];
  }

  const payload = {
    event: wsEvent,
    data: {
      bookingId: input.bookingId,
      eventType: input.eventType,
      ...data,
    },
    targetUserIds,
  };

  // 🔥 Step 3: Dispatch (HTTP if server, WS if client)
  if (typeof window === "undefined") {
    // 🧠 On server, we must use HTTP because there is no per-user WS connection
    return postJson("/api/realtime/broadcast", payload).catch((err) => {
      console.error("❌ Failed to broadcast booking event via HTTP:", err);
      throw err;
    });
  } else {
    // 🌐 On client, we can use the existing WS connection
    wsSend({
      type: wsEvent,
      bookingId: input.bookingId,
      eventType: input.eventType,
      targetUserIds,
      ...data,
    });
  }
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

export function publishPaymentUpdate(input: {
  bookingId: string;
  paymentId: string;
  status: "created" | "authorized" | "captured" | "failed" | "refunded" | "partially_refunded";
  targetUserIds: string[];
  amount: number;
  currency: string;
  providerOrderId?: string;
  providerPaymentId?: string;
  failureCode?: string;
  failureReason?: string;
}) {
  const payload = {
    event: "payment_update",
    data: {
      bookingId: input.bookingId,
      paymentId: input.paymentId,
      status: input.status,
      amount: input.amount,
      currency: input.currency,
      providerOrderId: input.providerOrderId,
      providerPaymentId: input.providerPaymentId,
      failureCode: input.failureCode,
      failureReason: input.failureReason,
      targetUserIds: input.targetUserIds,
    },
    targetUserIds: input.targetUserIds,
  };

  if (typeof window === "undefined") {
    return postJson("/api/realtime/broadcast", payload).catch((err) => {
      console.error("Failed to broadcast payment event via HTTP:", err);
      throw err;
    });
  }

  wsSend({
    type: "payment_update",
    ...payload.data,
  });
}
