import { timingSafeEqual } from "node:crypto";

import { auth } from "@/lib/auth/server";

function safeTimingEqual(left: string, right: string): boolean {
  const leftBuffer = Buffer.from(left, "utf8");
  const rightBuffer = Buffer.from(right, "utf8");

  if (leftBuffer.length !== rightBuffer.length) {
    return false;
  }

  return timingSafeEqual(leftBuffer, rightBuffer);
}

/**
 * Authorize privileged realtime ops ingress.
 *
 * Accept either:
 * - matching x-realtime-secret header when configured
 * - authenticated admin session
 */
export async function authorizeRealtimeOpsRequest(request: Request): Promise<boolean> {
  const configuredSecret = process.env.REALTIME_BROADCAST_SECRET?.trim();
  const providedSecret = request.headers.get("x-realtime-secret")?.trim();

  if (configuredSecret && providedSecret && safeTimingEqual(configuredSecret, providedSecret)) {
    return true;
  }

  const session = await auth.api.getSession({
    headers: new Headers(request.headers),
  });

  return session?.user?.role === "admin";
}

export function buildRealtimeForwardHeaders(): Record<string, string> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  const configuredSecret = process.env.REALTIME_BROADCAST_SECRET?.trim();
  if (configuredSecret) {
    headers["x-realtime-secret"] = configuredSecret;
  }

  return headers;
}