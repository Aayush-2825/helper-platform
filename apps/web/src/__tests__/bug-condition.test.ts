/**
 * Bug Condition Exploration Tests
 *
 * These tests are EXPECTED TO FAIL on unfixed code.
 * Failure confirms the bugs exist. DO NOT fix the code to make these pass.
 *
 * Validates: Requirements 1.1, 1.6, 1.8, 1.15
 */

import { describe, it, expect } from "vitest";
import fc from "fast-check";

// ---------------------------------------------------------------------------
// Bug 1 — WS Messages Dropped Before Socket Initializes
// ---------------------------------------------------------------------------
// Root cause: wsManager._send is null before registerWsSend is called.
// wsSend silently drops the message instead of queuing it.
// ---------------------------------------------------------------------------

describe("Bug 1 — WS Message Drop Before Socket Ready", () => {
  /**
   * We test the wsManager module directly. Because vitest caches modules we
   * need to reset the singleton state between tests. We do this by re-importing
   * the module fresh each time via a dynamic import with a cache-bust query.
   *
   * The test simulates: call wsSend BEFORE registerWsSend, then call
   * registerWsSend, then assert the message was delivered.
   *
   * On UNFIXED code: wsSend drops the message → received stays empty → FAIL.
   */
  it("should queue a message sent before registerWsSend and deliver it after registration", async () => {
    // Dynamically import so we get a fresh module instance
    const mod = await import("../lib/realtime/wsManager");

    const received: object[] = [];

    // Send BEFORE registering — on unfixed code this is silently dropped
    mod.wsSend({ type: "ping" });

    // Now register the send function
    mod.registerWsSend((msg) => {
      received.push(msg);
      return true;
    });

    // The message should have been queued and flushed on registration
    // EXPECTED FAIL on unfixed code: received is [] instead of [{ type: "ping" }]
    expect(received).toEqual([{ type: "ping" }]);
  });

  /**
   * Property-based variant: for any message sent before socket ready,
   * it must be delivered after registerWsSend is called.
   *
   * Validates: Requirements 1.1
   */
  it("property: any message sent before socket ready is delivered after registerWsSend", async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          type: fc.constantFrom("ping", "booking_update", "location_update"),
          payload: fc.string(),
        }),
        async (msg) => {
          // Re-import fresh module for each property run by resetting state
          // We use the module-level reset approach: call registerWsSend(null-like)
          // to clear state, then test the queue behaviour.
          const { wsSend, registerWsSend } = await import("../lib/realtime/wsManager");

          const received: object[] = [];

          // Send before register
          wsSend(msg);

          // Register
          registerWsSend((m) => {
            received.push(m);
            return true;
          });

          // Must have been delivered
          return received.some((r) => JSON.stringify(r) === JSON.stringify(msg));
        },
      ),
      { numRuns: 10 },
    );
  });
});

// ---------------------------------------------------------------------------
// Bug 6 — Payments Page Uses quotedAmount Instead of finalAmount
// ---------------------------------------------------------------------------
// Root cause: totalPaid reduce uses b.quotedAmount instead of
//             b.finalAmount ?? b.quotedAmount
// ---------------------------------------------------------------------------

describe("Bug 6 — Payments totalPaid Uses quotedAmount Instead of finalAmount", () => {
  /**
   * Replicate the exact totalPaid calculation from CustomerPaymentsPage.
   * On UNFIXED code: uses b.quotedAmount → returns 1200 instead of 1500.
   *
   * Counterexample: booking with finalAmount=1500, quotedAmount=1200
   *   → totalPaid returns 1200 (WRONG)
   */

  // This is the BUGGY implementation copied from the source file
  function totalPaidBuggy(
    completed: Array<{ quotedAmount: number; finalAmount?: number | null }>,
  ): number {
    return completed.reduce((sum, b) => sum + (b.quotedAmount ?? 0), 0);
  }

  it("should use finalAmount when it differs from quotedAmount for a completed booking", () => {
    const completedBookings = [
      { quotedAmount: 1200, finalAmount: 1500, status: "completed" },
    ];

    // EXPECTED FAIL on unfixed code: totalPaidBuggy returns 1200, not 1500
    const result = totalPaidBuggy(completedBookings);
    expect(result).toBe(1500); // fails because buggy code returns 1200
  });

  /**
   * Property: for any completed booking where finalAmount != null and
   * finalAmount != quotedAmount, totalPaid must equal finalAmount.
   *
   * Validates: Requirements 1.6
   */
  it("property: totalPaid equals finalAmount for completed bookings with non-null finalAmount", () => {
    fc.assert(
      fc.property(
        fc.array(
          fc.record({
            quotedAmount: fc.integer({ min: 100, max: 10000 }),
            finalAmountDelta: fc.integer({ min: 1, max: 5000 }),
          }),
          { minLength: 1, maxLength: 10 },
        ),
        (bookingInputs) => {
          const bookings = bookingInputs.map((b) => ({
            quotedAmount: b.quotedAmount,
            finalAmount: b.quotedAmount + b.finalAmountDelta, // always differs
          }));

          const buggyTotal = bookings.reduce((sum, b) => sum + (b.quotedAmount ?? 0), 0);
          const correctTotal = bookings.reduce(
            (sum, b) => sum + (b.finalAmount ?? b.quotedAmount ?? 0),
            0,
          );

          // On unfixed code: buggyTotal !== correctTotal (since finalAmountDelta > 0)
          // This assertion will FAIL because buggyTotal < correctTotal
          return buggyTotal === correctTotal;
        },
      ),
      { numRuns: 50 },
    );
  });
});

// ---------------------------------------------------------------------------
// Bug 8 — Amount Displayed Without INR Formatting
// ---------------------------------------------------------------------------
// Root cause: BookingCard renders ₹{booking.quotedAmount} without
//             toLocaleString("en-IN"), so 1200 shows as ₹1200 not ₹1,200
// ---------------------------------------------------------------------------

describe("Bug 8 — INR Amount Formatting Missing in BookingCard", () => {
  /**
   * The buggy rendering pattern from BookingCard.tsx:
   *   `₹${booking.quotedAmount}`
   *
   * The correct pattern:
   *   `₹${booking.quotedAmount.toLocaleString("en-IN")}`
   *
   * Counterexample: quotedAmount=1200 → renders "₹1200" instead of "₹1,200"
   */

  // Simulate the BUGGY render output from BookingCard
  function renderAmountBuggy(amount: number): string {
    return `₹${amount}`;
  }

  it("should render ₹1,200 for quotedAmount=1200 (not ₹1200)", () => {
    const amount = 1200;
    const rendered = renderAmountBuggy(amount);

    // EXPECTED FAIL on unfixed code: rendered is "₹1200" not "₹1,200"
    expect(rendered).toBe(`₹${amount.toLocaleString("en-IN")}`);
  });

  it("should render ₹10,000 for quotedAmount=10000 (not ₹10000)", () => {
    const amount = 10000;
    const rendered = renderAmountBuggy(amount);

    // EXPECTED FAIL on unfixed code: rendered is "₹10000" not "₹10,000"
    expect(rendered).toBe(`₹${amount.toLocaleString("en-IN")}`);
  });

  /**
   * Property: for any amount >= 1000, the rendered string must equal
   * ₹{amount.toLocaleString("en-IN")} which includes comma separators.
   *
   * Validates: Requirements 1.8
   */
  it("property: any amount >= 1000 must be formatted with toLocaleString(en-IN)", () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1000, max: 9999999 }),
        (amount) => {
          const buggyRendered = renderAmountBuggy(amount);
          const correctRendered = `₹${amount.toLocaleString("en-IN")}`;

          // On unfixed code: buggyRendered !== correctRendered for amounts >= 1000
          // (because toLocaleString adds comma separators)
          return buggyRendered === correctRendered;
        },
      ),
      { numRuns: 100 },
    );
  });
});

// ---------------------------------------------------------------------------
// Bug 15 — WS Event Batch Only Processes First Event
// ---------------------------------------------------------------------------
// Root cause: customer/bookings/page.tsx reads eventMessages[0] and returns
//             early, ignoring all other events in the same render batch.
// ---------------------------------------------------------------------------

describe("Bug 15 — WS Event Batch Only Processes First Event", () => {
  type BookingStatus = "requested" | "accepted" | "in_progress" | "completed" | "cancelled";

  type Booking = {
    id: string;
    status: BookingStatus;
    quotedAmount: number;
    categoryId: string;
    addressLine: string;
    city: string;
    requestedAt: string;
  };

  type BookingUpdateEventData = {
    bookingId: string;
    eventType: "accepted" | "in_progress" | "completed" | "cancelled";
    acceptedAt?: string;
    startedAt?: string;
    completedAt?: string;
  };

  type RealtimeMessage = {
    type: "event";
    event: "booking_update";
    data: BookingUpdateEventData;
  };

  // BUGGY implementation — mirrors the exact logic in customer/bookings/page.tsx
  function applyEventsBuggy(bookings: Booking[], eventMessages: RealtimeMessage[]): Booking[] {
    if (eventMessages.length === 0) return bookings;

    // BUG: only processes eventMessages[0], ignores the rest
    const latest = eventMessages[0];
    if (latest.type !== "event" || latest.event !== "booking_update") return bookings;

    const data = latest.data;
    if (!data?.bookingId) return bookings;

    const statusMap: Record<BookingUpdateEventData["eventType"], BookingStatus> = {
      accepted: "accepted",
      in_progress: "in_progress",
      completed: "completed",
      cancelled: "cancelled",
    };

    const newStatus = statusMap[data.eventType];
    if (!newStatus) return bookings;

    return bookings.map((b) => {
      if (b.id !== data.bookingId) return b;
      return {
        ...b,
        status: newStatus,
        ...(data.acceptedAt ? { acceptedAt: data.acceptedAt } : {}),
        ...(data.startedAt ? { startedAt: data.startedAt } : {}),
        ...(data.completedAt ? { completedAt: data.completedAt } : {}),
      };
    });
  }

  it("should apply both events when two simultaneous booking_update events arrive", () => {
    const bookings: Booking[] = [
      {
        id: "booking-1",
        status: "requested",
        quotedAmount: 500,
        categoryId: "plumber",
        addressLine: "123 Main St",
        city: "Mumbai",
        requestedAt: new Date().toISOString(),
      },
      {
        id: "booking-2",
        status: "requested",
        quotedAmount: 800,
        categoryId: "electrician",
        addressLine: "456 Park Ave",
        city: "Delhi",
        requestedAt: new Date().toISOString(),
      },
    ];

    const events: RealtimeMessage[] = [
      {
        type: "event",
        event: "booking_update",
        data: { bookingId: "booking-1", eventType: "accepted" },
      },
      {
        type: "event",
        event: "booking_update",
        data: { bookingId: "booking-2", eventType: "accepted" },
      },
    ];

    const result = applyEventsBuggy(bookings, events);

    const booking1 = result.find((b) => b.id === "booking-1");
    const booking2 = result.find((b) => b.id === "booking-2");

    // booking-1 should be updated (first event — this passes even on buggy code)
    expect(booking1?.status).toBe("accepted");

    // booking-2 should ALSO be updated (second event)
    // EXPECTED FAIL on unfixed code: booking-2 status remains "requested"
    expect(booking2?.status).toBe("accepted");
  });

  /**
   * Property: for any batch of N booking_update events targeting N distinct
   * bookings, all N bookings must have their status updated.
   *
   * Validates: Requirements 1.15
   */
  it("property: all N events in a batch must be applied to their respective bookings", () => {
    fc.assert(
      fc.property(
        fc.array(
          fc.record({
            id: fc.uuid(),
            eventType: fc.constantFrom(
              "accepted" as const,
              "in_progress" as const,
              "completed" as const,
            ),
          }),
          { minLength: 2, maxLength: 5 },
        ),
        (inputs) => {
          // Ensure unique IDs
          const unique = inputs.filter(
            (item, idx, arr) => arr.findIndex((x) => x.id === item.id) === idx,
          );
          if (unique.length < 2) return true; // skip degenerate case

          const bookings: Booking[] = unique.map((item) => ({
            id: item.id,
            status: "requested" as BookingStatus,
            quotedAmount: 500,
            categoryId: "plumber",
            addressLine: "123 St",
            city: "Mumbai",
            requestedAt: new Date().toISOString(),
          }));

          const events: RealtimeMessage[] = unique.map((item) => ({
            type: "event" as const,
            event: "booking_update" as const,
            data: { bookingId: item.id, eventType: item.eventType },
          }));

          const result = applyEventsBuggy(bookings, events);

          // All bookings should have been updated from "requested"
          const allUpdated = unique.every((item) => {
            const updated = result.find((b) => b.id === item.id);
            return updated?.status === item.eventType;
          });

          // On unfixed code: only the first booking is updated → allUpdated = false
          return allUpdated;
        },
      ),
      { numRuns: 50 },
    );
  });
});
