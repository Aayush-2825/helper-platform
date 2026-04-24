import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";

vi.mock("@/lib/integrations/google-calendar", () => {
  return {
    normalizeCalendarId: (value: string) => value,
    getCalendarBusyIntervals: vi.fn(async () => []),
    createGoogleMeetEvent: vi.fn(),
    updateGoogleEventTime: vi.fn(),
    deleteGoogleEvent: vi.fn(),
  };
});

import { getCalendarBusyIntervals } from "@/lib/integrations/google-calendar";
import { getVideoKycAvailableSlots } from "@/lib/kyc/video-kyc";

describe("video kyc slots", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.useFakeTimers();
    process.env = { ...originalEnv };
    process.env.GOOGLE_KYC_CALENDAR_ID = "test-calendar";
    process.env.VIDEO_KYC_TIMEZONE = "UTC";
    process.env.VIDEO_KYC_TIMEZONE_OFFSET = "+00:00";
    process.env.VIDEO_KYC_START_HOUR_LOCAL = "10";
    process.env.VIDEO_KYC_END_HOUR_LOCAL = "11";
    process.env.VIDEO_KYC_SLOT_INTERVAL_MINUTES = "15";
    process.env.VIDEO_KYC_DURATION_MINUTES = "20";
    process.env.VIDEO_KYC_MIN_LEAD_MINUTES = "0";
    process.env.VIDEO_KYC_DAYS_AHEAD = "1";
  });

  afterEach(() => {
    vi.useRealTimers();
    process.env = originalEnv;
    vi.clearAllMocks();
  });

  it("generates slots within the configured hours", async () => {
    vi.setSystemTime(new Date("2026-04-24T00:00:00.000Z"));

    const slots = await getVideoKycAvailableSlots({ daysAhead: 1 });

    expect(slots.length).toBeGreaterThan(0);
    expect(
      slots.every((slot) => {
        const startsAt = new Date(slot.startsAtIso);
        const endsAt = new Date(slot.endsAtIso);
        return (
          startsAt.toISOString().startsWith("2026-04-24T10:") &&
          endsAt.toISOString().startsWith("2026-04-24T10:")
        );
      }),
    ).toBe(true);
  });

  it("filters slots overlapping busy intervals", async () => {
    vi.setSystemTime(new Date("2026-04-24T00:00:00.000Z"));

    (getCalendarBusyIntervals as unknown as ReturnType<typeof vi.fn>).mockResolvedValueOnce([
      { start: new Date("2026-04-24T10:00:00.000Z"), end: new Date("2026-04-24T10:30:00.000Z") },
    ]);

    const slots = await getVideoKycAvailableSlots({ daysAhead: 1 });

    expect(slots.some((slot) => slot.startsAtIso === "2026-04-24T10:00:00.000Z")).toBe(false);
    expect(slots.some((slot) => slot.startsAtIso === "2026-04-24T10:15:00.000Z")).toBe(false);
  });
});
