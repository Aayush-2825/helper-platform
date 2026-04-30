import { WebSocket } from "ws";
import { logger } from "../services/logger.js";
import { AnyWsMessage } from "@repo/types";

/**
 * Manages active WebSocket clients grouped by User ID
 */
export class WsDispatcher {
  private static instance: WsDispatcher;
  private clients = new Map<string, Set<WebSocket>>();

  private constructor() {}

  static getInstance(): WsDispatcher {
    if (!WsDispatcher.instance) {
      WsDispatcher.instance = new WsDispatcher();
    }
    return WsDispatcher.instance;
  }

  /**
   * Registers a new client connection for a user
   */
  register(userId: string, socket: WebSocket) {
    const existing = this.clients.get(userId) ?? new Set<WebSocket>();
    existing.add(socket);
    this.clients.set(userId, existing);
    
    logger.debug(`[Dispatcher] Registered client for user=${userId}. Total users=${this.clients.size}`);
  }

  /**
   * Removes a specific client connection
   */
  unregister(userId: string, socket: WebSocket) {
    const userSockets = this.clients.get(userId);
    if (userSockets) {
      userSockets.delete(socket);
      if (userSockets.size === 0) {
        this.clients.delete(userId);
      }
    }
    logger.debug(`[Dispatcher] Unregistered client for user=${userId}. Remaining=${userSockets?.size ?? 0}`);
  }

  /**
   * Sends a message to a specific user (all their active sockets)
   */
  sendToUser(userId: string, payload: AnyWsMessage) {
    const sockets = this.clients.get(userId);
    if (!sockets || sockets.size === 0) {
      logger.warn(`[Dispatcher] Attempted to send message to inactive user=${userId}`);
      return;
    }

    const message = JSON.stringify(payload);
    sockets.forEach((s) => {
      if (s.readyState === WebSocket.OPEN) {
        s.send(message);
      }
    });
  }

  /**
   * Broadcasts a message to all connected clients
   */
  broadcast(payload: AnyWsMessage) {
    const message = JSON.stringify(payload);
    this.clients.forEach((sockets) => {
      sockets.forEach((s) => {
        if (s.readyState === WebSocket.OPEN) {
          s.send(message);
        }
      });
    });
  }

  /**
   * Multi-cast to specific users
   */
  multicast(userIds: string[], payload: AnyWsMessage) {
    userIds.forEach((id) => this.sendToUser(id, payload));
  }

  getTotalActiveSockets(): number {
    let count = 0;
    this.clients.forEach((s) => { count += s.size; });
    return count;
  }
}

export const dispatcher = WsDispatcher.getInstance();
