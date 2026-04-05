"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { registerWsSend } from "../lib/realtime/wsManager";
import { getRealtimeWsUrl } from "../lib/realtime/client";

type WSMessage = {
  type: string;
  event?: string;
  data?: unknown;
};

type WebSocketOptions = {
  onOpen?: () => void;
  onClose?: () => void;
  onError?: (event: Event) => void;
};

type Connection = {
  userId: string;
  socket: WebSocket | null;
  messageListeners: Set<(data: WSMessage) => void>;
  openListeners: Set<() => void>;
  closeListeners: Set<() => void>;
  errorListeners: Set<(event: Event) => void>;
  reconnectTimeout: ReturnType<typeof setTimeout> | null;
  heartbeatInterval: ReturnType<typeof setInterval> | null;
};

const connections = new Map<string, Connection>();

function createConnection(userId: string): Connection {
  return {
    userId,
    socket: null,
    messageListeners: new Set(),
    openListeners: new Set(),
    closeListeners: new Set(),
    errorListeners: new Set(),
    reconnectTimeout: null,
    heartbeatInterval: null,
  };
}

function clearTimers(connection: Connection) {
  if (connection.reconnectTimeout) {
    clearTimeout(connection.reconnectTimeout);
    connection.reconnectTimeout = null;
  }

  if (connection.heartbeatInterval) {
    clearInterval(connection.heartbeatInterval);
    connection.heartbeatInterval = null;
  }
}

function connect(connection: Connection) {
  if (connection.socket && (connection.socket.readyState === WebSocket.OPEN || connection.socket.readyState === WebSocket.CONNECTING)) {
    return;
  }

  const wsUrl = new URL(getRealtimeWsUrl());
  wsUrl.searchParams.set("userId", connection.userId);

  const ws = new WebSocket(wsUrl.toString());
  connection.socket = ws;

  ws.onopen = () => {
    connection.openListeners.forEach((listener) => listener());

    connection.heartbeatInterval = setInterval(() => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ type: "ping" }));
      }
    }, 25000);
  };

  ws.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data) as WSMessage;
      connection.messageListeners.forEach((listener) => listener(data));
    } catch {
      console.warn("[WS] Invalid message");
    }
  };

  ws.onclose = () => {
    clearTimers(connection);
    connection.socket = null;
    connection.closeListeners.forEach((listener) => listener());

    if (connections.has(connection.userId)) {
      connection.reconnectTimeout = setTimeout(() => {
        connect(connection);
      }, 2000);
    }
  };

  ws.onerror = (event) => {
    connection.errorListeners.forEach((listener) => listener(event));
    ws.close();
  };
}

function subscribe(
  userId: string,
  onMessage: (data: WSMessage) => void,
  options?: WebSocketOptions,
) {
  const connection = connections.get(userId) ?? createConnection(userId);
  connections.set(userId, connection);

  connection.messageListeners.add(onMessage);
  if (options?.onOpen) connection.openListeners.add(options.onOpen);
  if (options?.onClose) connection.closeListeners.add(options.onClose);
  if (options?.onError) connection.errorListeners.add(options.onError);

  connect(connection);

  return () => {
    connection.messageListeners.delete(onMessage);
    if (options?.onOpen) connection.openListeners.delete(options.onOpen);
    if (options?.onClose) connection.closeListeners.delete(options.onClose);
    if (options?.onError) connection.errorListeners.delete(options.onError);

    const isUnused =
      connection.messageListeners.size === 0 &&
      connection.openListeners.size === 0 &&
      connection.closeListeners.size === 0 &&
      connection.errorListeners.size === 0;

    if (isUnused) {
      connections.delete(userId);
      clearTimers(connection);
      connection.socket?.close();
      connection.socket = null;
    }
  };
}

function sendForUser(userId: string, message: WSMessage): boolean {
  const connection = connections.get(userId);
  if (connection?.socket?.readyState === WebSocket.OPEN) {
    connection.socket.send(JSON.stringify(message));
    return true;
  }
  return false;
}

export function useWebSocket(
  userId: string,
  onMessage: (data: WSMessage) => void,
  options?: WebSocketOptions,
) {
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const onMessageRef = useRef(onMessage);
  const onOpenRef = useRef(options?.onOpen);
  const onCloseRef = useRef(options?.onClose);
  const onErrorRef = useRef(options?.onError);

  useEffect(() => { onMessageRef.current = onMessage; }, [onMessage]);
  useEffect(() => { onOpenRef.current = options?.onOpen; }, [options?.onOpen]);
  useEffect(() => { onCloseRef.current = options?.onClose; }, [options?.onClose]);
  useEffect(() => { onErrorRef.current = options?.onError; }, [options?.onError]);

  const send = useCallback((message: WSMessage): boolean => {
    if (!userId || userId === "unknown") return false;
    return sendForUser(userId, message);
  }, [userId]);

  const sendAsObject = useCallback((msg: object): boolean => {
    return send(msg as WSMessage);
  }, [send]);

  useEffect(() => {
    if (!userId || userId === "unknown") return;

    const unsubscribe = subscribe(
      userId,
      (data) => onMessageRef.current(data),
      {
        onOpen: () => {
          setConnected(true);
          setError(null);
          onOpenRef.current?.();
        },
        onClose: () => {
          setConnected(false);
          onCloseRef.current?.();
        },
        onError: (event) => {
          setConnected(false);
          setError("WebSocket connection failed");
          onErrorRef.current?.(event);
        },
      },
    );

    registerWsSend(sendAsObject);

    return () => {
      unsubscribe();
    };
  }, [userId, sendAsObject]);

  return { send, connected, error };
}