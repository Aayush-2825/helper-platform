import { headers } from "next/headers";
import { NextResponse } from "next/server";

import { auth } from "@/lib/auth/server";
import { NO_STORE_HEADERS } from "@/lib/http/cache";
import { createWsAuthToken } from "@/lib/realtime/ws-auth";

export async function GET() {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
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
    console.error("Failed to issue websocket token:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500, headers: NO_STORE_HEADERS },
    );
  }
}
