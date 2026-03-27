"use client";

import { useEffect, useRef, useState } from "react";
import { 
  Map, 
  MapControls, 
  MapMarker, 
  MarkerContent, 
  MarkerPopup,
  MapRoute
} from "@/components/ui/map";
import { Clock, MapPin, Navigation, Route } from "lucide-react";
import type MapLibreGL from "maplibre-gl";
import { useRealtimeEvents } from "@/hooks/use-realtime-events";
import { cn } from "@/lib/utils";

interface TrackingMapProps {
  bookingId: string;
  customerLocation: { lat: number; lng: number };
  helperId?: string;
}

export function TrackingMap({ bookingId, customerLocation, helperId }: TrackingMapProps) {
  const [helperLocation, setHelperLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [routeInfo, setRouteInfo] = useState<{ 
    coordinates: [number, number][],
    duration: number,
    distance: number
  } | null>(null);
  const mapRef = useRef<MapLibreGL.Map | null>(null);

  // 📡 Listen for live location updates from the helper
  const { eventMessages } = useRealtimeEvents({
    eventTypes: ["location_update", "helper_presence"],
  });

  useEffect(() => {
    if (!eventMessages.length) return;
    for (const msg of eventMessages) {
      if (msg.type === "event" && msg.event === "location_update") {
        const d = msg.data as any;
        if (d.bookingId === bookingId && d.latitude && d.longitude) {
          setHelperLocation({ lat: parseFloat(d.latitude), lng: parseFloat(d.longitude) });
        }
      } else if (msg.type === "event" && msg.event === "helper_presence") {
          const d = msg.data as any;
          if (d.helperUserId === helperId && d.latitude && d.longitude) {
              setHelperLocation({ lat: parseFloat(d.latitude), lng: parseFloat(d.longitude) });
          }
      }
    }
  }, [eventMessages, bookingId, helperId]);

  // 🛣️ Fetch OSRM route when helper location changes
  useEffect(() => {
    if (!helperLocation) return;

    const fetchRoute = async () => {
      try {
        const url = `https://router.project-osrm.org/route/v1/driving/${helperLocation.lng},${helperLocation.lat};${customerLocation.lng},${customerLocation.lat}?overview=full&geometries=geojson`;
        const res = await fetch(url);
        if (res.ok) {
          const data = await res.json();
          if (data.routes && data.routes[0]) {
            setRouteInfo({
              coordinates: data.routes[0].geometry.coordinates,
              duration: data.routes[0].duration,
              distance: data.routes[0].distance
            });
          }
        }
      } catch (err) {
        console.error("OSRM Route fetching failed:", err);
      }
    };
    fetchRoute();
  }, [helperLocation?.lat, helperLocation?.lng, customerLocation.lat, customerLocation.lng]);

  // Handle zooming to fit both points
  useEffect(() => {
      if (mapRef.current && helperLocation) {
          const bounds = [
              [Math.min(helperLocation.lng, customerLocation.lng), Math.min(helperLocation.lat, customerLocation.lat)],
              [Math.max(helperLocation.lng, customerLocation.lng), Math.max(helperLocation.lat, customerLocation.lat)]
          ];
          mapRef.current.fitBounds(bounds as any, { padding: 50, duration: 1000 });
      }
  }, [helperLocation, customerLocation]);

  return (
    <div className="h-[300px] w-full bg-muted rounded-lg overflow-hidden border mt-2">
      <Map
        ref={mapRef}
        center={[customerLocation.lng, customerLocation.lat]}
        zoom={13}
      >
        <MapControls position="bottom-right" showZoom showLocate />

        {/* 🛣️ Declarative Route Layer */}
        {routeInfo && (
          <MapRoute 
            id={bookingId}
            coordinates={routeInfo.coordinates}
            color="#3b82f6"
            width={5}
            opacity={0.8}
          />
        )}

        {/* 🎯 Service Location (Customer) */}
        <MapMarker longitude={customerLocation.lng} latitude={customerLocation.lat}>
          <MarkerContent>
            <div className="bg-primary rounded-full p-2 border-2 border-white shadow-lg">
              <MapPin className="size-4 text-white" />
            </div>
          </MarkerContent>
          <MarkerPopup>
            <p className="text-xs font-semibold">Service Location</p>
          </MarkerPopup>
        </MapMarker>

        {/* 👤 Helper Location */}
        {helperLocation && (
          <MapMarker longitude={helperLocation.lng} latitude={helperLocation.lat}>
            <MarkerContent>
              <div className="bg-green-500 rounded-full p-2 border-2 border-white shadow-lg">
                <Navigation className="size-4 text-white fill-white" />
              </div>
            </MarkerContent>
            <MarkerPopup>
              <p className="text-xs font-semibold">Helper is approaching</p>
            </MarkerPopup>
          </MapMarker>
        )}
      </Map>

      {/* Arrival Estimates Floating UI */}
      {routeInfo && (
        <div className="absolute top-2 left-2 flex flex-col gap-1.5 pointer-events-none">
          <div className="bg-background/90 backdrop-blur-sm border rounded-lg px-3 py-2 shadow-lg flex items-center gap-3 animate-in fade-in slide-in-from-left-2">
            <div className="flex flex-col">
              <span className="text-[10px] uppercase font-bold text-muted-foreground leading-none tracking-tight">Est. Arrival</span>
              <div className="flex items-center gap-1 mt-0.5">
                <Clock className="size-3.5 text-primary" />
                <span className="text-sm font-bold">{Math.round(routeInfo.duration / 60)} min</span>
              </div>
            </div>
            <div className="w-px h-6 bg-border" />
            <div className="flex flex-col">
              <span className="text-[10px] uppercase font-bold text-muted-foreground leading-none tracking-tight">Distance</span>
              <div className="flex items-center gap-1 mt-0.5">
                <Route className="size-3.5 text-primary" />
                <span className="text-sm font-bold">{(routeInfo.distance / 1000).toFixed(1)} km</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
