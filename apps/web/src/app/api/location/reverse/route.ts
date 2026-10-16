import { NextRequest, NextResponse } from "next/server";
import { NO_STORE_HEADERS } from "@/lib/http/cache";

export async function GET(request: NextRequest) {
  try {
    const lat = request.nextUrl.searchParams.get("lat");
    const lng = request.nextUrl.searchParams.get("lng");

    if (!lat || !lng) {
      return NextResponse.json(
        { message: "Missing lat or lng query parameters." },
        { status: 400, headers: NO_STORE_HEADERS }
      );
    }

    const parsedLat = parseFloat(lat);
    const parsedLng = parseFloat(lng);

    if (Number.isNaN(parsedLat) || Number.isNaN(parsedLng)) {
      return NextResponse.json(
        { message: "Invalid lat or lng values." },
        { status: 400, headers: NO_STORE_HEADERS }
      );
    }

    const nominatimUrl = `https://nominatim.openstreetmap.org/reverse?lat=${parsedLat}&lon=${parsedLng}&format=json&addressdetails=1`;
    const res = await fetch(nominatimUrl, {
      headers: {
        "User-Agent": "DOZO-Platform/1.0 (contact@dozo.work)",
        "Accept-Language": "en",
      },
      cache: "no-store",
    });

    if (!res.ok) {
      return NextResponse.json(
        { addressLine: "", area: "", city: "", state: "", postalCode: "" },
        { status: 200, headers: NO_STORE_HEADERS }
      );
    }

    const data = await res.json();
    const addr = data?.address ?? {};
    const road = addr.road ?? addr.suburb ?? addr.neighbourhood ?? "";
    const area = addr.suburb ?? addr.neighbourhood ?? addr.city_district ?? "";
    const city =
      addr.city ??
      addr.town ??
      addr.village ??
      addr.state_district ??
      addr.county ??
      "";
    const state = addr.state ?? "";
    const postalCode = (addr.postcode ?? "").replace(/[^0-9]/g, "").slice(0, 6);
    const short = (data?.display_name ?? "").split(",").slice(0, 3).join(",").trim();

    return NextResponse.json(
      {
        addressLine: road || short,
        area,
        city,
        state,
        postalCode,
        displayName: data?.display_name ?? "",
      },
      { status: 200, headers: NO_STORE_HEADERS }
    );
  } catch (error) {
    console.warn("[/api/location/reverse] Reverse geocoding error:", error);
    return NextResponse.json(
      { addressLine: "", area: "", city: "", state: "", postalCode: "" },
      { status: 200, headers: NO_STORE_HEADERS }
    );
  }
}
