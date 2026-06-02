/**
 * Small Redis-backed registry to map userId -> nodeIds (instances hosting the user)
 * Uses dynamic import of ioredis so it's optional in local dev.
 */
import { logger } from "../services/logger.js";

let client: any = null;

async function getClient() {
  if (client) return client;
  const redisUrl = process.env.REDIS_URL;
  if (!redisUrl) return null;
  try {
    const { default: IORedis } = await import("ioredis");
    const IORedisCtor: any = IORedis;
    client = new IORedisCtor(redisUrl);
    return client;
  } catch (err: any) {
    logger.error("[RedisRegistry] Failed to create redis client", { error: err.message });
    return null;
  }
}

export async function addNodeForUser(userId: string, nodeId: string) {
  const c = await getClient();
  if (!c) return;
  try {
    await c.sadd(`user:${userId}:nodes`, nodeId);
    // set a TTL to auto-expire stale mappings
    await c.expire(`user:${userId}:nodes`, 60 * 60 * 24); // 24h
  } catch (err: any) {
    logger.debug("[RedisRegistry] addNodeForUser failed", { error: err.message });
  }
}

export async function removeNodeForUser(userId: string, nodeId: string) {
  const c = await getClient();
  if (!c) return;
  try {
    await c.srem(`user:${userId}:nodes`, nodeId);
  } catch (err: any) {
    logger.debug("[RedisRegistry] removeNodeForUser failed", { error: err.message });
  }
}

export async function getNodesForUsers(userIds: string[]) {
  const c = await getClient();
  if (!c) return null;
  try {
    const pipeline = c.pipeline();
    userIds.forEach((id) => pipeline.smembers(`user:${id}:nodes`));
    const res = await pipeline.exec();
    const nodeSets = res.map((r: any) => (Array.isArray(r) && r[1] ? r[1] : []));
    const nodes = new Set<string>();
    nodeSets.forEach((arr: string[]) => arr.forEach((n) => nodes.add(n)));
    return Array.from(nodes);
  } catch (err: any) {
    logger.debug("[RedisRegistry] getNodesForUsers failed", { error: err.message });
    return null;
  }
}

export async function disconnectRegistry() {
  if (client) {
    try {
      client.disconnect();
    } catch (_) {}
  }
}
