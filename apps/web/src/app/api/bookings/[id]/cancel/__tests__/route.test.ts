import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => {
  const getSession = vi.fn();
  const findFirst = vi.fn();
  const updateReturning = vi.fn();
  const updateWhere = vi.fn(() => ({ returning: updateReturning }));
  const updateSet = vi.fn(() => ({ where: updateWhere }));
  const update = vi.fn(() => ({ set: updateSet }));
  const insertValues = vi.fn();
  const insert = vi.fn(() => ({ values: insertValues }));
  const publishBookingEvent = vi.fn();

  return {
    getSession,
    findFirst,
    update,
    updateReturning,
    insert,
    insertValues,
    publishBookingEvent,
  };
});

vi.mock("next/headers", () => ({
  headers: vi.fn(async () => new Headers()),
}));

vi.mock("@/lib/auth/server", () => ({
  auth: {
    api: {
      getSession: mocks.getSession,
    },
  },
}));

vi.mock("@/db", () => ({
  db: {
    query: {
      booking: {
        findFirst: mocks.findFirst,
      },
    },
    update: mocks.update,
    insert: mocks.insert,
  },
}));

vi.mock("@/db/schema", () => ({
  booking: {
    id: "id",
  },
  bookingStatusEvent: {
    id: "id",
  },
}));

vi.mock("@/lib/realtime/client", () => ({
  publishBookingEvent: mocks.publishBookingEvent,
}));

import { POST } from "../route";

describe("booking cancel POST route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.insertValues.mockResolvedValue(undefined);
  });

  it("returns unauthorized envelope when user session is missing", async () => {
    mocks.getSession.mockResolvedValue(null);

    const request = new Request("http://localhost/api/bookings/b1/cancel", {
      method: "POST",
      headers: { "x-request-id": "req-unauth", "content-type": "application/json" },
      body: JSON.stringify({ reason: "Cannot proceed" }),
    });

    const response = await POST(request, { params: Promise.resolve({ id: "b1" }) });
    const body = await response.json();

    expect(response.status).toBe(401);
    expect(response.headers.get("x-request-id")).toBe("req-unauth");
    expect(body.error.code).toBe("AUTH_UNAUTHORIZED");
  });

  it("blocks cancellation after in_progress", async () => {
    mocks.getSession.mockResolvedValue({ user: { id: "c1", role: "customer" } });
    mocks.findFirst.mockResolvedValue({
      id: "b1",
      status: "in_progress",
      customerId: "c1",
      helperId: "h1",
    });

    const request = new Request("http://localhost/api/bookings/b1/cancel", {
      method: "POST",
      headers: { "x-request-id": "req-window", "content-type": "application/json" },
      body: JSON.stringify({ reason: "Need to stop" }),
    });

    const response = await POST(request, { params: Promise.resolve({ id: "b1" }) });
    const body = await response.json();

    expect(response.status).toBe(409);
    expect(body.error.code).toBe("BOOKING_CANCEL_WINDOW_CLOSED");
    expect(mocks.update).not.toHaveBeenCalled();
  });

  it("cancels booking and publishes realtime event", async () => {
    mocks.getSession.mockResolvedValue({ user: { id: "c1", role: "customer" } });
    mocks.findFirst.mockResolvedValue({
      id: "b1",
      status: "requested",
      customerId: "c1",
      helperId: "h1",
    });
    mocks.updateReturning.mockResolvedValue([
      {
        id: "b1",
        status: "cancelled",
      },
    ]);

    const request = new Request("http://localhost/api/bookings/b1/cancel", {
      method: "POST",
      headers: { "x-request-id": "req-ok", "content-type": "application/json" },
      body: JSON.stringify({ reason: "No longer needed" }),
    });

    const response = await POST(request, { params: Promise.resolve({ id: "b1" }) });
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.ok).toBe(true);
    expect(body.message).toBe("Booking cancelled successfully.");
    expect(mocks.insert).toHaveBeenCalledTimes(1);
    expect(mocks.publishBookingEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        bookingId: "b1",
        customerId: "c1",
        helperId: "h1",
        eventType: "cancelled",
      }),
    );
  });
});
