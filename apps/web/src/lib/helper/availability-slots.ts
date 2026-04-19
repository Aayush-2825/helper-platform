type SlotLike = {
  dayOfWeek: number;
  startMinute: number;
  endMinute: number;
  timezone?: string | null;
  isActive?: boolean;
};

const WEEKDAY_INDEX: Record<string, number> = {
  sun: 0,
  mon: 1,
  tue: 2,
  wed: 3,
  thu: 4,
  fri: 5,
  sat: 6,
};

function normalizeTimezone(timezone?: string | null) {
  return timezone && timezone.trim().length > 0 ? timezone : "Asia/Kolkata";
}

function getLocalWeekdayAndMinute(date: Date, timezone: string) {
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone: timezone,
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  });

  const parts = formatter.formatToParts(date);
  const weekdayToken = parts.find((part) => part.type === "weekday")?.value.toLowerCase() ?? "";
  const hourToken = Number(parts.find((part) => part.type === "hour")?.value ?? "NaN");
  const minuteToken = Number(parts.find((part) => part.type === "minute")?.value ?? "NaN");

  const weekday = WEEKDAY_INDEX[weekdayToken.slice(0, 3)];
  const minuteOfDay = hourToken * 60 + minuteToken;

  return {
    weekday,
    minuteOfDay,
    valid: Number.isFinite(weekday) && Number.isFinite(hourToken) && Number.isFinite(minuteToken),
  };
}

function isMinuteWithinRange(minuteOfDay: number, startMinute: number, endMinute: number) {
  if (startMinute === endMinute) return false;

  if (startMinute < endMinute) {
    return minuteOfDay >= startMinute && minuteOfDay < endMinute;
  }

  return minuteOfDay >= startMinute;
}

export function isTimeWithinAvailabilitySlot(scheduledFor: Date, slot: SlotLike) {
  if (slot.isActive === false) return false;

  const timezone = normalizeTimezone(slot.timezone);
  const local = getLocalWeekdayAndMinute(scheduledFor, timezone);

  if (!local.valid) return false;
  if (slot.startMinute < slot.endMinute) {
    if (local.weekday !== slot.dayOfWeek) return false;
    return isMinuteWithinRange(local.minuteOfDay, slot.startMinute, slot.endMinute);
  }

  const nextDay = (slot.dayOfWeek + 1) % 7;

  if (local.weekday === slot.dayOfWeek) {
    return local.minuteOfDay >= slot.startMinute;
  }

  if (local.weekday === nextDay) {
    return local.minuteOfDay < slot.endMinute;
  }

  return false;
}

export function hasAnyMatchingAvailabilitySlot(scheduledFor: Date, slots: SlotLike[]) {
  return slots.some((slot) => isTimeWithinAvailabilitySlot(scheduledFor, slot));
}
