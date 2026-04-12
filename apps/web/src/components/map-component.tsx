"use client";

import {
  Map as MapComponent,
  MapControls,
  MapMarker,
  MarkerContent,
  MarkerPopup,
  MarkerTooltip,
} from "@/components/ui/map";
import { Card } from "@/components/ui/card";
import { useCallback, useEffect, useRef, useState, memo } from "react";
import { MapPin, Search, Star, X, Users } from "lucide-react";
import { BookingForm, type LiveHelper } from "@/components/BookingForm";
import { BookingStatus } from "@/components/BookingStatus";
import { useRealtimeEvents } from "@/hooks/use-realtime-events";
import type MapLibreGL from "maplibre-gl";

type NearbyHelper = LiveHelper & {
  lat: number | null;
  lng: number | null;
};

type GeocodedLocation = {
  lat: number;
  lng: number;
  addressLine: string;
  area: string;
  city: string;
  state: string;
  postalCode: string;
};

type NominatimResult = {
  lat: string;
  lon: string;
  display_name: string;
  address?: {
    road?: string;
    suburb?: string;
    neighbourhood?: string;
    city?: string;
    town?: string;
    village?: string;
    state?: string;
    postcode?: string;
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
    const area = addr.suburb ?? addr.neighbourhood ?? "";
    const city = addr.city ?? addr.town ?? addr.village ?? addr.state_district ?? addr.county ?? "";
    const state = addr.state ?? "";
    const postalCode = (addr.postcode ?? "").replace(/[^0-9]/g, "").slice(0, 6);
    const short = r.display_name.split(",").slice(0, 3).join(",");
    setQuery(short);
    setResults([]);
    onSelect({ lat: parseFloat(r.lat), lng: parseFloat(r.lon), addressLine: road || short, area, city, state, postalCode });
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

async function reverseGeocode(lat: number, lng: number): Promise<{ addressLine: string; area: string; city: string; state: string; postalCode: string }> {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&addressdetails=1`,
      { headers: { "Accept-Language": "en" } },
    );
    const data = await res.json() as NominatimResult;
    const addr = data?.address ?? {};
    const road = addr.road ?? addr.suburb ?? "";
    const area = addr.suburb ?? addr.neighbourhood ?? "";
    const city = addr.city ?? addr.town ?? addr.village ?? addr.state_district ?? addr.county ?? "";
    const state = addr.state ?? "";
    const postalCode = (addr.postcode ?? "").replace(/[^0-9]/g, "").slice(0, 6);
    const short = data.display_name.split(",").slice(0, 3).join(",");
    return { addressLine: road || short, area, city, state, postalCode };
  } catch {
    return { addressLine: "", area: "", city: "", state: "", postalCode: "" };
  }
}

function HelpersInAreaBadge({
  count,
  city,
}: {
  count: number;
  city: string;
}) {
  if (count === 0) return null;

  return (
    <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-muted/50 border text-sm">
      <Users className="size-4 text-muted-foreground" />
      <span className="text-muted-foreground">
        <span className="font-semibold text-foreground">{count}</span>{" "}
        helper{count > 1 ? "s" : ""} registered in{" "}
        <span className="font-medium text-foreground">{city || "this area"}</span>{" "}
        (not sharing live location)
      </span>
    </div>
  );
}

function ServiceLocationMarker({
  lat,
  lng,
  onDragEnd,
}: {
  lat: number;
  lng: number;
  onDragEnd: (coords: { lat: number; lng: number }) => void;
}) {
  return (
    <MapMarker
      draggable
      longitude={lng}
      latitude={lat}
      onDragEnd={({ lng: nextLng, lat: nextLat }) => onDragEnd({ lng: nextLng, lat: nextLat })}
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
            {lat.toFixed(4)}, {lng.toFixed(4)}
          </p>
          <p className="text-xs text-muted-foreground">Drag to adjust</p>
        </div>
      </MarkerPopup>
    </MapMarker>
  );
}

function HelperMarkerItem({ helper }: { helper: NearbyHelper }) {
  return (
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
  );
}

const HelperMarkersLayer = memo(function HelperMarkersLayer({ helpers }: { helpers: NearbyHelper[] }) {
  return (
    <>
      {helpers.map((helper) => (
        <HelperMarkerItem key={helper.id} helper={helper} />
      ))}
    </>
  );
});


// ---------------------------------------------------------------------------
// Main map component
// ---------------------------------------------------------------------------

export function MyMap({ userId }: { userId?: string }) {
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [mapCenter, setMapCenter] = useState({ lat: 28.6139, lng: 77.209 });
  const [draggableMarker, setDraggableMarker] = useState({ lng: 77.209, lat: 28.6139 });
  const [nearbyHelpers, setNearbyHelpers] = useState<NearbyHelper[]>([]);
  const selectedCategory = "";
  const [prefillAddress, setPrefillAddress] = useState({ addressLine: "", area: "", city: "", state: "", postalCode: "" });
  const [currentBookingId, setCurrentBookingId] = useState<string | null>(null);
  const formRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<MapLibreGL.Map | null>(null);
  // Track the city we last fetched helpers for
  const [fetchCity, setFetchCity] = useState<string>("");

  // Track helper updates to batch/debounce them
  const helperUpdatesRef = useRef<Record<string, NearbyHelper>>({});
  const batchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // On mount, get the user's position and reverse-geocode for city
  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        setLocation({ lat, lng });
        setMapCenter({ lat, lng });
        setDraggableMarker({ lat, lng });
        const { addressLine, area, city, state, postalCode } = await reverseGeocode(lat, lng);
        setFetchCity(city);
        setPrefillAddress({ addressLine, area, city, state, postalCode });
      },
      async () => {
        // Default to New Delhi if geolocation denied
        const fallback = { lat: 28.6139, lng: 77.209 };
        setLocation(fallback);
        setFetchCity("New Delhi");
      },
    );
  }, []);

  // Listen to both helper_presence (online/offline + coords) and location_update (in-job GPS)
  const { eventMessages } = useRealtimeEvents({
    userId,
    eventTypes: ["helper_presence", "location_update"],
  });

  const scheduleBatchUpdate = useCallback(() => {
    // Clear existing timeout
    if (batchTimeoutRef.current) {
      clearTimeout(batchTimeoutRef.current);
    }

    // Schedule a batched update in the next animation frame
    batchTimeoutRef.current = setTimeout(() => {
      setNearbyHelpers((prev) => {
        const newHelpers = [...prev];
        const existingMap = new Map(newHelpers.map((h) => [h.userId, h]));

        // Apply all pending updates
        Object.entries(helperUpdatesRef.current).forEach(([uid, updated]) => {
          existingMap.set(uid, updated);
        });

        // Clear pending updates
        helperUpdatesRef.current = {};

        return Array.from(existingMap.values());
      });
    }, 16); // ~60fps batch interval
  }, []);

  // Process events with batching to prevent excessive re-renders
  useEffect(() => {
    if (!eventMessages.length) return;
    const msg = eventMessages[0]; // Only process the latest event
    if (msg.type !== "event") return;

    if (msg.event === "helper_presence") {
      const d = msg.data as
        | { helperUserId?: string; status?: string; latitude?: number | string; longitude?: number | string }
        | undefined;
      if (!d?.helperUserId) return;
      const uid: string = d.helperUserId;
      const latitude = d.latitude != null ? Number(d.latitude) : null;
      const longitude = d.longitude != null ? Number(d.longitude) : null;
      const hasValidCoords =
        latitude != null &&
        longitude != null &&
        !Number.isNaN(latitude) &&
        !Number.isNaN(longitude);

      // Update the tracking object instead of state immediately
      if (d.status === "offline") {
        delete helperUpdatesRef.current[uid];
      } else {
        const existing = helperUpdatesRef.current[uid];
        helperUpdatesRef.current[uid] = {
          ...(existing || {
            id: uid,
            userId: uid,
            name: "Helper",
            category: "other",
            rating: 0,
            completedJobs: 0,
            serviceCity: null,
            distanceKm: null,
            latitude: null,
            longitude: null,
            lat: null,
            lng: null,
          }),
          availability: (d.status ?? "online") as NearbyHelper["availability"],
          ...(hasValidCoords ? { lat: latitude!, lng: longitude!, latitude: latitude!, longitude: longitude! } : {}),
        };
      }

      // Batch the update
      scheduleBatchUpdate();
      return;
    }

    if (msg.event === "location_update") {
      const d = msg.data as
        | { helperUserId?: string; latitude?: number | string; longitude?: number | string }
        | undefined;
      const latitude = d?.latitude != null ? Number(d.latitude) : Number.NaN;
      const longitude = d?.longitude != null ? Number(d.longitude) : Number.NaN;
      if (!d?.helperUserId || Number.isNaN(latitude) || Number.isNaN(longitude)) return;
      const uid: string = d.helperUserId;

      // Update the tracking object instead of state immediately
      if (helperUpdatesRef.current[uid]) {
        helperUpdatesRef.current[uid] = {
          ...helperUpdatesRef.current[uid],
          lat: latitude,
          lng: longitude,
          latitude,
          longitude,
        };
      }

      // Batch the update
      scheduleBatchUpdate();
    }
  }, [eventMessages, scheduleBatchUpdate]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (batchTimeoutRef.current) {
        clearTimeout(batchTimeoutRef.current);
      }
    };
  }, []);

  function handleLocationSelect(loc: GeocodedLocation) {
    setMapCenter({ lat: loc.lat, lng: loc.lng });
    setDraggableMarker({ lat: loc.lat, lng: loc.lng });
    setPrefillAddress({
      addressLine: loc.addressLine,
      area: loc.area,
      city: loc.city,
      state: loc.state,
      postalCode: loc.postalCode,
    });
    setFetchCity(loc.city); // re-fetch helpers for this city
    mapRef.current?.flyTo({ center: [loc.lng, loc.lat], zoom: 14, duration: 1200 });
  }

  if (!location) {
    return (
      <div className="h-105 rounded-2xl bg-muted animate-pulse flex items-center justify-center">
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

      <HelpersInAreaBadge count={helpersWithoutCoords.length} city={fetchCity} />

      <Card className="h-105 p-0 overflow-hidden">
        <MapComponent
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
              const { latitude: lat, longitude: lng } = coords;
              setDraggableMarker({ lat, lng });
              const { addressLine, area, city, state, postalCode } = await reverseGeocode(lat, lng);
              setFetchCity(city);
              setPrefillAddress({ addressLine, area, city, state, postalCode });
            }}
          />

          <ServiceLocationMarker
            lat={draggableMarker.lat}
            lng={draggableMarker.lng}
            onDragEnd={setDraggableMarker}
          />

          <HelperMarkersLayer helpers={helpersWithCoords} />
        </MapComponent>
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
          userId={userId}
          defaultCategory={selectedCategory}
          defaultAddressLine={prefillAddress.addressLine}
          defaultArea={prefillAddress.area}
          defaultCity={prefillAddress.city || fetchCity}
          defaultState={prefillAddress.state}
          defaultPostalCode={prefillAddress.postalCode}
          formRef={formRef}
          onHelpersFound={(helpers) => {
            setNearbyHelpers(
              helpers.map((helper) => ({
                ...helper,
                lat: helper.latitude ?? null,
                lng: helper.longitude ?? null,
              })),
            );
          }}
          onHelpersSearching={() => {
            setNearbyHelpers((prev) => prev);
          }}
          onSuccess={(id) => {
            setCurrentBookingId(id);
          }}
        />
      )}
    </div>
  );
}

