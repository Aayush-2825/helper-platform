import { relations } from "drizzle-orm";
import {
  boolean,
  numeric,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { contactMethodEnum } from "../enums.js";
import { user } from "./auth.js";

export const customerProfile = pgTable(
  "customer_profile",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    phone: text("phone"),
    phoneVerified: boolean("phone_verified").default(false).notNull(),
    preferredContactMethod: contactMethodEnum("preferred_contact_method")
      .default("call")
      .notNull(),
    emergencyContactName: text("emergency_contact_name"),
    emergencyContactPhone: text("emergency_contact_phone"),
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

export const customerProfileRelations = relations(customerProfile, ({ one }) => ({
  user: one(user, {
    fields: [customerProfile.userId],
    references: [user.id],
  }),
}));
