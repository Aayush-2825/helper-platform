import { relations } from "drizzle-orm";
import {
  index,
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import {
  paymentMethodEnum,
  paymentStatusEnum,
  payoutStatusEnum,
} from "../enums.js";
import { user } from "./auth.js";
import { helperProfile } from "./helpers.js";
import { booking } from "./bookings.js";

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

// RELATIONS
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
