import { test, expect } from "@playwright/test";

test.describe("Production Environment Verification & Flow Audit", () => {
  test("Security Headers & CSP Verification", async ({ request }) => {
    const response = await request.get("/");
    expect(response.status()).toBe(200);

    const headers = response.headers();
    expect(headers["x-frame-options"]).toBe("DENY");
    expect(headers["x-content-type-options"]).toBe("nosniff");
    expect(headers["strict-transport-security"]).toContain("max-age=31536000");

    const csp = headers["content-security-policy"];
    expect(csp).toBeTruthy();
    expect(csp).toContain("https://tiles.openfreemap.org");
    expect(csp).toContain("https://lh3.googleusercontent.com");

    const permPolicy = headers["permissions-policy"];
    expect(permPolicy).toBeTruthy();
    expect(permPolicy).toContain("camera=(self)");
    expect(permPolicy).toContain("microphone=(self)");
  });

  test("Marketing & Public Pages Sanity", async ({ page }) => {
    // Landing Page
    await page.goto("/");
    await expect(page).toHaveTitle(/Dozo|Helper/i);
    await expect(page.locator("body")).not.toBeEmpty();

    // Legal / Static Pages
    for (const path of ["/about", "/terms", "/privacy", "/help"]) {
      const response = await page.goto(path);
      expect(response?.status()).toBe(200);
      await expect(page.locator("h1, h2").first()).toBeVisible();
    }
  });

  test("Next.js 16 Proxy Gate (Protected Routes Redirect to Auth)", async ({ page }) => {
    const protectedRoutes = ["/customer", "/helper", "/admin", "/dashboard"];

    for (const route of protectedRoutes) {
      await page.goto(route);
      await expect(page).toHaveURL(new RegExp(`/auth/signin\\?redirect=.*`));
    }
  });

  test("Authentication Pages Functionality", async ({ page }) => {
    // Sign In page
    await page.goto("/auth/signin");
    await expect(page.locator("input[type='email'], input[name='email']").first()).toBeVisible();
    await expect(page.locator("input[type='password'], input[name='password']").first()).toBeVisible();

    // Sign Up page
    await page.goto("/auth/signup");
    await expect(page.locator("input[type='email'], input[name='email']").first()).toBeVisible();

    // Forgot password page
    await page.goto("/auth/forgot-password");
    await expect(page.locator("input[type='email'], input[name='email']").first()).toBeVisible();
  });

  test("API Security: Unauthenticated Access Rejected Across Protected Endpoints", async ({ request }) => {
    const endpoints = [
      { method: "get", path: "/api/bookings" },
      { method: "get", path: "/api/disputes" },
      { method: "get", path: "/api/verifications" },
      { method: "get", path: "/api/admin/users" },
      { method: "get", path: "/api/admin/payouts" },
      { method: "get", path: "/api/helpers/video-kyc/slots" },
      { method: "post", path: "/api/bookings" },
      { method: "post", path: "/api/disputes" },
      { method: "post", path: "/api/reviews" },
    ];

    for (const endpoint of endpoints) {
      const res = endpoint.method === "get"
        ? await request.get(endpoint.path)
        : await request.post(endpoint.path, { data: {} });

      // Must be 401 Unauthorized or 403 Forbidden
      expect([401, 403]).toContain(res.status());
    }
  });

  test("Map Geocoding & OpenStreetMap Connectivity", async ({ request }) => {
    const geoResponse = await request.get(
      "https://nominatim.openstreetmap.org/search?q=Bengaluru&format=json&limit=1&countrycodes=in",
      {
        headers: { "User-Agent": "DozoPlatformE2ETest/1.0" }
      }
    );
    expect(geoResponse.status()).toBe(200);
    const data = await geoResponse.json();
    expect(Array.isArray(data)).toBe(true);
    expect(data.length).toBeGreaterThan(0);
    expect(data[0]).toHaveProperty("lat");
    expect(data[0]).toHaveProperty("lon");
  });

  test("HTTP Concurrency Stress: 50 Parallel Booking Endpoint Requests", async ({ request }) => {
    const start = Date.now();
    const requests = Array.from({ length: 50 }, (_, i) =>
      request.post("/api/bookings", {
        data: {
          categoryID: "cleaner",
          addressLine: `Stress Address ${i}`,
          city: "Delhi",
          quotedAmount: 500,
        },
      })
    );

    const responses = await Promise.all(requests);
    const duration = Date.now() - start;

    expect(responses).toHaveLength(50);
    // All 50 unauthorized requests must be cleanly and securely rejected with 401 Unauthorized
    for (const res of responses) {
      expect(res.status()).toBe(401);
    }
    // High performance: 50 concurrent requests handled swiftly
    expect(duration).toBeLessThan(10000);
  });

  test("Free Project OSRM Turn-by-Turn Road Routing Engine", async ({ request }) => {
    // Connaught Place (77.2167, 28.6315) to India Gate (77.2295, 28.6129)
    const osrmResponse = await request.get(
      "https://router.project-osrm.org/route/v1/driving/77.2167,28.6315;77.2295,28.6129?overview=full&geometries=geojson"
    );
    expect(osrmResponse.status()).toBe(200);
    const routeData = await osrmResponse.json();
    expect(routeData.code).toBe("Ok");
    expect(Array.isArray(routeData.routes)).toBe(true);
    expect(routeData.routes.length).toBeGreaterThan(0);

    const primaryRoute = routeData.routes[0];
    expect(primaryRoute.distance).toBeGreaterThan(2000); // ~2.5km road distance
    expect(primaryRoute.duration).toBeGreaterThan(120); // > 2 mins driving
    expect(primaryRoute.geometry.type).toBe("LineString");
    expect(primaryRoute.geometry.coordinates.length).toBeGreaterThan(10);
  });

  test("Free Vector Tile Infrastructure (OpenFreeMap & CartoCDN)", async ({ request }) => {
    const ofmStyleRes = await request.get("https://tiles.openfreemap.org/styles/liberty");
    expect(ofmStyleRes.status()).toBe(200);
    const ofmStyle = await ofmStyleRes.json();
    expect(ofmStyle.version).toBe(8);

    const cartoStyleRes = await request.get("https://basemaps.cartocdn.com/gl/positron-gl-style/style.json");
    expect(cartoStyleRes.status()).toBe(200);
    const cartoStyle = await cartoStyleRes.json();
    expect(cartoStyle.version).toBe(8);
  });
});
