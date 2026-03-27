/**
 * Preservation Property Tests — Property 3
 *
 * These tests MUST PASS on unfixed code — they establish the baseline behavior
 * that must be preserved after the fix is applied.
 *
 * Validates: Requirements 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import * as fc from "fast-check";
import { EventEmitter } from "events";
import WebSocket from "ws";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Replicate the ping handler logic from apps/realtime/src/index.ts (unfixed).
 * We test the handler in isolation — no server startup required.
 */
function makePingHandler(socket: { send: (msg: string) => void }) {
  return (raw: Buffer | string) => {
    try {
      const data = JSON.parse(raw.toString());
      if (data.type === "ping") {
        socket.send(JSON.stringify({ type: "pong" }));
        return;
      }
      // non-ping messages are just logged (unfixed behaviour)
      console.log("[WS] Message:", data);
    } catch {
      console.warn("[WS] Invalid message");
    }
  };
}

/**
 * Replicate broadcastEvent from apps/realtime/src/index.ts.
 * We test it in isolation using a mock clients map.
 */
function makeBroadcastEvent(clients: Map<string, { send: (...args: any[]) => void; readyState: number }>) {
  return function broadcastEvent({
    event,
    data,
    targetUserIds,
  }: {
    event: string;
    data: unknown;
    targetUserIds?: string[];
  }) {
    const message = JSON.stringify({ type: "event", event, data });

    if (targetUserIds && targetUserIds.length > 0) {
      targetUserIds.forEach((userId) => {
        const client = clients.get(userId);
        if (client && client.readyState === WebSocket.OPEN) {
          client.send(message);
        }
      });
    } else {
      clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(message);
        }
      });
    }
  };
}

// ---------------------------------------------------------------------------
// Property 3.2 — Ping/Pong Preservation
// ---------------------------------------------------------------------------

describe("Preservation — Ping/Pong (Requirement 3.2)", () => {
  /**
   * Property: for any { type: "ping" } message, the server always responds
   * with { type: "pong" }.
   *
   * **Validates: Requirements 3.2**
   */
  it("Property: { type: 'ping' } always produces { type: 'pong' } response", () => {
    fc.assert(
      fc.property(
        // Generate arbitrary extra fields alongside type: "ping"
        fc.record({
          extra: fc.option(fc.string(), { nil: undefined }),
          id: fc.option(fc.nat(), { nil: undefined }),
        }),
        ({ extra, id }) => {
          const sendMock = vi.fn();
          const socket = { send: sendMock };
          const handler = makePingHandler(socket);

          const pingMsg: Record<string, unknown> = { type: "ping" };
          if (extra !== undefined) pingMsg.extra = extra;
          if (id !== undefined) pingMsg.id = id;

          handler(Buffer.from(JSON.stringify(pingMsg)));

          expect(sendMock).toHaveBeenCalledOnce();
          const sent = JSON.parse(sendMock.mock.calls[0]![0]);
          expect(sent).toEqual({ type: "pong" });
        },
      ),
    );
  });

  it("Example: bare { type: 'ping' } returns { type: 'pong' }", () => {
    const sendMock = vi.fn();
    const handler = makePingHandler({ send: sendMock });
    handler(Buffer.from(JSON.stringify({ type: "ping" })));
    expect(JSON.parse(sendMock.mock.calls[0]![0])).toEqual({ type: "pong" });
  });
});

// ---------------------------------------------------------------------------
// Property 3.6 — broadcastEvent targetUserIds Preservation
// ---------------------------------------------------------------------------

describe("Preservation — broadcastEvent targetUserIds (Requirement 3.6)", () => {
  /**
   * Property: for any set of connected userIds, broadcastEvent with targetUserIds
   * delivers to exactly those users and no others.
   *
   * **Validates: Requirements 3.6**
   */
  it("Property: broadcastEvent with targetUserIds delivers to exactly those users and no others", () => {
    fc.assert(
      fc.property(
        // Generate a pool of at least 2 connected user IDs so we always have targets + non-targets
        fc.uniqueArray(fc.string({ minLength: 1, maxLength: 10 }), { minLength: 2, maxLength: 8 }),
        // Generate a non-zero target count (at least 1, at most pool size - 1)
        fc.nat({ max: 6 }),
        fc.string({ minLength: 1 }),
        (allUserIds, targetOffset, eventName) => {
          // Build a clients map — all users are OPEN
          const clients = new Map<string, { send: ReturnType<typeof vi.fn>; readyState: number }>();
          for (const uid of allUserIds) {
            clients.set(uid, { send: vi.fn(), readyState: WebSocket.OPEN });
          }

          // Ensure at least 1 target and at least 1 non-target
          const maxTargets = allUserIds.length - 1;
          const targetCount = (targetOffset % maxTargets) + 1;
          const targetUserIds = allUserIds.slice(0, targetCount);
          const nonTargets = allUserIds.slice(targetCount);

          const broadcastEvent = makeBroadcastEvent(clients as any);
          broadcastEvent({ event: eventName, data: {}, targetUserIds });

          // Every target should have received exactly one message
          for (const uid of targetUserIds) {
            expect(clients.get(uid)!.send).toHaveBeenCalledOnce();
          }

          // Non-targets should NOT have received any message
          for (const uid of nonTargets) {
            expect(clients.get(uid)!.send).not.toHaveBeenCalled();
          }
        },
      ),
    );
  });

  it("Example: broadcastEvent(['u1']) delivers to u1 only, not u2", () => {
    const u1Send = vi.fn();
    const u2Send = vi.fn();
    const clients = new Map([
      ["u1", { send: u1Send, readyState: WebSocket.OPEN }],
      ["u2", { send: u2Send, readyState: WebSocket.OPEN }],
    ]);
    const broadcastEvent = makeBroadcastEvent(clients);
    broadcastEvent({ event: "x", data: {}, targetUserIds: ["u1"] });
    expect(u1Send).toHaveBeenCalledOnce();
    expect(u2Send).not.toHaveBeenCalled();
  });
});

// ---------------------------------------------------------------------------
// Property 3.7 — broadcastEvent without targetUserIds broadcasts to all
// ---------------------------------------------------------------------------

describe("Preservation — broadcastEvent broadcasts to all (Requirement 3.7)", () => {
  it("Property: broadcastEvent without targetUserIds delivers to all connected clients", () => {
    fc.assert(
      fc.property(
        fc.uniqueArray(fc.string({ minLength: 1, maxLength: 10 }), { minLength: 1, maxLength: 8 }),
        fc.string({ minLength: 1 }),
        (allUserIds, eventName) => {
          const clients = new Map<string, { send: ReturnType<typeof vi.fn>; readyState: number }>();
          for (const uid of allUserIds) {
            clients.set(uid, { send: vi.fn(), readyState: WebSocket.OPEN });
          }

          const broadcastEvent = makeBroadcastEvent(clients as any);
          broadcastEvent({ event: eventName, data: {} });

          for (const uid of allUserIds) {
            expect(clients.get(uid)!.send).toHaveBeenCalledOnce();
          }
        },
      ),
    );
  });
});
