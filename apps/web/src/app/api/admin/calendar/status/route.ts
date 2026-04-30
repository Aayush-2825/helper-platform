import { NextResponse } from "next/server";
import { eq, and } from "drizzle-orm";
import { connection, NextRequest } from "next/server";
import { db } from "@/db";
import { account } from "@/db/schema";
import { auth } from "@/lib/auth/server";
import { NO_STORE_HEADERS } from "@/lib/http/cache";

function isPrerenderHangError(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "digest" in error &&
    (error as { digest?: string }).digest === "HANGING_PROMISE_REJECTION"
  );
}

export async function GET(request: NextRequest) {
  try {
    await connection();

    const session = await auth.api.getSession({ headers: request.headers });
    if (!session?.user || session.user.role !== "admin") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401, headers: NO_STORE_HEADERS });
    }

    const googleAccount = await db.query.account.findFirst({
      where: and(
        eq(account.userId, session.user.id),
        eq(account.providerId, "google")
      ),
      columns: {
        scope: true,
        refreshToken: true,
      }
    });

    const isConnected = !!googleAccount;
    const hasCalendarScope = googleAccount?.scope?.includes("https://www.googleapis.com/auth/calendar") ?? false;
    const hasRefreshToken = !!googleAccount?.refreshToken;

    return NextResponse.json({
      isConnected,
      hasCalendarScope,
      hasRefreshToken,
      email: session.user.email,
    }, { headers: NO_STORE_HEADERS });
  } catch (error) {
    if (!isPrerenderHangError(error)) {
      console.error("Calendar status error:", error);
    }
    return NextResponse.json({ message: "Internal server error" }, { status: 500, headers: NO_STORE_HEADERS });
  }
}
