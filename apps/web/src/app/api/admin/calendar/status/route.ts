import { NextResponse } from "next/server";
import { connection, NextRequest } from "next/server";
import { and, eq } from "drizzle-orm";
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

    // Check for service account configuration (preferred method)
    const hasServiceAccount = !!(
      (process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL && process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY) ||
      process.env.GOOGLE_SERVICE_ACCOUNT_JSON
    );

    // Check if current admin user has a Google OAuth account linked
    const adminGoogleAccount = await db.query.account.findFirst({
      where: and(eq(account.userId, session.user.id), eq(account.providerId, "google")),
    });

    const isConnected = !!adminGoogleAccount || hasServiceAccount;
    const hasRefreshToken = !!adminGoogleAccount?.refreshToken || hasServiceAccount;
    const hasCalendarScope =
      hasServiceAccount ||
      (adminGoogleAccount?.scope ? adminGoogleAccount.scope.includes("calendar") : true);

    const configured = hasServiceAccount || (isConnected && (hasRefreshToken || Boolean(adminGoogleAccount?.accessToken)));

    return NextResponse.json(
      {
        isConnected,
        hasCalendarScope,
        hasRefreshToken,
        hasServiceAccount,
        email: session.user.email,
        configured,
      },
      { headers: NO_STORE_HEADERS }
    );
  } catch (error) {
    if (!isPrerenderHangError(error)) {
      console.error("Calendar status error:", error);
    }
    return NextResponse.json({ message: "Internal server error" }, { status: 500, headers: NO_STORE_HEADERS });
  }
}
