"use client";

import { useEffect, useRef, useState } from "react";
import { 
  Map, 
  MapControls, 
  MapMarker, 
  MarkerContent, 
  MapRoute
} from "@/components/ui/map";
import { Clock, MapPin, Navigation, Loader2, AlertCircle, Route } from "lucide-react";
import type MapLibreGL from "maplibre-gl";
import { useRealtimeEvents } from "@/hooks/use-realtime-events";
import { useSession } from "@/lib/auth/session";
import { fetchOsrmRoute, type RouteResult } from "@/lib/maps/osrm";

interface TrackingMapProps {
  bookingId: string;
  customerLocation: { lat: number; lng: number };
  helperId?: string;
  status?: string;
}

type RouteData = RouteResult;

function formatDuration(seconds: number): string {
  const mins = Math.round(seconds / 60);
  if (mins < 60) return `${mins} min`;
  const hours = Math.floor(mins / 60);
  const remainingMins = mins % 60;
  return `${hours}h ${remainingMins}m`;
}

function formatDistance(meters: number): string {
  if (meters < 1000) return `${Math.round(meters)} m`;
  return `${(meters / 1000).toFixed(1)} km`;
}

type RealtimeLocationUpdate = {
  bookingId?: string;
  helperUserId?: string;
  latitude?: number | string;
  longitude?: number | string;
};

export function TrackingMap({ bookingId, customerLocation, helperId, status }: TrackingMapProps) {
  const { session } = useSession();
  const userId = session?.user?.id;
  const [helperLocation, setHelperLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [routeInfo, setRouteInfo] = useState<RouteData | null>(null);
  const [isRouteLoading, setIsRouteLoading] = useState(false);
  const [routeError, setRouteError] = useState<string | null>(null);
  const [debugInfo, setDebugInfo] = useState<string[]>([]);
  const mapRef = useRef<MapLibreGL.Map | null>(null);
  const routeDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const addDebug = (msg: string) => {
    console.log(`[TrackingMap] ${msg}`);
    setDebugInfo(prev => [...prev.slice(-4), `[${new Date().toLocaleTimeString()}] ${msg}`]);
  };

  // 📡 Listen for live location updates from the helper
  const { eventMessages } = useRealtimeEvents({
    userId,
    eventTypes: ["location_update", "helper_presence"],
  });

  useEffect(() => {
    if (!eventMessages.length) return;
    const msg = eventMessages[0];
    if (msg.type === "event" && msg.event === "location_update") {
      const d = msg.data as RealtimeLocationUpdate | undefined;
      if (!d) return;
      if (
        d.bookingId === bookingId &&
        (!helperId || d.helperUserId === helperId) &&
        d.latitude != null &&
        d.longitude != null
      ) {
        const newLoc = { lat: Number(d.latitude), lng: Number(d.longitude) };
        if (Number.isNaN(newLoc.lat) || Number.isNaN(newLoc.lng)) return;
        addDebug(`Location update: ${newLoc.lat.toFixed(4)}, ${newLoc.lng.toFixed(4)}`);
        setHelperLocation(newLoc);
      }
    } else if (msg.type === "event" && msg.event === "helper_presence") {
      const d = msg.data as RealtimeLocationUpdate | undefined;
      if (!d) return;
      if (d.helperUserId === helperId && d.latitude != null && d.longitude != null) {
        const newLoc = { lat: Number(d.latitude), lng: Number(d.longitude) };
        if (Number.isNaN(newLoc.lat) || Number.isNaN(newLoc.lng)) return;
        addDebug(`Presence update: ${newLoc.lat.toFixed(4)}, ${newLoc.lng.toFixed(4)}`);
        setHelperLocation(newLoc);
      }
    }
  }, [eventMessages, bookingId, helperId]);

  // 🛣️ Fetch OSRM route when helper or customer location changes, or on mount (if both are available)
  useEffect(() => {
    if (!helperLocation) {
      setRouteInfo(null);
      setRouteError(null);
      return;
    }

    if (routeDebounceRef.current) {
      clearTimeout(routeDebounceRef.current);
    }

    const abortController = new AbortController();
    setIsRouteLoading(true);
    setRouteError(null);

    const fetchRoute = async () => {
      try {
        const route = await fetchOsrmRoute({
          from: { lng: helperLocation.lng, lat: helperLocation.lat },
          to: { lng: customerLocation.lng, lat: customerLocation.lat },
          signal: abortController.signal,
        });

        if (route) {
          const first = route.coordinates[0];
          addDebug(`Route found with ${route.coordinates.length} points`);
          if (route.source === "fallback") {
            addDebug("Using approximate straight-line fallback route");
          }
          if (first) {
            addDebug(`Route start: [${first[0].toFixed(4)},${first[1].toFixed(4)}]`);
          }
          setRouteInfo(route);
          setRouteError(null);
        } else {
          addDebug("No drivable route available");
          setRouteInfo(null);
          setRouteError("No route available");
        }
      } catch (err) {
        if (err instanceof Error && err.name !== "AbortError") {
          addDebug(`Fetch error: ${err.message}`);
          setRouteError(err.message || "Failed to fetch route");
        }
      } finally {
        setIsRouteLoading(false);
      }
    };

    routeDebounceRef.current = setTimeout(() => {
      void fetchRoute();
    }, 700);

    // Optionally, refresh route every 30s (heartbeat) if job is in progress
    let interval: NodeJS.Timeout | undefined;
    if (status === "in_progress") {
      interval = setInterval(fetchRoute, 30000); // 30 seconds
    }

    

    return () => {
      abortController.abort();
      if (routeDebounceRef.current) {
        clearTimeout(routeDebounceRef.current);
        routeDebounceRef.current = null;
      }
      if (interval) clearInterval(interval);
    };
  }, [
    customerLocation.lat,
    customerLocation.lng,
    status,
    helperLocation
  ]);

  // Handle zooming to fit both points
  useEffect(() => {
      if (mapRef.current && helperLocation) {
          const minLng = Math.min(helperLocation.lng, customerLocation.lng);
          const maxLng = Math.max(helperLocation.lng, customerLocation.lng);
          const minLat = Math.min(helperLocation.lat, customerLocation.lat);
          const maxLat = Math.max(helperLocation.lat, customerLocation.lat);
          
          // Add padding to bounds
          const lngPadding = (maxLng - minLng) * 0.3 || 0.01;
          const latPadding = (maxLat - minLat) * 0.3 || 0.01;
          
          const bounds: [[number, number], [number, number]] = [
              [minLng - lngPadding, minLat - latPadding],
              [maxLng + lngPadding, maxLat + latPadding]
          ];
          
          addDebug(`Fitting bounds: [${bounds[0][0].toFixed(4)},${bounds[0][1].toFixed(4)}] to [${bounds[1][0].toFixed(4)},${bounds[1][1].toFixed(4)}]`);
          mapRef.current.fitBounds(bounds, { padding: 40, duration: 800 });
      }
  }, [helperLocation, customerLocation]);

  // Helper to convert {lat, lng} to [lng, lat] for MapLibre/GeoJSON
  const toMapCoords = (loc: { lat: number; lng: number }): [number, number] => [loc.lng, loc.lat];

  return (
    <div className="h-75 w-full bg-muted rounded-lg overflow-hidden border mt-2 relative">
      <Map
        ref={mapRef}
        center={toMapCoords(customerLocation)}
        zoom={12}
        // style={{ width: "100%", height: "100%" }}
      >
        <MapControls position="bottom-right" showZoom showLocate />

        {/* 🛣️ Route Layer - only render if we have valid coordinates */}
        {routeInfo?.coordinates && routeInfo.coordinates.length > 1 && (
          <MapRoute 
            id={`route-${bookingId}`}
            coordinates={routeInfo.coordinates}
            color="#3b82f6"
            width={5}
            opacity={0.85}
          />
        )}

        {/* 🎯 Customer/Service Location Marker - ALWAYS SHOW */}
        <MapMarker 
          longitude={customerLocation.lng} 
          latitude={customerLocation.lat}
          key={`customer-${customerLocation.lat}-${customerLocation.lng}`}
        >
          <MarkerContent>
            <div className="bg-primary rounded-full p-2 border-2 border-white shadow-lg animate-pulse">
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
              <div className="bg-green-500 rounded-full p-2 border-2 border-white shadow-lg">
                <Navigation className="size-4 text-white fill-white" />
              </div>
            </MarkerContent>
          </MapMarker>
        )}
      </Map>

      {/* Debug Panel (toggle with ?debug=true in URL if needed) */}
      {process.env.NODE_ENV === "development" && debugInfo.length > 0 && (
        <div className="absolute bottom-2 right-2 max-w-50 bg-black/80 text-[10px] text-green-400 font-mono p-2 rounded border border-green-500/30 max-h-24 overflow-y-auto">
          {debugInfo.map((line, i) => <div key={i}>{line}</div>)}
        </div>
      )}

      {/* Loading State */}
      {isRouteLoading && (
        <div className="absolute top-2 left-2 pointer-events-none">
          <div className="bg-background/90 backdrop-blur-sm border rounded-lg px-3 py-2 shadow-lg flex items-center gap-2">
            <Loader2 className="size-4 animate-spin text-muted-foreground" />
            <span className="text-xs font-medium text-muted-foreground">Finding route...</span>
          </div>
        </div>
      )}

      {/* Error State */}
      {routeError && !isRouteLoading && (
        <div className="absolute top-2 left-2 pointer-events-none">
          <div className="bg-destructive/90 backdrop-blur-sm border border-destructive rounded-lg px-3 py-2 shadow-lg flex items-center gap-2">
            <AlertCircle className="size-3.5 text-destructive-foreground" />
            <span className="text-xs font-medium text-destructive-foreground">Route unavailable</span>
          </div>
        </div>
      )}

      {/* Arrival Estimates - only when route is ready */}
      {routeInfo && !isRouteLoading && !routeError && (
        <div className="absolute top-2 left-2 flex flex-col gap-1.5 pointer-events-none">
          <div className="bg-background/90 backdrop-blur-sm border rounded-lg px-3 py-2 shadow-lg flex items-center gap-3 animate-in fade-in slide-in-from-left-2">
            <div className="flex flex-col">
              <span className="text-[10px] uppercase font-bold text-muted-foreground leading-none tracking-tight">ETA</span>
              <div className="flex items-center gap-1 mt-0.5">
                <Clock className="size-3.5 text-primary" />
                <span className="text-sm font-bold">{formatDuration(routeInfo.duration)}</span>
              </div>
            </div>
            <div className="w-px h-6 bg-border" />
            <div className="flex flex-col">
              <span className="text-[10px] uppercase font-bold text-muted-foreground leading-none tracking-tight">Distance</span>
              <div className="flex items-center gap-1 mt-0.5">
                <Route className="size-3.5 text-primary" />
                <span className="text-sm font-bold">{formatDistance(routeInfo.distance)}</span>
              </div>
            </div>
            <span className="text-[10px] px-1.5 py-0.5 rounded font-medium bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300">
              Fastest
            </span>
            {routeInfo.source === "fallback" && (
              <span className="text-[10px] px-1.5 py-0.5 rounded font-medium bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300">
                Approx
              </span>
            )}
          </div>
        </div>
      )}

      {/* No helper yet state */}
      {!helperLocation && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="bg-background/80 backdrop-blur-sm border rounded-lg px-4 py-3 shadow-lg text-center">
            {status === "accepted" && (
              <p className="text-sm font-medium text-muted-foreground">Waiting for helper to start...</p>
            )}
            {status === "in_progress" && (
              <p className="text-sm font-medium text-green-700">Job in Progress. Tracking will update when helper moves.</p>
            )}
            {status !== "accepted" && status !== "in_progress" && (
              <p className="text-sm font-medium text-muted-foreground">Tracking unavailable for this status.</p>
            )}
            <p className="text-[10px] text-muted-foreground mt-1">
              {customerLocation.lat.toFixed(4)}, {customerLocation.lng.toFixed(4)}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}