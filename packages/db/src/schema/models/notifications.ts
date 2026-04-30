import { relations } from "drizzle-orm";
import {
  index,
  jsonb,
  pgTable,
  text,
  timestamp,
} from "drizzle-orm/pg-core";
import { user } from "./auth.js";

export const notificationEvent = pgTable(
  "notification_event",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    channel: text("channel").notNull(),
    templateKey: text("template_key").notNull(),
    status: text("status").default("queued").notNull(),
    payload: jsonb("payload"),
    sentAt: timestamp("sent_at"),
    error: text("error"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    index("notificationEvent_userId_createdAt_idx").on(
      table.userId,
      table.createdAt,
    ),
    index("notificationEvent_status_idx").on(table.status),
  ],
);

// RELATIONS
export const notificationEventRelations = relations(notificationEvent, ({ one }) => ({
  user: one(user, {
    fields: [notificationEvent.userId],
    references: [user.id],
  }),
}));
