import { relations } from "drizzle-orm";
import {
  bigint,
  boolean,
  index,
  integer,
  jsonb,
  numeric,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";

export const helperVerificationStatusEnum = pgEnum(
  "helper_verification_status",
  ["pending", "approved", "rejected", "resubmission_required"],
);

export const helperAvailabilityStatusEnum = pgEnum(
  "helper_availability_status",
  ["online", "offline", "busy"],
);

export const bookingStatusEnum = pgEnum("booking_status", [
  "requested",
  "matched",
  "accepted",
  "in_progress",
  "completed",
  "cancelled",
  "expired",
  "disputed",
]);

export const bookingCandidateResponseEnum = pgEnum("booking_candidate_response", [
  "pending",
  "accepted",
  "rejected",
  "timeout",
]);

export const cancellationActorEnum = pgEnum("cancellation_actor", [
  "customer",
  "helper",
  "admin",
  "system",
]);

export const paymentMethodEnum = pgEnum("payment_method", [
  "upi",
  "card",
  "wallet",
  "cash",
]);

export const paymentStatusEnum = pgEnum("payment_status", [
  "created",
  "authorized",
  "captured",
  "failed",
  "refunded",
  "partially_refunded",
]);

export const payoutStatusEnum = pgEnum("payout_status", [
  "pending",
  "processing",
  "paid",
  "failed",
  "reversed",
]);

export const disputeStatusEnum = pgEnum("dispute_status", [
  "open",
  "investigating",
  "resolved",
  "rejected",
]);

export const disputeResolutionEnum = pgEnum("dispute_resolution", [
  "refund_full",
  "refund_partial",
  "no_refund",
  "credit_note",
  "other",
]);

export const reviewModerationStatusEnum = pgEnum("review_moderation_status", [
  "visible",
  "hidden",
  "flagged",
]);

export const helperServiceCategoryEnum = pgEnum("helper_service_category", [
  "driver",
  "electrician",
  "plumber",
  "cleaner",
  "chef",
  "delivery_helper",
  "caretaker",
  "security_guard",
  "other",
]);

export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  phone: text("phone"),
  emailVerified: boolean("email_verified").default(false).notNull(),
  image: text("image"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
  twoFactorEnabled: boolean("two_factor_enabled").default(false),
  role: text("role").default("user"),
});

export const session = pgTable(
  "session",
  {
    id: text("id").primaryKey(),
    expiresAt: timestamp("expires_at").notNull(),
    token: text("token").notNull().unique(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .$onUpdate(() => new Date())
      .notNull(),
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    activeOrganizationId: text("active_organization_id"),
    activeTeamId: text("active_team_id"),
  },
  (table) => [index("session_userId_idx").on(table.userId)],
);

export const account = pgTable(
  "account",
  {
    id: text("id").primaryKey(),
    accountId: text("account_id").notNull(),
    providerId: text("provider_id").notNull(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    accessToken: text("access_token"),
    refreshToken: text("refresh_token"),
    idToken: text("id_token"),
    accessTokenExpiresAt: timestamp("access_token_expires_at"),
    refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
    scope: text("scope"),
    password: text("password"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [index("account_userId_idx").on(table.userId)],
);

export const verification = pgTable(
  "verification",
  {
    id: text("id").primaryKey(),
    identifier: text("identifier").notNull(),
    value: text("value").notNull(),
    expiresAt: timestamp("expires_at").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [index("verification_identifier_idx").on(table.identifier)],
);

export const twoFactor = pgTable(
  "two_factor",
  {
    id: text("id").primaryKey(),
    secret: text("secret").notNull(),
    backupCodes: text("backup_codes").notNull(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
  },
  (table) => [
    index("twoFactor_secret_idx").on(table.secret),
    index("twoFactor_userId_idx").on(table.userId),
  ],
);

export const organization = pgTable(
  "organization",
  {
    id: text("id").primaryKey(),
    name: text("name").notNull(),
    slug: text("slug").notNull().unique(),
    logo: text("logo"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    metadata: text("metadata"),
  },
  (table) => [uniqueIndex("organization_slug_uidx").on(table.slug)],
);

export const team = pgTable(
  "team",
  {
    id: text("id").primaryKey(),
    name: text("name").notNull(),
    organizationId: text("organization_id")
      .notNull()
      .references(() => organization.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").$onUpdate(() => new Date()),
  },
  (table) => [index("team_organizationId_idx").on(table.organizationId)],
);

export const teamMember = pgTable(
  "team_member",
  {
    id: text("id").primaryKey(),
    teamId: text("team_id")
      .notNull()
      .references(() => team.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    index("teamMember_teamId_idx").on(table.teamId),
    index("teamMember_userId_idx").on(table.userId),
  ],
);

export const member = pgTable(
  "member",
  {
    id: text("id").primaryKey(),
    organizationId: text("organization_id")
      .notNull()
      .references(() => organization.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    role: text("role").default("member").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    index("member_organizationId_idx").on(table.organizationId),
    index("member_userId_idx").on(table.userId),
  ],
);

export const invitation = pgTable(
  "invitation",
  {
    id: text("id").primaryKey(),
    organizationId: text("organization_id")
      .notNull()
      .references(() => organization.id, { onDelete: "cascade" }),
    email: text("email").notNull(),
    role: text("role"),
    teamId: text("team_id"),
    status: text("status").default("pending").notNull(),
    expiresAt: timestamp("expires_at").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    inviterId: text("inviter_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
  },
  (table) => [
    index("invitation_organizationId_idx").on(table.organizationId),
    index("invitation_email_idx").on(table.email),
  ],
);

export const rateLimit = pgTable("rate_limit", {
  id: text("id").primaryKey(),
  key: text("key").notNull().unique(),
  count: integer("count").notNull(),
  lastRequest: bigint("last_request", { mode: "number" }).notNull(),
});

export const customerProfile = pgTable(
  "customer_profile",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    defaultAddressLine: text("default_address_line"),
    defaultArea: text("default_area"),
    defaultCity: text("default_city"),
    defaultState: text("default_state"),
    defaultPostalCode: text("default_postal_code"),
    defaultLatitude: numeric("default_latitude", { precision: 10, scale: 7 }),
    defaultLongitude: numeric("default_longitude", { precision: 10, scale: 7 }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [uniqueIndex("customerProfile_userId_uidx").on(table.userId)],
);

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
    averageRating: numeric("average_rating", { precision: 3, scale: 2 })
      .default("0.00")
      .notNull(),
    totalRatings: integer("total_ratings").default(0).notNull(),
    completedJobs: integer("completed_jobs").default(0).notNull(),
    qualityScore: integer("quality_score").default(0).notNull(),
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

export const serviceCategory = pgTable(
  "service_category",
  {
    id: text("id").primaryKey(),
    slug: text("slug").notNull(),
    name: text("name").notNull(),
    description: text("description"),
    isActive: boolean("is_active").default(true).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [uniqueIndex("serviceCategory_slug_uidx").on(table.slug)],
);

export const serviceSubcategory = pgTable(
  "service_subcategory",
  {
    id: text("id").primaryKey(),
    categoryId: text("category_id")
      .notNull()
      .references(() => serviceCategory.id, { onDelete: "cascade" }),
    slug: text("slug").notNull(),
    name: text("name").notNull(),
    description: text("description"),
    isActive: boolean("is_active").default(true).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    uniqueIndex("serviceSubcategory_categoryId_slug_uidx").on(
      table.categoryId,
      table.slug,
    ),
    index("serviceSubcategory_categoryId_idx").on(table.categoryId),
  ],
);

export const helperServiceOffering = pgTable(
  "helper_service_offering",
  {
    id: text("id").primaryKey(),
    helperProfileId: text("helper_profile_id")
      .notNull()
      .references(() => helperProfile.id, { onDelete: "cascade" }),
    categoryId: text("category_id")
      .notNull()
      .references(() => serviceCategory.id, { onDelete: "restrict" }),
    subcategoryId: text("subcategory_id").references(() => serviceSubcategory.id, {
      onDelete: "set null",
    }),
    pricingType: text("pricing_type").default("fixed").notNull(),
    basePrice: integer("base_price").notNull(),
    currency: text("currency").default("INR").notNull(),
    isActive: boolean("is_active").default(true).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    uniqueIndex("helperServiceOffering_unique_idx").on(
      table.helperProfileId,
      table.categoryId,
      table.subcategoryId,
    ),
    index("helperServiceOffering_helperProfileId_idx").on(table.helperProfileId),
    index("helperServiceOffering_categoryId_idx").on(table.categoryId),
    index("helperServiceOffering_subcategoryId_idx").on(table.subcategoryId),
  ],
);

export const helperAvailabilitySlot = pgTable(
  "helper_availability_slot",
  {
    id: text("id").primaryKey(),
    helperProfileId: text("helper_profile_id")
      .notNull()
      .references(() => helperProfile.id, { onDelete: "cascade" }),
    dayOfWeek: integer("day_of_week").notNull(),
    startMinute: integer("start_minute").notNull(),
    endMinute: integer("end_minute").notNull(),
    timezone: text("timezone").default("Asia/Kolkata").notNull(),
    isActive: boolean("is_active").default(true).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    uniqueIndex("helperAvailabilitySlot_unique_idx").on(
      table.helperProfileId,
      table.dayOfWeek,
      table.startMinute,
      table.endMinute,
    ),
    index("helperAvailabilitySlot_helperProfileId_idx").on(table.helperProfileId),
  ],
);

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

export const paymentTransaction = pgTable(
  "payment_transaction",
  {
    id: text("id").primaryKey(),
    bookingId: text("booking_id")
      .notNull()
      .references(() => booking.id, { onDelete: "restrict" }),
    customerId: text("customer_id")
      .notNull()
      .references(() => user.id, { onDelete: "restrict" }),
    helperProfileId: text("helper_profile_id").references(() => helperProfile.id, {
      onDelete: "set null",
    }),
    method: paymentMethodEnum("method").notNull(),
    status: paymentStatusEnum("status").default("created").notNull(),
    provider: text("provider").default("razorpay").notNull(),
    providerOrderId: text("provider_order_id"),
    providerPaymentId: text("provider_payment_id"),
    amount: integer("amount").notNull(),
    platformFee: integer("platform_fee").notNull(),
    helperEarning: integer("helper_earning").notNull(),
    currency: text("currency").default("INR").notNull(),
    capturedAt: timestamp("captured_at"),
    failedAt: timestamp("failed_at"),
    failureCode: text("failure_code"),
    failureReason: text("failure_reason"),
    metadata: jsonb("metadata"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    index("paymentTransaction_bookingId_idx").on(table.bookingId),
    index("paymentTransaction_customerId_idx").on(table.customerId),
    index("paymentTransaction_helperProfileId_idx").on(table.helperProfileId),
    index("paymentTransaction_status_createdAt_idx").on(table.status, table.createdAt),
    uniqueIndex("paymentTransaction_providerPaymentId_uidx").on(
      table.providerPaymentId,
    ),
  ],
);

export const payout = pgTable(
  "payout",
  {
    id: text("id").primaryKey(),
    helperProfileId: text("helper_profile_id")
      .notNull()
      .references(() => helperProfile.id, { onDelete: "restrict" }),
    periodStart: timestamp("period_start"),
    periodEnd: timestamp("period_end"),
    amount: integer("amount").notNull(),
    currency: text("currency").default("INR").notNull(),
    status: payoutStatusEnum("status").default("pending").notNull(),
    provider: text("provider").default("razorpay").notNull(),
    providerTransferId: text("provider_transfer_id"),
    processedAt: timestamp("processed_at"),
    failedReason: text("failed_reason"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    index("payout_helperProfileId_idx").on(table.helperProfileId),
    index("payout_status_createdAt_idx").on(table.status, table.createdAt),
  ],
);

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

export const bookingReceipt = pgTable(
  "booking_receipt",
  {
    id: text("id").primaryKey(),
    bookingId: text("booking_id")
      .notNull()
      .references(() => booking.id, { onDelete: "cascade" }),
    paymentTransactionId: text("payment_transaction_id").references(
      () => paymentTransaction.id,
      {
        onDelete: "set null",
      },
    ),
    invoiceNumber: text("invoice_number"),
    fileUrl: text("file_url"),
    issuedAt: timestamp("issued_at").defaultNow().notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("bookingReceipt_bookingId_uidx").on(table.bookingId),
    uniqueIndex("bookingReceipt_invoiceNumber_uidx").on(table.invoiceNumber),
  ],
);

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

export const userRelations = relations(user, ({ many, one }) => ({
  customerProfile: one(customerProfile, {
    fields: [user.id],
    references: [customerProfile.userId],
  }),
  helperProfile: one(helperProfile, {
    fields: [user.id],
    references: [helperProfile.userId],
  }),
  sessions: many(session),
  accounts: many(account),
  twoFactors: many(twoFactor),
  teamMembers: many(teamMember),
  members: many(member),
  invitations: many(invitation),
  customerBookings: many(booking, { relationName: "bookingCustomer" }),
  helperBookings: many(booking, { relationName: "bookingHelper" }),
  bookingStatusEvents: many(bookingStatusEvent),
  paymentTransactions: many(paymentTransaction),
  reviews: many(review, { relationName: "customerReviews" }),
  raisedDisputes: many(dispute, { relationName: "disputeRaisedBy" }),
  disputeMessages: many(disputeMessage),
  notificationEvents: many(notificationEvent),
}));

export const sessionRelations = relations(session, ({ one }) => ({
  user: one(user, {
    fields: [session.userId],
    references: [user.id],
  }),
}));

export const accountRelations = relations(account, ({ one }) => ({
  user: one(user, {
    fields: [account.userId],
    references: [user.id],
  }),
}));

export const twoFactorRelations = relations(twoFactor, ({ one }) => ({
  user: one(user, {
    fields: [twoFactor.userId],
    references: [user.id],
  }),
}));

export const organizationRelations = relations(organization, ({ many }) => ({
  teams: many(team),
  members: many(member),
  invitations: many(invitation),
  helpers: many(helperProfile),
}));

export const teamRelations = relations(team, ({ one, many }) => ({
  organization: one(organization, {
    fields: [team.organizationId],
    references: [organization.id],
  }),
  teamMembers: many(teamMember),
}));

export const teamMemberRelations = relations(teamMember, ({ one }) => ({
  team: one(team, {
    fields: [teamMember.teamId],
    references: [team.id],
  }),
  user: one(user, {
    fields: [teamMember.userId],
    references: [user.id],
  }),
}));

export const memberRelations = relations(member, ({ one }) => ({
  organization: one(organization, {
    fields: [member.organizationId],
    references: [organization.id],
  }),
  user: one(user, {
    fields: [member.userId],
    references: [user.id],
  }),
}));

export const invitationRelations = relations(invitation, ({ one }) => ({
  organization: one(organization, {
    fields: [invitation.organizationId],
    references: [organization.id],
  }),
  user: one(user, {
    fields: [invitation.inviterId],
    references: [user.id],
  }),
}));

export const customerProfileRelations = relations(customerProfile, ({ one }) => ({
  user: one(user, {
    fields: [customerProfile.userId],
    references: [user.id],
  }),
}));

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
  offerings: many(helperServiceOffering),
  availabilitySlots: many(helperAvailabilitySlot),
  bookingCandidates: many(bookingCandidate),
  bookings: many(booking),
  paymentTransactions: many(paymentTransaction),
  payouts: many(payout),
  reviews: many(review),
}));

export const helperKycDocumentRelations = relations(
  helperKycDocument,
  ({ one }) => ({
    helperProfile: one(helperProfile, {
      fields: [helperKycDocument.helperProfileId],
      references: [helperProfile.id],
    }),
    reviewedByUser: one(user, {
      fields: [helperKycDocument.reviewedByUserId],
      references: [user.id],
    }),
  }),
);

export const serviceCategoryRelations = relations(serviceCategory, ({ many }) => ({
  subcategories: many(serviceSubcategory),
  offerings: many(helperServiceOffering),
  bookings: many(booking),
}));

export const serviceSubcategoryRelations = relations(
  serviceSubcategory,
  ({ one, many }) => ({
    category: one(serviceCategory, {
      fields: [serviceSubcategory.categoryId],
      references: [serviceCategory.id],
    }),
    offerings: many(helperServiceOffering),
    bookings: many(booking),
  }),
);

export const helperServiceOfferingRelations = relations(
  helperServiceOffering,
  ({ one }) => ({
    helperProfile: one(helperProfile, {
      fields: [helperServiceOffering.helperProfileId],
      references: [helperProfile.id],
    }),
    category: one(serviceCategory, {
      fields: [helperServiceOffering.categoryId],
      references: [serviceCategory.id],
    }),
    subcategory: one(serviceSubcategory, {
      fields: [helperServiceOffering.subcategoryId],
      references: [serviceSubcategory.id],
    }),
  }),
);

export const helperAvailabilitySlotRelations = relations(
  helperAvailabilitySlot,
  ({ one }) => ({
    helperProfile: one(helperProfile, {
      fields: [helperAvailabilitySlot.helperProfileId],
      references: [helperProfile.id],
    }),
  }),
);

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
  payments: many(paymentTransaction),
  reviews: many(review),
  disputes: many(dispute),
  receipt: one(bookingReceipt, {
    fields: [booking.id],
    references: [bookingReceipt.bookingId],
  }),
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

export const paymentTransactionRelations = relations(
  paymentTransaction,
  ({ one }) => ({
    booking: one(booking, {
      fields: [paymentTransaction.bookingId],
      references: [booking.id],
    }),
    customer: one(user, {
      fields: [paymentTransaction.customerId],
      references: [user.id],
    }),
    helperProfile: one(helperProfile, {
      fields: [paymentTransaction.helperProfileId],
      references: [helperProfile.id],
    }),
  }),
);

export const payoutRelations = relations(payout, ({ one }) => ({
  helperProfile: one(helperProfile, {
    fields: [payout.helperProfileId],
    references: [helperProfile.id],
  }),
}));

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

export const bookingReceiptRelations = relations(bookingReceipt, ({ one }) => ({
  booking: one(booking, {
    fields: [bookingReceipt.bookingId],
    references: [booking.id],
  }),
  paymentTransaction: one(paymentTransaction, {
    fields: [bookingReceipt.paymentTransactionId],
    references: [paymentTransaction.id],
  }),
}));

export const notificationEventRelations = relations(notificationEvent, ({ one }) => ({
  user: one(user, {
    fields: [notificationEvent.userId],
    references: [user.id],
  }),
}));
