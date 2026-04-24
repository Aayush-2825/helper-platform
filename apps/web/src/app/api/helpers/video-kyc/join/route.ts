import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/server";
import { NO_STORE_HEADERS } from "@/lib/http/cache";
import { canRevealJoinLink } from "@/lib/kyc/video-kyc";

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401, headers: NO_STORE_HEADERS });
    }

    if (session.user.role !== "helper") {
      return NextResponse.json({ message: "Forbidden" }, { status: 403, headers: NO_STORE_HEADERS });
    }

    const url = new URL(request.url);
    const sessionId = url.searchParams.get("session_id")?.trim();
    if (!sessionId) {
      return NextResponse.json({ message: "Missing session_id." }, { status: 400, headers: NO_STORE_HEADERS });
    }

    const gate = await canRevealJoinLink({ helperUserId: session.user.id, sessionId });
    if (!gate.ok) {
      const hasWindow = gate.reason === "too_early" || gate.reason === "expired";
      return NextResponse.json(
        {
          message:
            gate.reason === "too_early"
              ? "Join is not available yet."
              : gate.reason === "expired"
                ? "Join window has expired."
                : "Join is not available.",
          reason: gate.reason,
          scheduled_at: hasWindow ? gate.scheduledAt.toISOString() : null,
          not_before: hasWindow ? gate.notBefore.toISOString() : null,
          not_after: hasWindow ? gate.notAfter.toISOString() : null,
        },
        { status: 403, headers: NO_STORE_HEADERS },
      );
    }

    const response = NextResponse.redirect(gate.meetLink, { status: 302 });
    Object.entries(NO_STORE_HEADERS).forEach(([key, value]) => response.headers.set(key, value));
    return response;
  } catch (error) {
    console.error("Video KYC join redirect error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500, headers: NO_STORE_HEADERS });
  }
}
