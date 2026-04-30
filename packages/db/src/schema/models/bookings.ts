import { relations } from "drizzle-orm";
import {
  index,
  integer,
  jsonb,
  numeric,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import {
  bookingCandidateResponseEnum,
  bookingStatusEnum,
  cancellationActorEnum,
  contactMethodEnum,
} from "../enums.js";
import { user } from "./auth.js";
import { helperProfile } from "./helpers.js";
import { serviceCategory, serviceSubcategory } from "./services.js";

export const booking = pgTable(
  "booking",
  {
    id: text("id").primaryKey(),
    customerId: text("customer_id")
      .notNull()
      .references(() => user.id, { onDelete: "restrict" }),
    helperId: text("helper_id").references(() => user.id, { onDelete: "set null" }),
    helperProfileId: text("helper_profile_id").references(() => helperProfile.id, {
      onDelete: "set null",
    }),
    categoryId: text("category_id")
      .notNull()
      .references(() => serviceCategory.id, { onDelete: "restrict" }),
    subcategoryId: text("subcategory_id").references(() => serviceSubcategory.id, {
      onDelete: "set null",
    }),
    status: bookingStatusEnum("status").default("requested").notNull(),
    requestedAt: timestamp("requested_at").defaultNow().notNull(),
    acceptanceDeadline: timestamp("acceptance_deadline"),
    acceptedAt: timestamp("accepted_at"),
    scheduledFor: timestamp("scheduled_for"),
    startedAt: timestamp("started_at"),
    completedAt: timestamp("completed_at"),
    cancelledAt: timestamp("cancelled_at"),
    cancelledBy: cancellationActorEnum("cancelled_by"),
    cancellationReason: text("cancellation_reason"),
    customerName: text("customer_name"),
    customerPhone: text("customer_phone"),
    helperName: text("helper_name"),
    helperPhone: text("helper_phone"),
    helperPhoneVisibleAt: timestamp("helper_phone_visible_at"),
    preferredContactMethod: contactMethodEnum("preferred_contact_method")
      .default("call")
      .notNull(),
    addressLine: text("address_line").notNull(),
    area: text("area"),
    city: text("city").notNull(),
    state: text("state"),
    postalCode: text("postal_code"),
    latitude: numeric("latitude", { precision: 10, scale: 7 }),
    longitude: numeric("longitude", { precision: 10, scale: 7 }),
    notes: text("notes"),
    quotedAmount: integer("quoted_amount").notNull(),
    finalAmount: integer("final_amount"),
    currency: text("currency").default("INR").notNull(),
    commissionRate: integer("commission_rate").default(15).notNull(),
    commissionAmount: integer("commission_amount"),
    distanceKm: numeric("distance_km", { precision: 6, scale: 2 }),
    startCode: text("start_code"),
    completeCode: text("complete_code"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    index("booking_customerId_idx").on(table.customerId),
    index("booking_helperId_idx").on(table.helperId),
    index("booking_helperProfileId_idx").on(table.helperProfileId),
    index("booking_status_requestedAt_idx").on(table.status, table.requestedAt),
    index("booking_categoryId_status_idx").on(table.categoryId, table.status),
    index("booking_acceptanceDeadline_idx").on(table.acceptanceDeadline),
    index("booking_city_idx").on(table.city),
  ],
);

export const bookingCandidate = pgTable(
  "booking_candidate",
  {
    id: text("id").primaryKey(),
    bookingId: text("booking_id")
      .notNull()
      .references(() => booking.id, { onDelete: "cascade" }),
    helperProfileId: text("helper_profile_id")
      .notNull()
      .references(() => helperProfile.id, { onDelete: "cascade" }),
    response: bookingCandidateResponseEnum("response").default("pending").notNull(),
    rankScore: integer("rank_score"),
    distanceKm: numeric("distance_km", { precision: 6, scale: 2 }),
    offeredAt: timestamp("offered_at").defaultNow().notNull(),
    respondedAt: timestamp("responded_at"),
    expiresAt: timestamp("expires_at"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("bookingCandidate_bookingId_helperProfileId_uidx").on(
      table.bookingId,
      table.helperProfileId,
    ),
    index("bookingCandidate_bookingId_response_idx").on(
      table.bookingId,
      table.response,
    ),
    index("bookingCandidate_helperProfileId_idx").on(table.helperProfileId),
  ],
);

export const bookingStatusEvent = pgTable(
  "booking_status_event",
  {
    id: text("id").primaryKey(),
    bookingId: text("booking_id")
      .notNull()
      .references(() => booking.id, { onDelete: "cascade" }),
    status: bookingStatusEnum("status").notNull(),
    actorUserId: text("actor_user_id").references(() => user.id, {
      onDelete: "set null",
    }),
    note: text("note"),
    metadata: jsonb("metadata"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    index("bookingStatusEvent_bookingId_createdAt_idx").on(
      table.bookingId,
      table.createdAt,
    ),
    index("bookingStatusEvent_actorUserId_idx").on(table.actorUserId),
  ],
);

// RELATIONS
export const bookingRelations = relations(booking, ({ one, many }) => ({
  customer: one(user, {
    relationName: "bookingCustomer",
    fields: [booking.customerId],
    references: [user.id],
  }),
  helper: one(user, {
    relationName: "bookingHelper",
    fields: [booking.helperId],
    references: [user.id],
  }),
  helperProfile: one(helperProfile, {
    fields: [booking.helperProfileId],
    references: [helperProfile.id],
  }),
  category: one(serviceCategory, {
    fields: [booking.categoryId],
    references: [serviceCategory.id],
  }),
  subcategory: one(serviceSubcategory, {
    fields: [booking.subcategoryId],
    references: [serviceSubcategory.id],
  }),
  candidates: many(bookingCandidate),
  statusEvents: many(bookingStatusEvent),
}));

export const bookingCandidateRelations = relations(
  bookingCandidate,
  ({ one }) => ({
    booking: one(booking, {
      fields: [bookingCandidate.bookingId],
      references: [booking.id],
    }),
    helperProfile: one(helperProfile, {
      fields: [bookingCandidate.helperProfileId],
      references: [helperProfile.id],
    }),
  }),
);

export const bookingStatusEventRelations = relations(
  bookingStatusEvent,
  ({ one }) => ({
    booking: one(booking, {
      fields: [bookingStatusEvent.bookingId],
      references: [booking.id],
    }),
    actorUser: one(user, {
      fields: [bookingStatusEvent.actorUserId],
      references: [user.id],
    }),
  }),
);
