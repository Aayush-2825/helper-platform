import { useEffect } from "react";
import { getRealtimeWsUrl } from "../lib/realtime/client";

function closeSocketSafely(socket: WebSocket | null) {
  if (!socket) {
    return;
  }

  if (socket.readyState === WebSocket.CLOSING || socket.readyState === WebSocket.CLOSED) {
    return;
  }

  try {
    socket.close();
  } catch {
    // Ignore teardown errors when the socket never fully opened.
  }
}

export const useRealTimeUpdates = () => {
  useEffect(() => {
    const wsUrl = getRealtimeWsUrl();
    const ws = new WebSocket(wsUrl);

    ws.onopen = () => {};

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);

      if (data.event === "booking_request") {
        //   Handle the booking request (e.g., show a notification, update UI, etc.)
      }
    };
    ws.onclose = () => {};

    return () => {
      closeSocketSafely(ws);
    };
  }, []);
};
