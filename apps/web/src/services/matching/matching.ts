import crypto from "crypto";
import { eq, inArray } from "drizzle-orm";
import { db } from "@/db";
import { booking, bookingCandidate, helperProfile } from "@/db/schema";
import { publishBookingEvent } from "@/lib/realtime/client";


type BookingDataForMatching = {
  id: string;
  customerId: string;
  categoryId: string;
  latitude?: number | string | null;
  longitude?: number | string | null;
  city?: string | null;
  addressLine?: string | null;
  quotedAmount?: number | null;
};

type HelperServiceCategory =
  | "driver"
  | "electrician"
  | "plumber"
  | "cleaner"
  | "chef"
  | "delivery_helper"
  | "caretaker"
  | "security_guard"
  | "other";

export const startMatching = async (bookingData: BookingDataForMatching) => {
  try {
    console.log(`🔍 [Matching] Starting progressive match for booking: ${bookingData.id} (${bookingData.categoryId})`);

    const lat = bookingData.latitude?.toString() || "";
    const lng = bookingData.longitude?.toString() || "";
    const notifiedHelperIds = new Set<string>();

    const radiusSteps = [5, 10, 20, 50];
    let allEligibleHelpers: any[] = [];

    // 🔄 Progressive Search Loop
    for (const radius of radiusSteps) {
      console.log(`📡 [Matching] Searching within ${radius}km...`);
      
      // Notify customer of expansion
      await publishBookingEvent({
        bookingId: bookingData.id,
        customerId: bookingData.customerId,
        eventType: "matching_update",
        data: { 
          bookingId: bookingData.id, 
          radius, 
          message: `Expanding search area to ${radius}km...` 
        }
      });

      let nearbyHelperIds: string[] = [];
      if (lat && lng) {
        try {
          const url = new URL("http://localhost:3001/api/helpers/nearby");
          url.searchParams.append("latitude", lat);
          url.searchParams.append("longitude", lng);
          url.searchParams.append("radius", radius.toString());

          const response = await fetch(url.toString());
          if (response.ok) {
            const { helpers } = (await response.json()) as {
              helpers: Array<{ helperId: string }>;
            };
            nearbyHelperIds = helpers
              .map((h) => h.helperId)
              .filter(id => !notifiedHelperIds.has(id));
          }
        } catch (err) {
          console.warn("⚠️ Realtime nearby fetch failed:", err);
        }
      }

      if (nearbyHelperIds.length > 0) {
        const eligibleRadiusHelpers = await db.query.helperProfile.findMany({
          where: (helper, { inArray, eq: eqOp, and: andOp }) =>
            andOp(
              inArray(helper.userId, nearbyHelperIds),
              eqOp(helper.primaryCategory, bookingData.categoryId as HelperServiceCategory),
              eqOp(helper.isActive, true),
              eqOp(helper.verificationStatus, "approved"),
              eqOp(helper.availabilityStatus, "online"),
            ),
        });

        if (eligibleRadiusHelpers.length > 0) {
          console.log(`📍 [Matching] Found ${eligibleRadiusHelpers.length} NEW helpers at ${radius}km`);
          allEligibleHelpers = [...allEligibleHelpers, ...eligibleRadiusHelpers];
          
          // Add to notified list to avoid duplicates in next iterations
          eligibleRadiusHelpers.forEach(h => notifiedHelperIds.add(h.userId));

          // Create candidates and notify
          await createAndNotifyCandidates(bookingData, eligibleRadiusHelpers);
          
          // If we found some helpers, we can either stop or keep expanding after a delay.
          // Usually, you stop once you've notified a decent batch.
          if (allEligibleHelpers.length >= 3) {
            console.log("✅ [Matching] Sufficient helpers found and notified.");
            break;
          }
        }
      }

      // Wait 5 seconds before expanding radius
      await new Promise(resolve => setTimeout(resolve, 5000));
      
      // Re-fetch booking status: if already accepted, stop matching
      const currentBooking = await db.query.booking.findFirst({
        where: (b, { eq: eqOp }) => eqOp(b.id, bookingData.id),
        columns: { status: true }
      });
      if (currentBooking?.status !== "requested") {
          console.log(`🛑 [Matching] Booking ${bookingData.id} is no longer 'requested' (status: ${currentBooking?.status}). Stopping match loop.`);
          return;
      }
    }

    // 🔍 Step 2: City Fallback (if no helpers found via GPS)
    if (allEligibleHelpers.length === 0 && bookingData.city) {
      console.log(`🏙️ [Matching] Falling back to city-wide search for: ${bookingData.city}`);
      
      await publishBookingEvent({
        bookingId: bookingData.id,
        customerId: bookingData.customerId,
        eventType: "matching_update",
        data: { 
          bookingId: bookingData.id, 
          radius: 100, 
          message: `Expanding search across ${bookingData.city}...` 
        }
      });

      let cityHelpers = await db.query.helperProfile.findMany({
        where: (helper, { eq: eqOp, and: andOp }) =>
          andOp(
            eqOp(helper.primaryCategory, bookingData.categoryId as HelperServiceCategory),
            eqOp(helper.isActive, true),
            eqOp(helper.verificationStatus, "approved"),
            eqOp(helper.availabilityStatus, "online"),
          ),
      });

      const cityLower = bookingData.city.toLowerCase();
      cityHelpers = cityHelpers.filter(
        (h) => h.serviceCity?.toLowerCase() === cityLower && !notifiedHelperIds.has(h.userId)
      );

      if (cityHelpers.length > 0) {
        await createAndNotifyCandidates(bookingData, cityHelpers);
        allEligibleHelpers = [...allEligibleHelpers, ...cityHelpers];
      }
    }

    if (allEligibleHelpers.length === 0) {
      console.log("❌ [Matching] No eligible helpers found even after expansion.");
      return;
    }

    console.log(`✅ [Matching] Success: total ${allEligibleHelpers.length} helpers notified.`);
  } catch (err) {
    console.error("❌ Matching error:", err);
  }
};

/**
 * Shared logic to create candidates and broadcast notification
 */
async function createAndNotifyCandidates(bookingData: BookingDataForMatching, helpers: any[]) {
      const deadline = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
      await db.update(booking).set({ acceptanceDeadline: deadline }).where(eq(booking.id, bookingData.id));

      const candidates = helpers.map((helper) => ({
        id: crypto.randomUUID(),
        bookingId: bookingData.id,
        helperProfileId: helper.id,
        response: "pending" as const,
        rankScore: 100,
        expiresAt: new Date(Date.now() + 60 * 60 * 1000), // 1 hour
      }));

      await db.insert(bookingCandidate).values(candidates);

      let customerName = "Customer";
      try {
        const customerRow = await db.query.user.findFirst({
          where: (u, { eq: eqOp }) => eqOp(u.id, bookingData.customerId),
          columns: { name: true },
        });
        if (customerRow?.name) customerName = customerRow.name;
      } catch {}

      await publishBookingEvent({
        bookingId: bookingData.id,
        customerId: bookingData.customerId,
        eventType: "created",
        data: {
          candidates: helpers.map((h) => ({
            helperId: h.userId,
            candidateId: candidates.find((c) => c.helperProfileId === h.id)?.id,
          })),
          categoryId: bookingData.categoryId,
          addressLine: bookingData.addressLine ?? "",
          city: bookingData.city ?? "",
          quotedAmount: bookingData.quotedAmount ?? 0,
          customerName,
          expiresAt: new Date(Date.now() + 600000).toISOString(),
        },
      });
}

