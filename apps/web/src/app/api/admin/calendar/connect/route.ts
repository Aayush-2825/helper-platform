import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/server";
import { NO_STORE_HEADERS } from "@/lib/http/cache";

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user || session.user.role !== "admin") {
      return NextResponse.json({ message: "Unauthorized: Admin access required." }, { status: 401, headers: NO_STORE_HEADERS });
    }

    const clientId = process.env.GOOGLE_CLIENT_ID;
    if (!clientId) {
      return NextResponse.json({ message: "GOOGLE_CLIENT_ID is not configured." }, { status: 500, headers: NO_STORE_HEADERS });
    }

    const origin =
      process.env.BETTER_AUTH_URL ||
      request.nextUrl.origin ||
      "https://dozo.work";

    const redirectUri = `${origin.replace(/\/$/, "")}/api/admin/calendar/callback`;
    const scope = [
      "openid",
      "profile",
      "email",
      "https://www.googleapis.com/auth/calendar.events",
      "https://www.googleapis.com/auth/calendar",
    ].join(" ");

    const googleAuthUrl = new URL("https://accounts.google.com/o/oauth2/v2/auth");
    googleAuthUrl.searchParams.set("client_id", clientId);
    googleAuthUrl.searchParams.set("redirect_uri", redirectUri);
    googleAuthUrl.searchParams.set("response_type", "code");
    googleAuthUrl.searchParams.set("scope", scope);
    googleAuthUrl.searchParams.set("access_type", "offline");
    googleAuthUrl.searchParams.set("prompt", "select_account consent");
    googleAuthUrl.searchParams.set("state", session.user.id);

    return NextResponse.redirect(googleAuthUrl.toString());
  } catch (error) {
    console.error("Admin calendar connect error:", error);
    return NextResponse.json({ message: "Failed to initiate calendar connection." }, { status: 500, headers: NO_STORE_HEADERS });
  }
}
