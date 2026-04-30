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
import { helperProfile } from "./helpers.js";

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

// RELATIONS
export const serviceCategoryRelations = relations(serviceCategory, ({ many }) => ({
  subcategories: many(serviceSubcategory),
  offerings: many(helperServiceOffering),
}));

export const serviceSubcategoryRelations = relations(
  serviceSubcategory,
  ({ one, many }) => ({
    category: one(serviceCategory, {
      fields: [serviceSubcategory.categoryId],
      references: [serviceCategory.id],
    }),
    offerings: many(helperServiceOffering),
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
