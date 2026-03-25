CREATE TYPE "public"."booking_event_type" AS ENUM('created', 'accepted', 'rejected', 'in_progress', 'completed', 'cancelled', 'matching_timeout');--> statement-breakpoint
CREATE TYPE "public"."helper_presence_status" AS ENUM('online', 'offline', 'busy', 'away');--> statement-breakpoint
CREATE TYPE "public"."websocket_event_type" AS ENUM('booking_request', 'booking_update', 'helper_presence', 'location_update', 'message', 'notification', 'payment_update');--> statement-breakpoint
CREATE TABLE "active_connections" (
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
CREATE TABLE "booking_events" (
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
CREATE TABLE "helper_presence" (
	"id" text PRIMARY KEY NOT NULL,
	"helper_user_id" text NOT NULL,
	"status" "helper_presence_status" DEFAULT 'offline' NOT NULL,
	"latitude" numeric(10, 7),
	"longitude" numeric(10, 7),
	"accuracy" numeric(8, 2),
	"last_location_update" timestamp,
	"available_slots" integer DEFAULT 0,
	"current_booking_count" integer DEFAULT 0,
	"last_heartbeat" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "incoming_jobs" (
	"id" text PRIMARY KEY NOT NULL,
	"booking_id" text NOT NULL,
	"helper_id" text NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"sent_at" timestamp DEFAULT now() NOT NULL,
	"responded_at" timestamp,
	"expires_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "location_updates" (
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
CREATE TABLE "notification_queue" (
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
CREATE TABLE "subscriptions" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"connection_id" text NOT NULL,
	"event_type" "websocket_event_type" NOT NULL,
	"resource_id" text,
	"subscribed_at" timestamp DEFAULT now() NOT NULL,
	"unsubscribed_at" timestamp
);
--> statement-breakpoint
CREATE INDEX "activeConnections_userId_idx" ON "active_connections" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "activeConnections_isActive_idx" ON "active_connections" USING btree ("is_active");--> statement-breakpoint
CREATE INDEX "bookingEvents_bookingId_idx" ON "booking_events" USING btree ("booking_id");--> statement-breakpoint
CREATE INDEX "bookingEvents_customerId_idx" ON "booking_events" USING btree ("customer_id");--> statement-breakpoint
CREATE INDEX "bookingEvents_helperId_idx" ON "booking_events" USING btree ("helper_id");--> statement-breakpoint
CREATE INDEX "bookingEvents_eventType_idx" ON "booking_events" USING btree ("event_type");--> statement-breakpoint
CREATE INDEX "bookingEvents_expiresAt_idx" ON "booking_events" USING btree ("expires_at");--> statement-breakpoint
CREATE UNIQUE INDEX "helperPresence_helperUserId_uidx" ON "helper_presence" USING btree ("helper_user_id");--> statement-breakpoint
CREATE INDEX "helperPresence_status_idx" ON "helper_presence" USING btree ("status");--> statement-breakpoint
CREATE INDEX "incomingJobs_helperId_idx" ON "incoming_jobs" USING btree ("helper_id");--> statement-breakpoint
CREATE INDEX "incomingJobs_bookingId_idx" ON "incoming_jobs" USING btree ("booking_id");--> statement-breakpoint
CREATE INDEX "incomingJobs_status_idx" ON "incoming_jobs" USING btree ("status");--> statement-breakpoint
CREATE INDEX "incomingJobs_expiresAt_idx" ON "incoming_jobs" USING btree ("expires_at");--> statement-breakpoint
CREATE INDEX "locationUpdates_helperUserId_idx" ON "location_updates" USING btree ("helper_user_id");--> statement-breakpoint
CREATE INDEX "locationUpdates_bookingId_idx" ON "location_updates" USING btree ("booking_id");--> statement-breakpoint
CREATE INDEX "locationUpdates_expiresAt_idx" ON "location_updates" USING btree ("expires_at");--> statement-breakpoint
CREATE INDEX "notificationQueue_userId_idx" ON "notification_queue" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "notificationQueue_sent_idx" ON "notification_queue" USING btree ("sent");--> statement-breakpoint
CREATE INDEX "notificationQueue_expiresAt_idx" ON "notification_queue" USING btree ("expires_at");--> statement-breakpoint
CREATE INDEX "subscriptions_userId_idx" ON "subscriptions" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "subscriptions_connectionId_idx" ON "subscriptions" USING btree ("connection_id");--> statement-breakpoint
CREATE INDEX "subscriptions_eventType_idx" ON "subscriptions" USING btree ("event_type");--> statement-breakpoint
CREATE INDEX "subscriptions_resourceId_idx" ON "subscriptions" USING btree ("resource_id");