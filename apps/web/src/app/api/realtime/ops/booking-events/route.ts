// DEPRECATED: Frontend now sends these events directly over WebSocket via wsSend(). This route is no longer called by the frontend and can be removed in a follow-up cleanup.
import { authorizeRealtimeOpsRequest, buildRealtimeForwardHeaders } from "@/lib/realtime/ops-auth";

export async function POST(req: Request) {
  try {
    if (!(await authorizeRealtimeOpsRequest(req))) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401 },
      );
    }

    const body = await req.json();

    const {
      bookingId,
      customerId,
      helperId,
      eventType,
      data,
    } = body;

    // ✅ validation
    if (!bookingId || !customerId || !eventType) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { status: 400 },
      );
    }

    // 🧠 Step 1: map event
    let wsEvent: string | null = null;

    if (eventType === "created") {
      wsEvent = "booking_request";
    } else if (
      eventType === "accepted" ||
      eventType === "cancelled"
    ) {
      wsEvent = "booking_update";
    }

    if (!wsEvent) {
      return new Response(
        JSON.stringify({ error: "Invalid eventType" }),
        { status: 400 },
      );
    }

    // 🧠 Step 2: target users
    let targetUserIds: string[] = [];

    if (wsEvent === "booking_request") {
      if (!helperId) {
        return new Response(
          JSON.stringify({ error: "helperId required" }),
          { status: 400 },
        );
      }
      targetUserIds = [helperId];
    }

    if (wsEvent === "booking_update") {
      targetUserIds = [customerId, helperId].filter(Boolean);
    }

    // 🔥 Step 3: forward to realtime server
    await fetch(
      `${process.env.REALTIME_BASE_URL || "http://localhost:3001"}/api/realtime/broadcast`,
      {
        method: "POST",
        headers: buildRealtimeForwardHeaders(),
        body: JSON.stringify({
          event: wsEvent,
          data: {
            bookingId,
            ...data,
          },
          targetUserIds,
        }),
      },
    );

    return new Response(JSON.stringify({ success: true }));
  } catch (err) {
    console.error(err);

    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500 },
    );
  }
}