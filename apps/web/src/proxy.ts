import { NextResponse, type NextRequest } from "next/server";
import { getSessionCookie } from "better-auth/cookies";

/**
 * Security Headers configuration
 */
const securityHeaders = {
  "Content-Security-Policy":
    "default-src 'self'; " +
    "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://checkout.razorpay.com https://static.cloudflareinsights.com https://*.cloudflareinsights.com https://va.vercel-scripts.com; " +
    "style-src 'self' 'unsafe-inline'; " +
    "img-src 'self' blob: data: https://res.cloudinary.com https://*.cartocdn.com https://*.openfreemap.org https://tiles.openfreemap.org https://lh3.googleusercontent.com; " +
    "font-src 'self' data:; " +
    "connect-src 'self' https://api.razorpay.com https://basemaps.cartocdn.com https://*.cartocdn.com https://nominatim.openstreetmap.org https://router.project-osrm.org https://*.openfreemap.org https://tiles.openfreemap.org https://cloudflareinsights.com https://*.cloudflareinsights.com https://vitals.vercel-insights.com https://*.onrender.com wss: ws:; " +
    "worker-src 'self' blob: https://*.cartocdn.com https://*.openfreemap.org https://tiles.openfreemap.org; " +
    "child-src 'self' blob:; ",
  "Strict-Transport-Security": "max-age=31536000; includeSubDomains; preload",
  "X-Frame-Options": "DENY",
  "X-Content-Type-Options": "nosniff",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Permissions-Policy": "camera=(self), microphone=(self), geolocation=(self), browsing-topics=()",
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