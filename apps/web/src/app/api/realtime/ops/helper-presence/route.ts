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

    const {
      helperUserId,
      status,
      latitude,
      longitude,
      availableSlots,
    } = await req.json();

    // ✅ Proper validation
    if (!helperUserId || !status) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { status: 400 },
      );
    }

    // ✅ Call realtime server
    const res = await fetch(
      `${
        process.env.REALTIME_BASE_URL || "http://localhost:3001"
      }/api/helpers/helper-presence`,
      {
        method: "POST",
        headers: buildRealtimeForwardHeaders(),
        body: JSON.stringify({
          helperUserId,
          status,
          latitude,       // optional
          longitude,      // optional
          availableSlots, // optional
        }),
      },
    );

    if (!res.ok) {
      const text = await res.text();
      console.error("Realtime error:", text);

      return new Response(
        JSON.stringify({ error: "Realtime server failed" }),
        { status: 500 },
      );
    }

    return new Response(
      JSON.stringify({ success: true }),
      { status: 200 },
    );
  } catch (err) {
    console.error("Presence error:", err);

    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500 },
    );
  }
}