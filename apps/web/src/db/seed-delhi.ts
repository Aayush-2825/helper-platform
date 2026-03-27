/**
 * Full New Delhi seed — customers, helpers, bookings, realtime presence.
 * Uses better-auth's own hashPassword so credentials always work.
 *
 * Run from apps/web:  pnpm tsx src/db/seed-delhi.ts
 * Password for all accounts: Test@1234
 */
import "dotenv/config";
import { hashPassword } from "better-auth/crypto";
import { db, pool } from "./index";
import { user, account, helperProfile, customerProfile, booking, serviceCategory, serviceSubcategory } from "./schema";
import { db as realtimeDb, pool as realtimePool } from "@repo/db/realtime";
import { sql } from "drizzle-orm";

const PASSWORD = "Test@1234";

function daysAgo(n: number) { const d = new Date(); d.setDate(d.getDate() - n); return d; }
function hoursAgo(n: number) { return new Date(Date.now() - n * 3_600_000); }

const CATEGORIES = [
  { id: "driver",          slug: "driver",          name: "Driver",          description: "Driving and transportation" },
  { id: "electrician",     slug: "electrician",     name: "Electrician",     description: "Electrical repair" },
  { id: "plumber",         slug: "plumber",         name: "Plumber",         description: "Plumbing services" },
  { id: "cleaner",         slug: "cleaner",         name: "Cleaner",         description: "Cleaning services" },
  { id: "chef",            slug: "chef",            name: "Chef",            description: "Cooking services" },
  { id: "delivery_helper", slug: "delivery-helper", name: "Delivery Helper", description: "Delivery services" },
  { id: "caretaker",       slug: "caretaker",       name: "Caretaker",       description: "Caretaking services" },
  { id: "security_guard",  slug: "security-guard",  name: "Security Guard",  description: "Security services" },
  { id: "other",           slug: "other",           name: "Other",           description: "Other services" },
];

const SUBCATEGORIES = [
  { id: "car_driver",      categoryId: "driver",  slug: "car-driver",      name: "Car Driver" },
  { id: "home_cleaning",   categoryId: "cleaner", slug: "home-cleaning",   name: "Home Cleaning" },
  { id: "office_cleaning", categoryId: "cleaner", slug: "office-cleaning", name: "Office Cleaning" },
];


// New Delhi helpers with real GPS coordinates
const HELPERS = [
  { id: "ndh-001", name: "Rajesh Kumar",  email: "rajesh.plumber@delhi.test", category: "plumber"        as const, lat: 28.6448, lng: 77.1902, experience: 6, rating: "4.80", jobs: 140, headline: "Expert plumber — leaks, fittings, bathroom work" },
  { id: "ndh-002", name: "Sunita Sharma", email: "sunita.elec@delhi.test",    category: "electrician"    as const, lat: 28.6562, lng: 77.1173, experience: 4, rating: "4.60", jobs: 95,  headline: "Certified electrician — wiring, MCB, AC installation" },
  { id: "ndh-003", name: "Mohan Singh",   email: "mohan.driver@delhi.test",   category: "driver"         as const, lat: 28.5355, lng: 77.2100, experience: 8, rating: "4.90", jobs: 310, headline: "Reliable driver — outstation & local trips" },
  { id: "ndh-004", name: "Kavita Nair",   email: "kavita.cleaner@delhi.test", category: "cleaner"        as const, lat: 28.6692, lng: 77.1313, experience: 3, rating: "4.40", jobs: 60,  headline: "Deep cleaning — home & office" },
  { id: "ndh-005", name: "Aryan Mehta",   email: "aryan.chef@delhi.test",     category: "chef"           as const, lat: 28.5921, lng: 77.2437, experience: 5, rating: "4.75", jobs: 88,  headline: "Home chef — North Indian, Chinese, Continental" },
  { id: "ndh-006", name: "Deepak Verma",  email: "deepak.security@delhi.test",category: "security_guard" as const, lat: 28.6271, lng: 77.2190, experience: 7, rating: "4.55", jobs: 200, headline: "Ex-army security guard — events & residential" },
];

const CUSTOMERS = [
  { id: "ndc-001", name: "Priya Gupta", email: "priya.customer@delhi.test", lat: 28.6315, lng: 77.2167, city: "New Delhi" },
  { id: "ndc-002", name: "Amit Verma",  email: "amit.customer@delhi.test",  lat: 28.6139, lng: 77.2090, city: "New Delhi" },
];


async function seedCategories() {
  for (const c of CATEGORIES) {
    await db.insert(serviceCategory).values(c)
      .onConflictDoUpdate({ target: serviceCategory.id, set: { name: c.name, description: c.description } });
  }
  for (const s of SUBCATEGORIES) {
    await db.insert(serviceSubcategory).values({ ...s, description: s.name })
      .onConflictDoUpdate({ target: serviceSubcategory.id, set: { name: s.name } });
  }
  console.log("  categories done");
}

async function seedHelpers(hash: string) {
  for (const h of HELPERS) {
    await db.insert(user).values({
      id: h.id, name: h.name, email: h.email,
      emailVerified: true, role: "helper",
      createdAt: daysAgo(60), updatedAt: new Date(),
    }).onConflictDoUpdate({
      target: user.id,
      set: { name: h.name, email: h.email, emailVerified: true, role: "helper", updatedAt: new Date() },
    });

    await db.insert(account).values({
      id: `acc-${h.id}`, accountId: h.id, providerId: "credential",
      userId: h.id, password: hash,
      createdAt: daysAgo(60), updatedAt: new Date(),
    }).onConflictDoUpdate({
      target: account.id,
      set: { password: hash, updatedAt: new Date() },
    });

    await db.insert(helperProfile).values({
      id: `hp-${h.id}`, userId: h.id,
      primaryCategory: h.category,
      headline: h.headline,
      bio: `${h.name} — ${h.experience} years experience in New Delhi.`,
      serviceCity: "New Delhi",
      yearsExperience: h.experience,
      averageRating: h.rating,
      totalRatings: h.jobs,
      completedJobs: h.jobs,
      availabilityStatus: "online",
      verificationStatus: "approved",
      isActive: true,
      createdAt: daysAgo(60), updatedAt: new Date(),
    }).onConflictDoUpdate({
      target: helperProfile.id,
      set: { availabilityStatus: "online", verificationStatus: "approved", updatedAt: new Date() },
    });

    // Seed realtime presence so matching service Haversine query finds them
    // Use raw SQL because the Drizzle schema is out of sync with the actual migration
    // (migration has id PK + helper_user_id unique; schema has helperUserId as PK)
    await realtimeDb.execute(sql`
      INSERT INTO realtime.helper_presence (id, helper_user_id, status, latitude, longitude, available_slots, last_heartbeat, updated_at)
      VALUES (${`hp-presence-${h.id}`}, ${h.id}, 'online', ${h.lat.toString()}, ${h.lng.toString()}, 1, NOW(), NOW())
      ON CONFLICT (helper_user_id) DO UPDATE SET
        status = 'online',
        latitude = ${h.lat.toString()},
        longitude = ${h.lng.toString()},
        last_heartbeat = NOW(),
        updated_at = NOW()
    `);

    console.log(`  helper: ${h.email}`);
  }
}

async function seedCustomers(hash: string) {
  for (const c of CUSTOMERS) {
    await db.insert(user).values({
      id: c.id, name: c.name, email: c.email,
      emailVerified: true, role: "customer",
      createdAt: daysAgo(30), updatedAt: new Date(),
    }).onConflictDoUpdate({
      target: user.id,
      set: { name: c.name, email: c.email, emailVerified: true, role: "customer", updatedAt: new Date() },
    });

    await db.insert(account).values({
      id: `acc-${c.id}`, accountId: c.id, providerId: "credential",
      userId: c.id, password: hash,
      createdAt: daysAgo(30), updatedAt: new Date(),
    }).onConflictDoUpdate({
      target: account.id,
      set: { password: hash, updatedAt: new Date() },
    });

    await db.insert(customerProfile).values({
      id: `cp-${c.id}`, userId: c.id,
      defaultAddressLine: "Connaught Place",
      defaultCity: c.city,
      defaultLatitude: c.lat.toString(),
      defaultLongitude: c.lng.toString(),
      createdAt: daysAgo(30), updatedAt: new Date(),
    }).onConflictDoUpdate({
      target: customerProfile.id,
      set: { defaultCity: c.city, updatedAt: new Date() },
    });

    console.log(`  customer: ${c.email}`);
  }
}


async function seedBookings() {
  const [h1, h2, h3, h4] = HELPERS;
  const [c1, c2] = CUSTOMERS;

  type BookingRow = {
    id: string; customerId: string; helperId: string | null; helperProfileId: string | null;
    categoryId: string; status: "completed" | "accepted" | "in_progress" | "requested" | "cancelled";
    addressLine: string; city: string; latitude: string; longitude: string;
    quotedAmount: number; finalAmount?: number;
    requestedAt: Date; acceptedAt?: Date; startedAt?: Date; completedAt?: Date; cancelledAt?: Date;
  };

  const rows: BookingRow[] = [
    { id: "nd-bk-001", customerId: c1.id, helperId: h1.id, helperProfileId: `hp-${h1.id}`, categoryId: "plumber",       status: "completed",   addressLine: "12 Karol Bagh",           city: "New Delhi", latitude: "28.6448", longitude: "77.1902", quotedAmount: 800,  finalAmount: 850,  requestedAt: daysAgo(8), acceptedAt: daysAgo(8), startedAt: daysAgo(8), completedAt: daysAgo(8) },
    { id: "nd-bk-002", customerId: c2.id, helperId: h3.id, helperProfileId: `hp-${h3.id}`, categoryId: "driver",        status: "completed",   addressLine: "8 Connaught Place",       city: "New Delhi", latitude: "28.6315", longitude: "77.2167", quotedAmount: 500,  finalAmount: 500,  requestedAt: daysAgo(5), acceptedAt: daysAgo(5), startedAt: daysAgo(5), completedAt: daysAgo(5) },
    { id: "nd-bk-003", customerId: c1.id, helperId: h2.id, helperProfileId: `hp-${h2.id}`, categoryId: "electrician",   status: "completed",   addressLine: "5 Rohini Sector 3",       city: "New Delhi", latitude: "28.6562", longitude: "77.1173", quotedAmount: 1200, finalAmount: 1100, requestedAt: daysAgo(3), acceptedAt: daysAgo(3), startedAt: daysAgo(3), completedAt: daysAgo(3) },
    { id: "nd-bk-004", customerId: c1.id, helperId: h2.id, helperProfileId: `hp-${h2.id}`, categoryId: "electrician",   status: "accepted",    addressLine: "22 Rohini Sector 7",      city: "New Delhi", latitude: "28.6562", longitude: "77.1173", quotedAmount: 900,                    requestedAt: hoursAgo(4), acceptedAt: hoursAgo(3) },
    { id: "nd-bk-005", customerId: c2.id, helperId: h4.id, helperProfileId: `hp-${h4.id}`, categoryId: "cleaner",       status: "in_progress", addressLine: "5 Pitampura Block A",     city: "New Delhi", latitude: "28.6692", longitude: "77.1313", quotedAmount: 700,                    requestedAt: hoursAgo(6), acceptedAt: hoursAgo(5), startedAt: hoursAgo(1) },
    { id: "nd-bk-006", customerId: c1.id, helperId: null,  helperProfileId: null,           categoryId: "plumber",       status: "requested",   addressLine: "3 Lajpat Nagar Market",   city: "New Delhi", latitude: "28.5921", longitude: "77.2437", quotedAmount: 600,                    requestedAt: hoursAgo(1) },
    { id: "nd-bk-007", customerId: c2.id, helperId: h1.id, helperProfileId: `hp-${h1.id}`, categoryId: "plumber",       status: "cancelled",   addressLine: "9 Karol Bagh Extension",  city: "New Delhi", latitude: "28.6448", longitude: "77.1902", quotedAmount: 750,                    requestedAt: daysAgo(2), acceptedAt: daysAgo(2), cancelledAt: daysAgo(2) },
  ];

  for (const b of rows) {
    await db.insert(booking).values({
      id: b.id,
      customerId: b.customerId,
      helperId: b.helperId,
      helperProfileId: b.helperProfileId,
      categoryId: b.categoryId,
      status: b.status,
      addressLine: b.addressLine,
      city: b.city,
      latitude: b.latitude,
      longitude: b.longitude,
      quotedAmount: b.quotedAmount,
      finalAmount: b.finalAmount ?? null,
      currency: "INR",
      requestedAt: b.requestedAt,
      acceptedAt: b.acceptedAt ?? null,
      startedAt: b.startedAt ?? null,
      completedAt: b.completedAt ?? null,
      cancelledAt: b.cancelledAt ?? null,
      createdAt: b.requestedAt,
      updatedAt: b.requestedAt,
    }).onConflictDoUpdate({
      target: booking.id,
      set: { status: b.status, updatedAt: new Date() },
    });
  }
  console.log("  bookings done");
}

async function main() {
  console.log("Seeding New Delhi test data...\n");

  const hash = await hashPassword(PASSWORD);

  await seedCategories();
  await seedHelpers(hash);
  await seedCustomers(hash);
  await seedBookings();

  console.log(`
Done! Password for all accounts: ${PASSWORD}

Customers:
  priya.customer@delhi.test
  amit.customer@delhi.test

Helpers (online, approved, New Delhi):
  rajesh.plumber@delhi.test   Plumber        Karol Bagh
  sunita.elec@delhi.test      Electrician    Rohini
  mohan.driver@delhi.test     Driver         Saket
  kavita.cleaner@delhi.test   Cleaner        Pitampura
  aryan.chef@delhi.test       Chef           Lajpat Nagar
  deepak.security@delhi.test  Security Guard Connaught Place
`);

  await pool.end();
  await realtimePool.end();
  process.exit(0);
}

main().catch((e) => { console.error("Seed failed:", e); process.exit(1); });
