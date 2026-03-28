import { NextRequest, NextResponse } from "next/server";
import { NO_STORE_HEADERS } from "@/lib/http/cache";
import { db } from "@/db";
import { booking } from "@/db/schema";
import { auth } from "@/lib/auth/server";
import { z } from "zod";
import { desc, eq } from "drizzle-orm";
import { startMatching } from "@/services/matching/matching";
import { headers } from "next/headers";

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

  quotedAmount: z.number().int().positive(),
  finalAmount: z.number().int().optional(),

  scheduledFor: z.string().datetime().optional(),
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

    // Generate 4-digit OTPs
    const startCode = Math.floor(1000 + Math.random() * 9000).toString();
    const completeCode = Math.floor(1000 + Math.random() * 9000).toString();

    // ✅ Insert booking
    const [newBooking] = await db
      .insert(booking)
      .values({
        id: crypto.randomUUID(),

        customerId: session.user.id,
        categoryId: data.categoryID,

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

        startCode,
        completeCode,
      })
      .returning();

    startMatching(newBooking).catch((err) => {
      console.error("Matching error:", err);
    });

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
      { message: "Internal server error", error: (error as Error).message },
      { status: 500, headers: NO_STORE_HEADERS },
    );
  }
}

export async function GET() {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401, headers: NO_STORE_HEADERS },
      );
    }

    if (session.user.role === "helper") {
      const bookings = await db
        .select()
        .from(booking)
        .where(eq(booking.helperId, session.user.id))
        .orderBy(desc(booking.requestedAt));

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
        .orderBy(desc(booking.requestedAt));

      return NextResponse.json(
        { message: "Bookings fetched successfully", bookings },
        { status: 200, headers: NO_STORE_HEADERS },
      );
    }

    if (session.user.role === "admin") {
      const bookings = await db
        .select()
        .from(booking)
        .orderBy(desc(booking.requestedAt));

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
