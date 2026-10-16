"use client";

import { useEffect, useRef, useState, useCallback, useMemo } from "react";
import { 
  Map, 
  MapControls, 
  MapMarker, 
  MarkerContent,
  MarkerPopup,
  MapRoute,
  RoutePolyline,
} from "@features/shared/components/mapping/map";
import { 
  MapPin, 
  Navigation, 
  ExternalLink, 
  Maximize2, 
  Car, 
  CheckCircle2, 
  Play, 
  Square,
  Clock,
  Compass,
} from "lucide-react";
import type MapLibreGL from "maplibre-gl";
import { useRealtimeEvents } from "@features/booking/hooks/use-realtime-events";
import { useSession } from "@/lib/auth/session";

export interface TrackingMapProps {
  bookingId: string;
  customerLocation: { lat: number; lng: number };
  helperId?: string;
  initialHelperLocation?: { lat: number; lng: number } | null;
  className?: string;
  status?: string;
}

type RealtimeLocationUpdate = {
  bookingId?: string;
  helperUserId?: string;
  latitude?: number | string;
  longitude?: number | string;
  heading?: number;
  speed?: number;
};

type OSRMRouteResponse = {
  code: string;
  routes?: Array<{
    distance: number; // in meters
    duration: number; // in seconds
    geometry: {
      coordinates: [number, number][]; // [lng, lat]
    };
  }>;
};

/**
 * Calculates Haversine distance in meters between two coordinates.
 */
export function calculateHaversineDistance(
  coord1: { lat: number; lng: number },
  coord2: { lat: number; lng: number }
): number {
  const R = 6371e3; // Earth radius in meters
  const phi1 = (coord1.lat * Math.PI) / 180;
  const phi2 = (coord2.lat * Math.PI) / 180;
  const deltaPhi = ((coord2.lat - coord1.lat) * Math.PI) / 180;
  const deltaLambda = ((coord2.lng - coord1.lng) * Math.PI) / 180;

  const a =
    Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
    Math.cos(phi1) * Math.cos(phi2) * Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return Math.round(R * c);
}

/**
 * Format remaining distance cleanly.
 */
export function formatDistance(meters: number): string {
  if (meters < 50) return "Arrived";
  if (meters < 1000) return `${Math.round(meters)} m`;
  return `${(meters / 1000).toFixed(1)} km`;
}

/**
 * Format estimated arrival duration cleanly.
 */
export function formatDuration(seconds: number): string {
  if (seconds < 60) return "< 1 min";
  const mins = Math.ceil(seconds / 60);
  if (mins >= 60) {
    const hours = Math.floor(mins / 60);
    const remMins = mins % 60;
    return remMins > 0 ? `~${hours}h ${remMins}m` : `~${hours}h`;
  }
  return `~${mins} mins`;
}

export function TrackingMap({ 
  bookingId, 
  customerLocation, 
  helperId,
  initialHelperLocation,
  className = "",
  status,
}: TrackingMapProps) {
  const { session } = useSession();
  const userId = session?.user?.id;
  const isRouteActive = !status || status === "accepted" || status === "in_progress";

  const [helperLocation, setHelperLocation] = useState<{ lat: number; lng: number } | null>(
    initialHelperLocation ?? null
  );
  const [heading, setHeading] = useState<number | undefined>(undefined);
  const [routeCoordinates, setRouteCoordinates] = useState<[number, number][]>([]);
  const [distanceMeters, setDistanceMeters] = useState<number | null>(null);
  const [durationSeconds, setDurationSeconds] = useState<number | null>(null);
  const [isRouteLoading, setIsRouteLoading] = useState(false);
  const [isSimulating, setIsSimulating] = useState(false);

  const mapRef = useRef<MapLibreGL.Map | null>(null);
  const hasAutoFitRef = useRef(false);
  const lastFetchedCoordRef = useRef<{ lat: number; lng: number } | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const simulationTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // 📡 Real-time WebSocket event listener
  const { eventMessages } = useRealtimeEvents({
    userId,
    eventTypes: ["location_update", "helper_presence"],
  });

  // Handle incoming live helper locations
  useEffect(() => {
    if (!eventMessages.length) return;
    const msg = eventMessages[0];

    const handleLocation = (
      next: { lat: number; lng: number },
      newHeading?: number
    ) => {
      // If user was simulating, stop simulation upon receiving real GPS
      if (isSimulating) {
        setIsSimulating(false);
        if (simulationTimerRef.current) {
          clearInterval(simulationTimerRef.current);
          simulationTimerRef.current = null;
        }
      }
      setHelperLocation(next);
      if (newHeading != null && !Number.isNaN(newHeading)) {
        setHeading(newHeading);
      }
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
          handleLocation(parsed, d.heading);
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
          handleLocation(parsed, d.heading);
        }
      }
    }
  }, [eventMessages, bookingId, helperId, isSimulating]);

  // Clean up timers on unmount
  useEffect(() => {
    return () => {
      if (simulationTimerRef.current) {
        clearInterval(simulationTimerRef.current);
      }
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  // 🚗 Fetch turn-by-turn road route via Project OSRM (100% Free & Open Source)
  const fetchOSRMRoute = useCallback(
    async (start: { lat: number; lng: number }, end: { lat: number; lng: number }) => {
      // Abort any ongoing route request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      const controller = new AbortController();
      abortControllerRef.current = controller;
      setIsRouteLoading(true);

      try {
        const url = `https://router.project-osrm.org/route/v1/driving/${start.lng},${start.lat};${end.lng},${end.lat}?overview=full&geometries=geojson`;
        const res = await fetch(url, { signal: controller.signal });

        if (!res.ok) {
          throw new Error(`OSRM HTTP ${res.status}`);
        }

        const data = (await res.json()) as OSRMRouteResponse;
        if (data.code === "Ok" && data.routes && data.routes.length > 0) {
          const mainRoute = data.routes[0];
          setRouteCoordinates(mainRoute.geometry.coordinates);
          setDistanceMeters(mainRoute.distance);
          setDurationSeconds(mainRoute.duration);
        } else {
          throw new Error("No route found from OSRM");
        }
      } catch (err: unknown) {
        if (err instanceof Error && err.name === "AbortError") return;

        // Fallback: Haversine straight line + average city driving speed (25 km/h = 6.94 m/s)
        const straightDistance = calculateHaversineDistance(start, end);
        const estDuration = Math.round(straightDistance / 6.94);
        setRouteCoordinates([
          [start.lng, start.lat],
          [end.lng, end.lat],
        ]);
        setDistanceMeters(straightDistance);
        setDurationSeconds(estDuration);
      } finally {
        setIsRouteLoading(false);
      }
    },
    []
  );

  // Trigger route fetch when helper or customer location changes significantly (>20m)
  useEffect(() => {
    if (!helperLocation) {
      setRouteCoordinates([]);
      setDistanceMeters(null);
      setDurationSeconds(null);
      return;
    }

    const prev = lastFetchedCoordRef.current;
    if (prev) {
      const moved = calculateHaversineDistance(prev, helperLocation);
      if (moved < 20) return; // Don't spam route recalculations if movement is negligible
    }

    lastFetchedCoordRef.current = helperLocation;
    void fetchOSRMRoute(helperLocation, customerLocation);
  }, [helperLocation, customerLocation, fetchOSRMRoute]);

  // 🗺️ Auto-fit map camera bounds to encompass both customer and helper
  const fitRouteBounds = useCallback(() => {
    if (!mapRef.current) return;

    if (!helperLocation) {
      mapRef.current.flyTo({
        center: [customerLocation.lng, customerLocation.lat],
        zoom: 14,
        duration: 800,
      });
      return;
    }

    const minLng = Math.min(helperLocation.lng, customerLocation.lng);
    const maxLng = Math.max(helperLocation.lng, customerLocation.lng);
    const minLat = Math.min(helperLocation.lat, customerLocation.lat);
    const maxLat = Math.max(helperLocation.lat, customerLocation.lat);

    const lngPadding = (maxLng - minLng) * 0.25 || 0.008;
    const latPadding = (maxLat - minLat) * 0.25 || 0.008;

    const bounds: [[number, number], [number, number]] = [
      [minLng - lngPadding, minLat - latPadding],
      [maxLng + lngPadding, maxLat + latPadding],
    ];

    mapRef.current.fitBounds(bounds, { padding: 45, duration: 800 });
  }, [customerLocation, helperLocation]);

  // Auto-fit once per booking/customer location
  useEffect(() => {
    if (hasAutoFitRef.current || !helperLocation) return;
    fitRouteBounds();
    hasAutoFitRef.current = true;
  }, [helperLocation, fitRouteBounds]);

  // Reset auto-fit flag if booking changes
  useEffect(() => {
    hasAutoFitRef.current = false;
  }, [bookingId]);

  // 🎮 Simulator for testing & live preview
  const handleToggleSimulation = useCallback(() => {
    if (isSimulating) {
      if (simulationTimerRef.current) {
        clearInterval(simulationTimerRef.current);
        simulationTimerRef.current = null;
      }
      setIsSimulating(false);
      return;
    }

    // Generate a realistic start location ~1.2 km northwest of customer
    const startCoord = {
      lat: customerLocation.lat + 0.009,
      lng: customerLocation.lng - 0.009,
    };

    setHelperLocation(startCoord);
    setIsSimulating(true);

    // Fetch route first, then animate along route points
    void (async () => {
      try {
        const url = `https://router.project-osrm.org/route/v1/driving/${startCoord.lng},${startCoord.lat};${customerLocation.lng},${customerLocation.lat}?overview=full&geometries=geojson`;
        const res = await fetch(url);
        const data = (await res.json()) as OSRMRouteResponse;

        let points: [number, number][] = [];
        if (data.code === "Ok" && data.routes && data.routes.length > 0) {
          points = data.routes[0].geometry.coordinates;
          setRouteCoordinates(points);
          setDistanceMeters(data.routes[0].distance);
          setDurationSeconds(data.routes[0].duration);
        } else {
          points = [
            [startCoord.lng, startCoord.lat],
            [customerLocation.lng, customerLocation.lat],
          ];
        }

        if (points.length < 2) return;

        let currentIndex = 0;
        const totalPoints = points.length;
        const step = Math.max(1, Math.floor(totalPoints / 25)); // ~25 steps to reach destination

        if (simulationTimerRef.current) {
          clearInterval(simulationTimerRef.current);
        }

        simulationTimerRef.current = setInterval(() => {
          currentIndex += step;
          if (currentIndex >= totalPoints - 1) {
            // Arrived at destination
            const finalPt = points[points.length - 1];
            setHelperLocation({ lat: finalPt[1], lng: finalPt[0] });
            setRouteCoordinates([]);
            setDistanceMeters(0);
            setDurationSeconds(0);
            setIsSimulating(false);
            if (simulationTimerRef.current) {
              clearInterval(simulationTimerRef.current);
              simulationTimerRef.current = null;
            }
            return;
          }

          const pt = points[currentIndex];
          const nextPt = points[Math.min(currentIndex + 1, totalPoints - 1)];

          // Calculate heading angle in degrees
          const dy = nextPt[1] - pt[1];
          const dx = nextPt[0] - pt[0];
          const angleDeg = Math.round((Math.atan2(dx, dy) * 180) / Math.PI);
          setHeading(angleDeg >= 0 ? angleDeg : angleDeg + 360);

          setHelperLocation({ lat: pt[1], lng: pt[0] });
          const remainingSlice = points.slice(currentIndex);
          setRouteCoordinates(remainingSlice);

          // Update remaining distance and ETA
          const remainingDist = calculateHaversineDistance(
            { lat: pt[1], lng: pt[0] },
            customerLocation
          );
          setDistanceMeters(remainingDist);
          setDurationSeconds(Math.round(remainingDist / 6.94));
        }, 750);
      } catch {
        setIsSimulating(false);
      }
    })();
  }, [isSimulating, customerLocation]);

  // External directions URL
  const googleMapsHref = useMemo(() => {
    return helperLocation
      ? `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(`${helperLocation.lat},${helperLocation.lng}`)}&destination=${encodeURIComponent(`${customerLocation.lat},${customerLocation.lng}`)}`
      : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${customerLocation.lat},${customerLocation.lng}`)}`;
  }, [helperLocation, customerLocation]);

  // Determine helper status text
  const statusInfo = useMemo(() => {
    if (!helperLocation) {
      return {
        label: "Waiting for live GPS signal...",
        sub: "Connecting to helper device",
        isArrived: false,
      };
    }
    if (distanceMeters !== null && distanceMeters < 50) {
      return {
        label: "Helper has arrived!",
        sub: "At service location",
        isArrived: true,
      };
    }
    if (distanceMeters !== null && distanceMeters < 500) {
      return {
        label: "Helper is approaching",
        sub: "Reaching in less than 500m",
        isArrived: false,
      };
    }
    return {
      label: "Helper is en route",
      sub: "Navigating via live road network",
      isArrived: false,
    };
  }, [helperLocation, distanceMeters]);

  return (
    <div className={`relative h-80 w-full overflow-hidden rounded-2xl border border-slate-200/80 bg-slate-50 shadow-sm dark:border-slate-800 dark:bg-slate-900 ${className}`}>
      <Map
        ref={mapRef}
        center={[customerLocation.lng, customerLocation.lat]}
        zoom={13}
        styles={{
          light: "https://tiles.openfreemap.org/styles/liberty",
          dark: "https://tiles.openfreemap.org/styles/liberty",
        }}
      >
        <MapControls position="bottom-right" showZoom showLocate />

        {/* 🛣️ Road Navigation Route (Turn-by-turn polyline) */}
        {isRouteActive && helperLocation && routeCoordinates.length >= 2 && (
          <RoutePolyline
            id={`route-poly-${bookingId}`}
            coordinates={routeCoordinates}
            color="#f97316"
            width={3}
            dashArray={[2, 2]}
            animated
          />
        )}

        {/* 🎯 Customer Destination Marker */}
        <MapMarker
          longitude={customerLocation.lng}
          latitude={customerLocation.lat}
          key={`customer-${customerLocation.lat}-${customerLocation.lng}`}
        >
          <MarkerContent>
            <div className="relative flex flex-col items-center">
              <div className="absolute -inset-1 rounded-full bg-blue-500/30 animate-ping" />
              <div className="relative flex size-8 items-center justify-center rounded-full border-2 border-white bg-blue-600 shadow-md">
                <MapPin className="size-4 text-white" />
              </div>
            </div>
          </MarkerContent>
          <MarkerPopup>
            <div className="p-1 text-xs">
              <p className="font-semibold text-slate-800 dark:text-slate-100">Service Location</p>
              <p className="text-muted-foreground">Destination address</p>
            </div>
          </MarkerPopup>
        </MapMarker>

        {/* 👤 Live Helper Vehicle / Navigation Marker */}
        {helperLocation && (
          <MapMarker
            longitude={helperLocation.lng}
            latitude={helperLocation.lat}
            key={`helper-${helperLocation.lat}-${helperLocation.lng}`}
          >
            <MarkerContent>
              <div className="relative flex flex-col items-center">
                <div className="absolute -inset-1.5 rounded-full bg-emerald-500/30 animate-pulse" />
                <div 
                  className="relative flex size-8 items-center justify-center rounded-full border-2 border-white bg-emerald-600 shadow-lg transition-transform duration-300"
                  style={{
                    transform: heading !== undefined ? `rotate(${heading}deg)` : undefined,
                  }}
                >
                  <Navigation className="size-4 fill-white text-white" />
                </div>
              </div>
            </MarkerContent>
            <MarkerPopup>
              <div className="p-1 text-xs">
                <p className="font-semibold text-slate-800 dark:text-slate-100">
                  {statusInfo.isArrived ? "Helper Arrived" : "Helper en route"}
                </p>
                {distanceMeters !== null && (
                  <p className="text-muted-foreground">
                    {formatDistance(distanceMeters)} away • {durationSeconds !== null ? formatDuration(durationSeconds) : ""}
                  </p>
                )}
              </div>
            </MarkerPopup>
          </MapMarker>
        )}
      </Map>

      {/* 🧭 Top Floating Control Bar */}
      <div className="absolute top-2.5 inset-x-2.5 z-10 flex items-center justify-between pointer-events-none">
        <a
          href={googleMapsHref}
          target="_blank"
          rel="noopener noreferrer"
          className="pointer-events-auto inline-flex items-center gap-1.5 rounded-lg border border-slate-200/80 bg-white/95 px-2.5 py-1.5 text-xs font-semibold text-slate-700 shadow-sm backdrop-blur-md transition-colors hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900/90 dark:text-slate-200"
        >
          <ExternalLink className="size-3.5 text-blue-600 dark:text-blue-400" />
          Google Maps
        </a>

        <div className="pointer-events-auto flex items-center gap-2">
          {/* Recenter Button */}
          <button
            type="button"
            onClick={fitRouteBounds}
            title="Recenter on Route"
            aria-label="Recenter on Route"
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200/80 bg-white/95 px-2.5 py-1.5 text-xs font-semibold text-slate-700 shadow-sm backdrop-blur-md transition-colors hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900/90 dark:text-slate-200"
          >
            <Maximize2 className="size-3.5 text-slate-600 dark:text-slate-300" />
            <span className="hidden sm:inline">Recenter</span>
          </button>

          {/* Test / Demo Simulation Trigger */}
          <button
            type="button"
            onClick={handleToggleSimulation}
            title={isSimulating ? "Stop Simulation" : "Simulate Live Helper Route"}
            aria-label={isSimulating ? "Stop Simulation" : "Simulate Live Helper Route"}
            className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-semibold shadow-sm backdrop-blur-md transition-all ${
              isSimulating
                ? "border-amber-300 bg-amber-50 text-amber-800 dark:border-amber-700 dark:bg-amber-950/80 dark:text-amber-200 animate-pulse"
                : "border-slate-200/80 bg-white/95 text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900/90 dark:text-slate-200"
            }`}
          >
            {isSimulating ? (
              <>
                <Square className="size-3 text-amber-600 fill-amber-600" />
                <span>Simulating...</span>
              </>
            ) : (
              <>
                <Play className="size-3 text-emerald-600 fill-emerald-600" />
                <span className="hidden sm:inline">Simulate Route</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* 📊 Bottom Live ETA & HUD Floating Card */}
      <div className="absolute bottom-2.5 inset-x-2.5 z-10 pointer-events-none">
        <div className="pointer-events-auto rounded-xl border border-slate-200/80 bg-white/95 p-3 shadow-lg backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/95">
          <div className="flex items-center justify-between gap-3">
            {/* Left: Status & Live Beacon */}
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="relative flex size-9 shrink-0 items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800">
                {statusInfo.isArrived ? (
                  <CheckCircle2 className="size-5 text-emerald-600" />
                ) : helperLocation ? (
                  <Car className="size-5 text-blue-600 dark:text-blue-400" />
                ) : (
                  <Compass className="size-5 text-slate-400 animate-spin" />
                )}
                {helperLocation && (
                  <span className="absolute -top-0.5 -right-0.5 flex size-2.5">
                    <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex size-2.5 rounded-full bg-emerald-500" />
                  </span>
                )}
              </div>

              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <p className="truncate text-xs font-bold text-slate-900 dark:text-slate-100">
                    {statusInfo.label}
                  </p>
                  {helperLocation && (
                    <span className="inline-flex items-center rounded-full bg-emerald-50 px-1.5 py-0.2 text-[10px] font-bold text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300">
                      LIVE
                    </span>
                  )}
                </div>
                <p className="truncate text-[11px] text-slate-500 dark:text-slate-400">
                  {statusInfo.sub}
                </p>
              </div>
            </div>

            {/* Right: Metrics (Distance & ETA) */}
            <div className="flex items-center gap-3 shrink-0 text-right">
              {helperLocation && distanceMeters !== null && (
                <>
                  <div>
                    <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block leading-tight">
                      Distance
                    </span>
                    <span className="text-xs font-black text-slate-900 dark:text-slate-100">
                      {formatDistance(distanceMeters)}
                    </span>
                  </div>

                  {durationSeconds !== null && (
                    <div className="border-l border-slate-200 dark:border-slate-800 pl-3">
                      <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 flex items-center justify-end gap-1 leading-tight">
                        <Clock className="size-2.5" /> ETA
                      </span>
                      <span className="text-xs font-black text-orange-600 dark:text-orange-400">
                        {isRouteLoading ? "..." : formatDuration(durationSeconds)}
                      </span>
                    </div>
                  )}
                </>
              )}

              {!helperLocation && (
                <div className="text-[11px] text-slate-400 italic">
                  GPS active on helper dispatch
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
