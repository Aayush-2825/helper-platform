"use client";

import { useEffect, useRef } from "react";
import { publishLocationUpdate } from "@/lib/realtime/client";

/**
 * Continuously broadcasts the helper's GPS position via WebSocket
 * while they have at least one in-progress booking.
 *
 * @param helperUserId - the authenticated helper's user ID
 * @param activeBookingId - the booking ID to attach location updates to (first in_progress booking)
 * @param enabled - only watch when true (i.e. there is an active in_progress job)
 */
export function useHelperLocation(
  helperUserId: string | undefined,
  activeBookingId: string | undefined,
  enabled: boolean,
) {
  const watchIdRef = useRef<number | null>(null);

  useEffect(() => {
    if (!enabled || !helperUserId || !activeBookingId) {
      // Clear any existing watch when no longer needed
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
      return;
    }

    if (!navigator.geolocation) {
      console.warn("[useHelperLocation] Geolocation not supported");
      return;
    }

    watchIdRef.current = navigator.geolocation.watchPosition(
      (position) => {
        publishLocationUpdate({
          helperUserId,
          bookingId: activeBookingId,
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy ?? undefined,
          speed: position.coords.speed ?? undefined,
          heading: position.coords.heading ?? undefined,
        });
      },
      (err) => {
        console.warn("[useHelperLocation] Error:", err.message);
      },
      {
        enableHighAccuracy: true,
        maximumAge: 5000,
        timeout: 10000,
      },
    );

    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
    };
  }, [enabled, helperUserId, activeBookingId]);
}
