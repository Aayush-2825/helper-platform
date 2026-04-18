import { headers } from "next/headers";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { db } from "@/db";
import { bookingStatusEvent, helperProfile } from "@/db/schema";
import { auth } from "@/lib/auth/server";
import { NO_STORE_HEADERS } from "@/lib/http/cache";
import { resumeMatchingIfNeeded } from "@/services/matching/matching";

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const { id: bookingId } = await context.params;

    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401, headers: NO_STORE_HEADERS });
    }

    const bookingResult = await db.query.booking.findFirst({
      where: (bookingRecord, { eq: equals }) => equals(bookingRecord.id, bookingId),
      with: {
          category: true,
          customer: true,
          helper: true,
          helperProfile: {
              with: {
                  user: true
              }
          }
      }
    });

    if (!bookingResult) {
      return NextResponse.json({ message: "Booking not found." }, { status: 404, headers: NO_STORE_HEADERS });
    }

    const isCustomer = bookingResult.customerId === session.user.id;
    const isAssignedHelper = bookingResult.helperId === session.user.id;

    if (isCustomer && ["requested", "matched"].includes(bookingResult.status) && !bookingResult.helperId) {
      await resumeMatchingIfNeeded(bookingId);
    }

    // Check if the user is authorized to see this booking (customer or helper)
    if (!isCustomer && !isAssignedHelper) {
        // Find the helper profile for the current user to see if they are the assigned helper
        const profile = await db.query.helperProfile.findFirst({
            where: eq(helperProfile.userId, session.user.id),
        });

        if (!profile || bookingResult.helperId !== profile.id) {
            return NextResponse.json({ message: "Forbidden" }, { status: 403, headers: NO_STORE_HEADERS });
        }
    }

    const statusEvents = await db.query.bookingStatusEvent.findMany({
      where: eq(bookingStatusEvent.bookingId, bookingId),
      orderBy: (event, { asc }) => asc(event.createdAt),
      with: {
        actorUser: {
          columns: {
            id: true,
            name: true,
            role: true,
          },
        },
      },
    });

    // 🔒 Mask OTP codes if not the customer
    const sanitizedBooking = {
      ...bookingResult,
    } as typeof bookingResult & {
      startCode?: string | null;
      completeCode?: string | null;
      helperPhone?: string | null;
      canCustomerViewHelperPhone: boolean;
      statusEvents: typeof statusEvents;
    };
    if (!isCustomer) {
      sanitizedBooking.startCode = null;
      sanitizedBooking.completeCode = null;
    }

    const canCustomerViewHelperPhone =
      Boolean(sanitizedBooking.helperPhone) &&
      Boolean(sanitizedBooking.helperPhoneVisibleAt) &&
      ["in_progress", "completed"].includes(sanitizedBooking.status);

    if (isCustomer && !canCustomerViewHelperPhone) {
      sanitizedBooking.helperPhone = null;
    }

    sanitizedBooking.canCustomerViewHelperPhone = isCustomer
      ? canCustomerViewHelperPhone
      : true;
    sanitizedBooking.statusEvents = statusEvents;

    return NextResponse.json(
      { message: "Booking fetched successfully.", booking: sanitizedBooking },
      { status: 200, headers: NO_STORE_HEADERS }
    );
  } catch (err) {
    console.error("Fetch booking error:", err);

    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500, headers: NO_STORE_HEADERS }
    );
  }
}
