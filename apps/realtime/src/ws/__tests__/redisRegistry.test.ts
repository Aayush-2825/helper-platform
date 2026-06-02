import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock ioredis to a lightweight in-memory stub
vi.mock('ioredis', () => {
  class FakeRedis {
    store: Record<string, Set<string>> = {} as any;
    published: Array<any> = [] as any;
    constructor(_url: string) {}
    async sadd(key: string, member: string) {
      this.store[key] = this.store[key] || new Set();
      this.store[key].add(member);
      return 1;
    }
    async smembers(key: string) {
      return Array.from(this.store[key] || []);
    }
    async expire(_k: string, _s: number) {
      return 1;
    }
    async srem(key: string, member: string) {
      this.store[key] = this.store[key] || new Set();
      this.store[key].delete(member);
      return 1;
    }
    pipeline() {
      const self = this;
      const keys: string[] = [];
      return {
        smembers(arg: string) {
          keys.push(arg);
          return this;
        },
        async exec() {
          return keys.map((k) => [null, Array.from(self.store[k] || [])]);
        },
      };
    }
    disconnect() {}
  }

  return { default: FakeRedis };
});

describe('redisRegistry', () => {
  beforeEach(() => {
    // ensure tests use the stubbed path
    process.env.REDIS_URL = 'redis://127.0.0.1:6379';
    // Clear module cache so dynamic imports re-evaluate
    vi.resetModules();
  });

  it('adds, lists and removes node mappings for a user', async () => {
    const { addNodeForUser, getNodesForUsers, removeNodeForUser } = await import('../redisRegistry.js');

    await addNodeForUser('user1', 'node-A');
    await addNodeForUser('user2', 'node-B');
    const nodes = await getNodesForUsers(['user1', 'user2']);
    expect(Array.isArray(nodes)).toBe(true);
    // should include both node-A and node-B
    expect(nodes.sort()).toEqual(['node-A', 'node-B'].sort());

    await removeNodeForUser('user1', 'node-A');
    const nodesAfter = await getNodesForUsers(['user1']);
    expect(nodesAfter).toEqual([]);
  });
});
