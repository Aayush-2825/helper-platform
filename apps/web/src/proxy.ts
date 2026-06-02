import { NextResponse } from "next/server";

/**
 * Security Headers configuration
 */
const securityHeaders = {
  "Content-Security-Policy":
    "default-src 'self'; " +
    "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://checkout.razorpay.com; " +
    
    "style-src 'self' 'unsafe-inline'; " +

    // allow images + sprites + tiles + icons
    "img-src 'self' blob: data: https://res.cloudinary.com https://*.cartocdn.com; " +

    "font-src 'self' data:; " +

    // Razorpay + Carto tile/style JSON requests
    "connect-src 'self' https://api.razorpay.com https://basemaps.cartocdn.com https://*.cartocdn.com wss://*.helper-platform.com ws://localhost:3001; " +

    // Web Workers (MapLibre + blob workers)
    "worker-src 'self' blob: https://*.cartocdn.com; " +

    // optional but helps some map libs (style JSON via fetch in worker contexts)
    "child-src 'self' blob:; ",

  "Strict-Transport-Security": "max-age=31536000; includeSubDomains; preload",
  "X-Frame-Options": "DENY",
  "X-Content-Type-Options": "nosniff",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Permissions-Policy": "camera=(), microphone=(), geolocation=(self), browsing-topics=()",
};

export function proxy() {
  const response = NextResponse.next();

  // Apply security headers
  // Object.entries(securityHeaders).forEach(([key, value]) => {
  //   response.headers.set(key, value);
  // });

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