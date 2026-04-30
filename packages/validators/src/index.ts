import { z } from "zod";

/**
 * Shared Validation Schemas
 * Contains primitive validation blocks utilized across both `apps/web` and `apps/realtime`.
 */

export const paginationSchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).default(20),
  offset: z.coerce.number().int().min(0).default(0),
});

export const idSchema = z.object({
  id: z.string().uuid(),
});

export const locationSchema = z.object({
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
});

export const helperVerificationStatusEnum = z.enum(["pending", "approved", "rejected", "resubmission_required"]);
export const helperVideoKycStatusEnum = z.enum(["not_required", "pending_schedule", "scheduled", "passed", "failed"]);
export const videoKycSessionStatusEnum = z.enum(["scheduled", "passed", "failed", "no_show", "cancelled"]);
export const helperAvailabilityStatusEnum = z.enum(["online", "offline", "busy"]);
export const bookingStatusEnum = z.enum(["requested", "matched", "accepted", "in_progress", "completed", "cancelled", "expired", "disputed"]);
export const bookingCandidateResponseEnum = z.enum(["pending", "accepted", "rejected", "timeout"]);
export const cancellationActorEnum = z.enum(["customer", "helper", "admin", "system"]);
export const contactMethodEnum = z.enum(["call", "sms", "whatsapp", "in_app"]);
export const paymentMethodEnum = z.enum(["upi", "card", "wallet", "cash"]);
export const paymentStatusEnum = z.enum(["created", "authorized", "captured", "failed", "refunded", "partially_refunded"]);
export const payoutStatusEnum = z.enum(["pending", "processing", "paid", "failed", "reversed"]);
export const disputeStatusEnum = z.enum(["open", "investigating", "resolved", "rejected"]);
export const disputeResolutionEnum = z.enum(["refund_full", "refund_partial", "no_refund", "credit_note", "other"]);
export const reviewModerationStatusEnum = z.enum(["visible", "hidden", "flagged"]);
export const helperServiceCategoryEnum = z.enum(["driver", "electrician", "plumber", "cleaner", "chef", "delivery_helper", "caretaker", "security_guard", "other"]);
