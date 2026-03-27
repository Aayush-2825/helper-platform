"use client";

import {
  Map,
  MapControls,
  MapMarker,
  MarkerContent,
  MarkerPopup,
  MarkerTooltip,
} from "@/components/ui/map";
import { Card } from "@/components/ui/card";
import { useCallback, useEffect, useRef, useState } from "react";
import { MapPin, Navigation, Search, Star, X, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BookingForm } from "@/components/BookingForm";
import { BookingStatus } from "@/components/BookingStatus";
import { useRealtimeEvents } from "@/hooks/use-realtime-events";
import type MapLibreGL from "maplibre-gl";

type NearbyHelper = {
  id: string;
  userId: string;
  name: string;
  category: string;
  lat: number | null;
  lng: number | null;
  rating: string | number;
  completedJobs: number;
  availability: "online" | "offline" | "busy";
};

type ApiHelper = Omit<NearbyHelper, "lat" | "lng"> & { serviceCity?: string | null };

type GeocodedLocation = {
  lat: number;
  lng: number;
  addressLine: string;
  city: string;
};

type NominatimResult = {
  lat: string;
  lon: string;
  display_name: string;
  address?: {
    road?: string;
    suburb?: string;
    city?: string;
    town?: string;
    village?: string;
    state_district?: string;
    county?: string;
  };
};


// ---------------------------------------------------------------------------
// Location search bar (Nominatim, no API key)
// ---------------------------------------------------------------------------

function LocationSearchBar({ onSelect }: { onSelect: (loc: GeocodedLocation) => void }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<NominatimResult[]>([]);
  const [searching, setSearching] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const search = useCallback((q: string) => {
    if (q.trim().length < 3) { setResults([]); return; }
    setSearching(true);
    fetch(
      `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q)}&format=json&addressdetails=1&limit=5&countrycodes=in`,
      { headers: { "Accept-Language": "en" } },
    )
      .then((r) => r.json() as Promise<NominatimResult[]>)
      .then(setResults)
      .catch(() => setResults([]))
      .finally(() => setSearching(false));
  }, []);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const val = e.target.value;
    setQuery(val);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => search(val), 400);
  }

  function handleSelect(r: NominatimResult) {
    const addr = r.address ?? {};
    const road = addr.road ?? addr.suburb ?? "";
    const city = addr.city ?? addr.town ?? addr.village ?? addr.state_district ?? addr.county ?? "";
    const short = r.display_name.split(",").slice(0, 3).join(",");
    setQuery(short);
    setResults([]);
    onSelect({ lat: parseFloat(r.lat), lng: parseFloat(r.lon), addressLine: road || short, city });
  }

  return (
    <div className="relative">
      <div className="flex items-center gap-2 border rounded-lg px-3 py-2 bg-background shadow-sm">
        <Search className="size-4 text-muted-foreground shrink-0" />
        <input
          type="text"
          value={query}
          onChange={handleChange}
          placeholder="Search location (e.g. Connaught Place, Delhi)..."
          className="flex-1 text-sm bg-transparent outline-none placeholder:text-muted-foreground"
        />
        {searching && (
          <span className="size-4 rounded-full border-2 border-primary border-t-transparent animate-spin shrink-0" />
        )}
        {query && !searching && (
          <button
            onClick={() => { setQuery(""); setResults([]); }}
            className="text-muted-foreground hover:text-foreground"
          >
            <X className="size-4" />
          </button>
        )}
      </div>
      {results.length > 0 && (
        <ul className="absolute z-50 mt-1 w-full rounded-lg border bg-popover shadow-lg overflow-hidden">
          {results.map((r, i) => (
            <li key={i}>
              <button
                className="w-full text-left px-3 py-2 text-sm hover:bg-accent transition-colors"
                onClick={() => handleSelect(r)}
              >
                {r.display_name}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}


// ---------------------------------------------------------------------------
// Helper to reverse-geocode coordinates to get a city name
// ---------------------------------------------------------------------------

async function reverseGeocode(lat: number, lng: number): Promise<{ addressLine: string; city: string }> {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&addressdetails=1`,
      { headers: { "Accept-Language": "en" } },
    );
    const data = await res.json() as NominatimResult;
    const addr = data?.address ?? {};
    const road = addr.road ?? addr.suburb ?? "";
    const city = addr.city ?? addr.town ?? addr.village ?? addr.state_district ?? addr.county ?? "";
    const short = data.display_name.split(",").slice(0, 3).join(",");
    return { addressLine: road || short, city };
  } catch {
    return { addressLine: "", city: "" };
  }
}


// ---------------------------------------------------------------------------
// Main map component
// ---------------------------------------------------------------------------

export function MyMap() {
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [mapCenter, setMapCenter] = useState({ lat: 28.6139, lng: 77.209 });
  const [draggableMarker, setDraggableMarker] = useState({ lng: 77.209, lat: 28.6139 });
  const [nearbyHelpers, setNearbyHelpers] = useState<NearbyHelper[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [prefillAddress, setPrefillAddress] = useState({ addressLine: "", city: "" });
  const [currentBookingId, setCurrentBookingId] = useState<string | null>(null);
  const formRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<MapLibreGL.Map | null>(null);
  // Track the city we last fetched helpers for
  const [fetchCity, setFetchCity] = useState<string>("");

  // On mount, get the user's position and reverse-geocode for city
  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        setLocation({ lat, lng });
        setMapCenter({ lat, lng });
        setDraggableMarker({ lat, lng });
        const { addressLine, city } = await reverseGeocode(lat, lng);
        setFetchCity(city);
        setPrefillAddress({ addressLine, city });
      },
      async () => {
        // Default to New Delhi if geolocation denied
        const fallback = { lat: 28.6139, lng: 77.209 };
        setLocation(fallback);
        setFetchCity("New Delhi");
      },
    );
  }, []);

  // Fetch helpers filtered by city
  useEffect(() => {
    if (!fetchCity) return;
    const params = new URLSearchParams({ city: fetchCity });
    fetch(`/api/helpers/nearby?${params.toString()}`, { credentials: "include" })
      .then((r) => r.json() as Promise<{ helpers?: ApiHelper[] }>)
      .then((data) => {
        const helpers = data.helpers ?? [];
        // Only set lat/lng to null — real coords come from WS events
        setNearbyHelpers(
          helpers.map((h) => ({
            ...h,
            lat: null,
            lng: null,
          })),
        );
      })
      .catch(() => {});
  }, [fetchCity]);

  // Listen to both helper_presence (online/offline + coords) and location_update (in-job GPS)
  const { eventMessages } = useRealtimeEvents({
    eventTypes: ["helper_presence", "location_update"],
  });

  useEffect(() => {
    if (!eventMessages.length) return;
    for (const msg of eventMessages) {
      if (msg.type !== "event") continue;

      if (msg.event === "helper_presence") {
        const d = msg.data as
          | { helperUserId?: string; status?: string; latitude?: number; longitude?: number }
          | undefined;
        if (!d?.helperUserId) continue;
        const uid: string = d.helperUserId;

        setNearbyHelpers((prev) => {
          if (d.status === "offline") {
            return prev.filter((h) => h.userId !== uid);
          }
          const exists = prev.find((h) => h.userId === uid);
          if (exists) {
            return prev.map((h) =>
              h.userId === uid
                ? {
                    ...h,
                    availability: (d.status ?? h.availability) as NearbyHelper["availability"],
                    ...(d.latitude != null ? { lat: d.latitude } : {}),
                    ...(d.longitude != null ? { lng: d.longitude } : {}),
                  }
                : h,
            );
          }
          if (d.latitude != null && d.longitude != null) {
            const newHelper: NearbyHelper = {
              id: uid,
              userId: uid,
              name: "Helper",
              category: "other",
              lat: d.latitude,
              lng: d.longitude,
              rating: 0,
              completedJobs: 0,
              availability: (d.status ?? "online") as NearbyHelper["availability"],
            };
            return [...prev, newHelper];
          }
          return prev;
        });
      }

      if (msg.event === "location_update") {
        const d = msg.data as
          | { helperUserId?: string; latitude?: number; longitude?: number }
          | undefined;
        if (!d?.helperUserId || d.latitude == null || d.longitude == null) continue;
        const uid: string = d.helperUserId;
        setNearbyHelpers((prev) =>
          prev.map((h) =>
            h.userId === uid ? { ...h, lat: d.latitude!, lng: d.longitude! } : h,
          ),
        );
      }
    }
  }, [eventMessages]);

  function handleLocationSelect(loc: GeocodedLocation) {
    setMapCenter({ lat: loc.lat, lng: loc.lng });
    setDraggableMarker({ lat: loc.lat, lng: loc.lng });
    setPrefillAddress({ addressLine: loc.addressLine, city: loc.city });
    setFetchCity(loc.city); // re-fetch helpers for this city
    mapRef.current?.flyTo({ center: [loc.lng, loc.lat], zoom: 14, duration: 1200 });
  }

  function handleBookHelper(category: string) {
    setSelectedCategory(category);
    setTimeout(() => {
      formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 50);
  }

  if (!location) {
    return (
      <div className="h-[420px] rounded-2xl bg-muted animate-pulse flex items-center justify-center">
        <p className="text-sm text-muted-foreground">Locating you...</p>
      </div>
    );
  }

  // Separate helpers with real GPS coords from those without
  const helpersWithCoords = nearbyHelpers.filter((h) => h.lat != null && h.lng != null);
  const helpersWithoutCoords = nearbyHelpers.filter((h) => h.lat == null || h.lng == null);

  return (
    <div className="space-y-3">
      <LocationSearchBar onSelect={handleLocationSelect} />

      {/* Helpers-in-area badge (those without live GPS) */}
      {helpersWithoutCoords.length > 0 && (
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-muted/50 border text-sm">
          <Users className="size-4 text-muted-foreground" />
          <span className="text-muted-foreground">
            <span className="font-semibold text-foreground">{helpersWithoutCoords.length}</span>{" "}
            helper{helpersWithoutCoords.length > 1 ? "s" : ""} registered in{" "}
            <span className="font-medium text-foreground">{fetchCity || "this area"}</span>
            {" "}(not sharing live location)
          </span>
        </div>
      )}

      <Card className="h-[420px] p-0 overflow-hidden">
        <Map
          ref={mapRef}
          center={[mapCenter.lng, mapCenter.lat]}
          zoom={14}
          styles={{
            light: "https://tiles.openfreemap.org/styles/liberty",
            dark: "https://tiles.openfreemap.org/styles/liberty",
          }}
        >
          <MapControls
            position="bottom-right"
            showZoom
            showCompass
            showLocate
            showFullscreen
            onLocate={async (coords) => {
              const lat = coords.latitude;
              const lng = coords.longitude;
              setDraggableMarker({ lat, lng });
              const { addressLine, city } = await reverseGeocode(lat, lng);
              setFetchCity(city);
              setPrefillAddress({ addressLine, city });
            }}
          />

          <MapMarker
            draggable
            longitude={draggableMarker.lng}
            latitude={draggableMarker.lat}
            onDragEnd={(lngLat) => setDraggableMarker({ lng: lngLat.lng, lat: lngLat.lat })}
          >
            <MarkerContent>
              <div className="cursor-move">
                <MapPin className="fill-black stroke-white dark:fill-white" size={28} />
              </div>
            </MarkerContent>
            <MarkerPopup>
              <div className="space-y-1">
                <p className="font-medium text-foreground">Service Location</p>
                <p className="text-xs text-muted-foreground">
                  {draggableMarker.lat.toFixed(4)}, {draggableMarker.lng.toFixed(4)}
                </p>
                <p className="text-xs text-muted-foreground">Drag to adjust</p>
              </div>
            </MarkerPopup>
          </MapMarker>

          {/* Only render markers for helpers with real GPS coordinates */}
          {helpersWithCoords.map((helper) => (
            <MapMarker key={helper.id} longitude={helper.lng!} latitude={helper.lat!}>
              <MarkerContent>
                <div className="relative flex flex-col items-center">
                  <div
                    className={`size-4 rounded-full border-2 border-white shadow-lg cursor-pointer hover:scale-125 transition-transform ${
                      helper.availability === "online"
                        ? "bg-green-500"
                        : helper.availability === "busy"
                          ? "bg-yellow-500"
                          : "bg-gray-400"
                    }`}
                  />
                  <span className="mt-0.5 whitespace-nowrap text-[10px] font-semibold text-foreground drop-shadow-sm bg-background/80 rounded px-1">
                    {helper.name !== "Helper" ? helper.name.split(" ")[0] : "Helper"}
                  </span>
                </div>
              </MarkerContent>
              <MarkerTooltip>
                <div className="space-y-1">
                  <p className="font-medium">{helper.name}</p>
                  <p className="text-[10px] uppercase tracking-wide opacity-70">
                    {helper.category.replace(/_/g, " ")}
                  </p>
                  {Number(helper.rating) > 0 && (
                    <div className="flex items-center gap-1">
                      <Star className="size-3 fill-amber-400 text-amber-400" />
                      <span>{Number(helper.rating).toFixed(1)}</span>
                      <span className="opacity-70">({helper.completedJobs} jobs)</span>
                    </div>
                  )}
                  <span
                    className={`inline-block text-[10px] font-medium px-1.5 py-0.5 rounded-full ${
                      helper.availability === "online"
                        ? "bg-green-500/20 text-green-300"
                        : helper.availability === "busy"
                          ? "bg-yellow-500/20 text-yellow-300"
                          : "bg-gray-500/20 text-gray-400"
                    }`}
                  >
                    {helper.availability.charAt(0).toUpperCase() + helper.availability.slice(1)}
                  </span>
                </div>
              </MarkerTooltip>
            </MapMarker>
          ))}
        </Map>
      </Card>

      {currentBookingId ? (
        <BookingStatus
          bookingId={currentBookingId}
          onClose={() => setCurrentBookingId(null)}
        />
      ) : (
        <BookingForm
          latitude={draggableMarker.lat}
          longitude={draggableMarker.lng}
          defaultCategory={selectedCategory}
          defaultAddressLine={prefillAddress.addressLine}
          defaultCity={prefillAddress.city || fetchCity}
          formRef={formRef}
          onSuccess={(id) => {
            setCurrentBookingId(id);
          }}
        />
      )}
    </div>
  );
}

