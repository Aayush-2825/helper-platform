import { NextResponse } from "next/server";
import { connection, NextRequest } from "next/server";
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
      process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL &&
      process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY
    );

    // Fallback: check if admin has Google OAuth linked (for backward compatibility)
    const hasGoogleOAuth = !!session.user.email?.endsWith("@gmail.com");

    return NextResponse.json({
      hasServiceAccount,
      hasGoogleOAuth,
      email: session.user.email,
      configured: hasServiceAccount || hasGoogleOAuth,
    }, { headers: NO_STORE_HEADERS });
  } catch (error) {
    if (!isPrerenderHangError(error)) {
      console.error("Calendar status error:", error);
    }
    return NextResponse.json({ message: "Internal server error" }, { status: 500, headers: NO_STORE_HEADERS });
  }
}
