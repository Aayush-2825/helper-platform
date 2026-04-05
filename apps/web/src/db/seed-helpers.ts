/**
 * Seed script: creates test helper users, profiles, and sample bookings.
 *
 * Run with:
 *   npx tsx src/db/seed-helpers.ts
 *
 * from the apps/web directory.
 */
import "dotenv/config";
import { db } from "./index";
import {
  user,
  account,
  helperProfile,
  customerProfile,
  booking,
  serviceCategory,
  serviceSubcategory,
} from "./schema";

function daysAgo(n: number) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d;
}

function hoursAgo(n: number) {
  return new Date(Date.now() - n * 60 * 60 * 1000);
}

// ─── seed data ───────────────────────────────────────────────────────────────

const HELPER_PASSWORD_HASH =
  // better-auth scrypt hash of "Helper@123"
  // Generated via: import('better-auth/crypto').then(({hashPassword}) => hashPassword('Helper@123'))
  "02ccf56442bf7d77fc22a4b1feffefba:bd5b036c6bcecadf6548e482769c2695ccb737eed616f8c842f9e981a22385a9773b93d60e858bd5977c68a6e7172742f3a0b3a71b92cc23fb69a928dab425e6";

const CUSTOMER_PASSWORD_HASH = HELPER_PASSWORD_HASH; // same for simplicity

async function seedCategories() {
  const categories = [
    { id: "driver", slug: "driver", name: "Driver", description: "Driving and transportation services" },
    { id: "electrician", slug: "electrician", name: "Electrician", description: "Electrical repair and installation" },
    { id: "plumber", slug: "plumber", name: "Plumber", description: "Plumbing services" },
    { id: "cleaner", slug: "cleaner", name: "Cleaner", description: "Cleaning services" },
    { id: "chef", slug: "chef", name: "Chef", description: "Cooking and chef services" },
    { id: "delivery_helper", slug: "delivery-helper", name: "Delivery Helper", description: "Delivery and logistics support" },
    { id: "caretaker", slug: "caretaker", name: "Caretaker", description: "Caretaking and elderly support" },
    { id: "security_guard", slug: "security-guard", name: "Security Guard", description: "Security and guard services" },
    { id: "other", slug: "other", name: "Other", description: "Other services" },
  ];

  for (const cat of categories) {
    await db.insert(serviceCategory).values(cat).onConflictDoNothing();
  }

  const subcategories = [
    { id: "car_driver", categoryId: "driver", slug: "car-driver", name: "Car Driver", description: "Driving cars" },
    { id: "bike_driver", categoryId: "driver", slug: "bike-driver", name: "Bike Driver", description: "Driving bikes" },
    { id: "home_cleaning", categoryId: "cleaner", slug: "home-cleaning", name: "Home Cleaning", description: "Cleaning homes" },
    { id: "office_cleaning", categoryId: "cleaner", slug: "office-cleaning", name: "Office Cleaning", description: "Cleaning offices" },
    { id: "cook", categoryId: "chef", slug: "cook", name: "Cook", description: "Cooking meals" },
    { id: "security_night", categoryId: "security_guard", slug: "night-guard", name: "Night Guard", description: "Night security guard" },
  ];

  for (const sub of subcategories) {
    await db.insert(serviceSubcategory).values(sub).onConflictDoNothing();
  }

  console.log("✅ Categories seeded");
}

async function seedHelpers() {
  const helpers = [
    {
      userId: "helper-001",
      name: "Ravi Kumar",
      email: "ravi.helper@test.com",
      category: "plumber" as const,
      city: "Delhi",
      experience: 5,
      rating: "4.80",
      completedJobs: 120,
      status: "online" as const,
      verification: "approved" as const,
    },
    {
      userId: "helper-002",
      name: "Sita Sharma",
      email: "sita.helper@test.com",
      category: "electrician" as const,
      city: "Mumbai",
      experience: 3,
      rating: "4.50",
      completedJobs: 80,
      status: "online" as const,
      verification: "approved" as const,
    },
    {
      userId: "helper-003",
      name: "Gopal Singh",
      email: "gopal.helper@test.com",
      category: "driver" as const,
      city: "Bangalore",
      experience: 7,
      rating: "4.90",
      completedJobs: 200,
      status: "offline" as const,
      verification: "approved" as const,
    },
    {
      userId: "helper-004",
      name: "Priya Nair",
      email: "priya.helper@test.com",
      category: "cleaner" as const,
      city: "Delhi",
      experience: 2,
      rating: "4.20",
      completedJobs: 45,
      status: "busy" as const,
      verification: "approved" as const,
    },
    {
      userId: "helper-005",
      name: "Arjun Mehta",
      email: "arjun.helper@test.com",
      category: "chef" as const,
      city: "Pune",
      experience: 4,
      rating: "4.70",
      completedJobs: 95,
      status: "online" as const,
      verification: "pending" as const,
    },
  ];

  for (const h of helpers) {
    // user row
    await db.insert(user).values({
      id: h.userId,
      name: h.name,
      email: h.email,
      emailVerified: true,
      role: "helper",
      createdAt: daysAgo(30),
      updatedAt: daysAgo(1),
    }).onConflictDoNothing();

    // credential account
    await db.insert(account).values({
      id: `acc-${h.userId}`,
      accountId: h.userId,
      providerId: "credential",
      userId: h.userId,
      password: HELPER_PASSWORD_HASH,
      createdAt: daysAgo(30),
      updatedAt: daysAgo(1),
    }).onConflictDoUpdate({
      target: account.id,
      set: { password: HELPER_PASSWORD_HASH },
    });

    // helper profile
    await db.insert(helperProfile).values({
      id: `hp-${h.userId}`,
      userId: h.userId,
      primaryCategory: h.category,
      serviceCity: h.city,
      yearsExperience: h.experience,
      averageRating: h.rating,
      totalRatings: h.completedJobs,
      completedJobs: h.completedJobs,
      availabilityStatus: h.status,
      verificationStatus: h.verification,
      isActive: true,
      createdAt: daysAgo(30),
      updatedAt: daysAgo(1),
    }).onConflictDoNothing();
  }

  console.log("✅ Helper users & profiles seeded");
  return helpers;
}

async function seedCustomers() {
  const customers = [
    { userId: "customer-001", name: "Amit Verma", email: "amit.customer@test.com", city: "Delhi" },
    { userId: "customer-002", name: "Neha Gupta", email: "neha.customer@test.com", city: "Mumbai" },
  ];

  for (const c of customers) {
    await db.insert(user).values({
      id: c.userId,
      name: c.name,
      email: c.email,
      emailVerified: true,
      role: "customer",
      createdAt: daysAgo(20),
      updatedAt: daysAgo(1),
    }).onConflictDoNothing();

    await db.insert(account).values({
      id: `acc-${c.userId}`,
      accountId: c.userId,
      providerId: "credential",
      userId: c.userId,
      password: CUSTOMER_PASSWORD_HASH,
      createdAt: daysAgo(20),
      updatedAt: daysAgo(1),
    }).onConflictDoNothing();

    await db.insert(customerProfile).values({
      id: `cp-${c.userId}`,
      userId: c.userId,
      defaultCity: c.city,
      createdAt: daysAgo(20),
      updatedAt: daysAgo(1),
    }).onConflictDoNothing();
  }

  console.log("✅ Customer users seeded");
  return customers;
}

async function seedBookings(
  helpers: Awaited<ReturnType<typeof seedHelpers>>,
  customers: Awaited<ReturnType<typeof seedCustomers>>,
) {
  const [h1, h2, h3, h4] = helpers;
  const [c1, c2] = customers;

  const bookings = [
    // ── Completed bookings (for earnings history) ──────────────────────────
    {
      id: "booking-001",
      customerId: c1.userId,
      helperId: h1.userId,
      helperProfileId: `hp-${h1.userId}`,
      categoryId: "plumber",
      status: "completed" as const,
      addressLine: "12 Lajpat Nagar",
      city: "Delhi",
      quotedAmount: 800,
      requestedAt: daysAgo(10),
      acceptedAt: daysAgo(10),
      startedAt: daysAgo(10),
      completedAt: daysAgo(10),
    },
    {
      id: "booking-002",
      customerId: c2.userId,
      helperId: h2.userId,
      helperProfileId: `hp-${h2.userId}`,
      categoryId: "electrician",
      status: "completed" as const,
      addressLine: "45 Andheri West",
      city: "Mumbai",
      quotedAmount: 1200,
      requestedAt: daysAgo(7),
      acceptedAt: daysAgo(7),
      startedAt: daysAgo(7),
      completedAt: daysAgo(7),
    },
    {
      id: "booking-003",
      customerId: c1.userId,
      helperId: h3.userId,
      helperProfileId: `hp-${h3.userId}`,
      categoryId: "driver",
      status: "completed" as const,
      addressLine: "8 Connaught Place",
      city: "Delhi",
      quotedAmount: 500,
      requestedAt: daysAgo(5),
      acceptedAt: daysAgo(5),
      startedAt: daysAgo(5),
      completedAt: daysAgo(5),
    },
    // ── Active bookings (accepted / in_progress) ───────────────────────────
    {
      id: "booking-004",
      customerId: c1.userId,
      helperId: h1.userId,
      helperProfileId: `hp-${h1.userId}`,
      categoryId: "plumber",
      status: "accepted" as const,
      addressLine: "22 Saket",
      city: "Delhi",
      quotedAmount: 600,
      requestedAt: hoursAgo(3),
      acceptedAt: hoursAgo(2),
    },
    {
      id: "booking-005",
      customerId: c2.userId,
      helperId: h4.userId,
      helperProfileId: `hp-${h4.userId}`,
      categoryId: "cleaner",
      status: "in_progress" as const,
      addressLine: "7 Bandra East",
      city: "Mumbai",
      quotedAmount: 700,
      requestedAt: hoursAgo(5),
      acceptedAt: hoursAgo(4),
      startedAt: hoursAgo(1),
    },
    // ── Pending / requested (no helper yet) ───────────────────────────────
    {
      id: "booking-006",
      customerId: c1.userId,
      helperId: null,
      helperProfileId: null,
      categoryId: "chef",
      status: "requested" as const,
      addressLine: "3 Vasant Kunj",
      city: "Delhi",
      quotedAmount: 1500,
      requestedAt: hoursAgo(1),
    },
    // ── Cancelled ─────────────────────────────────────────────────────────
    {
      id: "booking-007",
      customerId: c2.userId,
      helperId: h2.userId,
      helperProfileId: `hp-${h2.userId}`,
      categoryId: "electrician",
      status: "cancelled" as const,
      addressLine: "19 Juhu",
      city: "Mumbai",
      quotedAmount: 900,
      requestedAt: daysAgo(3),
      acceptedAt: daysAgo(3),
      cancelledAt: daysAgo(3),
    },
  ];

  for (const b of bookings) {
    await db.insert(booking).values({
      id: b.id,
      customerId: b.customerId,
      helperId: b.helperId ?? null,
      helperProfileId: b.helperProfileId ?? null,
      categoryId: b.categoryId,
      status: b.status,
      addressLine: b.addressLine,
      city: b.city,
      quotedAmount: b.quotedAmount,
      currency: "INR",
      requestedAt: b.requestedAt,
      acceptedAt: "acceptedAt" in b ? (b.acceptedAt ?? null) : null,
      startedAt: "startedAt" in b ? (b.startedAt ?? null) : null,
      completedAt: "completedAt" in b ? (b.completedAt ?? null) : null,
      cancelledAt: "cancelledAt" in b ? (b.cancelledAt ?? null) : null,
      createdAt: b.requestedAt,
      updatedAt: b.requestedAt,
    }).onConflictDoNothing();
  }

  console.log("✅ Sample bookings seeded");
}

// ─── main ────────────────────────────────────────────────────────────────────

async function main() {
  console.log("🌱 Starting seed…\n");

  await seedCategories();
  const helpers = await seedHelpers();
  const customers = await seedCustomers();
  await seedBookings(helpers, customers);

  console.log(`
✅ Seed complete!

Test accounts (password: Helper@123):
  Helper:   ravi.helper@test.com   (plumber, Delhi, approved)
  Helper:   sita.helper@test.com   (electrician, Mumbai, approved)
  Helper:   gopal.helper@test.com  (driver, Bangalore, approved)
  Helper:   priya.helper@test.com  (cleaner, Delhi, approved)
  Helper:   arjun.helper@test.com  (chef, Pune, pending verification)
  Customer: amit.customer@test.com
  Customer: neha.customer@test.com
`);
  process.exit(0);
}

main().catch((e) => {
  console.error("❌ Seed failed:", e);
  process.exit(1);
});
