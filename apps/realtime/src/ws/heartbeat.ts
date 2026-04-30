import { WebSocket } from "ws";
import { logger } from "../services/logger.js";

const HEARTBEAT_INTERVAL = 30000; // 30s
const HEARTBEAT_TIMEOUT = 60000;  // 60s

export interface HeartbeatSocket extends WebSocket {
  isAlive: boolean;
}

/**
 * Setup ping/pong heartbeat for a socket
 */
export function setupHeartbeat(socket: WebSocket) {
  const ws = socket as HeartbeatSocket;
  ws.isAlive = true;

  ws.on("pong", () => {
    ws.isAlive = true;
  });
}

/**
 * Starts a global monitor that terminates stale connections
 */
export function startHeartbeatMonitor(wss: any) {
  const interval = setInterval(() => {
    wss.clients.forEach((ws: WebSocket) => {
      const socket = ws as HeartbeatSocket;
      if (socket.isAlive === false) {
        logger.info("[WS] Terminating stale connection");
        return socket.terminate();
      }

      socket.isAlive = false;
      socket.ping();
    });
  }, HEARTBEAT_INTERVAL);

  wss.on("close", () => {
    clearInterval(interval);
  });
}
