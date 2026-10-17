import { NextResponse, type NextRequest } from "next/server";
import { getSessionCookie } from "better-auth/cookies";

/**
 * Security Headers configuration
 */
const securityHeaders = {
  "Content-Security-Policy":
    "default-src 'self'; " +
    "script-src 'self' 'unsafe-eval' 'unsafe-inline' 'wasm-unsafe-eval' blob: https:; " +
    "style-src 'self' 'unsafe-inline' https:; " +
    "img-src 'self' blob: data: https:; " +
    "font-src 'self' data: https:; " +
    "connect-src 'self' blob: data: https: wss: ws:; " +
    "worker-src 'self' blob: https:; " +
    "child-src 'self' blob: https:; " +
    "frame-src 'self' blob: https:; " +
    "media-src 'self' blob: data: https:; ",
  "Strict-Transport-Security": "max-age=31536000; includeSubDomains; preload",
  "X-Frame-Options": "SAMEORIGIN",
  "X-Content-Type-Options": "nosniff",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Permissions-Policy": "camera=*, microphone=*, geolocation=*, accelerometer=*, gyroscope=*, display-capture=*, browsing-topics=()",
};


export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Protected portal route prefixes requiring session
  const isPortalRoute =
    pathname.startsWith("/customer") ||
    pathname.startsWith("/helper") ||
    pathname.startsWith("/admin") ||
    pathname === "/dashboard";

  if (isPortalRoute) {
    const sessionCookie = getSessionCookie(request, {
      cookiePrefix: "dozo",
    });

    if (!sessionCookie) {
      const signInUrl = new URL("/auth/signin", request.url);
      signInUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(signInUrl);
    }
  }

  const response = NextResponse.next();

  // Apply security headers
  for (const [key, value] of Object.entries(securityHeaders)) {
    response.headers.set(key, value);
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for static assets
     */
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};