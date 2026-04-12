"use client";

import { useMemo, useState } from "react";
import {
  type RealtimeOpEventType,
} from "@/lib/realtime/client";
import { useWebSocket } from "./useWebsocket";

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
  const eventTypes = options?.eventTypes;
  const [connectionId] = useState(() => createConnectionId());
  const [connected, setConnected] = useState(false);
  const [messages, setMessages] = useState<RealtimeMessage[]>([]);
  const [error, setError] = useState<string | null>(null);

  useWebSocket(
    userId ?? "unknown",
    (parsed) => {
      setMessages((previous) => {
        const next = [parsed as RealtimeMessage, ...previous];
        return next.slice(0, maxEvents);
      });

      if (parsed.type === "connected") {
        setConnected(true);
        setError(null);
      }
    },
    {
      onOpen: () => {
        setConnected(true);
        setError(null);
      },
      onClose: () => {
        setConnected(false);
      },
      onError: () => {
        setError("WebSocket connection failed");
      },
    },
  );

  const eventMessages = useMemo(
    () =>
      messages.filter((message): message is SocketEventMessage => {
        if (message.type !== "event") {
          return false;
        }

        if (!eventTypes || eventTypes.length === 0) {
          return true;
        }

        return eventTypes.includes(message.event as RealtimeOpEventType);
      }),
    [eventTypes, messages],
  );

  return {
    connected,
    error,
    messages,
    eventMessages,
    connectionId,
  };
}
