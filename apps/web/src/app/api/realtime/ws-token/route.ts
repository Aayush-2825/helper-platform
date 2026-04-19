import { headers } from "next/headers";
import { NextResponse } from "next/server";

import { auth } from "@/lib/auth/server";
import { NO_STORE_HEADERS } from "@/lib/http/cache";
import { createWsAuthToken } from "@/lib/realtime/ws-auth";

function isPrerenderHeadersError(error: unknown): boolean {
  if (!error || typeof error !== "object") {
    return false;
  }

  const maybeError = error as { digest?: string; message?: string };
  return (
    maybeError.digest === "HANGING_PROMISE_REJECTION" ||
    maybeError.message?.includes("During prerendering") === true
  );
}

export async function GET() {
  try {
    // Snapshot headers immediately so downstream async code does not read from
    // Next's request-bound headers context after prerender has finished.
    const requestHeaders = new Headers(await headers());
    const session = await auth.api.getSession({ headers: requestHeaders });
    if (!session?.user?.id) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401, headers: NO_STORE_HEADERS },
      );
    }

    const { token, expiresAt } = createWsAuthToken(session.user.id);

    return NextResponse.json(
      { token, expiresAt },
      { status: 200, headers: NO_STORE_HEADERS },
    );
  } catch (error) {
    if (!isPrerenderHeadersError(error)) {
      console.error("Failed to issue websocket token:", error);
    }
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500, headers: NO_STORE_HEADERS },
    );
  }
}
