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

const PORT = Number(process.env.PORT) || 3001;

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
 * 🔥 Map<userId, socket>
 */
const clients = new Map<string, WebSocket>();

// =========================
// ✅ UTIL FUNCTIONS
// =========================

function sendToUser(userId: string, message: object) {
  const client = clients.get(userId);

  if (client && client.readyState === WebSocket.OPEN) {
    client.send(JSON.stringify(message));
  }
}

function broadcastToAll(message: object) {
  clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(message));
    }
  });
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
  data: any;
  targetUserIds?: string[];
}) {
  const message = {
    type: "event",
    event,
    data,
  };

  console.log("📡 Broadcasting:", event, targetUserIds ?? "ALL");

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

  // ⚠️ Handle duplicate connections (same user)
  if (clients.has(userId)) {
    console.log(`[WS] Replacing existing connection for ${userId}`);
    clients.get(userId)?.close();
  }

  clients.set(userId, socket);

  console.log(`[WS] ${userId} connected. Total: ${clients.size}`);

  // ✅ Connection ack
  socket.send(
    JSON.stringify({
      type: "connected",
      userId,
      timestamp: new Date().toISOString(),
    }),
  );

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

      routeMessage(userId, data);
    } catch (err) {
      console.warn("[WS] Invalid message", err);
    }
  });

  // =========================
  // 🔌 CLEANUP
  // =========================

  socket.on("close", async () => {
    clients.delete(userId);
    console.log(`[WS] ${userId} disconnected. Total: ${clients.size}`);

    // ✅ NEW: Auto-cancel 'requested' bookings on disconnect
    try {
      const now = new Date();
      const nowTs = now.getTime();
      const cancelledCount = await webDb
        .update(booking)
        .set({ status: "cancelled", cancelledAt: nowTs, cancelledBy: "customer" })
        .where(
          and(
            eq(booking.customerId, userId),
            eq(booking.status, "requested")
          )
        )
        .returning({ id: booking.id, cancelledAt: booking.cancelledAt });

      if (cancelledCount.length > 0) {
        console.log(`🔌 [Auto-Cancel] Cancelled ${cancelledCount.length} bookings for disconnected user ${userId}`);
        cancelledCount.forEach((b) => {
          if (typeof b.cancelledAt !== "number") {
            console.warn("[Auto-Cancel] cancelledAt is not a number:", b.cancelledAt);
          }
        });
      }
    } catch (err) {
      console.error("[WS-Close] Auto-cancel failed:", err);
    }
  });

  socket.on("error", (err) => {
    console.error(`[WS] Error for ${userId}:`, err);
  });
});

// =========================
// 🚀 START SERVER
// =========================

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
  console.log(`[Server] Express + WS running on port ${PORT}`);
});
