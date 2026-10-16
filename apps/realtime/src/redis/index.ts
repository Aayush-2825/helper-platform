import { Redis } from "ioredis";
import { isValidRedisUrl } from "../utils/redis.js";

const rawUrl = process.env.REDIS_URL;
const isConfigured = isValidRedisUrl(rawUrl);

function createSafeRedisClient(url?: string): Redis {
  if (!isConfigured || !url) {
    const dummy = {
      on: () => dummy,
      subscribe: async () => {},
      publish: async () => 0,
      disconnect: () => {},
      quit: async () => "OK",
    } as unknown as Redis;
    return dummy;
  }

  const client = new Redis(url, {
    maxRetriesPerRequest: 1,
    retryStrategy: () => null,
    lazyConnect: true,
  });
  client.on("error", () => {});
  return client;
}

export const pub = createSafeRedisClient(rawUrl);
export const sub = createSafeRedisClient(rawUrl);

