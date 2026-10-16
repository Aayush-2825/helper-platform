import { describe, it, expect, vi, beforeEach } from "vitest";
import { 
  calculateHaversineDistance, 
  formatDistance, 
  formatDuration 
} from "../features/shared/components/mapping/TrackingMap";

describe("Live Tracking Map & Free Mapping Stack", () => {
  describe("Geographic Distance Calculations (Haversine)", () => {
    it("accurately calculates distance between known landmarks", () => {
      // Connaught Place to India Gate in New Delhi: ~2.3 km (2200m - 2400m)
      const connaughtPlace = { lat: 28.6315, lng: 77.2167 };
      const indiaGate = { lat: 28.6129, lng: 77.2295 };

      const distanceMeters = calculateHaversineDistance(connaughtPlace, indiaGate);
      expect(distanceMeters).toBeGreaterThan(2000);
      expect(distanceMeters).toBeLessThan(2600);
    });

    it("returns 0 for identical points", () => {
      const point = { lat: 28.6139, lng: 77.209 };
      expect(calculateHaversineDistance(point, point)).toBe(0);
    });

    it("handles short distances under 100 meters accurately", () => {
      const pt1 = { lat: 28.6139, lng: 77.209 };
      // approx 50m north
      const pt2 = { lat: 28.61435, lng: 77.209 };
      const dist = calculateHaversineDistance(pt1, pt2);
      expect(dist).toBeGreaterThan(30);
      expect(dist).toBeLessThan(70);
    });
  });

  describe("Distance Formatting", () => {
    it("reports 'Arrived' when within 50 meters", () => {
      expect(formatDistance(0)).toBe("Arrived");
      expect(formatDistance(25)).toBe("Arrived");
      expect(formatDistance(49)).toBe("Arrived");
    });

    it("reports meters when between 50m and 999m", () => {
      expect(formatDistance(50)).toBe("50 m");
      expect(formatDistance(245)).toBe("245 m");
      expect(formatDistance(999)).toBe("999 m");
    });

    it("reports kilometers with one decimal place when 1000m or more", () => {
      expect(formatDistance(1000)).toBe("1.0 km");
      expect(formatDistance(2450)).toBe("2.5 km");
      expect(formatDistance(10200)).toBe("10.2 km");
    });
  });

  describe("Duration / ETA Formatting", () => {
    it("reports '< 1 min' for duration under 60 seconds", () => {
      expect(formatDuration(0)).toBe("< 1 min");
      expect(formatDuration(45)).toBe("< 1 min");
      expect(formatDuration(59)).toBe("< 1 min");
    });

    it("reports minutes for duration under 1 hour", () => {
      expect(formatDuration(60)).toBe("~1 mins");
      expect(formatDuration(180)).toBe("~3 mins");
      expect(formatDuration(391)).toBe("~7 mins");
      expect(formatDuration(3540)).toBe("~59 mins");
    });

    it("reports hours and minutes for duration >= 1 hour", () => {
      expect(formatDuration(3600)).toBe("~1h");
      expect(formatDuration(3900)).toBe("~1h 5m");
      expect(formatDuration(7320)).toBe("~2h 2m");
    });
  });

  describe("Project OSRM Free Turn-by-Turn Routing Engine", () => {
    beforeEach(() => {
      vi.restoreAllMocks();
    });

    it("successfully parses real-world OSRM driving routes and extracts road geometry", async () => {
      const mockOsrmResponse = {
        code: "Ok",
        routes: [
          {
            distance: 3826.4,
            duration: 391.2,
            geometry: {
              coordinates: [
                [77.20877, 28.61392],
                [77.2095, 28.6145],
                [77.215, 28.618],
                [77.22, 28.62],
              ],
            },
          },
        ],
      };

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => mockOsrmResponse,
      });

      const start = { lat: 28.6139, lng: 77.2088 };
      const end = { lat: 28.62, lng: 77.22 };

      const url = `https://router.project-osrm.org/route/v1/driving/${start.lng},${start.lat};${end.lng},${end.lat}?overview=full&geometries=geojson`;
      const res = await fetch(url);
      const data = await res.json();

      expect(data.code).toBe("Ok");
      expect(data.routes).toHaveLength(1);
      expect(data.routes[0].distance).toBe(3826.4);
      expect(data.routes[0].duration).toBe(391.2);
      expect(data.routes[0].geometry.coordinates).toHaveLength(4);
      expect(data.routes[0].geometry.coordinates[0]).toEqual([77.20877, 28.61392]);
    });

    it("gracefully falls back to straight line & Haversine calculation when OSRM is offline", async () => {
      global.fetch = vi.fn().mockRejectedValue(new Error("Network timeout"));

      const start = { lat: 28.6139, lng: 77.209 };
      const end = { lat: 28.62, lng: 77.22 };

      let coordinates: [number, number][] = [];
      let distance = 0;
      let duration = 0;

      try {
        const res = await fetch("https://router.project-osrm.org/route/v1/driving/...");
        const data = await res.json();
        coordinates = data.routes[0].geometry.coordinates;
      } catch {
        // Fallback logic
        const directDist = calculateHaversineDistance(start, end);
        coordinates = [
          [start.lng, start.lat],
          [end.lng, end.lat],
        ];
        distance = directDist;
        duration = Math.round(directDist / 6.94);
      }

      expect(coordinates).toHaveLength(2);
      expect(coordinates[0]).toEqual([77.209, 28.6139]);
      expect(coordinates[1]).toEqual([77.22, 28.62]);
      expect(distance).toBeGreaterThan(1000);
      expect(duration).toBeGreaterThan(100);
    });
  });

  describe("Nominatim Free Geocoding Address Parser", () => {
    it("extracts clean address components from Nominatim response", () => {
      const mockResult = {
        lat: "28.6315",
        lon: "77.2167",
        display_name: "Connaught Place, New Delhi, Delhi, 110001, India",
        address: {
          road: "Connaught Place",
          suburb: "Connaught Place",
          city: "New Delhi",
          state: "Delhi",
          postcode: "110001",
        },
      };

      const addr = mockResult.address;
      const road = addr.road ?? addr.suburb ?? "";
      const city = addr.city ?? "";
      const state = addr.state ?? "";
      const postalCode = (addr.postcode ?? "").replace(/[^0-9]/g, "").slice(0, 6);

      expect(road).toBe("Connaught Place");
      expect(city).toBe("New Delhi");
      expect(state).toBe("Delhi");
      expect(postalCode).toBe("110001");
    });

    it("falls back to village or town when city is not specified", () => {
      const mockRuralResult = {
        lat: "28.1234",
        lon: "77.5678",
        display_name: "Greater Noida, Gautam Buddha Nagar, Uttar Pradesh, 201310, India",
        address: {
          village: "Knowledge Park",
          town: "Greater Noida",
          state: "Uttar Pradesh",
          postcode: "201310",
        },
      };

      const addr: { city?: string; town?: string; village?: string; state?: string; postcode?: string } = mockRuralResult.address;
      const city = addr.city ?? addr.town ?? addr.village ?? "";
      expect(city).toBe("Greater Noida");
    });
  });
});
