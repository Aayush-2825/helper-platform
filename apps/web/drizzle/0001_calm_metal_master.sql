CREATE TYPE "public"."booking_candidate_response" AS ENUM('pending', 'accepted', 'rejected', 'timeout');--> statement-breakpoint
CREATE TYPE "public"."booking_status" AS ENUM('requested', 'matched', 'accepted', 'in_progress', 'completed', 'cancelled', 'expired', 'disputed');--> statement-breakpoint
CREATE TYPE "public"."cancellation_actor" AS ENUM('customer', 'helper', 'admin', 'system');--> statement-breakpoint
CREATE TYPE "public"."dispute_resolution" AS ENUM('refund_full', 'refund_partial', 'no_refund', 'credit_note', 'other');--> statement-breakpoint
CREATE TYPE "public"."dispute_status" AS ENUM('open', 'investigating', 'resolved', 'rejected');--> statement-breakpoint
CREATE TYPE "public"."helper_availability_status" AS ENUM('online', 'offline', 'busy');--> statement-breakpoint
CREATE TYPE "public"."helper_service_category" AS ENUM('driver', 'electrician', 'plumber', 'cleaner', 'chef', 'delivery_helper', 'caretaker', 'security_guard', 'other');--> statement-breakpoint
CREATE TYPE "public"."helper_verification_status" AS ENUM('pending', 'approved', 'rejected', 'resubmission_required');--> statement-breakpoint
CREATE TYPE "public"."payment_method" AS ENUM('upi', 'card', 'wallet', 'cash');--> statement-breakpoint
CREATE TYPE "public"."payment_status" AS ENUM('created', 'authorized', 'captured', 'failed', 'refunded', 'partially_refunded');--> statement-breakpoint
CREATE TYPE "public"."payout_status" AS ENUM('pending', 'processing', 'paid', 'failed', 'reversed');--> statement-breakpoint
CREATE TYPE "public"."review_moderation_status" AS ENUM('visible', 'hidden', 'flagged');--> statement-breakpoint
CREATE TABLE "booking" (
	"id" text PRIMARY KEY NOT NULL,
	"customer_id" text NOT NULL,
	"helper_id" text,
	"helper_profile_id" text,
	"category_id" text NOT NULL,
	"subcategory_id" text,
	"status" "booking_status" DEFAULT 'requested' NOT NULL,
	"requested_at" timestamp DEFAULT now() NOT NULL,
	"acceptance_deadline" timestamp,
	"accepted_at" timestamp,
	"scheduled_for" timestamp,
	"started_at" timestamp,
	"completed_at" timestamp,
	"cancelled_at" timestamp,
	"cancelled_by" "cancellation_actor",
	"cancellation_reason" text,
	"address_line" text NOT NULL,
	"area" text,
	"city" text NOT NULL,
	"state" text,
	"postal_code" text,
	"latitude" numeric(10, 7),
	"longitude" numeric(10, 7),
	"notes" text,
	"quoted_amount" integer NOT NULL,
	"final_amount" integer,
	"currency" text DEFAULT 'INR' NOT NULL,
	"commission_rate" integer DEFAULT 15 NOT NULL,
	"commission_amount" integer,
	"distance_km" numeric(6, 2),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "booking_candidate" (
	"id" text PRIMARY KEY NOT NULL,
	"booking_id" text NOT NULL,
	"helper_profile_id" text NOT NULL,
	"response" "booking_candidate_response" DEFAULT 'pending' NOT NULL,
	"rank_score" integer,
	"distance_km" numeric(6, 2),
	"offered_at" timestamp DEFAULT now() NOT NULL,
	"responded_at" timestamp,
	"expires_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "booking_receipt" (
	"id" text PRIMARY KEY NOT NULL,
	"booking_id" text NOT NULL,
	"payment_transaction_id" text,
	"invoice_number" text,
	"file_url" text,
	"issued_at" timestamp DEFAULT now() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "booking_status_event" (
	"id" text PRIMARY KEY NOT NULL,
	"booking_id" text NOT NULL,
	"status" "booking_status" NOT NULL,
	"actor_user_id" text,
	"note" text,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "customer_profile" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"default_address_line" text,
	"default_area" text,
	"default_city" text,
	"default_state" text,
	"default_postal_code" text,
	"default_latitude" numeric(10, 7),
	"default_longitude" numeric(10, 7),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "dispute" (
	"id" text PRIMARY KEY NOT NULL,
	"booking_id" text NOT NULL,
	"raised_by_user_id" text NOT NULL,
	"against_user_id" text,
	"status" "dispute_status" DEFAULT 'open' NOT NULL,
	"reason_code" text NOT NULL,
	"description" text NOT NULL,
	"admin_notes" text,
	"resolution_type" "dispute_resolution",
	"resolution_amount" integer,
	"resolved_by_user_id" text,
	"resolved_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "dispute_message" (
	"id" text PRIMARY KEY NOT NULL,
	"dispute_id" text NOT NULL,
	"sender_user_id" text NOT NULL,
	"message" text NOT NULL,
	"attachments" jsonb,
	"is_internal" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "helper_availability_slot" (
	"id" text PRIMARY KEY NOT NULL,
	"helper_profile_id" text NOT NULL,
	"day_of_week" integer NOT NULL,
	"start_minute" integer NOT NULL,
	"end_minute" integer NOT NULL,
	"timezone" text DEFAULT 'Asia/Kolkata' NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "helper_kyc_document" (
	"id" text PRIMARY KEY NOT NULL,
	"helper_profile_id" text NOT NULL,
	"document_type" text NOT NULL,
	"document_number" text,
	"file_url" text NOT NULL,
	"status" "helper_verification_status" DEFAULT 'pending' NOT NULL,
	"reviewed_by_user_id" text,
	"reviewed_at" timestamp,
	"rejection_reason" text,
	"expires_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "helper_profile" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"organization_id" text,
	"primary_category" "helper_service_category" NOT NULL,
	"headline" text,
	"bio" text,
	"years_experience" integer DEFAULT 0 NOT NULL,
	"service_city" text,
	"service_radius_km" integer DEFAULT 8 NOT NULL,
	"verification_status" "helper_verification_status" DEFAULT 'pending' NOT NULL,
	"availability_status" "helper_availability_status" DEFAULT 'offline' NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"average_rating" numeric(3, 2) DEFAULT '0.00' NOT NULL,
	"total_ratings" integer DEFAULT 0 NOT NULL,
	"completed_jobs" integer DEFAULT 0 NOT NULL,
	"quality_score" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "helper_service_offering" (
	"id" text PRIMARY KEY NOT NULL,
	"helper_profile_id" text NOT NULL,
	"category_id" text NOT NULL,
	"subcategory_id" text,
	"pricing_type" text DEFAULT 'fixed' NOT NULL,
	"base_price" integer NOT NULL,
	"currency" text DEFAULT 'INR' NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "invitation" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"email" text NOT NULL,
	"role" text,
	"team_id" text,
	"status" text DEFAULT 'pending' NOT NULL,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"inviter_id" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "member" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"user_id" text NOT NULL,
	"role" text DEFAULT 'member' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "notification_event" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"channel" text NOT NULL,
	"template_key" text NOT NULL,
	"status" text DEFAULT 'queued' NOT NULL,
	"payload" jsonb,
	"sent_at" timestamp,
	"error" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "organization" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"logo" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"metadata" text,
	CONSTRAINT "organization_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "payment_transaction" (
	"id" text PRIMARY KEY NOT NULL,
	"booking_id" text NOT NULL,
	"customer_id" text NOT NULL,
	"helper_profile_id" text,
	"method" "payment_method" NOT NULL,
	"status" "payment_status" DEFAULT 'created' NOT NULL,
	"provider" text DEFAULT 'razorpay' NOT NULL,
	"provider_order_id" text,
	"provider_payment_id" text,
	"amount" integer NOT NULL,
	"platform_fee" integer NOT NULL,
	"helper_earning" integer NOT NULL,
	"currency" text DEFAULT 'INR' NOT NULL,
	"captured_at" timestamp,
	"failed_at" timestamp,
	"failure_code" text,
	"failure_reason" text,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "payout" (
	"id" text PRIMARY KEY NOT NULL,
	"helper_profile_id" text NOT NULL,
	"period_start" timestamp,
	"period_end" timestamp,
	"amount" integer NOT NULL,
	"currency" text DEFAULT 'INR' NOT NULL,
	"status" "payout_status" DEFAULT 'pending' NOT NULL,
	"provider" text DEFAULT 'razorpay' NOT NULL,
	"provider_transfer_id" text,
	"processed_at" timestamp,
	"failed_reason" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "rate_limit" (
	"id" text PRIMARY KEY NOT NULL,
	"key" text NOT NULL,
	"count" integer NOT NULL,
	"last_request" bigint NOT NULL,
	CONSTRAINT "rate_limit_key_unique" UNIQUE("key")
);
--> statement-breakpoint
CREATE TABLE "review" (
	"id" text PRIMARY KEY NOT NULL,
	"booking_id" text NOT NULL,
	"customer_id" text NOT NULL,
	"helper_profile_id" text NOT NULL,
	"rating" integer NOT NULL,
	"title" text,
	"comment" text,
	"is_anonymous" boolean DEFAULT false NOT NULL,
	"moderation_status" "review_moderation_status" DEFAULT 'visible' NOT NULL,
	"moderated_by_user_id" text,
	"moderation_reason" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "service_category" (
	"id" text PRIMARY KEY NOT NULL,
	"slug" text NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "service_subcategory" (
	"id" text PRIMARY KEY NOT NULL,
	"category_id" text NOT NULL,
	"slug" text NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "team" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"organization_id" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "team_member" (
	"id" text PRIMARY KEY NOT NULL,
	"team_id" text NOT NULL,
	"user_id" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "two_factor" (
	"id" text PRIMARY KEY NOT NULL,
	"secret" text NOT NULL,
	"backup_codes" text NOT NULL,
	"user_id" text NOT NULL
);
--> statement-breakpoint
ALTER TABLE "session" ADD COLUMN "active_organization_id" text;--> statement-breakpoint
ALTER TABLE "session" ADD COLUMN "active_team_id" text;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "phone" text;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "two_factor_enabled" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "role" text DEFAULT 'user';--> statement-breakpoint
ALTER TABLE "booking" ADD CONSTRAINT "booking_customer_id_user_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."user"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "booking" ADD CONSTRAINT "booking_helper_id_user_id_fk" FOREIGN KEY ("helper_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "booking" ADD CONSTRAINT "booking_helper_profile_id_helper_profile_id_fk" FOREIGN KEY ("helper_profile_id") REFERENCES "public"."helper_profile"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "booking" ADD CONSTRAINT "booking_category_id_service_category_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."service_category"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "booking" ADD CONSTRAINT "booking_subcategory_id_service_subcategory_id_fk" FOREIGN KEY ("subcategory_id") REFERENCES "public"."service_subcategory"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "booking_candidate" ADD CONSTRAINT "booking_candidate_booking_id_booking_id_fk" FOREIGN KEY ("booking_id") REFERENCES "public"."booking"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "booking_candidate" ADD CONSTRAINT "booking_candidate_helper_profile_id_helper_profile_id_fk" FOREIGN KEY ("helper_profile_id") REFERENCES "public"."helper_profile"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "booking_receipt" ADD CONSTRAINT "booking_receipt_booking_id_booking_id_fk" FOREIGN KEY ("booking_id") REFERENCES "public"."booking"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "booking_receipt" ADD CONSTRAINT "booking_receipt_payment_transaction_id_payment_transaction_id_fk" FOREIGN KEY ("payment_transaction_id") REFERENCES "public"."payment_transaction"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "booking_status_event" ADD CONSTRAINT "booking_status_event_booking_id_booking_id_fk" FOREIGN KEY ("booking_id") REFERENCES "public"."booking"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "booking_status_event" ADD CONSTRAINT "booking_status_event_actor_user_id_user_id_fk" FOREIGN KEY ("actor_user_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "customer_profile" ADD CONSTRAINT "customer_profile_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "dispute" ADD CONSTRAINT "dispute_booking_id_booking_id_fk" FOREIGN KEY ("booking_id") REFERENCES "public"."booking"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "dispute" ADD CONSTRAINT "dispute_raised_by_user_id_user_id_fk" FOREIGN KEY ("raised_by_user_id") REFERENCES "public"."user"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "dispute" ADD CONSTRAINT "dispute_against_user_id_user_id_fk" FOREIGN KEY ("against_user_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "dispute" ADD CONSTRAINT "dispute_resolved_by_user_id_user_id_fk" FOREIGN KEY ("resolved_by_user_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "dispute_message" ADD CONSTRAINT "dispute_message_dispute_id_dispute_id_fk" FOREIGN KEY ("dispute_id") REFERENCES "public"."dispute"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "dispute_message" ADD CONSTRAINT "dispute_message_sender_user_id_user_id_fk" FOREIGN KEY ("sender_user_id") REFERENCES "public"."user"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "helper_availability_slot" ADD CONSTRAINT "helper_availability_slot_helper_profile_id_helper_profile_id_fk" FOREIGN KEY ("helper_profile_id") REFERENCES "public"."helper_profile"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "helper_kyc_document" ADD CONSTRAINT "helper_kyc_document_helper_profile_id_helper_profile_id_fk" FOREIGN KEY ("helper_profile_id") REFERENCES "public"."helper_profile"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "helper_kyc_document" ADD CONSTRAINT "helper_kyc_document_reviewed_by_user_id_user_id_fk" FOREIGN KEY ("reviewed_by_user_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "helper_profile" ADD CONSTRAINT "helper_profile_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "helper_profile" ADD CONSTRAINT "helper_profile_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "helper_service_offering" ADD CONSTRAINT "helper_service_offering_helper_profile_id_helper_profile_id_fk" FOREIGN KEY ("helper_profile_id") REFERENCES "public"."helper_profile"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "helper_service_offering" ADD CONSTRAINT "helper_service_offering_category_id_service_category_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."service_category"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "helper_service_offering" ADD CONSTRAINT "helper_service_offering_subcategory_id_service_subcategory_id_fk" FOREIGN KEY ("subcategory_id") REFERENCES "public"."service_subcategory"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invitation" ADD CONSTRAINT "invitation_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invitation" ADD CONSTRAINT "invitation_inviter_id_user_id_fk" FOREIGN KEY ("inviter_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "member" ADD CONSTRAINT "member_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "member" ADD CONSTRAINT "member_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notification_event" ADD CONSTRAINT "notification_event_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payment_transaction" ADD CONSTRAINT "payment_transaction_booking_id_booking_id_fk" FOREIGN KEY ("booking_id") REFERENCES "public"."booking"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payment_transaction" ADD CONSTRAINT "payment_transaction_customer_id_user_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."user"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payment_transaction" ADD CONSTRAINT "payment_transaction_helper_profile_id_helper_profile_id_fk" FOREIGN KEY ("helper_profile_id") REFERENCES "public"."helper_profile"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payout" ADD CONSTRAINT "payout_helper_profile_id_helper_profile_id_fk" FOREIGN KEY ("helper_profile_id") REFERENCES "public"."helper_profile"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "review" ADD CONSTRAINT "review_booking_id_booking_id_fk" FOREIGN KEY ("booking_id") REFERENCES "public"."booking"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "review" ADD CONSTRAINT "review_customer_id_user_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."user"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "review" ADD CONSTRAINT "review_helper_profile_id_helper_profile_id_fk" FOREIGN KEY ("helper_profile_id") REFERENCES "public"."helper_profile"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "review" ADD CONSTRAINT "review_moderated_by_user_id_user_id_fk" FOREIGN KEY ("moderated_by_user_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "service_subcategory" ADD CONSTRAINT "service_subcategory_category_id_service_category_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."service_category"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "team" ADD CONSTRAINT "team_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "team_member" ADD CONSTRAINT "team_member_team_id_team_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."team"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "team_member" ADD CONSTRAINT "team_member_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "two_factor" ADD CONSTRAINT "two_factor_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "booking_customerId_idx" ON "booking" USING btree ("customer_id");--> statement-breakpoint
CREATE INDEX "booking_helperId_idx" ON "booking" USING btree ("helper_id");--> statement-breakpoint
CREATE INDEX "booking_helperProfileId_idx" ON "booking" USING btree ("helper_profile_id");--> statement-breakpoint
CREATE INDEX "booking_status_requestedAt_idx" ON "booking" USING btree ("status","requested_at");--> statement-breakpoint
CREATE INDEX "booking_categoryId_status_idx" ON "booking" USING btree ("category_id","status");--> statement-breakpoint
CREATE INDEX "booking_acceptanceDeadline_idx" ON "booking" USING btree ("acceptance_deadline");--> statement-breakpoint
CREATE INDEX "booking_city_idx" ON "booking" USING btree ("city");--> statement-breakpoint
CREATE UNIQUE INDEX "bookingCandidate_bookingId_helperProfileId_uidx" ON "booking_candidate" USING btree ("booking_id","helper_profile_id");--> statement-breakpoint
CREATE INDEX "bookingCandidate_bookingId_response_idx" ON "booking_candidate" USING btree ("booking_id","response");--> statement-breakpoint
CREATE INDEX "bookingCandidate_helperProfileId_idx" ON "booking_candidate" USING btree ("helper_profile_id");--> statement-breakpoint
CREATE UNIQUE INDEX "bookingReceipt_bookingId_uidx" ON "booking_receipt" USING btree ("booking_id");--> statement-breakpoint
CREATE UNIQUE INDEX "bookingReceipt_invoiceNumber_uidx" ON "booking_receipt" USING btree ("invoice_number");--> statement-breakpoint
CREATE INDEX "bookingStatusEvent_bookingId_createdAt_idx" ON "booking_status_event" USING btree ("booking_id","created_at");--> statement-breakpoint
CREATE INDEX "bookingStatusEvent_actorUserId_idx" ON "booking_status_event" USING btree ("actor_user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "customerProfile_userId_uidx" ON "customer_profile" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "dispute_bookingId_idx" ON "dispute" USING btree ("booking_id");--> statement-breakpoint
CREATE INDEX "dispute_raisedByUserId_idx" ON "dispute" USING btree ("raised_by_user_id");--> statement-breakpoint
CREATE INDEX "dispute_status_createdAt_idx" ON "dispute" USING btree ("status","created_at");--> statement-breakpoint
CREATE INDEX "disputeMessage_disputeId_createdAt_idx" ON "dispute_message" USING btree ("dispute_id","created_at");--> statement-breakpoint
CREATE UNIQUE INDEX "helperAvailabilitySlot_unique_idx" ON "helper_availability_slot" USING btree ("helper_profile_id","day_of_week","start_minute","end_minute");--> statement-breakpoint
CREATE INDEX "helperAvailabilitySlot_helperProfileId_idx" ON "helper_availability_slot" USING btree ("helper_profile_id");--> statement-breakpoint
CREATE INDEX "helperKycDocument_helperProfileId_idx" ON "helper_kyc_document" USING btree ("helper_profile_id");--> statement-breakpoint
CREATE INDEX "helperKycDocument_status_idx" ON "helper_kyc_document" USING btree ("status");--> statement-breakpoint
CREATE UNIQUE INDEX "helperProfile_userId_uidx" ON "helper_profile" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "helperProfile_primaryCategory_idx" ON "helper_profile" USING btree ("primary_category");--> statement-breakpoint
CREATE INDEX "helperProfile_verificationStatus_idx" ON "helper_profile" USING btree ("verification_status");--> statement-breakpoint
CREATE INDEX "helperProfile_availabilityStatus_idx" ON "helper_profile" USING btree ("availability_status");--> statement-breakpoint
CREATE INDEX "helperProfile_serviceCity_idx" ON "helper_profile" USING btree ("service_city");--> statement-breakpoint
CREATE UNIQUE INDEX "helperServiceOffering_unique_idx" ON "helper_service_offering" USING btree ("helper_profile_id","category_id","subcategory_id");--> statement-breakpoint
CREATE INDEX "helperServiceOffering_helperProfileId_idx" ON "helper_service_offering" USING btree ("helper_profile_id");--> statement-breakpoint
CREATE INDEX "helperServiceOffering_categoryId_idx" ON "helper_service_offering" USING btree ("category_id");--> statement-breakpoint
CREATE INDEX "helperServiceOffering_subcategoryId_idx" ON "helper_service_offering" USING btree ("subcategory_id");--> statement-breakpoint
CREATE INDEX "invitation_organizationId_idx" ON "invitation" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "invitation_email_idx" ON "invitation" USING btree ("email");--> statement-breakpoint
CREATE INDEX "member_organizationId_idx" ON "member" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "member_userId_idx" ON "member" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "notificationEvent_userId_createdAt_idx" ON "notification_event" USING btree ("user_id","created_at");--> statement-breakpoint
CREATE INDEX "notificationEvent_status_idx" ON "notification_event" USING btree ("status");--> statement-breakpoint
CREATE UNIQUE INDEX "organization_slug_uidx" ON "organization" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "paymentTransaction_bookingId_idx" ON "payment_transaction" USING btree ("booking_id");--> statement-breakpoint
CREATE INDEX "paymentTransaction_customerId_idx" ON "payment_transaction" USING btree ("customer_id");--> statement-breakpoint
CREATE INDEX "paymentTransaction_helperProfileId_idx" ON "payment_transaction" USING btree ("helper_profile_id");--> statement-breakpoint
CREATE INDEX "paymentTransaction_status_createdAt_idx" ON "payment_transaction" USING btree ("status","created_at");--> statement-breakpoint
CREATE UNIQUE INDEX "paymentTransaction_providerPaymentId_uidx" ON "payment_transaction" USING btree ("provider_payment_id");--> statement-breakpoint
CREATE INDEX "payout_helperProfileId_idx" ON "payout" USING btree ("helper_profile_id");--> statement-breakpoint
CREATE INDEX "payout_status_createdAt_idx" ON "payout" USING btree ("status","created_at");--> statement-breakpoint
CREATE UNIQUE INDEX "review_bookingId_uidx" ON "review" USING btree ("booking_id");--> statement-breakpoint
CREATE INDEX "review_helperProfileId_idx" ON "review" USING btree ("helper_profile_id");--> statement-breakpoint
CREATE INDEX "review_customerId_idx" ON "review" USING btree ("customer_id");--> statement-breakpoint
CREATE INDEX "review_moderationStatus_createdAt_idx" ON "review" USING btree ("moderation_status","created_at");--> statement-breakpoint
CREATE UNIQUE INDEX "serviceCategory_slug_uidx" ON "service_category" USING btree ("slug");--> statement-breakpoint
CREATE UNIQUE INDEX "serviceSubcategory_categoryId_slug_uidx" ON "service_subcategory" USING btree ("category_id","slug");--> statement-breakpoint
CREATE INDEX "serviceSubcategory_categoryId_idx" ON "service_subcategory" USING btree ("category_id");--> statement-breakpoint
CREATE INDEX "team_organizationId_idx" ON "team" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "teamMember_teamId_idx" ON "team_member" USING btree ("team_id");--> statement-breakpoint
CREATE INDEX "teamMember_userId_idx" ON "team_member" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "twoFactor_secret_idx" ON "two_factor" USING btree ("secret");--> statement-breakpoint
CREATE INDEX "twoFactor_userId_idx" ON "two_factor" USING btree ("user_id");