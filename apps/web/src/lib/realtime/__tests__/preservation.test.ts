/**
 * Preservation Property Tests — Property 3 (Client Side)
 *
 * These tests MUST PASS on unfixed code — they establish the baseline behavior
 * that must be preserved after the fix is applied.
 *
 * Observation: createIncomingJob, createRealtimeSubscription, and
 * unsubscribeRealtimeSubscription all use postJson (fetch/HTTP) on unfixed code.
 * wsSend is never called for these functions.
 *
 * Validates: Requirements 3.1, 3.3, 3.4, 3.5, 3.6, 3.7
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import * as fc from "fast-check";

// Mock wsManager so we can assert wsSend is never called.
// The stub already exists at ../wsManager — this mock overrides it for tests.
vi.mock("../wsManager", () => ({
  wsSend: vi.fn(),
  registerWsSend: vi.fn(),
}));

import {
  createIncomingJob,
  createRealtimeSubscription,
  unsubscribeRealtimeSubscription,
  type RealtimeOpEventType,
} from "../client";
import * as wsManager from "../wsManager";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const EVENT_TYPES: RealtimeOpEventType[] = [
  "booking_request",
  "booking_update",
  "helper_presence",
  "location_update",
  "message",
  "notification",
  "payment_update",
];

const fcEventType = fc.constantFrom(...EVENT_TYPES);

// ---------------------------------------------------------------------------
// Setup
// ---------------------------------------------------------------------------

beforeEach(() => {
  vi.clearAllMocks();
  // Provide a fetch stub that resolves successfully
  vi.stubGlobal(
    "fetch",
    vi.fn().mockResolvedValue({ ok: true, status: 200 } as Response),
  );
});

// ---------------------------------------------------------------------------
// Property: non-publish functions always use fetch (HTTP), never wsSend
// ---------------------------------------------------------------------------

describe("Preservation — Non-Publish Functions Use HTTP (Requirements 3.4)", () => {
  /**
   * Property: for any createIncomingJob call, fetch is always called and
   * wsSend is never called.
   *
   * **Validates: Requirements 3.4**
   */
  it("Property: createIncomingJob always calls fetch and never calls wsSend", async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          bookingId: fc.string({ minLength: 1, maxLength: 20 }),
          helperId: fc.string({ minLength: 1, maxLength: 20 }),
          status: fc.option(
            fc.constantFrom("pending", "accepted", "rejected", "timeout") as fc.Arbitrary<
              "pending" | "accepted" | "rejected" | "timeout"
            >,
            { nil: undefined },
          ),
        }),
        async (input) => {
          vi.clearAllMocks();
          vi.stubGlobal(
            "fetch",
            vi.fn().mockResolvedValue({ ok: true, status: 200 } as Response),
          );

          await createIncomingJob(input);

          expect(fetch).toHaveBeenCalledOnce();
          expect(vi.mocked(wsManager.wsSend)).not.toHaveBeenCalled();
        },
      ),
    );
  });

  /**
   * Property: for any createRealtimeSubscription call, fetch is always called
   * and wsSend is never called.
   *
   * **Validates: Requirements 3.4**
   */
  it("Property: createRealtimeSubscription always calls fetch and never calls wsSend", async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          userId: fc.string({ minLength: 1, maxLength: 20 }),
          connectionId: fc.string({ minLength: 1, maxLength: 20 }),
          eventType: fcEventType,
          resourceId: fc.option(fc.string({ minLength: 1, maxLength: 20 }), { nil: undefined }),
        }),
        async (input) => {
          vi.clearAllMocks();
          vi.stubGlobal(
            "fetch",
            vi.fn().mockResolvedValue({ ok: true, status: 200 } as Response),
          );

          await createRealtimeSubscription(input);

          expect(fetch).toHaveBeenCalledOnce();
          expect(vi.mocked(wsManager.wsSend)).not.toHaveBeenCalled();
        },
      ),
    );
  });

  /**
   * Property: for any unsubscribeRealtimeSubscription call, fetch is always
   * called and wsSend is never called.
   *
   * **Validates: Requirements 3.4**
   */
  it("Property: unsubscribeRealtimeSubscription always calls fetch and never calls wsSend", async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          connectionId: fc.string({ minLength: 1, maxLength: 20 }),
          eventType: fcEventType,
          resourceId: fc.option(fc.string({ minLength: 1, maxLength: 20 }), { nil: undefined }),
        }),
        async (input) => {
          vi.clearAllMocks();
          vi.stubGlobal(
            "fetch",
            vi.fn().mockResolvedValue({ ok: true, status: 200 } as Response),
          );

          await unsubscribeRealtimeSubscription(input);

          expect(fetch).toHaveBeenCalledOnce();
          expect(vi.mocked(wsManager.wsSend)).not.toHaveBeenCalled();
        },
      ),
    );
  });

  // -------------------------------------------------------------------------
  // Concrete examples
  // -------------------------------------------------------------------------

  it("Example: createIncomingJob calls fetch with correct path", async () => {
    await createIncomingJob({ bookingId: "b1", helperId: "h1" });
    expect(fetch).toHaveBeenCalledOnce();
    const [url] = (fetch as ReturnType<typeof vi.fn>).mock.calls[0];
    expect(url).toContain("/api/realtime/ops/incoming-jobs");
    expect(vi.mocked(wsManager.wsSend)).not.toHaveBeenCalled();
  });

  it("Example: createRealtimeSubscription calls fetch with correct path", async () => {
    await createRealtimeSubscription({
      userId: "u1",
      connectionId: "c1",
      eventType: "booking_request",
    });
    expect(fetch).toHaveBeenCalledOnce();
    const [url] = (fetch as ReturnType<typeof vi.fn>).mock.calls[0];
    expect(url).toContain("/api/realtime/ops/subscriptions");
    expect(vi.mocked(wsManager.wsSend)).not.toHaveBeenCalled();
  });

  it("Example: unsubscribeRealtimeSubscription calls fetch with correct path", async () => {
    await unsubscribeRealtimeSubscription({
      connectionId: "c1",
      eventType: "booking_request",
    });
    expect(fetch).toHaveBeenCalledOnce();
    const [url] = (fetch as ReturnType<typeof vi.fn>).mock.calls[0];
    expect(url).toContain("/api/realtime/ops/subscriptions/unsubscribe");
    expect(vi.mocked(wsManager.wsSend)).not.toHaveBeenCalled();
  });
});
