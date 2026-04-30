/**
 * Shared Type Definitions for the Helper Platform
 * Includes WS events, API Contracts, and Domain abstractions.
 */

// =========================
// 1. API CONTRACTS
// =========================

export type ApiResponse<T> =
  | { success: true; data: T; }
  | { success: false; error: string; code?: string; };

export interface PaginatedRequest {
  limit?: number;
  offset?: number;
}

// =========================
// 2. DOMAIN ENUMS (Literals map to DB Enums)
// =========================

export type HelperVerificationStatus = "pending" | "approved" | "rejected" | "resubmission_required";
export type HelperVideoKycStatus = "not_required" | "pending_schedule" | "scheduled" | "passed" | "failed";
export type VideoKycSessionStatus = "scheduled" | "passed" | "failed" | "no_show" | "cancelled";
export type HelperAvailabilityStatus = "online" | "offline" | "busy";
export type BookingStatus = "requested" | "matched" | "accepted" | "in_progress" | "completed" | "cancelled" | "expired" | "disputed";
export type BookingCandidateResponse = "pending" | "accepted" | "rejected" | "timeout";
export type CancellationActor = "customer" | "helper" | "admin" | "system";
export type ContactMethod = "call" | "sms" | "whatsapp" | "in_app";
export type PaymentMethod = "upi" | "card" | "wallet" | "cash";
export type PaymentStatus = "created" | "authorized" | "captured" | "failed" | "refunded" | "partially_refunded";
export type PayoutStatus = "pending" | "processing" | "paid" | "failed" | "reversed";
export type DisputeStatus = "open" | "investigating" | "resolved" | "rejected";
export type DisputeResolution = "refund_full" | "refund_partial" | "no_refund" | "credit_note" | "other";
export type ReviewModerationStatus = "visible" | "hidden" | "flagged";
export type HelperServiceCategory = "driver" | "electrician" | "plumber" | "cleaner" | "chef" | "delivery_helper" | "caretaker" | "security_guard" | "other";

// =========================
// 3. WEBSOCKET EVENTS & TYPES
// =========================

export type WebSocketEventType = 
  | "booking_request"
  | "booking_update"
  | "helper_presence"
  | "location_update"
  | "message"
  | "notification"
  | "payment_update";

export interface BaseWsMessage {
  type: string;
}

export interface WsAuthMessage extends BaseWsMessage {
  type: "auth";
  token: string;
}

export interface WsPingMessage extends BaseWsMessage {
  type: "ping";
}

export interface WsErrorMessage extends BaseWsMessage {
  type: "error";
  message: string;
  code?: string;
  requestType?: string;
}

export interface WsPresenceMessage extends BaseWsMessage {
  type: "helper_presence";
  helperUserId: string;
  status: HelperAvailabilityStatus;
}

export type AnyWsMessage = WsAuthMessage | WsPingMessage | WsErrorMessage | WsPresenceMessage | Record<string, unknown>;

// =========================
// 4. ENTITY ABSTRACTIONS
// =========================

export interface BaseEntity {
  id: string;
  createdAt: string | Date;
  updatedAt: string | Date;
}
