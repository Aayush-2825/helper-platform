import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

const mocks = vi.hoisted(() => {
  const getSession = vi.fn();
  const findFirst = vi.fn();
  const updateReturning = vi.fn();
  const updateWhere = vi.fn(() => ({ returning: updateReturning }));
  const updateSet = vi.fn(() => ({ where: updateWhere }));
  const update = vi.fn(() => ({ set: updateSet }));

  return {
    getSession,
    findFirst,
    update,
    updateReturning,
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
      payout: {
        findFirst: mocks.findFirst,
      },
    },
    update: mocks.update,
  },
}));

vi.mock("@/db/schema", () => ({
  payout: {
    id: "id",
    status: "status",
  },
}));

import { PATCH } from "../route";

describe("admin payout PATCH route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns unauthorized envelope for non-admin", async () => {
    mocks.getSession.mockResolvedValue(null);

    const request = new NextRequest("http://localhost/api/admin/payouts/p1", {
      method: "PATCH",
      headers: { "x-request-id": "req-auth" },
      body: JSON.stringify({ status: "processing" }),
    });

    const response = await PATCH(request, { params: Promise.resolve({ id: "p1" }) });
    const body = await response.json();

    expect(response.status).toBe(401);
    expect(response.headers.get("x-request-id")).toBe("req-auth");
    expect(body.ok).toBe(false);
    expect(body.error.code).toBe("AUTH_UNAUTHORIZED");
    expect(body.requestId).toBe("req-auth");
  });

  it("rejects paid transition without transfer reference", async () => {
    mocks.getSession.mockResolvedValue({ user: { id: "a1", role: "admin" } });
    mocks.findFirst.mockResolvedValue({
      id: "p1",
      status: "processing",
      providerTransferId: null,
      failedReason: null,
    });

    const request = new NextRequest("http://localhost/api/admin/payouts/p1", {
      method: "PATCH",
      headers: { "x-request-id": "req-transfer" },
      body: JSON.stringify({ status: "paid" }),
    });

    const response = await PATCH(request, { params: Promise.resolve({ id: "p1" }) });
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.ok).toBe(false);
    expect(body.error.code).toBe("TRANSFER_REFERENCE_REQUIRED");
    expect(mocks.update).not.toHaveBeenCalled();
  });

  it("returns success envelope for valid transition", async () => {
    mocks.getSession.mockResolvedValue({ user: { id: "a1", role: "admin" } });
    mocks.findFirst.mockResolvedValue({
      id: "p1",
      status: "pending",
      providerTransferId: null,
      failedReason: null,
    });
    mocks.updateReturning.mockResolvedValue([
      {
        id: "p1",
        status: "processing",
      },
    ]);

    const request = new NextRequest("http://localhost/api/admin/payouts/p1", {
      method: "PATCH",
      headers: { "x-request-id": "req-ok" },
      body: JSON.stringify({ status: "processing" }),
    });

    const response = await PATCH(request, { params: Promise.resolve({ id: "p1" }) });
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(response.headers.get("x-request-id")).toBe("req-ok");
    expect(body.ok).toBe(true);
    expect(body.message).toBe("Payout updated successfully.");
    expect(body.payout.status).toBe("processing");
  });
});
