import { WebSocketServer } from "ws";
import { Server } from "http";
import { logger } from "../services/logger.js";
import { handleConnection } from "./handler.js";
import { startHeartbeatMonitor, setupHeartbeat } from "./heartbeat.js";
import { env } from "../config/env.js";

/**
 * Initializes the WebSocket server and hooks it to the HTTP server
 */
export function initWsServer(server: Server) {
  const wss = new WebSocketServer({ 
    server,
    // Add path filtering if needed: path: "/api/realtime/ws"
  });

  logger.info("[WS] Server initialized");

  wss.on("connection", (socket, request) => {
    const origin = request.headers.origin;
    
    // Check CORS
    if (origin) {
        const allowed = env.CORS_ALLOWED_ORIGINS ?? [];
        if (!allowed.includes(origin) && process.env.NODE_ENV === "production") {
            logger.warn(`[WS] Rejected unauthorized origin: ${origin}`);
            socket.close(1008, "Origin not allowed");
            return;
        }
    }

    logger.debug(`[WS] New connection from ${request.socket.remoteAddress}`);
    
    setupHeartbeat(socket);
    handleConnection(socket);
  });

  startHeartbeatMonitor(wss);

  return wss;
}
