import { NextRequest, NextResponse } from "next/server";
import { NO_STORE_HEADERS } from "@/lib/http/cache";
import { db } from "@/db";
import { booking, user } from "@/db/schema";
import { auth } from "@/lib/auth/server";
import { z } from "zod";
import { desc, eq } from "drizzle-orm";
import { startMatching } from "@/services/matching/matching";
import { headers } from "next/headers";
import { randomInt } from "node:crypto";

const MIN_SCHEDULE_LEAD_MINUTES = 15;
const MAX_SCHEDULE_HORIZON_DAYS = 90;

function emptyToNull(value?: string | null) {
  return value && value.trim() !== "" ? value : null;
}

// ✅ Validation schema
const createBookingSchema = z.object({
  categoryID: z.string().min(1),
  subcategoryID: z.string().optional(),

  addressLine: z.string().min(1),
  city: z.string().min(1),
  area: z.string().optional(),
  state: z.string().optional(),
  postalCode: z.string().optional(),

  latitude: z.number().optional(),
  longitude: z.number().optional(),

  notes: z.string().optional(),

  quotedAmount: z.number().int().positive().max(1_000_000),
  finalAmount: z.number().int().optional(),
  customerPhone: z
    .string()
    .regex(/^\+?[0-9]{10,15}$/)
    .optional(),
  preferredContactMethod: z
    .enum(["call", "sms", "whatsapp", "in_app"])
    .default("call"),

  scheduledFor: z.preprocess(
    (value) => (typeof value === "string" && value.trim() === "" ? undefined : value),
    z.string().trim().min(1).optional(),
  ),
});

export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401, headers: NO_STORE_HEADERS },
      );
    }

    const body = await request.json();

    // ✅ Validate input
    const parsed = createBookingSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { message: "Invalid input", errors: parsed.error.flatten() },
        { status: 400, headers: NO_STORE_HEADERS },
      );
    }

    const data = parsed.data;

    const scheduledFor = data.scheduledFor ? new Date(data.scheduledFor) : null;

    if (scheduledFor && Number.isNaN(scheduledFor.getTime())) {
      return NextResponse.json(
        { message: "Invalid scheduledFor value." },
        { status: 400, headers: NO_STORE_HEADERS },
      );
    }

    if (scheduledFor) {
      const now = Date.now();
      const minScheduleTime = now + MIN_SCHEDULE_LEAD_MINUTES * 60 * 1000;
      const maxScheduleTime = now + MAX_SCHEDULE_HORIZON_DAYS * 24 * 60 * 60 * 1000;

      if (scheduledFor.getTime() < minScheduleTime) {
        return NextResponse.json(
          { message: `scheduledFor must be at least ${MIN_SCHEDULE_LEAD_MINUTES} minutes in the future.` },
          { status: 400, headers: NO_STORE_HEADERS },
        );
      }

      if (scheduledFor.getTime() > maxScheduleTime) {
        return NextResponse.json(
          { message: `scheduledFor cannot be more than ${MAX_SCHEDULE_HORIZON_DAYS} days in the future.` },
          { status: 400, headers: NO_STORE_HEADERS },
        );
      }
    }

    // Generate 4-digit OTPs with cryptographically secure randomness.
    const startCode = randomInt(1000, 10000).toString();
    const completeCode = randomInt(1000, 10000).toString();

    const customerRecord = await db.query.user.findFirst({
      where: eq(user.id, session.user.id),
      columns: {
        phone: true,
      },
    });

    // ✅ Insert booking
    const [newBooking] = await db
      .insert(booking)
      .values({
        id: crypto.randomUUID(),

        customerId: session.user.id,
        categoryId: data.categoryID,
        customerName: emptyToNull(session.user.name),
        customerPhone: emptyToNull(data.customerPhone ?? customerRecord?.phone),
        preferredContactMethod: data.preferredContactMethod,

        subcategoryId: emptyToNull(data.subcategoryID),

        status: "requested",
        requestedAt: new Date(),

        addressLine: data.addressLine,
        area: emptyToNull(data.area),
        city: data.city,
        state: emptyToNull(data.state),
        postalCode: emptyToNull(data.postalCode),

        latitude: emptyToNull(data.latitude?.toString()),
        longitude: emptyToNull(data.longitude?.toString()),

        notes: emptyToNull(data.notes),

        quotedAmount: data.quotedAmount,
        finalAmount: data.finalAmount ?? null,

        currency: "INR",
        scheduledFor,

        startCode,
        completeCode,
      })
      .returning();

    // Run matching inline so serverless runtimes do not terminate the
    // progressive radius workflow right after the HTTP response is sent.
    await startMatching(newBooking);

    return NextResponse.json(
      {
        message: "Booking created successfully",
        booking: newBooking,
      },
      { status: 201, headers: NO_STORE_HEADERS },
    );
  } catch (error) {
    console.error("Booking Error:", error);

    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500, headers: NO_STORE_HEADERS },
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401, headers: NO_STORE_HEADERS },
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const limit = Math.min(Math.max(Number(searchParams.get("limit") ?? "100"), 1), 200);
    const offset = Math.max(Number(searchParams.get("offset") ?? "0"), 0);

    if (session.user.role === "helper") {
      const bookings = await db
        .select()
        .from(booking)
        .where(eq(booking.helperId, session.user.id))
        .orderBy(desc(booking.requestedAt))
        .limit(limit)
        .offset(offset);

      return NextResponse.json(
        { message: "Bookings fetched successfully", bookings },
        { status: 200, headers: NO_STORE_HEADERS },
      );
    }

    if (session.user.role === "customer" || session.user.role === "user") {
      const bookings = await db
        .select()
        .from(booking)
        .where(eq(booking.customerId, session.user.id))
        .orderBy(desc(booking.requestedAt))
        .limit(limit)
        .offset(offset);

      return NextResponse.json(
        { message: "Bookings fetched successfully", bookings },
        { status: 200, headers: NO_STORE_HEADERS },
      );
    }

    if (session.user.role === "admin") {
      const bookings = await db
        .select()
        .from(booking)
        .orderBy(desc(booking.requestedAt))
        .limit(limit)
        .offset(offset);

      return NextResponse.json(
        { message: "Bookings fetched successfully", bookings },
        { status: 200, headers: NO_STORE_HEADERS },
      );
    }

    return NextResponse.json(
      { message: "Invalid user role" },
      { status: 400, headers: NO_STORE_HEADERS },
    );
  } catch (error) {
    console.error("Fetch Bookings Error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500, headers: NO_STORE_HEADERS },
    );
  }
}
