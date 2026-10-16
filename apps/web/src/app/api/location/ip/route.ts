import { NextRequest, NextResponse } from "next/server";
import { NO_STORE_HEADERS } from "@/lib/http/cache";

export async function GET(request: NextRequest) {
  try {
    // 1. Check Vercel geolocation headers
    const vercelLat = request.headers.get("x-vercel-ip-latitude");
    const vercelLng = request.headers.get("x-vercel-ip-longitude");
    const vercelCity = request.headers.get("x-vercel-ip-city");
    const vercelRegion = request.headers.get("x-vercel-ip-country-region");
    const vercelCountry = request.headers.get("x-vercel-ip-country");

    if (vercelLat && vercelLng) {
      const lat = parseFloat(vercelLat);
      const lng = parseFloat(vercelLng);
      if (!Number.isNaN(lat) && !Number.isNaN(lng)) {
        return NextResponse.json(
          {
            latitude: lat,
            longitude: lng,
            city: vercelCity ? decodeURIComponent(vercelCity) : "",
            region: vercelRegion || "",
            country: vercelCountry || "IN",
            source: "vercel-header",
          },
          { status: 200, headers: NO_STORE_HEADERS }
        );
      }
    }

    // 2. Check Cloudflare geolocation headers
    const cfLat = request.headers.get("cf-iplatitude");
    const cfLng = request.headers.get("cf-iplongitude");
    const cfCity = request.headers.get("cf-ipcity");

    if (cfLat && cfLng) {
      const lat = parseFloat(cfLat);
      const lng = parseFloat(cfLng);
      if (!Number.isNaN(lat) && !Number.isNaN(lng)) {
        return NextResponse.json(
          {
            latitude: lat,
            longitude: lng,
            city: cfCity || "",
            region: "",
            country: "IN",
            source: "cloudflare-header",
          },
          { status: 200, headers: NO_STORE_HEADERS }
        );
      }
    }

    // 3. Fallback to IP lookup service
    const forwardedFor = request.headers.get("x-forwarded-for");
    const clientIp =
      forwardedFor?.split(",")[0]?.trim() ||
      request.headers.get("x-real-ip") ||
      request.headers.get("cf-connecting-ip");

    const isLocalOrPrivate =
      !clientIp ||
      clientIp === "::1" ||
      clientIp === "127.0.0.1" ||
      clientIp.startsWith("192.168.") ||
      clientIp.startsWith("10.") ||
      clientIp.startsWith("172.");

    const lookupUrl = isLocalOrPrivate
      ? "https://ipwho.is/"
      : `https://ipwho.is/${clientIp}`;

    const res = await fetch(lookupUrl, {
      headers: { "User-Agent": "DOZO-Platform/1.0" },
      next: { revalidate: 3600 },
    });

    if (res.ok) {
      const data = await res.json();
      if (data && typeof data.latitude === "number" && typeof data.longitude === "number") {
        return NextResponse.json(
          {
            latitude: data.latitude,
            longitude: data.longitude,
            city: data.city || "",
            region: data.region || "",
            country: data.country_code || "IN",
            postalCode: data.postal || "",
            source: "ipwhois",
          },
          { status: 200, headers: NO_STORE_HEADERS }
        );
      }
    }

    // 4. Default fallback: New Delhi, India
    return NextResponse.json(
      {
        latitude: 28.6139,
        longitude: 77.209,
        city: "New Delhi",
        region: "Delhi",
        country: "IN",
        source: "fallback-default",
      },
      { status: 200, headers: NO_STORE_HEADERS }
    );
  } catch (error) {
    console.error("IP geolocation error:", error);
    return NextResponse.json(
      {
        latitude: 28.6139,
        longitude: 77.209,
        city: "New Delhi",
        region: "Delhi",
        country: "IN",
        source: "fallback-error",
      },
      { status: 200, headers: NO_STORE_HEADERS }
    );
  }
}
