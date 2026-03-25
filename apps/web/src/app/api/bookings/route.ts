import { NextRequest, NextResponse } from "next/server";
import { NO_STORE_HEADERS } from "@/lib/http/cache";
import { db } from "@/db";
import { booking } from "@/db/schema";
import { auth } from "@/lib/auth/server";
import { z } from "zod";
import { desc, eq } from "drizzle-orm";
import { startMatching } from "@/services/matching/matching";

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
    const session = await auth.api.getSession();

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

    // ✅ Insert booking
    const [newBooking] = await db
      .insert(booking)
      .values({
        id: crypto.randomUUID(),

        customerId: session.user.id,
        categoryId: data.categoryID,
        subcategoryId: data.subcategoryID ?? null,

        status: "requested",
        requestedAt: new Date(),
        scheduledFor: data.scheduledFor ? new Date(data.scheduledFor) : null,

        addressLine: data.addressLine,
        area: data.area ?? null,
        city: data.city,
        state: data.state ?? null,
        postalCode: data.postalCode ?? null,

        latitude: data.latitude?.toString() ?? null,
        longitude: data.longitude?.toString() ?? null,

        notes: data.notes ?? null,

        quotedAmount: data.quotedAmount,
        finalAmount: data.finalAmount ?? null,

        currency: "INR",
      })
      .returning();

    startMatching(newBooking);

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

export async function GET() {
  try {
    const session = await auth.api.getSession();
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

    if (session.user.role === "customer") {
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
