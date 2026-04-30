import { relations } from "drizzle-orm";
import {
  boolean,
  index,
  integer,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { reviewModerationStatusEnum } from "../enums.js";
import { user } from "./auth.js";
import { helperProfile } from "./helpers.js";
import { booking } from "./bookings.js";

export const review = pgTable(
  "review",
  {
    id: text("id").primaryKey(),
    bookingId: text("booking_id")
      .notNull()
      .references(() => booking.id, { onDelete: "cascade" }),
    customerId: text("customer_id")
      .notNull()
      .references(() => user.id, { onDelete: "restrict" }),
    helperProfileId: text("helper_profile_id")
      .notNull()
      .references(() => helperProfile.id, { onDelete: "cascade" }),
    rating: integer("rating").notNull(),
    title: text("title"),
    comment: text("comment"),
    isAnonymous: boolean("is_anonymous").default(false).notNull(),
    moderationStatus:
      reviewModerationStatusEnum("moderation_status").default("visible").notNull(),
    moderatedByUserId: text("moderated_by_user_id").references(() => user.id, {
      onDelete: "set null",
    }),
    moderationReason: text("moderation_reason"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    uniqueIndex("review_bookingId_uidx").on(table.bookingId),
    index("review_helperProfileId_idx").on(table.helperProfileId),
    index("review_customerId_idx").on(table.customerId),
    index("review_moderationStatus_createdAt_idx").on(
      table.moderationStatus,
      table.createdAt,
    ),
  ],
);

export const reviewRelations = relations(review, ({ one }) => ({
  booking: one(booking, {
    fields: [review.bookingId],
    references: [booking.id],
  }),
  customer: one(user, {
    relationName: "customerReviews",
    fields: [review.customerId],
    references: [user.id],
  }),
  helperProfile: one(helperProfile, {
    fields: [review.helperProfileId],
    references: [helperProfile.id],
  }),
  moderatedByUser: one(user, {
    fields: [review.moderatedByUserId],
    references: [user.id],
  }),
}));
