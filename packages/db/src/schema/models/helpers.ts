import { relations } from "drizzle-orm";
import {
  boolean,
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
  helperAvailabilityStatusEnum,
  helperServiceCategoryEnum,
  helperVideoKycStatusEnum,
  helperVerificationStatusEnum,
  videoKycSessionStatusEnum,
} from "../enums.js";
import { user } from "./auth.js";
import { organization } from "./organizations.js";

export const helperProfile = pgTable(
  "helper_profile",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    organizationId: text("organization_id").references(() => organization.id, {
      onDelete: "set null",
    }),
    primaryCategory: helperServiceCategoryEnum("primary_category").notNull(),
    headline: text("headline"),
    bio: text("bio"),
    yearsExperience: integer("years_experience").default(0).notNull(),
    serviceCity: text("service_city"),
    serviceRadiusKm: integer("service_radius_km").default(8).notNull(),
    verificationStatus:
      helperVerificationStatusEnum("verification_status").default("pending").notNull(),
    availabilityStatus:
      helperAvailabilityStatusEnum("availability_status").default("offline").notNull(),
    isActive: boolean("is_active").default(true).notNull(),
    blockResubmission: boolean("block_resubmission").default(false).notNull(),
    lastResubmittedAt: timestamp("last_resubmitted_at"),
    submittedAt: timestamp("submitted_at"),
    videoKycStatus: helperVideoKycStatusEnum("video_kyc_status")
      .default("pending_schedule")
      .notNull(),
    averageRating: numeric("average_rating", { precision: 3, scale: 2 })
      .default("0.00")
      .notNull(),
    totalRatings: integer("total_ratings").default(0).notNull(),
    completedJobs: integer("completed_jobs").default(0).notNull(),
    qualityScore: integer("quality_score").default(0).notNull(),
    phoneForBookings: text("phone_for_bookings"),
    verifiedPhone: text("verified_phone"),
    verifiedPhoneDate: timestamp("verified_phone_date"),
    emergencyContactName: text("emergency_contact_name"),
    emergencyContactPhone: text("emergency_contact_phone"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    uniqueIndex("helperProfile_userId_uidx").on(table.userId),
    index("helperProfile_primaryCategory_idx").on(table.primaryCategory),
    index("helperProfile_verificationStatus_idx").on(table.verificationStatus),
    index("helperProfile_availabilityStatus_idx").on(table.availabilityStatus),
    index("helperProfile_serviceCity_idx").on(table.serviceCity),
  ],
);

export const helperOnboardingDraft = pgTable(
  "helper_onboarding_draft",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    stepIndex: integer("step_index").default(0).notNull(),
    payload: jsonb("payload").default({}).notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [uniqueIndex("helperOnboardingDraft_userId_uidx").on(table.userId)],
);

export const helperKycDocument = pgTable(
  "helper_kyc_document",
  {
    id: text("id").primaryKey(),
    helperProfileId: text("helper_profile_id")
      .notNull()
      .references(() => helperProfile.id, { onDelete: "cascade" }),
    documentType: text("document_type").notNull(),
    documentNumber: text("document_number"),
    fileUrl: text("file_url").notNull(),
    status: helperVerificationStatusEnum("status").default("pending").notNull(),
    reviewedByUserId: text("reviewed_by_user_id").references(() => user.id, {
      onDelete: "set null",
    }),
    reviewedAt: timestamp("reviewed_at"),
    rejectionReason: text("rejection_reason"),
    expiresAt: timestamp("expires_at"),
    supersededAt: timestamp("superseded_at"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    index("helperKycDocument_helperProfileId_idx").on(table.helperProfileId),
    index("helperKycDocument_status_idx").on(table.status),
  ],
);

export const videoKycSession = pgTable(
  "video_kyc_session",
  {
    id: text("id").primaryKey(),
    helperProfileId: text("helper_profile_id")
      .notNull()
      .references(() => helperProfile.id, { onDelete: "cascade" }),
    meetLink: text("meet_link").notNull(),
    calendarEventId: text("calendar_event_id").notNull(),
    scheduledAt: timestamp("scheduled_at").notNull(),
    status: videoKycSessionStatusEnum("status").default("scheduled").notNull(),
    attemptNumber: integer("attempt_number").default(1).notNull(),
    adminUserId: text("admin_user_id").references(() => user.id, {
      onDelete: "set null",
    }),
    adminNotes: text("admin_notes"),
    completedAt: timestamp("completed_at"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    index("videoKycSession_helperProfileId_idx").on(table.helperProfileId),
    index("videoKycSession_status_scheduledAt_idx").on(table.status, table.scheduledAt),
  ],
);

export const helperWebPushSubscription = pgTable(
  "helper_web_push_subscription",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    helperProfileId: text("helper_profile_id")
      .notNull()
      .references(() => helperProfile.id, { onDelete: "cascade" }),
    endpoint: text("endpoint").notNull(),
    p256dh: text("p256dh").notNull(),
    auth: text("auth").notNull(),
    expirationTime: timestamp("expiration_time"),
    userAgent: text("user_agent"),
    isActive: boolean("is_active").default(true).notNull(),
    lastUsedAt: timestamp("last_used_at"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    uniqueIndex("helperWebPushSubscription_helperProfile_endpoint_uidx").on(
      table.helperProfileId,
      table.endpoint,
    ),
    index("helperWebPushSubscription_userId_idx").on(table.userId),
    index("helperWebPushSubscription_helperProfileId_idx").on(table.helperProfileId),
    index("helperWebPushSubscription_isActive_idx").on(table.isActive),
  ],
);

// RELATIONS
export const helperProfileRelations = relations(helperProfile, ({ one, many }) => ({
  user: one(user, {
    fields: [helperProfile.userId],
    references: [user.id],
  }),
  organization: one(organization, {
    fields: [helperProfile.organizationId],
    references: [organization.id],
  }),
  kycDocuments: many(helperKycDocument),
  videoKycSessions: many(videoKycSession),
  webPushSubscriptions: many(helperWebPushSubscription),
}));

export const helperOnboardingDraftRelations = relations(helperOnboardingDraft, ({ one }) => ({
  user: one(user, {
    fields: [helperOnboardingDraft.userId],
    references: [user.id],
  }),
}));

export const helperKycDocumentRelations = relations(helperKycDocument, ({ one }) => ({
  helperProfile: one(helperProfile, {
    fields: [helperKycDocument.helperProfileId],
    references: [helperProfile.id],
  }),
  reviewedByUser: one(user, {
    fields: [helperKycDocument.reviewedByUserId],
    references: [user.id],
  }),
}));

export const videoKycSessionRelations = relations(videoKycSession, ({ one }) => ({
  helperProfile: one(helperProfile, {
    fields: [videoKycSession.helperProfileId],
    references: [helperProfile.id],
  }),
  adminUser: one(user, {
    fields: [videoKycSession.adminUserId],
    references: [user.id],
  }),
}));

export const helperWebPushSubscriptionRelations = relations(helperWebPushSubscription, ({ one }) => ({
  user: one(user, {
    fields: [helperWebPushSubscription.userId],
    references: [user.id],
  }),
  helperProfile: one(helperProfile, {
    fields: [helperWebPushSubscription.helperProfileId],
    references: [helperProfile.id],
  }),
}));
