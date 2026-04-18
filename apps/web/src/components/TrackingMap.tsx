"use client";

import { useEffect, useRef, useState } from "react";
import { 
  Map, 
  MapControls, 
  MapMarker, 
  MarkerContent
} from "@/components/ui/map";
import { MapPin, Navigation, ExternalLink } from "lucide-react";
import type MapLibreGL from "maplibre-gl";
import { useRealtimeEvents } from "@/hooks/use-realtime-events";
import { useSession } from "@/lib/auth/session";

interface TrackingMapProps {
  bookingId: string;
  customerLocation: { lat: number; lng: number };
  helperId?: string;
}

type RealtimeLocationUpdate = {
  bookingId?: string;
  helperUserId?: string;
  latitude?: number | string;
  longitude?: number | string;
};

export function TrackingMap({ bookingId, customerLocation, helperId }: TrackingMapProps) {
  const { session } = useSession();
  const userId = session?.user?.id;
  const [helperLocation, setHelperLocation] = useState<{ lat: number; lng: number } | null>(null);
  const mapRef = useRef<MapLibreGL.Map | null>(null);
  const hasAutoFitRef = useRef(false);

  // 📡 Listen for live location updates from the helper
  const { eventMessages } = useRealtimeEvents({
    userId,
    eventTypes: ["location_update", "helper_presence"],
  });

  useEffect(() => {
    if (!eventMessages.length) return;
    const msg = eventMessages[0];

    const updateLocation = (next: { lat: number; lng: number }) => {
      queueMicrotask(() => {
        setHelperLocation(next);
      });
    };

    if (msg.type === "event" && msg.event === "location_update") {
      const d = msg.data as RealtimeLocationUpdate | undefined;
      if (
        d &&
        d.bookingId === bookingId &&
        (!helperId || d.helperUserId === helperId) &&
        d.latitude != null &&
        d.longitude != null
      ) {
        const parsed = { lat: Number(d.latitude), lng: Number(d.longitude) };
        if (!Number.isNaN(parsed.lat) && !Number.isNaN(parsed.lng)) {
          updateLocation(parsed);
        }
      }
    }

    if (msg.type === "event" && msg.event === "helper_presence") {
      const d = msg.data as RealtimeLocationUpdate | undefined;
      if (
        d &&
        (!helperId || d.helperUserId === helperId) &&
        d.latitude != null &&
        d.longitude != null
      ) {
        const parsed = { lat: Number(d.latitude), lng: Number(d.longitude) };
        if (!Number.isNaN(parsed.lat) && !Number.isNaN(parsed.lng)) {
          updateLocation(parsed);
        }
      }
    }
  }, [eventMessages, bookingId, helperId]);

  useEffect(() => {
    hasAutoFitRef.current = false;
  }, [bookingId, customerLocation.lat, customerLocation.lng]);

  // Auto-fit once per booking/customer location so live updates do not keep forcing camera moves.
  useEffect(() => {
    const helperLat = helperLocation?.lat;
    const helperLng = helperLocation?.lng;

    if (!mapRef.current || helperLat == null || helperLng == null || hasAutoFitRef.current) {
      return;
    }

    const minLng = Math.min(helperLng, customerLocation.lng);
    const maxLng = Math.max(helperLng, customerLocation.lng);
    const minLat = Math.min(helperLat, customerLocation.lat);
    const maxLat = Math.max(helperLat, customerLocation.lat);

    const lngPadding = (maxLng - minLng) * 0.3 || 0.01;
    const latPadding = (maxLat - minLat) * 0.3 || 0.01;

    const bounds: [[number, number], [number, number]] = [
      [minLng - lngPadding, minLat - latPadding],
      [maxLng + lngPadding, maxLat + latPadding],
    ];

    mapRef.current.fitBounds(bounds, { padding: 40, duration: 800 });
    hasAutoFitRef.current = true;
  }, [helperLocation?.lat, helperLocation?.lng, customerLocation.lat, customerLocation.lng]);

  // Helper to convert {lat, lng} to [lng, lat] for MapLibre/GeoJSON
  const toMapCoords = (loc: { lat: number; lng: number }): [number, number] => [loc.lng, loc.lat];

  const googleMapsHref = helperLocation
    ? `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(`${helperLocation.lat},${helperLocation.lng}`)}&destination=${encodeURIComponent(`${customerLocation.lat},${customerLocation.lng}`)}`
    : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${customerLocation.lat},${customerLocation.lng}`)}`;

  return (
    <div className="h-75 w-full bg-slate-50 rounded-lg overflow-hidden border mt-2 relative">
      <Map
        ref={mapRef}
        center={toMapCoords(customerLocation)}
        zoom={12}
        styles={{
          light: "https://tiles.openfreemap.org/styles/liberty",
          dark: "https://tiles.openfreemap.org/styles/liberty",
        }}
      >
        <MapControls position="bottom-right" showZoom showLocate />

        {/* 🎯 Customer/Service Location Marker - ALWAYS SHOW */}
        <MapMarker 
          longitude={customerLocation.lng} 
          latitude={customerLocation.lat}
          key={`customer-${customerLocation.lat}-${customerLocation.lng}`}
        >
          <MarkerContent>
            <div className="bg-blue-600 rounded-full p-2 border-2 border-white shadow-lg animate-pulse">
              <MapPin className="size-4 text-white" />
            </div>
          </MarkerContent>
        </MapMarker>

        {/* 👤 Helper Location Marker - ALWAYS SHOW if available */}
        {helperLocation && (
          <MapMarker 
            longitude={helperLocation.lng} 
            latitude={helperLocation.lat}
            key={`helper-${helperLocation.lat}-${helperLocation.lng}`}
          >
            <MarkerContent>
                <div className="bg-emerald-500 rounded-full p-2 border-2 border-white shadow-lg">
                <Navigation className="size-4 text-white fill-white" />
              </div>
            </MarkerContent>
          </MapMarker>
        )}
      </Map>

        <a
          href={googleMapsHref}
          target="_blank"
          rel="noopener noreferrer"
          className="absolute top-2 left-2 z-10"
        >
          <span className="inline-flex items-center gap-1.5 rounded-md border bg-white/95 px-2.5 py-1.5 text-xs font-medium text-slate-700 shadow-sm">
            <ExternalLink className="size-3.5" />
            Open in Google Maps
          </span>
        </a>

      {/* No helper yet state */}
      {!helperLocation && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="bg-white/90 backdrop-blur-sm border rounded-lg px-4 py-3 shadow-lg text-center">
            <p className="text-sm font-medium text-slate-600">Waiting for helper location...</p>
            <p className="text-[10px] text-muted-foreground mt-1">
              {customerLocation.lat.toFixed(4)}, {customerLocation.lng.toFixed(4)}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}