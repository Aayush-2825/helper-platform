import { NextResponse } from "next/server";
import { z } from "zod";

/**
 * Standardized API Error for consistent response shapes
 */
export class ApiError extends Error {
  constructor(
    public message: string,
    public statusCode: number = 400,
    public code?: string
  ) {
    super(message);
    this.name = "ApiError";
  }

  static badRequest(message: string, code = "BAD_REQUEST") {
    return new ApiError(message, 400, code);
  }

  static unauthorized(message = "Unauthorized", code = "UNAUTHORIZED") {
    return new ApiError(message, 401, code);
  }

  static forbidden(message = "Forbidden", code = "FORBIDDEN") {
    return new ApiError(message, 403, code);
  }

  static notFound(message = "Resource not found", code = "NOT_FOUND") {
    return new ApiError(message, 404, code);
  }

  static internal(message = "Internal server error", code = "INTERNAL_ERROR") {
    return new ApiError(message, 500, code);
  }
}

/**
 * Standard headers for API responses that should not be cached
 */
export const NO_CACHE_HEADERS = {
  "Cache-Control": "no-store, max-age=0",
};

/**
 * Utility to catch errors and return consistent JSON responses
 */
export async function handleApiError(error: unknown) {
  if (error instanceof ApiError) {
    return NextResponse.json(
      {
        success: false,
        error: error.message,
        code: error.code,
      },
      { status: error.statusCode, headers: NO_CACHE_HEADERS }
    );
  }

  if (error instanceof z.ZodError) {
    return NextResponse.json(
      {
        success: false,
        error: "Validation failed",
        code: "VALIDATION_ERROR",
        details: error.flatten().fieldErrors,
      },
      { status: 400, headers: NO_CACHE_HEADERS }
    );
  }

  console.error("[API_ERROR]", error);

  return NextResponse.json(
    {
      success: false,
      error: "An unexpected error occurred",
      code: "INTERNAL_SERVER_ERROR",
    },
    { status: 500, headers: NO_CACHE_HEADERS }
  );
}
