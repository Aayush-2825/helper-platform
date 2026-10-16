"use client";

import {
  Map,
  MapControls,
  MapMarker,
  MarkerContent,
  MarkerTooltip,
  MapRoute
} from "@features/shared/components/mapping/map";
import { Card } from "@repo/ui/components/ui/card";
import { MapPin, Navigation2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type MapLibreGL from "maplibre-gl";
import { IncomingJob } from "@/app/(portal)/helper/incoming-jobs/useIncomingJobs";
import { fetchOsrmRoute } from "@/lib/maps/osrm";

type WorkerLocation = {
  lat: number;
  lng: number;
};

type IncomingJobsMapProps = {
  jobs: IncomingJob[];
  /** The helper's own current GPS position (if available) */
  workerLocation?: WorkerLocation | null;
};

const DEFAULT_CENTER = { lat: 28.6139, lng: 77.209 }; // New Delhi

/**
 * A map that renders markers for each incoming job's service location
 * and optionally the helper's own live location.
 */
export function IncomingJobsMap({ jobs, workerLocation }: IncomingJobsMapProps) {
  const mapRef = useRef<MapLibreGL.Map | null>(null);
  const [currentLocation, setCurrentLocation] = useState<WorkerLocation | null>(workerLocation ?? null);
  const lastSentServerTimeRef = useRef<number>(0);
  const lastPositionRef = useRef<WorkerLocation | null>(null);
  const isFirstFixRef = useRef<boolean>(true);
  const [routes, setRoutes] = useState<Record<string, {
      coordinates: [number, number][],
      duration: number,
      distance: number
  }>>({});

  // Synchronize initial or external worker location changes
  useEffect(() => {
    if (workerLocation) {
      setCurrentLocation(workerLocation);
    }
  }, [workerLocation]);

  // Track helper location every 5s with watchPosition and animate marker / camera
  useEffect(() => {
    if (typeof window === "undefined" || !("geolocation" in navigator)) return;

    let watchId: number;

    const sendServerUpdate = async (lat: number, lng: number) => {
      try {
        await fetch("/api/helper/availability", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            availabilityStatus: "online",
            latitude: lat,
            longitude: lng,
          }),
        });
      } catch (err) {
        console.warn("[IncomingJobsMap] Availability GPS update failed:", err);
      }
    };

    const handlePosition = (pos: GeolocationPosition) => {
      const lat = pos.coords.latitude;
      const lng = pos.coords.longitude;
      const now = Date.now();

      setCurrentLocation({ lat, lng });

      if (mapRef.current) {
        if (isFirstFixRef.current) {
          isFirstFixRef.current = false;
          mapRef.current.easeTo({ center: [lng, lat], zoom: 14, duration: 1000 });
        } else {
          const prev = lastPositionRef.current;
          if (!prev || Math.abs(prev.lat - lat) > 0.0001 || Math.abs(prev.lng - lng) > 0.0001) {
            mapRef.current.easeTo({ center: [lng, lat], duration: 1000 });
          }
        }
      }
      lastPositionRef.current = { lat, lng };

      // Throttle updates to 5 seconds
      if (now - lastSentServerTimeRef.current >= 5000) {
        lastSentServerTimeRef.current = now;
        void sendServerUpdate(lat, lng);
      }
    };

    const handleError = (error: GeolocationPositionError) => {
      console.warn("[IncomingJobsMap] Geolocation watch error:", error.message);
    };

    watchId = navigator.geolocation.watchPosition(handlePosition, handleError, {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 4000,
    });

    return () => {
      if (watchId !== undefined) {
        navigator.geolocation.clearWatch(watchId);
      }
    };
  }, []);

  // Fetch routes for all nearby jobs
  useEffect(() => {
    const activeWorkerLocation = currentLocation;
    if (!activeWorkerLocation || jobs.length === 0) return;

    let cancelled = false;
    const abortController = new AbortController();

    const fetchRoutes = async () => {
      const newRoutes: Record<string, { coordinates: [number, number][]; duration: number; distance: number }> = {};
      const jobsToRoute = jobs
        .filter((job) => job.latitude != null && job.longitude != null)
        .slice(0, 5);

      const results = await Promise.allSettled(
        jobsToRoute.map(async (job) => {
          const route = await fetchOsrmRoute({
            from: { lng: activeWorkerLocation.lng, lat: activeWorkerLocation.lat },
            to: { lng: job.longitude as number, lat: job.latitude as number },
            signal: abortController.signal,
          });

          return { bookingId: job.bookingId, route };
        }),
      );

      for (const result of results) {
        if (result.status !== "fulfilled") {
          continue;
        }

        const { bookingId, route } = result.value;
        if (route) {
          newRoutes[bookingId] = route;
        }
      }

      if (!cancelled) {
        setRoutes(newRoutes);
      }
    };

    void fetchRoutes();

    return () => {
      cancelled = true;
      abortController.abort();
    };
  }, [jobs, currentLocation]);

  // Determine the map center: prefer worker location, else first job, else default
  const center =
    currentLocation ??
    (jobs.length > 0 && jobs[0].latitude != null && jobs[0].longitude != null
      ? { lat: jobs[0].latitude, lng: jobs[0].longitude }
      : DEFAULT_CENTER);

  // Only render job markers that have valid coordinates
  const jobsWithCoords = jobs.filter(
    (j) => j.latitude != null && j.longitude != null,
  );

  if (jobsWithCoords.length === 0 && !currentLocation) {
    return (
      <Card className="h-75 p-0 overflow-hidden flex items-center justify-center bg-muted/30">
        <p className="text-sm text-muted-foreground px-4 text-center">
          No jobs with location data yet. Job locations will appear here when available.
        </p>
      </Card>
    );
  }

  return (
    <div className="reveal-up">
      <Card className="h-112.5 p-0 overflow-hidden border-none surface-card-strong relative shadow-2xl">
        <Map
          ref={mapRef}
          center={[center.lng, center.lat]}
          zoom={13}
          styles={{
            light: "https://tiles.openfreemap.org/styles/liberty",
            dark: "https://tiles.openfreemap.org/styles/liberty",
          }}
        >
          <MapControls position="bottom-right" showZoom showLocate />

          {/* Glassmorphism Status Overlay */}
          <div className="absolute top-4 left-4 z-10 p-3 bg-background/60 backdrop-blur-md rounded-2xl border border-white/20 shadow-xl pointer-events-none">
             <div className="flex items-center gap-2">
                 <div className="size-2 rounded-full bg-green-500 animate-pulse" />
                 <span className="text-xs font-black uppercase tracking-widest text-foreground/80">
                   Service Radar Active
                </span>
             </div>
          </div>

          {/* 🛣️ Route Layers for available jobs */}
          {Object.entries(routes).map(([bookingId, route]) => (
            <MapRoute 
              key={`route-${bookingId}`}
              id={bookingId}
              coordinates={route.coordinates}
              color="#f97316"
              width={5}
              opacity={0.6}
              interactive={false}
            />
          ))}

          {/* Helper's own live location */}
          {currentLocation && (
            <MapMarker
              longitude={currentLocation.lng}
              latitude={currentLocation.lat}
            >
              <MarkerContent>
                <div className="relative group cursor-pointer">
                  <div className="absolute -inset-4 bg-primary/20 rounded-full animate-ping group-hover:bg-primary/30" />
                  <div className="size-8 rounded-full bg-primary border-4 border-white shadow-2xl flex items-center justify-center relative z-10 transition-transform hover:scale-125">
                    <Navigation2 className="size-4 text-white fill-white" />
                  </div>
                </div>
              </MarkerContent>
              <MarkerTooltip>You are here</MarkerTooltip>
            </MapMarker>
          )}

          {/* Job location markers */}
          {jobsWithCoords.map((job) => (
            <MapMarker
              key={job.bookingId}
              longitude={job.longitude!}
              latitude={job.latitude!}
            >
              <MarkerContent>
                <div className="relative flex flex-col items-center group cursor-pointer">
                  <div className="size-10 rounded-2xl bg-orange-500 border-4 border-white shadow-2xl flex items-center justify-center transition-all hover:scale-125 hover:-translate-y-2">
                    <MapPin className="size-5 text-white fill-white" />
                  </div>
                  <div className="mt-2 text-xs font-black text-white bg-orange-600 rounded-lg px-2 py-0.5 shadow-lg group-hover:bg-orange-700 transition-colors uppercase tracking-tight">
                    ₹{job.quotedAmount.toLocaleString("en-IN")}
                  </div>
                </div>
              </MarkerContent>
              <MarkerTooltip>
                <div className="p-1 space-y-1">
                  <p className="font-black text-sm text-primary uppercase">
                    {CATEGORY_LABELS[job.categoryId] ?? job.categoryId}
                  </p>
                  <p className="text-xs text-muted-foreground font-medium">{job.addressLine}</p>
                  {routes[job.bookingId] && (
                    <div className="pt-2 mt-2 border-t border-border/30 flex items-center gap-4">
                      <div className="flex flex-col">
                         <span className="text-[8px] font-bold text-muted-foreground uppercase">Time</span>
                         <span className="text-xs font-black">{Math.round(routes[job.bookingId].duration / 60)}m</span>
                      </div>
                      <div className="flex flex-col">
                         <span className="text-[8px] font-bold text-muted-foreground uppercase">Distance</span>
                         <span className="text-xs font-black">{(routes[job.bookingId].distance / 1000).toFixed(1)}km</span>
                      </div>
                    </div>
                  )}
                </div>
              </MarkerTooltip>
            </MapMarker>
          ))}
        </Map>
      </Card>
    </div>
  );
}

const CATEGORY_LABELS: Record<string, string> = {
  driver: "Driver",
  electrician: "Electrician",
  plumber: "Plumber",
  cleaner: "Cleaner",
  chef: "Chef",
  delivery_helper: "Delivery",
  caretaker: "Caretaker",
  security_guard: "Security",
  other: "Other",
};
