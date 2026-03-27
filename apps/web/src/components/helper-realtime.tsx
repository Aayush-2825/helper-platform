import { useEffect } from "react";
import { getRealtimeWsUrl } from "../lib/realtime/client";

export const useRealTimeUpdates = () => {
  useEffect(() => {
    const wsUrl = getRealtimeWsUrl();
    const ws = new WebSocket(wsUrl);

    ws.onopen = () => {
      console.log("WebSocket connection established");
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      console.log("Received real-time update:", data);

      if (data.event === "booking_request") {
        console.log("🔥 New booking:", data.data);

        //   Handle the booking request (e.g., show a notification, update UI, etc.)
      }
    };
    ws.onclose = () => {
      console.log("❌ WS disconnected");
    };

    return () => {
      ws.close();
    };
  }, []);
};
