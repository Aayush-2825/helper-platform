"use client";

import { useEffect, useRef, useCallback } from "react";
import { registerWsSend } from "../lib/realtime/wsManager";
import { getRealtimeWsUrl } from "../lib/realtime/client";

type WSMessage = {
  type: string;
  event?: string;
  data?: any;
};

export function useWebSocket(
  userId: string,
  onMessage: (data: WSMessage) => void,
) {
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeout = useRef<NodeJS.Timeout | null>(null);
  const heartbeatInterval = useRef<NodeJS.Timeout | null>(null);
  const onMessageRef = useRef(onMessage);

  useEffect(() => { onMessageRef.current = onMessage; }, [onMessage]);

  const connect = useCallback(() => {
    if (!userId) return;

    const wsUrl = new URL(getRealtimeWsUrl());
    wsUrl.searchParams.set("userId", userId);
    const ws = new WebSocket(wsUrl.toString());
    wsRef.current = ws;

    ws.onopen = () => {
      console.log("[WS] Connected");

      heartbeatInterval.current = setInterval(() => {
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify({ type: "ping" }));
        }
      }, 25000);
    };

    ws.onmessage = (event) => {
      try {
        const data: WSMessage = JSON.parse(event.data);
        onMessageRef.current(data);
      } catch {
        console.warn("[WS] Invalid message");
      }
    };

    ws.onclose = () => {
      console.log("[WS] Disconnected");
      wsRef.current = null;

      reconnectTimeout.current = setTimeout(() => {
        console.log("[WS] Reconnecting...");
        connect();
      }, 2000);
    };

    ws.onerror = (err) => {
      console.error("[WS] Error", err);
      ws.close();
    };
  }, [userId]);

  const send = useCallback((message: WSMessage) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(message));
    }
  }, []);

  const sendAsObject = useCallback((msg: object) => {
    send(msg as WSMessage);
  }, [send]);

  useEffect(() => {
    if (wsRef.current) return;

    connect();
    registerWsSend(sendAsObject);

    return () => {
      if (reconnectTimeout.current) clearTimeout(reconnectTimeout.current);
      if (heartbeatInterval.current) clearInterval(heartbeatInterval.current);
      wsRef.current?.close();
      wsRef.current = null;
    };
  }, [connect, send, sendAsObject]);

  return { send };
}