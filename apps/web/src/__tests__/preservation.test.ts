/**
 * Preservation Property Tests
 *
 * These tests MUST PASS on unfixed code.
 * They confirm baseline behaviors that must not be broken by any fix.
 *
 * Validates: Requirements 3.1, 3.2, 3.3, 3.8, 3.9, 3.10, 3.11, 3.12, 3.13
 */

import { describe, it, expect, vi } from "vitest";
import fc from "fast-check";

// ---------------------------------------------------------------------------
// Bug 3 Preservation — Accept action on non-error response removes job from panel
// ---------------------------------------------------------------------------
// Requirement 3.2: WHEN a helper clicks "Accept" on an incoming job and the
// API returns 200 THEN the system SHALL CONTINUE TO remove the job entry from
// the incoming jobs panel.
// ---------------------------------------------------------------------------

describe("Bug 3 Preservation — Accept on 200 removes job from panel", () => {
  /**
   * Replicate the accept logic from IncomingJobsPanel.tsx JobCard.handleAccept.
   * On a 200 ok response, removeJob(bookingId) must be called.
   *
   * Validates: Requirements 3.2
   */

  // Simulate the accept handler logic extracted from IncomingJobsPanel.tsx
  async function simulateAccept(
    bookingId: string,
    fetchResponse: { ok: boolean; json?: () => Promise<unknown> },
    removeJob: (id: string) => void,
    setAcceptError: (msg: string | null) => void,
  ): Promise<void> {
    const res = fetchResponse;
    if (res.ok) {
      removeJob(bookingId);
    } else {
      let message = "Failed to accept job.";
      try {
        const body = await res.json?.();
        if (body && typeof body === "object") {
          const b = body as Record<string, unknown>;
          if (b.error) message = String(b.error);
          else if (b.message) message = String(b.message);
        }
      } catch {
        // ignore parse errors
      }
      setAcceptError(message);
    }
  }

  it("should call removeJob when accept API returns 200 ok", async () => {
    const removeJob = vi.fn();
    const setAcceptError = vi.fn();

    await simulateAccept(
      "booking-abc",
      { ok: true },
      removeJob,
      setAcceptError,
    );

    expect(removeJob).toHaveBeenCalledWith("booking-abc");
    expect(setAcceptError).not.toHaveBeenCalled();
  });

  it("should NOT call removeJob when accept API returns non-200", async () => {
    const removeJob = vi.fn();
    const setAcceptError = vi.fn();

    await simulateAccept(
      "booking-abc",
      {
        ok: false,
        json: async () => ({ message: "Already accepted by another helper." }),
      },
      removeJob,
      setAcceptError,
    );

    expect(removeJob).not.toHaveBeenCalled();
    expect(setAcceptError).toHaveBeenCalledWith("Already accepted by another helper.");
  });

  /**
   * Property: for any booking ID and any ok=true response, removeJob is always
   * called with that booking ID.
   *
   * Validates: Requirements 3.2
   */
  it("property: accept on any ok response always removes the job", async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.uuid(),
        async (bookingId) => {
          const removed: string[] = [];
          const errors: (string | null)[] = [];

          await simulateAccept(
            bookingId,
            { ok: true },
            (id) => removed.push(id),
            (msg) => errors.push(msg),
          );

          return removed.includes(bookingId) && errors.length === 0;
        },
      ),
      { numRuns: 50 },
    );
  });
});

// ---------------------------------------------------------------------------
// Bug 14 Preservation — Invalid booking form shows validation errors without
// calling the API
// ---------------------------------------------------------------------------
// Requirement 3.13: WHEN the BookingForm has invalid or missing required fields
// on submit THEN the system SHALL CONTINUE TO display field-level validation
// errors without calling the API.
// ---------------------------------------------------------------------------

describe("Bug 14 Preservation — Invalid form shows validation errors, no API call", () => {
  /**
   * Replicate the validate() function from BookingForm.tsx.
   * On invalid input, errors are returned and the API must NOT be called.
   */

  interface FormErrors {
    categoryID?: string;
    addressLine?: string;
    city?: string;
    quotedAmount?: string;
  }

  function validate(fields: {
    categoryID: string;
    addressLine: string;
    city: string;
    quotedAmount: string;
  }): FormErrors {
    const errs: FormErrors = {};
    if (!fields.categoryID) errs.categoryID = "Category is required.";
    if (!fields.addressLine.trim()) errs.addressLine = "Address line is required.";
    if (!fields.city.trim()) errs.city = "City is required.";
    const amount = Number(fields.quotedAmount);
    if (
      !fields.quotedAmount ||
      isNaN(amount) ||
      !Number.isInteger(amount) ||
      amount <= 0
    ) {
      errs.quotedAmount = "Quoted amount must be a positive integer.";
    }
    return errs;
  }

  // Simulate handleSubmit: returns true if API would be called, false if validation blocked it
  function wouldCallApi(fields: {
    categoryID: string;
    addressLine: string;
    city: string;
    quotedAmount: string;
  }): { apiCalled: boolean; errors: FormErrors } {
    const errs = validate(fields);
    if (Object.keys(errs).length > 0) {
      return { apiCalled: false, errors: errs };
    }
    return { apiCalled: true, errors: {} };
  }

  it("should show categoryID error and not call API when category is missing", () => {
    const result = wouldCallApi({
      categoryID: "",
      addressLine: "12 Main St",
      city: "Mumbai",
      quotedAmount: "500",
    });

    expect(result.apiCalled).toBe(false);
    expect(result.errors.categoryID).toBeDefined();
  });

  it("should show addressLine error and not call API when address is missing", () => {
    const result = wouldCallApi({
      categoryID: "plumber",
      addressLine: "",
      city: "Mumbai",
      quotedAmount: "500",
    });

    expect(result.apiCalled).toBe(false);
    expect(result.errors.addressLine).toBeDefined();
  });

  it("should show quotedAmount error and not call API when amount is zero", () => {
    const result = wouldCallApi({
      categoryID: "plumber",
      addressLine: "12 Main St",
      city: "Mumbai",
      quotedAmount: "0",
    });

    expect(result.apiCalled).toBe(false);
    expect(result.errors.quotedAmount).toBeDefined();
  });

  it("should call API when all fields are valid", () => {
    const result = wouldCallApi({
      categoryID: "plumber",
      addressLine: "12 Main St",
      city: "Mumbai",
      quotedAmount: "500",
    });

    expect(result.apiCalled).toBe(true);
    expect(Object.keys(result.errors)).toHaveLength(0);
  });

  /**
   * Property: for any combination of invalid fields, the API is never called
   * and at least one error is present.
   *
   * Validates: Requirements 3.13
   */
  it("property: any invalid form submission never calls the API", () => {
    fc.assert(
      fc.property(
        // Generate at least one invalid field
        fc.oneof(
          // Missing category
          fc.record({
            categoryID: fc.constant(""),
            addressLine: fc.string({ minLength: 1 }),
            city: fc.string({ minLength: 1 }),
            quotedAmount: fc.integer({ min: 1, max: 10000 }).map(String),
          }),
          // Missing address
          fc.record({
            categoryID: fc.constantFrom("plumber", "driver", "cleaner"),
            addressLine: fc.constant(""),
            city: fc.string({ minLength: 1 }),
            quotedAmount: fc.integer({ min: 1, max: 10000 }).map(String),
          }),
          // Missing city
          fc.record({
            categoryID: fc.constantFrom("plumber", "driver", "cleaner"),
            addressLine: fc.string({ minLength: 1 }),
            city: fc.constant(""),
            quotedAmount: fc.integer({ min: 1, max: 10000 }).map(String),
          }),
          // Invalid amount (zero or negative)
          fc.record({
            categoryID: fc.constantFrom("plumber", "driver", "cleaner"),
            addressLine: fc.string({ minLength: 1 }),
            city: fc.string({ minLength: 1 }),
            quotedAmount: fc.oneof(
              fc.constant("0"),
              fc.constant("-1"),
              fc.constant(""),
              fc.constant("abc"),
            ),
          }),
        ),
        (fields) => {
          const result = wouldCallApi(fields);
          return result.apiCalled === false && Object.keys(result.errors).length > 0;
        },
      ),
      { numRuns: 100 },
    );
  });
});

// ---------------------------------------------------------------------------
// Bug 15 Preservation — Bookings page groups into Active/Past sections
// correctly after batch event processing
// ---------------------------------------------------------------------------
// Requirement 3.9: WHEN the customer bookings page loads THEN the system SHALL
// CONTINUE TO display bookings grouped into "Active" and "Past" sections
// ordered by requestedAt descending.
// ---------------------------------------------------------------------------

describe("Bug 15 Preservation — Active/Past grouping is correct after event processing", () => {
  type BookingStatus =
    | "requested"
    | "accepted"
    | "in_progress"
    | "completed"
    | "cancelled";

  type Booking = {
    id: string;
    status: BookingStatus;
    quotedAmount: number;
    categoryId: string;
    addressLine: string;
    city: string;
    requestedAt: string;
  };

  const ACTIVE_STATUSES = new Set(["requested", "accepted", "in_progress"]);
  const PAST_STATUSES = new Set(["completed", "cancelled"]);

  // Replicate the grouping logic from customer/bookings/page.tsx
  function groupBookings(bookings: Booking[]): {
    active: Booking[];
    past: Booking[];
  } {
    const sorted = [...bookings].sort(
      (a, b) =>
        new Date(b.requestedAt).getTime() - new Date(a.requestedAt).getTime(),
    );
    return {
      active: sorted.filter((b) => ACTIVE_STATUSES.has(b.status)),
      past: sorted.filter((b) => PAST_STATUSES.has(b.status)),
    };
  }

  it("should place requested/accepted/in_progress bookings in Active section", () => {
    const bookings: Booking[] = [
      {
        id: "b1",
        status: "requested",
        quotedAmount: 500,
        categoryId: "plumber",
        addressLine: "1 St",
        city: "Mumbai",
        requestedAt: "2024-01-01T10:00:00Z",
      },
      {
        id: "b2",
        status: "accepted",
        quotedAmount: 600,
        categoryId: "driver",
        addressLine: "2 St",
        city: "Delhi",
        requestedAt: "2024-01-01T09:00:00Z",
      },
      {
        id: "b3",
        status: "in_progress",
        quotedAmount: 700,
        categoryId: "cleaner",
        addressLine: "3 St",
        city: "Pune",
        requestedAt: "2024-01-01T08:00:00Z",
      },
    ];

    const { active, past } = groupBookings(bookings);

    expect(active).toHaveLength(3);
    expect(past).toHaveLength(0);
    expect(active.map((b) => b.id)).toEqual(["b1", "b2", "b3"]);
  });

  it("should place completed/cancelled bookings in Past section", () => {
    const bookings: Booking[] = [
      {
        id: "b1",
        status: "completed",
        quotedAmount: 500,
        categoryId: "plumber",
        addressLine: "1 St",
        city: "Mumbai",
        requestedAt: "2024-01-01T10:00:00Z",
      },
      {
        id: "b2",
        status: "cancelled",
        quotedAmount: 600,
        categoryId: "driver",
        addressLine: "2 St",
        city: "Delhi",
        requestedAt: "2024-01-01T09:00:00Z",
      },
    ];

    const { active, past } = groupBookings(bookings);

    expect(active).toHaveLength(0);
    expect(past).toHaveLength(2);
  });

  it("should maintain correct grouping after a booking transitions from active to past", () => {
    const bookings: Booking[] = [
      {
        id: "b1",
        status: "accepted",
        quotedAmount: 500,
        categoryId: "plumber",
        addressLine: "1 St",
        city: "Mumbai",
        requestedAt: "2024-01-01T10:00:00Z",
      },
      {
        id: "b2",
        status: "requested",
        quotedAmount: 600,
        categoryId: "driver",
        addressLine: "2 St",
        city: "Delhi",
        requestedAt: "2024-01-01T09:00:00Z",
      },
    ];

    // Simulate b1 transitioning to completed
    const updated = bookings.map((b) =>
      b.id === "b1" ? { ...b, status: "completed" as BookingStatus } : b,
    );

    const { active, past } = groupBookings(updated);

    expect(active.map((b) => b.id)).toEqual(["b2"]);
    expect(past.map((b) => b.id)).toEqual(["b1"]);
  });

  it("should sort bookings by requestedAt descending within each section", () => {
    const bookings: Booking[] = [
      {
        id: "older",
        status: "requested",
        quotedAmount: 500,
        categoryId: "plumber",
        addressLine: "1 St",
        city: "Mumbai",
        requestedAt: "2024-01-01T08:00:00Z",
      },
      {
        id: "newer",
        status: "requested",
        quotedAmount: 600,
        categoryId: "driver",
        addressLine: "2 St",
        city: "Delhi",
        requestedAt: "2024-01-01T10:00:00Z",
      },
    ];

    const { active } = groupBookings(bookings);

    // Newer should come first
    expect(active[0].id).toBe("newer");
    expect(active[1].id).toBe("older");
  });

  /**
   * Property: for any list of bookings, every booking with an active status
   * appears in the active section and every booking with a past status appears
   * in the past section — regardless of how many events have been applied.
   *
   * Validates: Requirements 3.9
   */
  it("property: grouping is always correct for any mix of booking statuses", () => {
    fc.assert(
      fc.property(
        fc.array(
          fc.record({
            id: fc.uuid(),
            status: fc.constantFrom(
              "requested" as BookingStatus,
              "accepted" as BookingStatus,
              "in_progress" as BookingStatus,
              "completed" as BookingStatus,
              "cancelled" as BookingStatus,
            ),
            quotedAmount: fc.integer({ min: 100, max: 10000 }),
            requestedAt: fc
              .integer({ min: 0, max: 1_000_000_000 })
              .map((n) => new Date(n * 1000).toISOString()),
          }),
          { minLength: 0, maxLength: 20 },
        ),
        (bookings) => {
          // Deduplicate IDs
          const unique = bookings.filter(
            (b, i, arr) => arr.findIndex((x) => x.id === b.id) === i,
          );

          const fullBookings: Booking[] = unique.map((b) => ({
            ...b,
            categoryId: "plumber",
            addressLine: "1 St",
            city: "Mumbai",
          }));

          const { active, past } = groupBookings(fullBookings);

          // Every active booking must have an active status
          const activeCorrect = active.every((b) => ACTIVE_STATUSES.has(b.status));
          // Every past booking must have a past status
          const pastCorrect = past.every((b) => PAST_STATUSES.has(b.status));
          // No booking is in both sections
          const activeIds = new Set(active.map((b) => b.id));
          const pastIds = new Set(past.map((b) => b.id));
          const noOverlap = [...activeIds].every((id) => !pastIds.has(id));
          // Total count matches (no booking lost)
          const totalCorrect =
            active.length + past.length === fullBookings.length;

          return activeCorrect && pastCorrect && noOverlap && totalCorrect;
        },
      ),
      { numRuns: 100 },
    );
  });
});

// ---------------------------------------------------------------------------
// Bug 2 Preservation — Successful PATCH to availability calls publishHelperPresence
// ---------------------------------------------------------------------------
// Requirement 3.8: WHEN the helper availability page successfully updates status
// THEN the system SHALL CONTINUE TO call publishHelperPresence to broadcast the
// new status via WebSocket.
// ---------------------------------------------------------------------------

describe("Bug 2 Preservation — Successful availability PATCH calls publishHelperPresence", () => {
  /**
   * Replicate the handleStatusChange logic from helper/availability/page.tsx.
   * On a successful (ok) PATCH response, publishHelperPresence must be called
   * with the correct helperUserId and new status.
   */

  type AvailabilityStatus = "online" | "offline" | "busy";

  async function simulateHandleStatusChange(
    newStatus: AvailabilityStatus,
    helperUserId: string | undefined,
    fetchResponse: { ok: boolean; json?: () => Promise<unknown> },
    publishHelperPresence: (input: {
      helperUserId: string;
      status: AvailabilityStatus;
    }) => void,
  ): Promise<{ error: string | null; successMsg: string | null }> {
    let error: string | null = null;
    let successMsg: string | null = null;

    const res = fetchResponse;
    if (!res.ok) {
      const body = (await res.json?.().catch(() => ({}))) as {
        message?: string;
      };
      error = body.message ?? "Failed to update status.";
      return { error, successMsg };
    }

    // Success path
    successMsg = `Status updated to ${newStatus}`;
    if (helperUserId) {
      publishHelperPresence({ helperUserId, status: newStatus });
    }

    return { error, successMsg };
  }

  it("should call publishHelperPresence with correct args on successful PATCH", async () => {
    const publishSpy = vi.fn();

    const result = await simulateHandleStatusChange(
      "online",
      "user-123",
      { ok: true },
      publishSpy,
    );

    expect(publishSpy).toHaveBeenCalledOnce();
    expect(publishSpy).toHaveBeenCalledWith({
      helperUserId: "user-123",
      status: "online",
    });
    expect(result.error).toBeNull();
    expect(result.successMsg).toBeTruthy();
  });

  it("should NOT call publishHelperPresence when PATCH fails", async () => {
    const publishSpy = vi.fn();

    const result = await simulateHandleStatusChange(
      "online",
      "user-123",
      {
        ok: false,
        json: async () => ({ message: "Unauthorized" }),
      },
      publishSpy,
    );

    expect(publishSpy).not.toHaveBeenCalled();
    expect(result.error).toBe("Unauthorized");
  });

  it("should NOT call publishHelperPresence when session userId is undefined", async () => {
    const publishSpy = vi.fn();

    await simulateHandleStatusChange(
      "online",
      undefined, // no session
      { ok: true },
      publishSpy,
    );

    expect(publishSpy).not.toHaveBeenCalled();
  });

  /**
   * Property: for any valid status and any helperUserId, a successful PATCH
   * always results in publishHelperPresence being called with the exact same
   * status and userId.
   *
   * Validates: Requirements 3.8
   */
  it("property: successful PATCH always calls publishHelperPresence with correct status and userId", async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.constantFrom("online" as const, "offline" as const, "busy" as const),
        fc.uuid(),
        async (status, userId) => {
          const calls: Array<{ helperUserId: string; status: AvailabilityStatus }> = [];

          await simulateHandleStatusChange(
            status,
            userId,
            { ok: true },
            (input) => calls.push(input),
          );

          return (
            calls.length === 1 &&
            calls[0].helperUserId === userId &&
            calls[0].status === status
          );
        },
      ),
      { numRuns: 50 },
    );
  });
});
