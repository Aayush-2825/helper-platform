import {
  pgSchema,
  pgEnum,
  text,
  timestamp,
  boolean,
  numeric,
  integer,
  index,
  uniqueIndex,
} from "drizzle-orm/pg-core";

const realtimeSchema = pgSchema("realtime");
const realtimeTable = realtimeSchema.table;

// Enums for real-time events
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

// Track active WebSocket connections
export const activeConnections = realtimeTable(
  "active_connections",
  {
    id: text("id").primaryKey(),
    userId: text("user_id").notNull(),
    userRole: text("user_role").notNull(), // 'customer', 'helper', 'admin'
    connectionId: text("connection_id").notNull().unique(),
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),
    connectedAt: timestamp("connected_at").defaultNow().notNull(),
    disconnectedAt: timestamp("disconnected_at"),
    isActive: boolean("is_active").default(true).notNull(),
  },
  (table) => [
    index("activeConnections_userId_idx").on(table.userId),
    index("activeConnections_isActive_idx").on(table.isActive),
  ],
);

// Track real-time helper presence and availability
export const helperPresence = realtimeTable(
  "helper_presence",
  {
    id: text("id").primaryKey(),
    helperUserId: text("helper_user_id").notNull().unique(),

    status: helperPresenceStatusEnum("status").default("offline").notNull(),

    latitude: numeric("latitude", { precision: 10, scale: 7 }),
    longitude: numeric("longitude", { precision: 10, scale: 7 }),

    availableSlots: integer("available_slots").default(1),
    currentBookingCount: integer("current_booking_count").default(0),

    lastHeartbeat: timestamp("last_heartbeat").defaultNow().notNull(),

    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [index("helperPresence_status_idx").on(table.status)],
);

// Track location updates for active jobs
export const locationUpdates = realtimeTable(
  "location_updates",
  {
    id: text("id").primaryKey(),
    helperUserId: text("helper_user_id").notNull(),
    bookingId: text("booking_id").notNull(),
    latitude: numeric("latitude", { precision: 10, scale: 7 }).notNull(),
    longitude: numeric("longitude", { precision: 10, scale: 7 }).notNull(),
    accuracy: numeric("accuracy", { precision: 8, scale: 2 }), // in meters
    speed: numeric("speed", { precision: 6, scale: 2 }), // km/h
    heading: numeric("heading", { precision: 6, scale: 2 }), // degrees
    timestamp: timestamp("timestamp").defaultNow().notNull(),
    expiresAt: timestamp("expires_at"), // For TTL cleanup
  },
  (table) => [
    index("locationUpdates_helperUserId_idx").on(table.helperUserId),
    index("locationUpdates_bookingId_idx").on(table.bookingId),
    index("locationUpdates_expiresAt_idx").on(table.expiresAt),
  ],
);

// Track real-time booking events for WebSocket subscriptions
export const bookingEvents = realtimeTable(
  "booking_events",
  {
    id: text("id").primaryKey(),
    bookingId: text("booking_id").notNull(),
    eventType: bookingEventTypeEnum("event_type").notNull(),
    customerId: text("customer_id").notNull(),
    helperId: text("helper_id"),
    data: text("data"), // JSON stringified event details
    createdAt: timestamp("created_at").defaultNow().notNull(),
    expiresAt: timestamp("expires_at"), // For TTL cleanup (e.g., 7 days)
  },
  (table) => [
    index("bookingEvents_bookingId_idx").on(table.bookingId),
    index("bookingEvents_customerId_idx").on(table.customerId),
    index("bookingEvents_helperId_idx").on(table.helperId),
    index("bookingEvents_eventType_idx").on(table.eventType),
    index("bookingEvents_expiresAt_idx").on(table.expiresAt),
  ],
);

// Track WebSocket subscriptions (what events a user is interested in)
export const subscriptions = realtimeTable(
  "subscriptions",
  {
    id: text("id").primaryKey(),
    userId: text("user_id").notNull(),
    connectionId: text("connection_id").notNull(),
    eventType: websocketEventTypeEnum("event_type").notNull(),
    resourceId: text("resource_id"), // booking_id, helper_id, etc.
    subscribedAt: timestamp("subscribed_at").defaultNow().notNull(),
    unsubscribedAt: timestamp("unsubscribed_at"),
  },
  (table) => [
    index("subscriptions_userId_idx").on(table.userId),
    index("subscriptions_connectionId_idx").on(table.connectionId),
    index("subscriptions_eventType_idx").on(table.eventType),
    index("subscriptions_resourceId_idx").on(table.resourceId),
  ],
);

// Track real-time notifications queued for delivery
export const notificationQueue = realtimeTable(
  "notification_queue",
  {
    id: text("id").primaryKey(),
    userId: text("user_id").notNull(),
    eventType: websocketEventTypeEnum("event_type").notNull(),
    payload: text("payload").notNull(), // JSON stringified notification data
    sent: boolean("sent").default(false).notNull(),
    sentAt: timestamp("sent_at"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    expiresAt: timestamp("expires_at"), // For TTL cleanup (e.g., 24 hours)
  },
  (table) => [
    index("notificationQueue_userId_idx").on(table.userId),
    index("notificationQueue_sent_idx").on(table.sent),
    index("notificationQueue_expiresAt_idx").on(table.expiresAt),
  ],
);

// Track incoming job matching events for helpers
export const incomingJobs = realtimeTable(
  "incoming_jobs",
  {
    id: text("id").primaryKey(),
    bookingId: text("booking_id").notNull(),
    helperId: text("helper_id").notNull(),
    status: text("status").default("pending").notNull(), // pending, accepted, rejected, timeout
    sentAt: timestamp("sent_at").defaultNow().notNull(),
    respondedAt: timestamp("responded_at"),
    expiresAt: timestamp("expires_at"), // Matching timeout (e.g., 10 minutes)
  },
  (table) => [
    index("incomingJobs_helperId_idx").on(table.helperId),
    index("incomingJobs_bookingId_idx").on(table.bookingId),
    index("incomingJobs_status_idx").on(table.status),
    index("incomingJobs_expiresAt_idx").on(table.expiresAt),
  ],
);

// Export types for type-safe queries
export type ActiveConnection = typeof activeConnections.$inferSelect;
export type NewActiveConnection = typeof activeConnections.$inferInsert;

export type HelperPresence = typeof helperPresence.$inferSelect;
export type NewHelperPresence = typeof helperPresence.$inferInsert;

export type LocationUpdate = typeof locationUpdates.$inferSelect;
export type NewLocationUpdate = typeof locationUpdates.$inferInsert;

export type BookingEvent = typeof bookingEvents.$inferSelect;
export type NewBookingEvent = typeof bookingEvents.$inferInsert;

export type Subscription = typeof subscriptions.$inferSelect;
export type NewSubscription = typeof subscriptions.$inferInsert;

export type NotificationQueueItem = typeof notificationQueue.$inferSelect;
export type NewNotificationQueueItem = typeof notificationQueue.$inferInsert;

export type IncomingJob = typeof incomingJobs.$inferSelect;
export type NewIncomingJob = typeof incomingJobs.$inferInsert;
