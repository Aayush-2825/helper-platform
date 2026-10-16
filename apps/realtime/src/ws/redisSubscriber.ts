import { dispatcher } from "./dispatcher.js";
import { logger } from "../services/logger.js";
import { isValidRedisUrl } from "../utils/redis.js";

let redisSub: any = null;

export async function startRedisSubscriber() {
  const redisUrl = process.env.REDIS_URL;
  if (!isValidRedisUrl(redisUrl)) {
    logger.info("[RedisSubscriber] REDIS_URL not configured with valid redis:// connection string — running in standalone mode");
    return;
  }

  try {
    const { default: IORedis } = await import("ioredis");
    const IORedisCtor: any = IORedis;
    redisSub = new IORedisCtor(redisUrl, {
      maxRetriesPerRequest: 3,
      retryStrategy(times: number) {
        if (times > 5) return null; // Stop endless reconnection loops
        return Math.min(times * 200, 2000);
      },
    });

    if (typeof redisSub.on === "function") {
      redisSub.on("error", (err: any) => {
        logger.error("[RedisSubscriber] Redis error", { error: err?.message });
      });
    }

    await redisSub.subscribe("realtime:outbound");
    logger.info("[RedisSubscriber] Subscribed to realtime:outbound");

    redisSub.on("message", (_channel: string, payload: string) => {
      try {
        const parsed = JSON.parse(payload);
        const { message, targetUserIds, targetNodeIds } = parsed as any;

        // If the publisher provided targetNodeIds, only process if this node is targeted
        const myNode = process.env.NODE_ID || `${process.pid}`;
        if (Array.isArray(targetNodeIds) && targetNodeIds.length > 0) {
          if (!targetNodeIds.includes(myNode)) {
            return; // not for this instance
          }
        }

        if (targetUserIds && Array.isArray(targetUserIds) && targetUserIds.length > 0) {
          dispatcher.multicast(targetUserIds, message as any);
        } else {
          dispatcher.broadcast(message as any);
        }
      } catch (err: any) {
        logger.error("[RedisSubscriber] Failed to process message", { error: err.message });
      }
    });
  } catch (err: any) {
    logger.error("[RedisSubscriber] Failed to start", { error: err.message });
  }
}

export async function stopRedisSubscriber() {
  if (redisSub) {
    try {
      await redisSub.unsubscribe("realtime:outbound");
      redisSub.disconnect();
    } catch (err) {
      // ignore
    }
  }
}
