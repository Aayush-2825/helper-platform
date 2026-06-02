import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock ioredis to capture published payloads
let published: Array<{ channel: string; payload: string }> = [];
vi.mock('ioredis', () => {
  class FakeRedisPub {
    constructor(_url: string) {}
    async publish(channel: string, payload: string) {
      published.push({ channel, payload });
      return 1;
    }
    disconnect() {}
  }
  return { default: FakeRedisPub };
});

// Mock registry to return targeted nodes
vi.mock('../redisRegistry.js', () => ({ getNodesForUsers: async () => ['node-123'] }));

// Mock persistence service to avoid DB calls
vi.mock('../../services/event-persistence.service.js', () => ({ persistOutboundEvent: async () => null }));

describe('dispatch broadcastEvent', () => {
  beforeEach(() => {
    process.env.REDIS_URL = 'redis://127.0.0.1:6379';
    process.env.NODE_ID = 'node-123';
    published = [];
    vi.resetModules();
  });

  it('includes targetNodeIds when registry returns nodes', async () => {
    const { broadcastEvent } = await import('../dispatch.js');
    await broadcastEvent({ event: 'test', data: { x: 1 }, targetUserIds: ['u1'] });
    expect(published.length).toBeGreaterThan(0);
    const msg = JSON.parse(published[0].payload);
    expect(msg.targetNodeIds).toBeDefined();
    expect(Array.isArray(msg.targetNodeIds)).toBe(true);
    expect(msg.targetNodeIds).toContain('node-123');
  });
});
