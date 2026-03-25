"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  createRealtimeSubscription,
  getRealtimeWsUrl,
  type RealtimeOpEventType,
  unsubscribeRealtimeSubscription,
} from "@/lib/realtime/client";

type SocketConnectedMessage = {
  type: "connected";
  timestamp: string;
};

type SocketEventMessage = {
  type: "event";
  event: string;
  data?: unknown;
  occurredAt?: string;
};

type SocketBroadcastMessage = {
  type: "broadcast";
  payload: string;
  timestamp: string;
};

export type RealtimeMessage = SocketConnectedMessage | SocketEventMessage | SocketBroadcastMessage;

type Options = {
  maxEvents?: number;
  userId?: string;
  userRole?: string;
  eventTypes?: RealtimeOpEventType[];
  resourceId?: string;
};

function createConnectionId() {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }

  return `conn_${Date.now()}_${Math.random().toString(16).slice(2)}`;
}

export function useRealtimeEvents(options?: Options) {
  const maxEvents = options?.maxEvents ?? 100;
  const userId = options?.userId;
  const userRole = options?.userRole;
  const eventTypes = options?.eventTypes;
  const resourceId = options?.resourceId;
  const [connectionId] = useState(() => createConnectionId());
  const [connected, setConnected] = useState(false);
  const [messages, setMessages] = useState<RealtimeMessage[]>([]);
  const [error, setError] = useState<string | null>(null);
  const socketRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    const wsUrl = new URL(getRealtimeWsUrl());
    wsUrl.searchParams.set("connectionId", connectionId);
    if (userId) {
      wsUrl.searchParams.set("userId", userId);
    }
    if (userRole) {
      wsUrl.searchParams.set("userRole", userRole);
    }

    const socket = new WebSocket(wsUrl.toString());
    socketRef.current = socket;

    socket.onopen = () => {
      setConnected(true);
      setError(null);
    };

    socket.onclose = () => {
      setConnected(false);
    };

    socket.onerror = () => {
      setError("WebSocket connection failed");
    };

    socket.onmessage = (event: MessageEvent<string>) => {
      try {
        const parsed = JSON.parse(event.data) as RealtimeMessage;
        setMessages((previous) => {
          const next = [parsed, ...previous];
          return next.slice(0, maxEvents);
        });
      } catch {
        // Ignore non-JSON websocket payloads.
      }
    };

    return () => {
      socket.close();
      socketRef.current = null;
    };
  }, [connectionId, maxEvents, userId, userRole]);

  useEffect(() => {
    if (!userId || !eventTypes || eventTypes.length === 0) {
      return;
    }

    const currentConnectionId = connectionId;
    let disposed = false;

    (async () => {
      await Promise.allSettled(
        eventTypes.map((eventType) =>
          createRealtimeSubscription({
            userId,
            connectionId: currentConnectionId,
            eventType,
            resourceId,
          }),
        ),
      );
    })();

    return () => {
      disposed = true;
      if (disposed) {
        void Promise.allSettled(
          eventTypes.map((eventType) =>
            unsubscribeRealtimeSubscription({
              connectionId: currentConnectionId,
              eventType,
              resourceId,
            }),
          ),
        );
      }
    };
  }, [connectionId, eventTypes, resourceId, userId]);

  const eventMessages = useMemo(
    () => messages.filter((message): message is SocketEventMessage => message.type === "event"),
    [messages],
  );

  return {
    connected,
    error,
    messages,
    eventMessages,
    connectionId,
  };
}
