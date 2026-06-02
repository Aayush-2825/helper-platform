import { dispatcher } from "./dispatcher.js";
import { persistOutboundEvent } from "../services/event-persistence.service.js";
import { logger } from "../services/logger.js";
import { getNodesForUsers } from "./redisRegistry.js";

/**
 * Higher-level event dispatcher that persists events and sends them via WS
 */
export async function broadcastEvent({
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

  // 1. Persist for offline delivery/history
  try {
    await persistOutboundEvent({ event, data, targetUserIds });
  } catch (err) {
    logger.error("[Dispatch] Failed to persist event", { event, err });
  }

  // 2. Deliver via WebSockets
  // If REDIS_URL is configured, publish to the outbound channel instead
  // so other instances can deliver to their connected clients. We do a
  // dynamic import of ioredis to avoid hard dependency when not used.
  const redisUrl = process.env.REDIS_URL;
  if (redisUrl) {
    try {
      const { default: IORedis } = await import("ioredis");
      const IORedisCtor: any = IORedis;
      const client = new IORedisCtor(redisUrl);
      const payloadObj: any = { message, targetUserIds };
      if (targetUserIds && targetUserIds.length > 0) {
        try {
          const nodes = await getNodesForUsers(targetUserIds);
          if (nodes && nodes.length > 0) payloadObj.targetNodeIds = nodes;
        } catch (_) {
          // ignore registry failures and publish to all
        }
      }
      const payload = JSON.stringify(payloadObj);
      await client.publish("realtime:outbound", payload);
      // disconnect the short-lived client
      try {
        client.disconnect();
      } catch (_) {
        // ignore
      }
      return;
    } catch (err) {
      logger.error("[Dispatch] Redis publish failed, falling back to local dispatcher", { error: (err as any)?.message });
      // fallthrough to local dispatcher
    }
  }

  if (targetUserIds && targetUserIds.length > 0) {
    dispatcher.multicast(targetUserIds, message as any);
  } else {
    dispatcher.broadcast(message as any);
  }
}
