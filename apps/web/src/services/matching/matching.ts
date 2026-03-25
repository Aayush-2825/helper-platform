import { db } from "@/db";
import { bookingCandidate  } from "@/db/schema";
import { publishBookingEvent } from "@/lib/realtime/client";

export const startMatching = async (bookingData:any) => {
  try {
    const url = new URL("http://localhost:3001/api/helpers/nearby");
    url.searchParams.append("latitude", bookingData.latitude?.toString() || "");
    url.searchParams.append("longitude", bookingData.longitude?.toString() || "");
    url.searchParams.append("radius", "20");

    const response = await fetch(url.toString());
    if (!response.ok) throw new Error("Failed to fetch nearby helpers");
    
    const {helpers} = await response.json();
    
    const nearbyHelperIds = helpers.map((helper:any) => helper.helperId);

    if (nearbyHelperIds.length === 0) {
       console.log("No nearby helpers found.");
       return; 
    }

    const eligibleHelpers = await db.query.helperProfile.findMany({
      where: (helper, {inArray, eq, and}) => and(
        inArray(helper.userId, nearbyHelperIds),
        eq(helper.primaryCategory, bookingData.categoryId),
        eq(helper.isActive, true)
      ),
    });

    const candidates = eligibleHelpers.map((helper, index) => ({
      id: crypto.randomUUID(),
      bookingId: bookingData.id,
      helperProfileId: helper.id,
      response: "pending" as const,
      rankScore: 100 - index,
      expiresAt: new Date(Date.now() + 600000), // 10 min timeout
    }));

    await db.insert(bookingCandidate).values(candidates);

    // 3. Send via WebSocket
    for (const helper of eligibleHelpers) {
    //   sendBookingRequest(helper.id, bookingData);
    publishBookingEvent({
        bookingId: bookingData.id,
        customerId: bookingData.customerId,
        eventType: "created",
        data: {
          helperId: helper.userId,
          candidateId: candidates.find(c => c.helperProfileId === helper.id)?.id,
        },
    });
    }

  } catch (err) {
    console.error("Matching error:", err);
  }
};

