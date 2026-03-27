/**
 * Bug Condition Exploration Tests — Property 1
 *
 * These tests ENCODE THE EXPECTED BEHAVIOR and are EXPECTED TO FAIL on unfixed code.
 * Failure confirms the bug exists. DO NOT fix the code when these tests fail.
 *
 * Bug: publishBookingEvent, publishHelperPresence, publishLocationUpdate all use
 * fetch() (HTTP) instead of the open WebSocket connection.
 *
 * Validates: Requirements 1.1, 1.2, 1.3, 1.5, 1.6
 */

import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock the wsManager module (does not exist yet — part of the fix)
vi.mock("../wsManager", () => ({
  wsSend: vi.fn(),
}));

import { publishBookingEvent, publishHelperPresence, publishLocationUpdate } from "../client";
import * as wsManager from "../wsManager";

describe("Bug Condition — Outbound Events Use HTTP Instead of WebSocket", () => {
  let wsSendMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.clearAllMocks();
    // Mock fetch globally — it should NOT be called
    vi.stubGlobal("fetch", vi.fn());
    wsSendMock = vi.mocked(wsManager.wsSend);
  });

  /**
   * Test 1: publishBookingEvent with eventType "created" should send booking_request over WS
   *
   * Validates: Requirement 1.1 (bug), 2.1 (expected fix)
   * EXPECTED TO FAIL on unfixed code — fetch is called instead of wsSend
   */
  it("Test 1: publishBookingEvent(created) calls wsSend with { type: 'booking_request' } and does NOT call fetch", async () => {
    await publishBookingEvent({
      bookingId: "b1",
      customerId: "u1",
      helperId: "h1",
      eventType: "created",
    });

    // Assert wsSend was called with the correct type
    expect(wsSendMock).toHaveBeenCalledWith(
      expect.objectContaining({ type: "booking_request" }),
    );

    // Assert fetch was NOT called
    expect(fetch).not.toHaveBeenCalled();
  });

  /**
   * Test 2: publishBookingEvent with eventType "accepted" should send booking_update over WS
   *
   * Validates: Requirement 1.1 (bug), 2.1 (expected fix)
   * EXPECTED TO FAIL on unfixed code — fetch is called instead of wsSend
   */
  it("Test 2: publishBookingEvent(accepted) calls wsSend with { type: 'booking_update' } and does NOT call fetch", async () => {
    await publishBookingEvent({
      bookingId: "b1",
      customerId: "u1",
      helperId: "h1",
      eventType: "accepted",
    });

    expect(wsSendMock).toHaveBeenCalledWith(
      expect.objectContaining({ type: "booking_update" }),
    );

    expect(fetch).not.toHaveBeenCalled();
  });

  /**
   * Test 3: publishHelperPresence should send helper_presence over WS
   *
   * Validates: Requirement 1.2 (bug), 2.2 (expected fix)
   * EXPECTED TO FAIL on unfixed code — fetch is called instead of wsSend
   */
  it("Test 3: publishHelperPresence calls wsSend with { type: 'helper_presence' } and does NOT call fetch", async () => {
    await publishHelperPresence({ helperUserId: "h1", status: "online" });

    expect(wsSendMock).toHaveBeenCalledWith(
      expect.objectContaining({ type: "helper_presence" }),
    );

    expect(fetch).not.toHaveBeenCalled();
  });

  /**
   * Test 4: publishLocationUpdate should send location_update over WS
   *
   * Validates: Requirement 1.3 (bug), 2.3 (expected fix)
   * EXPECTED TO FAIL on unfixed code — fetch is called instead of wsSend
   */
  it("Test 4: publishLocationUpdate calls wsSend with { type: 'location_update' } and does NOT call fetch", async () => {
    await publishLocationUpdate({
      helperUserId: "h1",
      bookingId: "b1",
      latitude: 12.9,
      longitude: 77.6,
    });

    expect(wsSendMock).toHaveBeenCalledWith(
      expect.objectContaining({ type: "location_update" }),
    );

    expect(fetch).not.toHaveBeenCalled();
  });
});
