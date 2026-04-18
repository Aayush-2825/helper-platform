type LngLat = {
  lng: number;
  lat: number;
};

export type OsrmRoute = {
  coordinates: [number, number][];
  distance: number;
  duration: number;
};

export type RouteSource = "osrm" | "fallback";

export type RouteResult = OsrmRoute & {
  source: RouteSource;
};

type FetchRouteOptions = {
  from: LngLat;
  to: LngLat;
  signal?: AbortSignal;
  alternatives?: number;
};

const DEFAULT_OSRM_BASE_URL = "https://router.project-osrm.org";
const ROUTE_TIMEOUT_MS = 8000;
const MAX_RETRIES = 2;
let hasWarnedAboutDefaultBaseUrl = false;

type OsrmRouteResponse = {
  code?: string;
  message?: string;
  routes?: Array<{
    distance?: number;
    duration?: number;
    geometry?: {
      coordinates?: [number, number][];
    };
  }>;
};

type OsrmRoutePayload = NonNullable<OsrmRouteResponse["routes"]>[number];

function isFiniteCoordinate(value: number, min: number, max: number) {
  return Number.isFinite(value) && value >= min && value <= max;
}

function isValidLngLat(point: LngLat) {
  return (
    isFiniteCoordinate(point.lng, -180, 180) &&
    isFiniteCoordinate(point.lat, -90, 90)
  );
}

function getOsrmBaseUrl() {
  const configured = process.env.NEXT_PUBLIC_OSRM_BASE_URL?.trim();
  if (!configured) {
    if (process.env.NODE_ENV === "production" && !hasWarnedAboutDefaultBaseUrl) {
      hasWarnedAboutDefaultBaseUrl = true;
      console.warn(
        "[OSRM] NEXT_PUBLIC_OSRM_BASE_URL is not set. Using public OSRM endpoint; configure your own OSRM backend for production SLA.",
      );
    }
    return DEFAULT_OSRM_BASE_URL;
  }

  return configured.endsWith("/") ? configured.slice(0, -1) : configured;
}

function buildRouteUrl(from: LngLat, to: LngLat, alternatives = 1) {
  const coords = `${from.lng},${from.lat};${to.lng},${to.lat}`;
  const url = new URL(`/route/v1/driving/${coords}`, getOsrmBaseUrl());

  // Keep payload compact while retaining enough data for ETA and polyline rendering.
  url.searchParams.set("overview", "full");
  url.searchParams.set("geometries", "geojson");
  url.searchParams.set("steps", "false");
  url.searchParams.set("annotations", "false");
  url.searchParams.set("alternatives", String(alternatives));

  return url;
}

function mergeSignals(signal: AbortSignal | undefined, timeoutMs: number) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  const onAbort = () => controller.abort();
  if (signal) {
    if (signal.aborted) {
      controller.abort();
    } else {
      signal.addEventListener("abort", onAbort);
    }
  }

  return {
    signal: controller.signal,
    cleanup: () => {
      clearTimeout(timeout);
      if (signal) {
        signal.removeEventListener("abort", onAbort);
      }
    },
  };
}

function shouldRetryStatus(status: number) {
  return status === 408 || status === 425 || status === 429 || status >= 500;
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function normalizeRoute(route: OsrmRoutePayload): OsrmRoute | null {
  const distance = Number(route.distance);
  const duration = Number(route.duration);
  const coordinates = route.geometry?.coordinates;

  if (!Number.isFinite(distance) || !Number.isFinite(duration) || !Array.isArray(coordinates) || coordinates.length < 2) {
    return null;
  }

  return {
    distance,
    duration,
    coordinates,
  };
}

function toRadians(value: number) {
  return (value * Math.PI) / 180;
}

function haversineDistanceMeters(from: LngLat, to: LngLat) {
  const earthRadiusMeters = 6371000;
  const latDelta = toRadians(to.lat - from.lat);
  const lngDelta = toRadians(to.lng - from.lng);
  const a =
    Math.sin(latDelta / 2) * Math.sin(latDelta / 2) +
    Math.cos(toRadians(from.lat)) * Math.cos(toRadians(to.lat)) *
      Math.sin(lngDelta / 2) * Math.sin(lngDelta / 2);
  return 2 * earthRadiusMeters * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function createFallbackRoute(from: LngLat, to: LngLat): RouteResult {
  const distance = haversineDistanceMeters(from, to);
  const averageUrbanSpeedMetersPerSecond = 35_000 / 3600;
  const duration = Math.max(60, distance / averageUrbanSpeedMetersPerSecond);

  return {
    source: "fallback",
    distance,
    duration,
    coordinates: [
      [from.lng, from.lat],
      [to.lng, to.lat],
    ],
  };
}

export async function fetchOsrmRoute({ from, to, signal, alternatives = 1 }: FetchRouteOptions): Promise<RouteResult | null> {
  if (!isValidLngLat(from) || !isValidLngLat(to)) {
    return null;
  }

  const url = buildRouteUrl(from, to, alternatives);
  let attempt = 0;

  while (attempt <= MAX_RETRIES) {
    const merged = mergeSignals(signal, ROUTE_TIMEOUT_MS);

    try {
      const response = await fetch(url.toString(), {
        method: "GET",
        signal: merged.signal,
        headers: {
          Accept: "application/json",
        },
      });

      if (!response.ok) {
        if (attempt < MAX_RETRIES && shouldRetryStatus(response.status)) {
          attempt += 1;
          await sleep(250 * attempt);
          continue;
        }

        return null;
      }

      const payload = (await response.json()) as OsrmRouteResponse;

      if (payload.code === "NoRoute") {
        return createFallbackRoute(from, to);
      }

      if (payload.code !== "Ok") {
        if (attempt < MAX_RETRIES) {
          attempt += 1;
          await sleep(250 * attempt);
          continue;
        }

        return createFallbackRoute(from, to);
      }

      const route = payload.routes?.[0];
      if (!route) {
        return null;
      }

      const normalized = normalizeRoute(route);
      return normalized ? { ...normalized, source: "osrm" } : createFallbackRoute(from, to);
    } catch {
      if (attempt < MAX_RETRIES) {
        attempt += 1;
        await sleep(250 * attempt);
        continue;
      }

      return createFallbackRoute(from, to);
    } finally {
      merged.cleanup();
    }
  }

  return createFallbackRoute(from, to);
}
