import { db } from "@/db";
import { eq, and } from "drizzle-orm";
import { booking } from "@/db/schema";
import { auth } from "@/lib/auth/server";

export async function POST(request: Request, { params }: { params: { id: string } }) {
    const bookingId = params.id;
    const user = await auth.api.getSession({
        headers: request.headers,
    });
    if (!user) {
        return new Response("Unauthorized", { status: 401 });
    }
    const existingBooking = await db.query.booking.findFirst({
        where: (b, { eq }) => eq(b.id, bookingId)
    });

    if (!existingBooking) {
        return new Response("Booking not found", { status: 404 });
    }
    if (existingBooking.customerId !== user.user.id) {
        return new Response("Unauthorized", { status: 403 });
    }
    if (existingBooking.status !== "requested") {
        return new Response("Booking is not in requested state", { status: 400 });
    }
    const updatedRows = await db.update(booking).set({
        status: "accepted",
        helperId: user.user.id,
        updatedAt: new Date(),
    }).where(and(
        eq(booking.id, bookingId),
        eq(booking.status, "requested")
    )).returning();
    if (updatedRows.length === 0) {
        return new Response("Booking not found or not in requested state", { status: 400 });
    }
    return new Response(JSON.stringify(updatedRows), { status: 200 });
}