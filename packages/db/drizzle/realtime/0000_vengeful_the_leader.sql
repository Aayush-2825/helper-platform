CREATE TYPE "public"."booking_candidate_response" AS ENUM('pending', 'accepted', 'rejected', 'timeout');--> statement-breakpoint
CREATE TYPE "public"."booking_event_type" AS ENUM('created', 'accepted', 'rejected', 'in_progress', 'completed', 'cancelled', 'matching_timeout');--> statement-breakpoint
CREATE TYPE "public"."booking_status" AS ENUM('requested', 'matched', 'accepted', 'in_progress', 'completed', 'cancelled', 'expired', 'disputed');--> statement-breakpoint
CREATE TYPE "public"."cancellation_actor" AS ENUM('customer', 'helper', 'admin', 'system');--> statement-breakpoint
CREATE TYPE "public"."contact_method" AS ENUM('call', 'sms', 'whatsapp', 'in_app');--> statement-breakpoint
CREATE TYPE "public"."dispute_resolution" AS ENUM('refund_full', 'refund_partial', 'no_refund', 'credit_note', 'other');--> statement-breakpoint
CREATE TYPE "public"."dispute_status" AS ENUM('open', 'investigating', 'resolved', 'rejected');--> statement-breakpoint
CREATE TYPE "public"."helper_availability_status" AS ENUM('online', 'offline', 'busy');--> statement-breakpoint
CREATE TYPE "public"."helper_presence_status" AS ENUM('online', 'offline', 'busy', 'away');--> statement-breakpoint
CREATE TYPE "public"."helper_service_category" AS ENUM('driver', 'electrician', 'plumber', 'cleaner', 'chef', 'delivery_helper', 'caretaker', 'security_guard', 'other');--> statement-breakpoint
CREATE TYPE "public"."helper_verification_status" AS ENUM('pending', 'approved', 'rejected', 'resubmission_required');--> statement-breakpoint
CREATE TYPE "public"."payment_method" AS ENUM('upi', 'card', 'wallet', 'cash');--> statement-breakpoint
CREATE TYPE "public"."payment_status" AS ENUM('created', 'authorized', 'captured', 'failed', 'refunded', 'partially_refunded');--> statement-breakpoint
CREATE TYPE "public"."payout_status" AS ENUM('pending', 'processing', 'paid', 'failed', 'reversed');--> statement-breakpoint
CREATE TYPE "public"."review_moderation_status" AS ENUM('visible', 'hidden', 'flagged');--> statement-breakpoint
CREATE TYPE "public"."websocket_event_type" AS ENUM('booking_request', 'booking_update', 'helper_presence', 'location_update', 'message', 'notification', 'payment_update');--> statement-breakpoint
CREATE TABLE "realtime"."active_connections" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"user_role" text NOT NULL,
	"connection_id" text NOT NULL,
	"ip_address" text,
	"user_agent" text,
	"connected_at" timestamp DEFAULT now() NOT NULL,
	"disconnected_at" timestamp,
	"is_active" boolean DEFAULT true NOT NULL,
	CONSTRAINT "active_connections_connection_id_unique" UNIQUE("connection_id")
);
--> statement-breakpoint
CREATE TABLE "realtime"."booking_events" (
	"id" text PRIMARY KEY NOT NULL,
	"booking_id" text NOT NULL,
	"event_type" "booking_event_type" NOT NULL,
	"customer_id" text NOT NULL,
	"helper_id" text,
	"data" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"expires_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "realtime"."helper_presence" (
	"id" text PRIMARY KEY NOT NULL,
	"helper_user_id" text NOT NULL,
	"status" "helper_presence_status" DEFAULT 'offline' NOT NULL,
	"latitude" numeric(10, 7),
	"longitude" numeric(10, 7),
	"available_slots" integer DEFAULT 1,
	"current_booking_count" integer DEFAULT 0,
	"last_heartbeat" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "helper_presence_helper_user_id_unique" UNIQUE("helper_user_id")
);
--> statement-breakpoint
CREATE TABLE "realtime"."incoming_jobs" (
	"id" text PRIMARY KEY NOT NULL,
	"booking_id" text NOT NULL,
	"helper_id" text NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"sent_at" timestamp DEFAULT now() NOT NULL,
	"responded_at" timestamp,
	"expires_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "realtime"."location_updates" (
	"id" text PRIMARY KEY NOT NULL,
	"helper_user_id" text NOT NULL,
	"booking_id" text NOT NULL,
	"latitude" numeric(10, 7) NOT NULL,
	"longitude" numeric(10, 7) NOT NULL,
	"accuracy" numeric(8, 2),
	"speed" numeric(6, 2),
	"heading" numeric(6, 2),
	"timestamp" timestamp DEFAULT now() NOT NULL,
	"expires_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "realtime"."notification_queue" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"event_type" "websocket_event_type" NOT NULL,
	"payload" text NOT NULL,
	"sent" boolean DEFAULT false NOT NULL,
	"sent_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"expires_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "realtime"."subscriptions" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"connection_id" text NOT NULL,
	"event_type" "websocket_event_type" NOT NULL,
	"resource_id" text,
	"subscribed_at" timestamp DEFAULT now() NOT NULL,
	"unsubscribed_at" timestamp
);
--> statement-breakpoint
CREATE INDEX "activeConnections_userId_idx" ON "realtime"."active_connections" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "activeConnections_isActive_idx" ON "realtime"."active_connections" USING btree ("is_active");--> statement-breakpoint
CREATE INDEX "bookingEvents_bookingId_idx" ON "realtime"."booking_events" USING btree ("booking_id");--> statement-breakpoint
CREATE INDEX "bookingEvents_customerId_idx" ON "realtime"."booking_events" USING btree ("customer_id");--> statement-breakpoint
CREATE INDEX "bookingEvents_helperId_idx" ON "realtime"."booking_events" USING btree ("helper_id");--> statement-breakpoint
CREATE INDEX "bookingEvents_eventType_idx" ON "realtime"."booking_events" USING btree ("event_type");--> statement-breakpoint
CREATE INDEX "bookingEvents_expiresAt_idx" ON "realtime"."booking_events" USING btree ("expires_at");--> statement-breakpoint
CREATE INDEX "helperPresence_status_idx" ON "realtime"."helper_presence" USING btree ("status");--> statement-breakpoint
CREATE INDEX "incomingJobs_helperId_idx" ON "realtime"."incoming_jobs" USING btree ("helper_id");--> statement-breakpoint
CREATE INDEX "incomingJobs_bookingId_idx" ON "realtime"."incoming_jobs" USING btree ("booking_id");--> statement-breakpoint
CREATE INDEX "incomingJobs_status_idx" ON "realtime"."incoming_jobs" USING btree ("status");--> statement-breakpoint
CREATE INDEX "incomingJobs_expiresAt_idx" ON "realtime"."incoming_jobs" USING btree ("expires_at");--> statement-breakpoint
CREATE INDEX "locationUpdates_helperUserId_idx" ON "realtime"."location_updates" USING btree ("helper_user_id");--> statement-breakpoint
CREATE INDEX "locationUpdates_bookingId_idx" ON "realtime"."location_updates" USING btree ("booking_id");--> statement-breakpoint
CREATE INDEX "locationUpdates_expiresAt_idx" ON "realtime"."location_updates" USING btree ("expires_at");--> statement-breakpoint
CREATE INDEX "notificationQueue_userId_idx" ON "realtime"."notification_queue" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "notificationQueue_sent_idx" ON "realtime"."notification_queue" USING btree ("sent");--> statement-breakpoint
CREATE INDEX "notificationQueue_expiresAt_idx" ON "realtime"."notification_queue" USING btree ("expires_at");--> statement-breakpoint
CREATE INDEX "subscriptions_userId_idx" ON "realtime"."subscriptions" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "subscriptions_connectionId_idx" ON "realtime"."subscriptions" USING btree ("connection_id");--> statement-breakpoint
CREATE INDEX "subscriptions_eventType_idx" ON "realtime"."subscriptions" USING btree ("event_type");--> statement-breakpoint
CREATE INDEX "subscriptions_resourceId_idx" ON "realtime"."subscriptions" USING btree ("resource_id");