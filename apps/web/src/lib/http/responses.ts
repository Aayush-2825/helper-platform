import { NextResponse } from "next/server";
import { NO_STORE_HEADERS } from "./cache";

type ApiErrorOptions = {
  requestId: string;
  message: string;
  code: string;
  status: number;
  details?: unknown;
};

type ApiSuccessOptions = {
  requestId: string;
  status?: number;
};

function withResponseHeaders(requestId: string) {
  return {
    ...NO_STORE_HEADERS,
    "X-Request-Id": requestId,
  };
}

export function getRequestId(headersValue?: Headers | null) {
  const existingRequestId = headersValue?.get("x-request-id")?.trim();
  return existingRequestId || crypto.randomUUID();
}

export function apiError(options: ApiErrorOptions) {
  const { requestId, message, code, status, details } = options;

  return NextResponse.json(
    {
      ok: false,
      message,
      error: {
        code,
        message,
        details: details ?? null,
      },
      requestId,
    },
    {
      status,
      headers: withResponseHeaders(requestId),
    },
  );
}

export function apiSuccess<T extends Record<string, unknown>>(
  data: T,
  options: ApiSuccessOptions,
) {
  const { requestId, status = 200 } = options;

  return NextResponse.json(
    {
      ok: true,
      ...data,
      requestId,
    },
    {
      status,
      headers: withResponseHeaders(requestId),
    },
  );
}

export function logApiError(
  scope: string,
  error: unknown,
  context: { requestId: string; [key: string]: unknown },
) {
  const { requestId, ...restContext } = context;

  console.error(`[${scope}]`, {
    requestId,
    ...restContext,
    error,
  });
}