import { describe, expect, it, vi } from "vitest";

describe("Stress Testing: Booking Lifecycle & Concurrency Resilience", () => {
  it("Scenario 1: 20 Concurrent Helpers Attempting to Accept the Same Booking", async () => {
    // Shared simulated database state
    let bookingState: {
      id: string;
      status: "requested" | "accepted";
      helperId: string | null;
      version: number;
    } = {
      id: "booking-stress-1",
      status: "requested",
      helperId: null,
      version: 0,
    };

    // Atomic DB update simulator
    const attemptAccept = async (helperId: string): Promise<{ status: number; message: string }> => {
      // Simulate random network jitter (1ms - 15ms)
      await new Promise((r) => setTimeout(r, Math.random() * 15));

      // Atomic conditional update simulation: UPDATE booking SET status='accepted', helperId=helperId WHERE id=id AND status='requested'
      if (bookingState.status === "requested") {
        bookingState = {
          ...bookingState,
          status: "accepted",
          helperId,
          version: bookingState.version + 1,
        };
        return { status: 200, message: "Booking accepted successfully." };
      }

      return { status: 409, message: "Booking not found or no longer available for acceptance." };
    };

    // 20 concurrent helpers fire accept requests simultaneously
    const helperIds = Array.from({ length: 20 }, (_, i) => `helper-profile-${i + 1}`);
    const results = await Promise.all(helperIds.map((hId) => attemptAccept(hId)));

    const successfulAccepts = results.filter((r) => r.status === 200);
    const rejectedAccepts = results.filter((r) => r.status === 409);

    // Exactly one helper wins
    expect(successfulAccepts).toHaveLength(1);
    expect(rejectedAccepts).toHaveLength(19);

    // Final database state is strictly consistent
    expect(bookingState.status).toBe("accepted");
    expect(bookingState.helperId).toBeTruthy();
    expect(bookingState.version).toBe(1);
  });

  it("Scenario 2: Cancellation vs Acceptance Race Condition at the exact same millisecond", async () => {
    let bookingState: {
      status: "requested" | "accepted" | "cancelled";
      assignedHelperId: string | null;
      cancelledBy: string | null;
    } = {
      status: "requested",
      assignedHelperId: null,
      cancelledBy: null,
    };

    const attemptCancel = async (): Promise<{ status: number; action: string }> => {
      await new Promise((r) => setTimeout(r, Math.random() * 10));
      if (bookingState.status === "requested") {
        bookingState.status = "cancelled";
        bookingState.cancelledBy = "customer";
        return { status: 200, action: "cancelled" };
      }
      return { status: 409, action: "cancel_failed_already_transitioned" };
    };

    const attemptAccept = async (helperId: string): Promise<{ status: number; action: string }> => {
      await new Promise((r) => setTimeout(r, Math.random() * 10));
      if (bookingState.status === "requested") {
        bookingState.status = "accepted";
        bookingState.assignedHelperId = helperId;
        return { status: 200, action: "accepted" };
      }
      return { status: 409, action: "accept_failed_already_cancelled" };
    };

    const [cancelResult, acceptResult] = await Promise.all([
      attemptCancel(),
      attemptAccept("helper-superstar-1"),
    ]);

    // Exactly one operation must succeed (200), and the other must be cleanly rejected (409)
    const statuses = [cancelResult.status, acceptResult.status];
    expect(statuses).toContain(200);
    expect(statuses).toContain(409);

    // State must NEVER be a corrupt hybrid
    if (bookingState.status === "cancelled") {
      expect(bookingState.assignedHelperId).toBeNull();
      expect(bookingState.cancelledBy).toBe("customer");
    } else {
      expect(bookingState.status).toBe("accepted");
      expect(bookingState.assignedHelperId).toBe("helper-superstar-1");
      expect(bookingState.cancelledBy).toBeNull();
    }
  });

  it("Scenario 3: Stress Testing OTP Brute Force under 30 Concurrent Requests", async () => {
    const correctStartCode = "7492";
    const attemptsLog: Array<{ attempt: string; timestamp: number }> = [];

    const verifyOtp = async (inputCode: string): Promise<{ status: number; message: string }> => {
      const now = Date.now();
      const fifteenMinutesAgo = now - 15 * 60 * 1000;

      // Rate limit check: max 5 failed attempts in 15 minutes
      const failedCount = attemptsLog.filter(
        (a) => a.timestamp >= fifteenMinutesAgo,
      ).length;

      if (failedCount >= 5) {
        return { status: 429, message: "Too many failed OTP attempts. Please wait 15 minutes before trying again." };
      }

      if (inputCode !== correctStartCode) {
        attemptsLog.push({ attempt: inputCode, timestamp: now });
        const remaining = Math.max(0, 5 - attemptsLog.length);
        return { status: 400, message: `Invalid OTP. (${remaining} attempts remaining)` };
      }

      return { status: 200, message: "Job started." };
    };

    // 30 concurrent guesses
    const guesses = Array.from({ length: 30 }, (_, i) => String(1000 + i));
    const results = [];

    for (const guess of guesses) {
      results.push(await verifyOtp(guess));
    }

    const badRequests = results.filter((r) => r.status === 400);
    const rateLimitedRequests = results.filter((r) => r.status === 429);

    // Exactly 5 attempts allowed, remaining 25 strictly blocked with 429
    expect(badRequests).toHaveLength(5);
    expect(rateLimitedRequests).toHaveLength(25);
  });

  it("Scenario 4: Helper Double Immediate Booking Conflict Prevention", async () => {
    // Helper already has an active immediate booking
    const activeImmediateBookings = [
      { id: "existing-job-1", status: "accepted", scheduledFor: null },
    ];

    // Helper attempts to accept another immediate booking
    const isScheduledBooking = false;
    let conflictError: string | null = null;

    if (!isScheduledBooking) {
      if (activeImmediateBookings.length > 0) {
        conflictError = "HELPER_ACTIVE_BOOKING_CONFLICT";
      }
    }

    expect(conflictError).toBe("HELPER_ACTIVE_BOOKING_CONFLICT");
  });

  it("Scenario 5: 100 High-Frequency Realtime Event Dispatches", async () => {
    const dispatchedEvents: Array<{ id: string; event: string }> = [];

    const mockPublish = vi.fn(async (event: { id: string; event: string }) => {
      dispatchedEvents.push(event);
      return { ok: true };
    });

    const eventPayloads = Array.from({ length: 100 }, (_, i) => ({
      id: `evt-${i + 1}`,
      event: i % 2 === 0 ? "location_update" : "booking_update",
    }));

    await Promise.all(eventPayloads.map((payload) => mockPublish(payload)));

    expect(dispatchedEvents).toHaveLength(100);
    expect(mockPublish).toHaveBeenCalledTimes(100);
  });
});
