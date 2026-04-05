import express from "express";
import http from "http";
import WebSocket, { WebSocketServer } from "ws";
import router from "./routes/helpers.js";
import realtimeRouter from "./routes/realtime.js";
import cors from "cors";
import { routeMessage } from "./handlers/index.js";
import { webDb } from "./db/index.js";
import { booking } from "./db/schema.js";
import { and, eq, lt } from "drizzle-orm";
import { env } from "./config/env.js";
import { ValidationError } from "./utils/validation.js";
import {
  flushQueuedNotificationsForUser,
  persistOutboundEvent,
} from "./services/event-persistence.service.js";

const PORT = env.PORT;

const app = express();

app.use(
  cors({
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
    credentials: true,
  }),
);

app.use(express.json());
app.use("/api/helpers", router);
app.use("/api/realtime", realtimeRouter);

const server = http.createServer(app);
const wss = new WebSocketServer({ server });

/**
 * 🔥 Map<userId, sockets>
 */
const clients = new Map<string, Set<WebSocket>>();

// =========================
// ✅ UTIL FUNCTIONS
// =========================

function sendToUser(userId: string, message: object) {
  const userSockets = clients.get(userId);

  if (!userSockets || userSockets.size === 0) {
    return;
  }

  const payload = JSON.stringify(message);

  userSockets.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(payload);
    }
  });

  // Clean up closed sockets opportunistically.
  userSockets.forEach((client) => {
    if (client.readyState !== WebSocket.OPEN) {
      userSockets.delete(client);
    }
  });

  if (userSockets.size === 0) {
    clients.delete(userId);
  }
}

function broadcastToAll(message: object) {
  const payload = JSON.stringify(message);

  clients.forEach((userSockets, userId) => {
    userSockets.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(payload);
      }
    });

    userSockets.forEach((client) => {
      if (client.readyState !== WebSocket.OPEN) {
        userSockets.delete(client);
      }
    });

    if (userSockets.size === 0) {
      clients.delete(userId);
    }
  });
}

function getTotalActiveSockets() {
  let total = 0;
  clients.forEach((userSockets) => {
    total += userSockets.size;
  });
  return total;
}

// =========================
// 🔥 CORE EVENT DISPATCHER
// =========================

export function broadcastEvent({
  event,
  data,
  targetUserIds,
}: {
  event: string;
  data: Record<string, unknown>;
  targetUserIds?: string[];
}) {
  const message = {
    type: "event",
    event,
    data,
  };

  console.log("📡 Broadcasting:", event, targetUserIds ?? "ALL");

  void persistOutboundEvent({ event, data, targetUserIds });

  if (targetUserIds && targetUserIds.length > 0) {
    targetUserIds.forEach((userId) => {
      sendToUser(userId, message);
    });
  } else {
    broadcastToAll(message);
  }
}

// =========================
// 🌐 WS CONNECTION
// =========================

wss.on("connection", (socket: WebSocket, request) => {
  const url = new URL(request.url || "", "http://localhost");
  const userId = url.searchParams.get("userId");

  if (!userId) {
    console.warn("[WS] Missing userId → rejected");
    socket.close(1008, "Missing userId");
    return;
  }

  const existingSockets = clients.get(userId) ?? new Set<WebSocket>();
  existingSockets.add(socket);
  clients.set(userId, existingSockets);

  console.log(
    `[WS] ${userId} connected. Users: ${clients.size}, sockets: ${getTotalActiveSockets()}`,
  );

  // ✅ Connection ack
  socket.send(
    JSON.stringify({
      type: "connected",
      userId,
      timestamp: new Date().toISOString(),
    }),
  );

  void flushQueuedNotificationsForUser(userId, (queuedMessage) => {
    if (socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify(queuedMessage));
    }
  });

  // =========================
  // 📩 MESSAGE HANDLER
  // =========================

  socket.on("message", (raw) => {
    try {
      const data = JSON.parse(raw.toString());

      // ❤️ Handle heartbeat
      if (data.type === "ping") {
        socket.send(JSON.stringify({ type: "pong" }));
        return;
      }

      // 🛡️ Wrap handler in try-catch to prevent crashes
      try {
        routeMessage(userId, data);
      } catch (handlerErr) {
        console.error(`[WS] Handler error for ${userId} (${data.type}):`, handlerErr);
        const isValidationError = handlerErr instanceof ValidationError;
        socket.send(
          JSON.stringify({
            type: "error",
            message: isValidationError ? handlerErr.message : "Failed to process message",
            code: isValidationError ? handlerErr.code : "HANDLER_ERROR",
            requestType: data.type,
          })
        );
      }
    } catch (err) {
      console.warn("[WS] Invalid message JSON", err);
      socket.send(
        JSON.stringify({
          type: "error",
          message: "Invalid message format",
        })
      );
    }
  });

  // =========================
  // 🔌 CLEANUP
  // =========================

  socket.on("close", async () => {
    const userSockets = clients.get(userId);
    if (userSockets) {
      userSockets.delete(socket);
      if (userSockets.size === 0) {
        clients.delete(userId);
      }
    }
    console.log(
      `[WS] ${userId} disconnected. Users: ${clients.size}, sockets: ${getTotalActiveSockets()}`,
    );
  });

  socket.on("error", (err) => {
    console.error(`[WS] Error for ${userId}:`, err);
  });
});

// =========================
// 🚀 START SERVER
// =========================

const stopSignals = ["SIGTERM", "SIGINT"];

let isShuttingDown = false;

const gracefulShutdown = async (signal: string) => {
  if (isShuttingDown) {
    console.log(`[Server] Shutdown already in progress (${signal}), forcing exit...`);
    process.exit(1);
  }

  isShuttingDown = true;
  console.log(`[Server] Received ${signal}, starting graceful shutdown...`);

  // Close all WebSocket connections
  wss.clients.forEach((client) => {
    client.close(1001, "Server shutting down");
  });

  // Close HTTP server
  server.close(() => {
    console.log("[Server] HTTP server closed");
    process.exit(0);
  });

  // Force shutdown after 10 seconds
  setTimeout(() => {
    console.error("[Server] Forced shutdown after 10s timeout");
    process.exit(1);
  }, 10000);
};

stopSignals.forEach((signal) => {
  process.on(signal, () => gracefulShutdown(signal));
});

// Handle uncaught exceptions
process.on("uncaughtException", (err) => {
  console.error("[Server] Uncaught exception:", err);
  gracefulShutdown("UNCAUGHT_EXCEPTION");
});

process.on("unhandledRejection", (reason, promise) => {
  console.error("[Server] Unhandled rejection at:", promise, "reason:", reason);
});

// =========================
// 🕒 BOOKING EXPIRATION JOB (runs every 30s)
// =========================

setInterval(async () => {
  try {
    const now = new Date();
    const expired = await webDb
      .update(booking)
      .set({ status: "expired", updatedAt: now })
      .where(
        and(
          eq(booking.status, "requested"),
          lt(booking.acceptanceDeadline, now)
        )
      )
      .returning({ id: booking.id, customerId: booking.customerId });

    if (expired.length > 0) {
      console.log(`🕒 [Expiration] Marked ${expired.length} bookings as expired`);
      expired.forEach((b) => {
        broadcastEvent({
          event: "booking_update",
          data: { bookingId: b.id, status: "expired", eventType: "expired" },
          targetUserIds: [b.customerId],
        });
      });
    }
  } catch (err) {
    // Silence error if booking table doesn't exist yet or other DB issues
    if (process.env.NODE_ENV === "development") {
      // console.warn("🕒 [Expiration] Job skipped (likely DB or table not ready)");
    } else {
      console.error("❌ [Expiration] Job failed:", err);
    }
  }
}, 30000);

server.listen(PORT, () => {
  console.log(`[Server] ✅ Express + WS running on port ${PORT}`);
  console.log(`[Server] 📡 WebSocket server ready`);
  console.log(`[Server] 🔄 Auto-expiration job started (30s interval)`);
  console.log(`[Server] 🛡️ Graceful shutdown configured`);
});
