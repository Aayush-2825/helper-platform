import { headers } from "next/headers";
import { and, eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { account, user } from "@/db/schema";
import { auth } from "@/lib/auth/server";

export async function GET(request: NextRequest) {
  const origin =
    process.env.BETTER_AUTH_URL ||
    request.nextUrl.origin ||
    "https://dozo.work";

  const redirectTarget = new URL("/admin/verifications", origin);

  try {
    const error = request.nextUrl.searchParams.get("error");
    if (error) {
      redirectTarget.searchParams.set("calendar_error", error);
      return NextResponse.redirect(redirectTarget.toString());
    }

    const code = request.nextUrl.searchParams.get("code");
    const stateUserId = request.nextUrl.searchParams.get("state");

    if (!code) {
      redirectTarget.searchParams.set("calendar_error", "missing_code");
      return NextResponse.redirect(redirectTarget.toString());
    }

    const session = await auth.api.getSession({ headers: await headers() });
    const targetUserId = session?.user?.id || stateUserId;

    if (!targetUserId) {
      redirectTarget.searchParams.set("calendar_error", "unauthorized");
      return NextResponse.redirect(redirectTarget.toString());
    }

    // Verify admin
    const targetUser = await db.query.user.findFirst({
      where: eq(user.id, targetUserId),
      columns: { id: true, role: true },
    });

    if (!targetUser || targetUser.role !== "admin") {
      redirectTarget.searchParams.set("calendar_error", "not_admin");
      return NextResponse.redirect(redirectTarget.toString());
    }

    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
    if (!clientId || !clientSecret) {
      redirectTarget.searchParams.set("calendar_error", "misconfigured");
      return NextResponse.redirect(redirectTarget.toString());
    }

    const redirectUri = `${origin.replace(/\/$/, "")}/api/admin/calendar/callback`;

    // Exchange authorization code for tokens
    const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        code,
        grant_type: "authorization_code",
        redirect_uri: redirectUri,
      }),
    });

    if (!tokenResponse.ok) {
      const errText = await tokenResponse.text();
      console.error("Failed to exchange Google OAuth code:", errText);
      redirectTarget.searchParams.set("calendar_error", "token_exchange_failed");
      return NextResponse.redirect(redirectTarget.toString());
    }

    const tokenData = await tokenResponse.json();
    const accessToken = tokenData.access_token as string;
    const refreshToken = tokenData.refresh_token as string | undefined;
    const expiresIn = Number(tokenData.expires_in ?? 3600);
    const scope = tokenData.scope as string | undefined;

    // Fetch user info to get Google account ID
    let accountId = targetUserId;
    try {
      const infoRes = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (infoRes.ok) {
        const info = await infoRes.json();
        if (info.id) accountId = info.id;
      }
    } catch {
      // ignore
    }

    // Check if account record exists
    const existing = await db.query.account.findFirst({
      where: and(eq(account.userId, targetUserId), eq(account.providerId, "google")),
    });

    const expiresAt = new Date(Date.now() + expiresIn * 1000);

    if (existing) {
      await db
        .update(account)
        .set({
          accountId,
          accessToken,
          ...(refreshToken ? { refreshToken } : {}),
          accessTokenExpiresAt: expiresAt,
          ...(scope ? { scope } : {}),
          updatedAt: new Date(),
        })
        .where(eq(account.id, existing.id));
    } else {
      await db.insert(account).values({
        id: `acc_google_${targetUserId}_${Date.now()}`,
        accountId,
        providerId: "google",
        userId: targetUserId,
        accessToken,
        refreshToken: refreshToken || null,
        accessTokenExpiresAt: expiresAt,
        scope: scope || null,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }

    redirectTarget.searchParams.set("calendar", "connected");
    return NextResponse.redirect(redirectTarget.toString());
  } catch (err) {
    console.error("Admin calendar callback error:", err);
    redirectTarget.searchParams.set("calendar_error", "internal_error");
    return NextResponse.redirect(redirectTarget.toString());
  }
}
