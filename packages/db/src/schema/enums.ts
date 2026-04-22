import { pgEnum } from "drizzle-orm/pg-core";

export const helperVerificationStatusEnum = pgEnum(
  "helper_verification_status",
  ["pending", "approved", "rejected", "resubmission_required"],
);

export const helperVideoKycStatusEnum = pgEnum("helper_video_kyc_status", [
  "not_required",
  "pending_schedule",
  "scheduled",
  "passed",
  "failed",
]);

export const videoKycSessionStatusEnum = pgEnum("video_kyc_session_status", [
  "scheduled",
  "passed",
  "failed",
  "no_show",
  "cancelled",
]);

export const helperAvailabilityStatusEnum = pgEnum(
  "helper_availability_status",
  ["online", "offline", "busy"],
);

export const bookingStatusEnum = pgEnum("booking_status", [
  "requested",
  "matched",
  "accepted",
  "in_progress",
  "completed",
  "cancelled",
  "expired",
  "disputed",
]);

export const bookingCandidateResponseEnum = pgEnum("booking_candidate_response", [
  "pending",
  "accepted",
  "rejected",
  "timeout",
]);

export const cancellationActorEnum = pgEnum("cancellation_actor", [
  "customer",
  "helper",
  "admin",
  "system",
]);

export const contactMethodEnum = pgEnum("contact_method", [
  "call",
  "sms",
  "whatsapp",
  "in_app",
]);

export const paymentMethodEnum = pgEnum("payment_method", [
  "upi",
  "card",
  "wallet",
  "cash",
]);

export const paymentStatusEnum = pgEnum("payment_status", [
  "created",
  "authorized",
  "captured",
  "failed",
  "refunded",
  "partially_refunded",
]);

export const payoutStatusEnum = pgEnum("payout_status", [
  "pending",
  "processing",
  "paid",
  "failed",
  "reversed",
]);

export const disputeStatusEnum = pgEnum("dispute_status", [
  "open",
  "investigating",
  "resolved",
  "rejected",
]);

export const disputeResolutionEnum = pgEnum("dispute_resolution", [
  "refund_full",
  "refund_partial",
  "no_refund",
  "credit_note",
  "other",
]);

export const reviewModerationStatusEnum = pgEnum("review_moderation_status", [
  "visible",
  "hidden",
  "flagged",
]);

export const helperServiceCategoryEnum = pgEnum("helper_service_category", [
  "driver",
  "electrician",
  "plumber",
  "cleaner",
  "chef",
  "delivery_helper",
  "caretaker",
  "security_guard",
  "other",
]);

export const bookingEventTypeEnum = pgEnum("booking_event_type", [
  "created",
  "accepted",
  "rejected",
  "in_progress",
  "completed",
  "cancelled",
  "matching_timeout",
]);

export const helperPresenceStatusEnum = pgEnum("helper_presence_status", [
  "online",
  "offline",
  "busy",
  "away",
]);

export const websocketEventTypeEnum = pgEnum("websocket_event_type", [
  "booking_request",
  "booking_update",
  "helper_presence",
  "location_update",
  "message",
  "notification",
  "payment_update",
]);