import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { eq, and } from "drizzle-orm";
import { db } from "@/db";
import { account } from "@/db/schema";
import { auth } from "@/lib/auth/server";
import { NO_STORE_HEADERS } from "@/lib/http/cache";

export async function GET() {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
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
    console.error("Calendar status error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500, headers: NO_STORE_HEADERS });
  }
}
