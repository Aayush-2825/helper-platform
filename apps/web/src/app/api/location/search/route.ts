import { NextRequest, NextResponse } from "next/server";
import { NO_STORE_HEADERS } from "@/lib/http/cache";

export async function GET(request: NextRequest) {
  try {
    const q = request.nextUrl.searchParams.get("q");

    if (!q || q.trim().length < 2) {
      return NextResponse.json([], { status: 200, headers: NO_STORE_HEADERS });
    }

    const nominatimUrl = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
      q.trim()
    )}&format=json&addressdetails=1&limit=6&countrycodes=in`;

    const res = await fetch(nominatimUrl, {
      headers: {
        "User-Agent": "DOZO-Platform/1.0 (contact@dozo.work)",
        "Accept-Language": "en",
      },
      next: { revalidate: 300 },
    });

    if (!res.ok) {
      return NextResponse.json([], { status: 200, headers: NO_STORE_HEADERS });
    }

    const results = await res.json();
    return NextResponse.json(results, { status: 200, headers: NO_STORE_HEADERS });
  } catch (error) {
    console.error("Location search error:", error);
    return NextResponse.json([], { status: 200, headers: NO_STORE_HEADERS });
  }
}
