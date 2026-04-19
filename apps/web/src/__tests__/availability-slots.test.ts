import { describe, expect, it } from "vitest";

import {
  hasAnyMatchingAvailabilitySlot,
  isTimeWithinAvailabilitySlot,
} from "../lib/helper/availability-slots";

describe("availability slot matching", () => {
  it("matches a same-day slot in UTC", () => {
    const scheduledFor = new Date("2026-04-20T09:30:00.000Z"); // Monday

    const matches = isTimeWithinAvailabilitySlot(scheduledFor, {
      dayOfWeek: 1,
      startMinute: 9 * 60,
      endMinute: 10 * 60,
      timezone: "UTC",
      isActive: true,
    });

    expect(matches).toBe(true);
  });

  it("matches overnight slot into next day", () => {
    const scheduledFor = new Date("2026-04-21T01:00:00.000Z"); // Tuesday 01:00 UTC

    const matches = isTimeWithinAvailabilitySlot(scheduledFor, {
      dayOfWeek: 1,
      startMinute: 22 * 60,
      endMinute: 2 * 60,
      timezone: "UTC",
      isActive: true,
    });

    expect(matches).toBe(true);
  });

  it("ignores inactive slots", () => {
    const scheduledFor = new Date("2026-04-20T09:30:00.000Z");

    const matches = isTimeWithinAvailabilitySlot(scheduledFor, {
      dayOfWeek: 1,
      startMinute: 9 * 60,
      endMinute: 10 * 60,
      timezone: "UTC",
      isActive: false,
    });

    expect(matches).toBe(false);
  });

  it("finds a match when any slot is valid", () => {
    const scheduledFor = new Date("2026-04-20T14:30:00.000Z");

    const matches = hasAnyMatchingAvailabilitySlot(scheduledFor, [
      {
        dayOfWeek: 1,
        startMinute: 8 * 60,
        endMinute: 9 * 60,
        timezone: "UTC",
        isActive: true,
      },
      {
        dayOfWeek: 1,
        startMinute: 14 * 60,
        endMinute: 15 * 60,
        timezone: "UTC",
        isActive: true,
      },
    ]);

    expect(matches).toBe(true);
  });
});
