import express from "express";
import http from "http";
import WebSocket, { WebSocketServer } from "ws";
import { randomUUID } from "crypto";
import router from "./routes/helpers.js";

const PORT = Number(process.env.PORT) || 3001;

const app = express();
app.use(express.json()); 

app.use("/api/helpers", router);

const server = http.createServer(app);

const wss = new WebSocketServer({ server });

const clients = new Map<string, WebSocket>();

type Message =
  | { type: "chat"; to: string; payload: unknown }
  | { type: "broadcast"; payload: unknown }
  | { type: "booking_request"; payload: unknown };

wss.on("connection", (socket: WebSocket) => {
  const userId = randomUUID();
  clients.set(userId, socket);
  console.log(`[WS] ${userId} connected. Total: ${clients.size}`);

  socket.on("message", (dataRaw) => {
    let data: Message & Record<string, unknown>;
    try {
      data = JSON.parse(dataRaw.toString()) as Message & Record<string, unknown>;
    } catch (err) {
      console.warn("[WS] Invalid JSON received", err);
      return;
    }

    if (!data.type) {
      console.warn("[WS] Message missing type", data);
      return;
    }

    switch (data.type) {
      case "chat":
        handleChat({ userId, to: data.to, payload: data.payload, socket });
        break;
      case "broadcast":
        handleBroadcast({ userId, payload: data.payload, socket });
        break;
      case "booking_request":
        handleBookingRequest({ userId, payload: data.payload, socket });
        break;
      default:
        // Unreachable with the current `Message` union; kept for runtime safety.
        console.warn("[WS] Unknown message type received");
        break;
    }
  });

  socket.on("close", () => {
    clients.delete(userId);
    console.log(`[WS] ${userId} disconnected. Total: ${clients.size}`);
  });

  socket.on("error", (err) => {
    console.error(`[WS] Error for user ${userId}:`, err);
  });
});

function sendAck(
  socket: WebSocket,
  type: string,
  status: "ok" | "error",
  extra?: Record<string, unknown>,
) {
  if (socket.readyState === WebSocket.OPEN) {
    socket.send(
      JSON.stringify({
        type: "ack",
        ackType: type,
        status,
        ...extra,
      }),
    );
  }
}

function handleChat({
  userId,
  to,
  payload,
  socket,
}: {
  userId: string;
  to: string;
  payload: unknown;
  socket: WebSocket;
}) {
  const target = clients.get(to);
  if (!target) {
    console.warn(`[WS] Target user ${to} not found for chat from ${userId}`);
    sendAck(socket, "chat", "error", { message: "Target user not found" });
    return;
  }
  if (target.readyState === WebSocket.OPEN) {
    target.send(
      JSON.stringify({
        type: "chat",
        from: userId,
        payload,
      }),
    );
    sendAck(socket, "chat", "ok");
  } else {
    console.warn(`[WS] Target user ${to} socket not open`);
    sendAck(socket, "chat", "error", { message: "Target socket not open" });
  }
}

function handleBroadcast({
  socket,
  userId,
  payload,
}: {
  socket: WebSocket;
  userId: string;
  payload: unknown;
}) {
  if (!payload) {
    sendAck(socket, "broadcast", "error", { message: "Missing payload" });
    return;
  }
  clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(
        JSON.stringify({
          type: "broadcast",
          from: userId,
          payload,
        }),
      );
    }
  });
  sendAck(socket, "broadcast", "ok");
}

function handleBookingRequest({
  socket,
  userId,
  payload,
}: {
  socket: WebSocket;
  userId: string;
  payload: unknown;
}) {
  if (!payload) {
    sendAck(socket, "booking_request", "error", { message: "Missing payload" });
    return;
  }
  const payloadObj = payload as { service?: unknown; location?: unknown };
  if (!payloadObj.service || !payloadObj.location) {
    socket.send(
      JSON.stringify({
        type: "error",
        message: "Invalid booking request: missing service or location",
      }),
    );
    sendAck(socket, "booking_request", "error", {
      message: "Missing service or location",
    });
    return;
  }
  clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(
        JSON.stringify({
          type: "booking_request",
          from: userId,
          payload,
        }),
      );
    }
  });
  sendAck(socket, "booking_request", "ok");
}

server.listen(PORT, () => {
  console.log(`[Server] Express & WS listening on port ${PORT}`);
});
