import { dispatcher } from "./dispatcher.js";
import { persistOutboundEvent } from "../services/event-persistence.service.js";
import { logger } from "../services/logger.js";
import { getNodesForUsers } from "./redisRegistry.js";
import { isValidRedisUrl } from "../utils/redis.js";

let publisherClient: any = null;

async function getPublisherClient(): Promise<any> {
  const redisUrl = process.env.REDIS_URL;
  if (!isValidRedisUrl(redisUrl)) return null;
  if (publisherClient) return publisherClient;

  try {
    const { default: IORedis } = await import("ioredis");
    const IORedisCtor: any = IORedis;
    publisherClient = new IORedisCtor(redisUrl, {
      maxRetriesPerRequest: 3,
      retryStrategy(times: number) {
        if (times > 5) return null;
        return Math.min(times * 100, 3000);
      },
    });
    if (typeof publisherClient.on === "function") {
      publisherClient.on("error", (err: any) => {
        logger.error("[Dispatch] Redis publisher error", { error: err?.message });
      });
    }
    return publisherClient;
  } catch (err: any) {
    logger.error("[Dispatch] Failed to initialize Redis publisher", { error: err?.message });
    return null;
  }
}

export async function disconnectPublisher() {
  if (publisherClient) {
    try {
      await publisherClient.quit();
    } catch (_) {
      publisherClient.disconnect();
    }
    publisherClient = null;
  }
}

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
  // If REDIS_URL is configured, publish to the outbound channel using persistent publisher
  try {
    const client = await getPublisherClient();
    if (client) {
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
      return;
    }
  } catch (err) {
    logger.error("[Dispatch] Redis publish failed, falling back to local dispatcher", { error: (err as any)?.message });
    // fallthrough to local dispatcher
  }

  if (targetUserIds && targetUserIds.length > 0) {
    dispatcher.multicast(targetUserIds, message as any);
  } else {
    dispatcher.broadcast(message as any);
  }
}
