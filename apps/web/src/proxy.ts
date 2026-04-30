import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Security Headers configuration
 */
const securityHeaders = {
  "Content-Security-Policy":
    "default-src 'self'; " +
    "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://checkout.razorpay.com; " +
    "style-src 'self' 'unsafe-inline'; " +
    "img-src 'self' blob: data: https://res.cloudinary.com; " +
    "font-src 'self' data:; " +
    "frame-src 'self' https://api.razorpay.com; " +
    "connect-src 'self' https://api.razorpay.com wss://*.helper-platform.com ws://localhost:3001;",
  "Strict-Transport-Security": "max-age=31536000; includeSubDomains; preload",
  "X-Frame-Options": "DENY",
  "X-Content-Type-Options": "nosniff",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Permissions-Policy": "camera=(), microphone=(), geolocation=(self), browsing-topics=()",
  
};

export function proxy(request: NextRequest) {
  const response = NextResponse.next();

  // Apply security headers
  Object.entries(securityHeaders).forEach(([key, value]) => {
    response.headers.set(key, value);
  });

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};