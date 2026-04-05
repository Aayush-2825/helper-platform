import "dotenv/config";

import { Pool } from "pg";

const databaseUrl = process.env.DATABASE_URL_REALTIME || process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error(
    "DATABASE_URL_REALTIME (or DATABASE_URL fallback) is not set in the environment"
  );
}

const pool = new Pool({ connectionString: databaseUrl });

const statements = [
  'CREATE SCHEMA IF NOT EXISTS "realtime";',
  `DO $$
BEGIN
  CREATE TYPE public.booking_event_type AS ENUM (
    'created',
    'accepted',
    'rejected',
    'in_progress',
    'completed',
    'cancelled',
    'matching_timeout'
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;`,
  `DO $$
BEGIN
  CREATE TYPE public.helper_presence_status AS ENUM (
    'online',
    'offline',
    'busy',
    'away'
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;`,
  `DO $$
BEGIN
  CREATE TYPE public.websocket_event_type AS ENUM (
    'booking_request',
    'booking_update',
    'helper_presence',
    'location_update',
    'message',
    'notification',
    'payment_update'
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;`,
  `CREATE TABLE IF NOT EXISTS "realtime"."active_connections" (
    "id" text PRIMARY KEY NOT NULL,
    "user_id" text NOT NULL,
    "user_role" text NOT NULL,
    "connection_id" text NOT NULL,
    "ip_address" text,
    "user_agent" text,
    "connected_at" timestamp DEFAULT now() NOT NULL,
    "disconnected_at" timestamp,
    "is_active" boolean DEFAULT true NOT NULL
  );`,
  `CREATE UNIQUE INDEX IF NOT EXISTS "active_connections_connection_id_unique"
    ON "realtime"."active_connections" USING btree ("connection_id");`,
  `CREATE INDEX IF NOT EXISTS "activeConnections_userId_idx"
    ON "realtime"."active_connections" USING btree ("user_id");`,
  `CREATE INDEX IF NOT EXISTS "activeConnections_isActive_idx"
    ON "realtime"."active_connections" USING btree ("is_active");`,
  `CREATE TABLE IF NOT EXISTS "realtime"."booking_events" (
    "id" text PRIMARY KEY NOT NULL,
    "booking_id" text NOT NULL,
    "event_type" "booking_event_type" NOT NULL,
    "customer_id" text NOT NULL,
    "helper_id" text,
    "data" text,
    "created_at" timestamp DEFAULT now() NOT NULL,
    "expires_at" timestamp
  );`,
  `CREATE INDEX IF NOT EXISTS "bookingEvents_bookingId_idx"
    ON "realtime"."booking_events" USING btree ("booking_id");`,
  `CREATE INDEX IF NOT EXISTS "bookingEvents_customerId_idx"
    ON "realtime"."booking_events" USING btree ("customer_id");`,
  `CREATE INDEX IF NOT EXISTS "bookingEvents_helperId_idx"
    ON "realtime"."booking_events" USING btree ("helper_id");`,
  `CREATE INDEX IF NOT EXISTS "bookingEvents_eventType_idx"
    ON "realtime"."booking_events" USING btree ("event_type");`,
  `CREATE INDEX IF NOT EXISTS "bookingEvents_expiresAt_idx"
    ON "realtime"."booking_events" USING btree ("expires_at");`,
  `CREATE TABLE IF NOT EXISTS "realtime"."helper_presence" (
    "id" text PRIMARY KEY NOT NULL,
    "helper_user_id" text NOT NULL,
    "status" "helper_presence_status" DEFAULT 'offline' NOT NULL,
    "latitude" numeric(10, 7),
    "longitude" numeric(10, 7),
    "available_slots" integer DEFAULT 1,
    "current_booking_count" integer DEFAULT 0,
    "last_heartbeat" timestamp DEFAULT now() NOT NULL,
    "updated_at" timestamp DEFAULT now() NOT NULL
  );`,
  `CREATE UNIQUE INDEX IF NOT EXISTS "helper_presence_helper_user_id_unique"
    ON "realtime"."helper_presence" USING btree ("helper_user_id");`,
  `CREATE INDEX IF NOT EXISTS "helperPresence_status_idx"
    ON "realtime"."helper_presence" USING btree ("status");`,
  `CREATE TABLE IF NOT EXISTS "realtime"."incoming_jobs" (
    "id" text PRIMARY KEY NOT NULL,
    "booking_id" text NOT NULL,
    "helper_id" text NOT NULL,
    "status" text DEFAULT 'pending' NOT NULL,
    "sent_at" timestamp DEFAULT now() NOT NULL,
    "responded_at" timestamp,
    "expires_at" timestamp
  );`,
  `CREATE INDEX IF NOT EXISTS "incomingJobs_helperId_idx"
    ON "realtime"."incoming_jobs" USING btree ("helper_id");`,
  `CREATE INDEX IF NOT EXISTS "incomingJobs_bookingId_idx"
    ON "realtime"."incoming_jobs" USING btree ("booking_id");`,
  `CREATE INDEX IF NOT EXISTS "incomingJobs_status_idx"
    ON "realtime"."incoming_jobs" USING btree ("status");`,
  `CREATE INDEX IF NOT EXISTS "incomingJobs_expiresAt_idx"
    ON "realtime"."incoming_jobs" USING btree ("expires_at");`,
  `CREATE TABLE IF NOT EXISTS "realtime"."location_updates" (
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
  );`,
  `CREATE INDEX IF NOT EXISTS "locationUpdates_helperUserId_idx"
    ON "realtime"."location_updates" USING btree ("helper_user_id");`,
  `CREATE INDEX IF NOT EXISTS "locationUpdates_bookingId_idx"
    ON "realtime"."location_updates" USING btree ("booking_id");`,
  `CREATE INDEX IF NOT EXISTS "locationUpdates_expiresAt_idx"
    ON "realtime"."location_updates" USING btree ("expires_at");`,
  `CREATE TABLE IF NOT EXISTS "realtime"."notification_queue" (
    "id" text PRIMARY KEY NOT NULL,
    "user_id" text NOT NULL,
    "event_type" "websocket_event_type" NOT NULL,
    "payload" text NOT NULL,
    "sent" boolean DEFAULT false NOT NULL,
    "sent_at" timestamp,
    "created_at" timestamp DEFAULT now() NOT NULL,
    "expires_at" timestamp
  );`,
  `CREATE INDEX IF NOT EXISTS "notificationQueue_userId_idx"
    ON "realtime"."notification_queue" USING btree ("user_id");`,
  `CREATE INDEX IF NOT EXISTS "notificationQueue_sent_idx"
    ON "realtime"."notification_queue" USING btree ("sent");`,
  `CREATE INDEX IF NOT EXISTS "notificationQueue_expiresAt_idx"
    ON "realtime"."notification_queue" USING btree ("expires_at");`,
  `CREATE TABLE IF NOT EXISTS "realtime"."subscriptions" (
    "id" text PRIMARY KEY NOT NULL,
    "user_id" text NOT NULL,
    "connection_id" text NOT NULL,
    "event_type" "websocket_event_type" NOT NULL,
    "resource_id" text,
    "subscribed_at" timestamp DEFAULT now() NOT NULL,
    "unsubscribed_at" timestamp
  );`,
  `CREATE INDEX IF NOT EXISTS "subscriptions_userId_idx"
    ON "realtime"."subscriptions" USING btree ("user_id");`,
  `CREATE INDEX IF NOT EXISTS "subscriptions_connectionId_idx"
    ON "realtime"."subscriptions" USING btree ("connection_id");`,
  `CREATE INDEX IF NOT EXISTS "subscriptions_eventType_idx"
    ON "realtime"."subscriptions" USING btree ("event_type");`,
  `CREATE INDEX IF NOT EXISTS "subscriptions_resourceId_idx"
    ON "realtime"."subscriptions" USING btree ("resource_id");`,
];

async function main() {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");
    await client.query(`SELECT pg_advisory_xact_lock(hashtext('helper-platform-realtime-sync'));`);

    for (const statement of statements) {
      await client.query(statement);
    }

    await client.query("COMMIT");
    console.log("Realtime tables are ensured.");
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});