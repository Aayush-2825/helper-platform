import { WebSocket } from "ws";
import { logger } from "../services/logger.js";
import { dispatcher } from "./dispatcher.js";
import { verifyWsAuthToken } from "../lib/ws-auth.js"; // Existing util
import { env } from "../config/env.js";
import { routeMessage } from "../handlers/index.js"; // Existing router

const AUTH_TIMEOUT = 10000; // 10 seconds to authenticate

/**
 * Handles communication for a single WebSocket connection
 */
export function handleConnection(socket: WebSocket) {
  let isAuthenticated = false;
  let currentUserId: string | null = null;

  // Set timeout to drop unauthenticated connections
  const authTimeout = setTimeout(() => {
    if (!isAuthenticated) {
      logger.warn("[WS] Closing connection: Auth timeout");
      socket.close(1008, "Authentication timeout");
    }
  }, AUTH_TIMEOUT);

  socket.on("message", (raw) => {
    try {
      const payload = JSON.parse(raw.toString());

      // 1. Handle Auth Message if not authenticated
      if (!isAuthenticated) {
        if (payload.type === "auth" && payload.token && payload.userId) {
          const secret = env.REALTIME_WS_AUTH_SECRET || env.AUTH_SECRET;
          if (verifyWsAuthToken(payload.token, payload.userId, secret)) {
            isAuthenticated = true;
            currentUserId = payload.userId;
            clearTimeout(authTimeout);
            
            dispatcher.register(currentUserId!, socket);
            
            socket.send(JSON.stringify({ 
              type: "authenticated", 
              userId: currentUserId,
              timestamp: new Date().toISOString() 
            }));
            
            logger.info(`[WS] User=${currentUserId} authenticated successfully`);
            return;
          }
        }
        
        logger.warn("[WS] Invalid auth attempt or message received before auth");
        socket.close(1008, "Authentication required");
        return;
      }

      // 2. Handle ping (in addition to protocol level ping)
      if (payload.type === "ping") {
        socket.send(JSON.stringify({ type: "pong" }));
        return;
      }

      // 3. Route authenticated messages
      if (currentUserId) {
        routeMessage(currentUserId, payload);
      }
      
    } catch (err) {
      logger.error("[WS] Message error", { err });
      socket.send(JSON.stringify({ type: "error", message: "Invalid message format" }));
    }
  });

  socket.on("close", () => {
    clearTimeout(authTimeout);
    if (currentUserId) {
      dispatcher.unregister(currentUserId, socket);
    }
  });

  socket.on("error", (err) => {
    logger.error(`[WS] Error for user=${currentUserId ?? "unknown"}`, { err });
  });
}
