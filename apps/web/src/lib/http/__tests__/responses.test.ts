import { describe, expect, it } from "vitest";
import { apiError, apiSuccess, getRequestId } from "../responses";

describe("http response helpers", () => {
  it("uses incoming x-request-id when present", () => {
    const requestId = getRequestId(new Headers({ "x-request-id": "trace-123" }));
    expect(requestId).toBe("trace-123");
  });

  it("generates request id when header is missing", () => {
    const requestId = getRequestId(new Headers());
    expect(requestId).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
    );
  });

  it("returns consistent success envelope with request id", async () => {
    const response = apiSuccess(
      {
        message: "ok",
        resource: { id: "1" },
      },
      {
        requestId: "req-1",
        status: 201,
      },
    );

    expect(response.status).toBe(201);
    expect(response.headers.get("x-request-id")).toBe("req-1");

    const body = await response.json();
    expect(body).toEqual({
      ok: true,
      message: "ok",
      resource: { id: "1" },
      requestId: "req-1",
    });
  });

  it("returns consistent error envelope with code and details", async () => {
    const response = apiError({
      requestId: "req-2",
      message: "invalid payload",
      code: "INVALID_PAYLOAD",
      status: 400,
      details: { field: "amount" },
    });

    expect(response.status).toBe(400);
    expect(response.headers.get("x-request-id")).toBe("req-2");

    const body = await response.json();
    expect(body).toEqual({
      ok: false,
      message: "invalid payload",
      error: {
        code: "INVALID_PAYLOAD",
        message: "invalid payload",
        details: { field: "amount" },
      },
      requestId: "req-2",
    });
  });
});