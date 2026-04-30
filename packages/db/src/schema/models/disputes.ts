import { relations } from "drizzle-orm";
import {
  boolean,
  index,
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
} from "drizzle-orm/pg-core";
import { disputeResolutionEnum, disputeStatusEnum } from "../enums.js";
import { user } from "./auth.js";
import { booking } from "./bookings.js";

export const dispute = pgTable(
  "dispute",
  {
    id: text("id").primaryKey(),
    bookingId: text("booking_id")
      .notNull()
      .references(() => booking.id, { onDelete: "restrict" }),
    raisedByUserId: text("raised_by_user_id")
      .notNull()
      .references(() => user.id, { onDelete: "restrict" }),
    againstUserId: text("against_user_id").references(() => user.id, {
      onDelete: "set null",
    }),
    status: disputeStatusEnum("status").default("open").notNull(),
    reasonCode: text("reason_code").notNull(),
    description: text("description").notNull(),
    adminNotes: text("admin_notes"),
    resolutionType: disputeResolutionEnum("resolution_type"),
    resolutionAmount: integer("resolution_amount"),
    resolvedByUserId: text("resolved_by_user_id").references(() => user.id, {
      onDelete: "set null",
    }),
    resolvedAt: timestamp("resolved_at"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    index("dispute_bookingId_idx").on(table.bookingId),
    index("dispute_raisedByUserId_idx").on(table.raisedByUserId),
    index("dispute_againstUserId_idx").on(table.againstUserId),
    index("dispute_status_createdAt_idx").on(table.status, table.createdAt),
  ],
);

export const disputeMessage = pgTable(
  "dispute_message",
  {
    id: text("id").primaryKey(),
    disputeId: text("dispute_id")
      .notNull()
      .references(() => dispute.id, { onDelete: "cascade" }),
    senderUserId: text("sender_user_id")
      .notNull()
      .references(() => user.id, { onDelete: "restrict" }),
    message: text("message").notNull(),
    attachments: jsonb("attachments"),
    isInternal: boolean("is_internal").default(false).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    index("disputeMessage_disputeId_createdAt_idx").on(
      table.disputeId,
      table.createdAt,
    ),
  ],
);

// RELATIONS
export const disputeRelations = relations(dispute, ({ one, many }) => ({
  booking: one(booking, {
    fields: [dispute.bookingId],
    references: [booking.id],
  }),
  raisedByUser: one(user, {
    relationName: "disputeRaisedBy",
    fields: [dispute.raisedByUserId],
    references: [user.id],
  }),
  againstUser: one(user, {
    fields: [dispute.againstUserId],
    references: [user.id],
  }),
  resolvedByUser: one(user, {
    fields: [dispute.resolvedByUserId],
    references: [user.id],
  }),
  messages: many(disputeMessage),
}));

export const disputeMessageRelations = relations(disputeMessage, ({ one }) => ({
  dispute: one(dispute, {
    fields: [disputeMessage.disputeId],
    references: [dispute.id],
  }),
  senderUser: one(user, {
    fields: [disputeMessage.senderUserId],
    references: [user.id],
  }),
}));
