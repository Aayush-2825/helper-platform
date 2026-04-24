import { and, desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { helperProfile, user, videoKycSession } from "@/db/schema";
import { enqueueHelperNotification } from "@/lib/notifications/helper-events";
import {
  createGoogleMeetEvent,
  deleteGoogleEvent,
  getCalendarBusyIntervals,
  normalizeCalendarId,
  updateGoogleEventTime,
} from "@/lib/integrations/google-calendar";

function addMinutes(date: Date, minutes: number) {
  const updated = new Date(date);
  updated.setMinutes(updated.getMinutes() + minutes);
  return updated;
}

function getAdminCalendarId(adminEmail: string) {
  const raw = process.env.KYC_ADMIN_CALENDAR_MAP;
  if (raw) {
    try {
      const normalized = raw.trim();
      const parsed = JSON.parse(
        (normalized.startsWith("'") && normalized.endsWith("'")) ||
          (normalized.startsWith("\"") && normalized.endsWith("\""))
          ? normalized.slice(1, -1)
          : normalized,
      ) as Record<string, string>;

      const mapped = parsed?.[adminEmail];
      if (mapped) {
        return normalizeCalendarId(mapped);
      }
    } catch (error) {
      console.warn(`Invalid KYC_ADMIN_CALENDAR_MAP JSON: ${(error as Error).message}`);
    }
  }

  const fallback = process.env.GOOGLE_KYC_CALENDAR_ID;
  if (!fallback) {
    return "primary";
  }

  return normalizeCalendarId(fallback);
}

function getSharedKycCalendarId() {
  const calendarId = process.env.GOOGLE_KYC_CALENDAR_ID;
  if (!calendarId) {
    return "primary";
  }
  return normalizeCalendarId(calendarId);
}

function getDefaultHostEmail() {
  const configured = process.env.VIDEO_KYC_HOST_EMAIL?.trim();
  if (configured) return configured;

  const raw = process.env.KYC_ADMIN_CALENDAR_MAP;
  if (!raw) return null;

  try {
    const normalized = raw.trim();
    const parsed = JSON.parse(
      (normalized.startsWith("'") && normalized.endsWith("'")) ||
        (normalized.startsWith("\"") && normalized.endsWith("\""))
        ? normalized.slice(1, -1)
        : normalized,
    ) as Record<string, string>;
    const email = Object.keys(parsed ?? {})[0];
    return email ? email.trim() : null;
  } catch {
    return null;
  }
}

function envInt(key: string, fallback: number) {
  const raw = process.env[key]?.trim();
  if (!raw) return fallback;
  const parsed = Number.parseInt(raw, 10);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function envString(key: string, fallback: string) {
  const raw = process.env[key]?.trim();
  return raw && raw.length > 0 ? raw : fallback;
}

function buildLocalIsoWithOffset(date: Date, hour: number, minute: number, offset: string) {
  const yyyy = date.getUTCFullYear();
  const mm = String(date.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(date.getUTCDate()).padStart(2, "0");
  const hh = String(hour).padStart(2, "0");
  const min = String(minute).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}T${hh}:${min}:00${offset}`;
}

function overlaps(a: { start: Date; end: Date }, b: { start: Date; end: Date }) {
  return a.start < b.end && b.start < a.end;
}

export type VideoKycSlot = {
  startsAt: Date;
  endsAt: Date;
  startsAtIso: string;
  endsAtIso: string;
  label: string;
};

export async function getVideoKycAvailableSlots(params?: { daysAhead?: number }) {
  const timezoneOffset = envString("VIDEO_KYC_TIMEZONE_OFFSET", "+05:30");
  const timeZone = envString("VIDEO_KYC_TIMEZONE", "Asia/Kolkata");
  const startHourLocal = envInt("VIDEO_KYC_START_HOUR_LOCAL", 10);
  const endHourLocal = envInt("VIDEO_KYC_END_HOUR_LOCAL", 18);
  const slotIntervalMinutes = envInt("VIDEO_KYC_SLOT_INTERVAL_MINUTES", 15);
  const durationMinutes = envInt("VIDEO_KYC_DURATION_MINUTES", 20);
  const minLeadMinutes = envInt("VIDEO_KYC_MIN_LEAD_MINUTES", 60);
  const daysAhead = params?.daysAhead ?? envInt("VIDEO_KYC_DAYS_AHEAD", 7);

  const calendarId = getSharedKycCalendarId();

  const now = new Date();
  const earliest = addMinutes(now, minLeadMinutes);
  const timeMin = earliest;
  const timeMax = addMinutes(timeMin, daysAhead * 24 * 60);

  const busyIntervals = await getCalendarBusyIntervals({
    calendarId,
    timeMin,
    timeMax,
  });

  const slots: VideoKycSlot[] = [];

  for (let dayOffset = 0; dayOffset < daysAhead; dayOffset += 1) {
    const day = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + dayOffset));

    for (
      let minuteOfDay = startHourLocal * 60;
      minuteOfDay + durationMinutes <= endHourLocal * 60;
      minuteOfDay += slotIntervalMinutes
    ) {
      const hour = Math.floor(minuteOfDay / 60);
      const minute = minuteOfDay % 60;

      const startsAt = new Date(buildLocalIsoWithOffset(day, hour, minute, timezoneOffset));
      const endsAt = addMinutes(startsAt, durationMinutes);

      if (Number.isNaN(startsAt.getTime()) || Number.isNaN(endsAt.getTime())) continue;
      if (startsAt < timeMin || endsAt > timeMax) continue;

      const candidate = { start: startsAt, end: endsAt };
      const isBusy = busyIntervals.some((busy) => overlaps(candidate, busy));
      if (isBusy) continue;

      const label = new Intl.DateTimeFormat("en-IN", {
        dateStyle: "medium",
        timeStyle: "short",
        timeZone,
      }).format(startsAt);

      slots.push({
        startsAt,
        endsAt,
        startsAtIso: startsAt.toISOString(),
        endsAtIso: endsAt.toISOString(),
        label,
      });
    }
  }

  return slots;
}

async function getHelperProfileById(helperProfileId: string) {
  return db.query.helperProfile.findFirst({
    where: eq(helperProfile.id, helperProfileId),
    columns: {
      id: true,
      userId: true,
      verificationStatus: true,
      videoKycStatus: true,
    },
    with: {
      user: {
        columns: {
          name: true,
          email: true,
        },
      },
    },
  });
}

async function getHelperProfileByUserId(helperUserId: string) {
  return db.query.helperProfile.findFirst({
    where: eq(helperProfile.userId, helperUserId),
    columns: {
      id: true,
      userId: true,
      verificationStatus: true,
      videoKycStatus: true,
    },
    with: {
      user: {
        columns: {
          name: true,
          email: true,
        },
      },
    },
  });
}

async function computeNextAttempt(helperProfileId: string) {
  const latestSession = await db.query.videoKycSession.findFirst({
    where: eq(videoKycSession.helperProfileId, helperProfileId),
    orderBy: desc(videoKycSession.createdAt),
    columns: {
      status: true,
      attemptNumber: true,
    },
  });

  if (latestSession?.status === "scheduled") {
    throw new Error("A video KYC session is already scheduled for this helper.");
  }

  const nextAttempt = latestSession
    ? latestSession.status === "cancelled"
      ? latestSession.attemptNumber
      : latestSession.attemptNumber + 1
    : 1;

  if (nextAttempt > 3) {
    throw new Error("This helper has exceeded the maximum number of video KYC attempts.");
  }

  return nextAttempt;
}

export async function scheduleVideoKYC(params: {
  helperProfileId: string;
  scheduledAt: Date;
  attemptNumber: number;
  adminEmail: string;
  adminUserId?: string;
  durationMinutes?: number;
}) {
  const profile = await getHelperProfileById(params.helperProfileId);

  if (!profile?.user?.email) {
    throw new Error("Cannot schedule video KYC without helper email.");
  }

  const durationMinutes = params.durationMinutes ?? envInt("VIDEO_KYC_DURATION_MINUTES", 20);
  const start = params.scheduledAt;
  const end = addMinutes(start, durationMinutes);

  const calendarId = params.adminUserId ? "primary" : getAdminCalendarId(params.adminEmail);
  const event = await createGoogleMeetEvent({
    calendarId,
    summary: `KYC Verification - ${profile.user.name ?? "Helper"}`,
    description: "Identity verification call for helper onboarding.",
    start,
    end,
    attendees: [{ email: profile.user.email }, { email: params.adminEmail }],
    userId: params.adminUserId,
  });

  await db.transaction(async (tx) => {
    await tx.insert(videoKycSession).values({
      id: crypto.randomUUID(),
      helperProfileId: profile.id,
      meetLink: event.meetLink,
      calendarEventId: event.calendarEventId,
      scheduledAt: event.scheduledAt,
      attemptNumber: params.attemptNumber,
      status: "scheduled",
      adminUserId: params.adminUserId ?? null,
    });

    await tx
      .update(helperProfile)
      .set({
        videoKycStatus: "scheduled",
        updatedAt: new Date(),
      })
      .where(eq(helperProfile.id, params.helperProfileId));
  });

  await enqueueHelperNotification({
    helperUserId: profile.userId,
    event: "video_kyc_scheduled",
    meta: {
      meetLink: event.meetLink,
      scheduledAt: event.scheduledAt.toISOString(),
    },
  });
}

export async function bookVideoKycSlotForHelper(params: { helperUserId: string; scheduledAt: Date }) {
  const profile = await getHelperProfileByUserId(params.helperUserId);
  if (!profile?.user?.email) {
    throw new Error("Helper profile not found.");
  }

  if (profile.verificationStatus !== "approved") {
    throw new Error("Video KYC can only be scheduled after documents are approved.");
  }

  if (profile.videoKycStatus === "passed") {
    throw new Error("Video KYC already passed for this helper.");
  }

  if (profile.videoKycStatus === "failed") {
    throw new Error("Video KYC already failed for this helper.");
  }

  const nextAttempt = await computeNextAttempt(profile.id);
  const hostEmail = getDefaultHostEmail();
  const durationMinutes = envInt("VIDEO_KYC_DURATION_MINUTES", 20);
  const start = params.scheduledAt;
  const end = addMinutes(start, durationMinutes);

  const calendarId = getSharedKycCalendarId();
  const attendees = [{ email: profile.user.email }];
  if (hostEmail && hostEmail !== profile.user.email) {
    attendees.push({ email: hostEmail });
  }

  let event: { calendarEventId: string; meetLink: string; scheduledAt: Date } | null = null;
  const sessionId = crypto.randomUUID();
  try {
    event = await createGoogleMeetEvent({
      calendarId,
      summary: `KYC Verification - ${profile.user.name ?? "Helper"}`,
      description: "Identity verification call for helper onboarding.",
      start,
      end,
      attendees,
    });

    await db.transaction(async (tx) => {
      await tx.insert(videoKycSession).values({
        id: sessionId,
        helperProfileId: profile.id,
        meetLink: event!.meetLink,
        calendarEventId: event!.calendarEventId,
        scheduledAt: event!.scheduledAt,
        attemptNumber: nextAttempt,
        status: "scheduled",
        adminUserId: null,
      });

      await tx
        .update(helperProfile)
        .set({
          videoKycStatus: "scheduled",
          updatedAt: new Date(),
        })
        .where(eq(helperProfile.id, profile.id));
    });
  } catch (error) {
    if (event?.calendarEventId) {
      await deleteGoogleEvent({ calendarId, calendarEventId: event.calendarEventId }).catch(() => {});
    }
    throw error;
  }

  await enqueueHelperNotification({
    helperUserId: profile.userId,
    event: "video_kyc_scheduled",
    meta: {
      meetLink: event.meetLink,
      scheduledAt: event.scheduledAt.toISOString(),
    },
  });

  return {
    sessionId,
    meetLink: event.meetLink,
    scheduledAt: event.scheduledAt,
    attemptNumber: nextAttempt,
  };
}

export async function rescheduleVideoKYC(params: {
  sessionId: string;
  scheduledAt: Date;
  adminEmail: string;
  adminUserId?: string;
  durationMinutes?: number;
  adminNotes?: string;
}) {
  const session = await db.query.videoKycSession.findFirst({
    where: eq(videoKycSession.id, params.sessionId),
    columns: {
      id: true,
      status: true,
      calendarEventId: true,
      helperProfileId: true,
      attemptNumber: true,
      adminUserId: true,
    },
  });

  if (!session) {
    throw new Error("Video KYC session not found.");
  }

  if (session.status !== "scheduled") {
    throw new Error("Only scheduled sessions can be rescheduled.");
  }

  const durationMinutes = params.durationMinutes ?? envInt("VIDEO_KYC_DURATION_MINUTES", 20);
  const start = params.scheduledAt;
  const end = addMinutes(start, durationMinutes);

  const calendarId = params.adminUserId ? "primary" : getAdminCalendarId(params.adminEmail);
  const nextScheduledAt = await updateGoogleEventTime({
    calendarId,
    calendarEventId: session.calendarEventId,
    start,
    end,
    userId: params.adminUserId,
  });

  await db
    .update(videoKycSession)
    .set({
      scheduledAt: nextScheduledAt,
      adminNotes: params.adminNotes ?? null,
      adminUserId: params.adminUserId ?? session.adminUserId ?? null,
    })
    .where(eq(videoKycSession.id, session.id));

  const profile = await db.query.helperProfile.findFirst({
    where: eq(helperProfile.id, session.helperProfileId),
    columns: { userId: true },
  });

  if (profile?.userId) {
    await enqueueHelperNotification({
      helperUserId: profile.userId,
      event: "video_kyc_rescheduled",
      meta: { scheduledAt: nextScheduledAt.toISOString() },
    });
  }
}

export async function rescheduleVideoKycByHelper(params: {
  helperUserId: string;
  sessionId: string;
  scheduledAt: Date;
}) {
  const profile = await getHelperProfileByUserId(params.helperUserId);
  if (!profile) throw new Error("Helper profile not found.");

  const session = await db.query.videoKycSession.findFirst({
    where: and(eq(videoKycSession.id, params.sessionId), eq(videoKycSession.helperProfileId, profile.id)),
    columns: { id: true, status: true, calendarEventId: true, helperProfileId: true },
  });

  if (!session) throw new Error("Video KYC session not found.");
  if (session.status !== "scheduled") throw new Error("Only scheduled sessions can be rescheduled.");

  const calendarId = getSharedKycCalendarId();
  const durationMinutes = envInt("VIDEO_KYC_DURATION_MINUTES", 20);
  const start = params.scheduledAt;
  const end = addMinutes(start, durationMinutes);

  const nextScheduledAt = await updateGoogleEventTime({
    calendarId,
    calendarEventId: session.calendarEventId,
    start,
    end,
  });

  await db.update(videoKycSession).set({ scheduledAt: nextScheduledAt }).where(eq(videoKycSession.id, session.id));

  await enqueueHelperNotification({
    helperUserId: profile.userId,
    event: "video_kyc_rescheduled",
    meta: { scheduledAt: nextScheduledAt.toISOString() },
  });

  return { scheduledAt: nextScheduledAt };
}

export async function cancelVideoKYC(params: {
  sessionId: string;
  adminEmail: string;
  adminUserId?: string;
  adminNotes?: string;
}) {
  const session = await db.query.videoKycSession.findFirst({
    where: eq(videoKycSession.id, params.sessionId),
    columns: {
      id: true,
      status: true,
      calendarEventId: true,
      helperProfileId: true,
      attemptNumber: true,
      adminUserId: true,
    },
  });

  if (!session) {
    throw new Error("Video KYC session not found.");
  }

  if (session.status !== "scheduled") {
    throw new Error("Only scheduled sessions can be cancelled.");
  }

  const calendarId = params.adminUserId ? "primary" : getAdminCalendarId(params.adminEmail);
  await deleteGoogleEvent({ calendarId, calendarEventId: session.calendarEventId, userId: params.adminUserId });

  await db.transaction(async (tx) => {
    await tx
      .update(videoKycSession)
      .set({
        status: "cancelled",
        completedAt: new Date(),
        adminNotes: params.adminNotes ?? null,
        adminUserId: params.adminUserId ?? session.adminUserId ?? null,
      })
      .where(eq(videoKycSession.id, session.id));

    await tx
      .update(helperProfile)
      .set({
        videoKycStatus: "pending_schedule",
        updatedAt: new Date(),
      })
      .where(eq(helperProfile.id, session.helperProfileId));
  });

  const profile = await db.query.helperProfile.findFirst({
    where: eq(helperProfile.id, session.helperProfileId),
    columns: { userId: true },
  });

  if (profile?.userId) {
    await enqueueHelperNotification({
      helperUserId: profile.userId,
      event: "video_kyc_cancelled",
      meta: { adminNotes: params.adminNotes },
    });
  }
}

export async function cancelVideoKycByHelper(params: { helperUserId: string; sessionId: string }) {
  const profile = await getHelperProfileByUserId(params.helperUserId);
  if (!profile) throw new Error("Helper profile not found.");

  const session = await db.query.videoKycSession.findFirst({
    where: and(eq(videoKycSession.id, params.sessionId), eq(videoKycSession.helperProfileId, profile.id)),
    columns: { id: true, status: true, calendarEventId: true, helperProfileId: true },
  });

  if (!session) throw new Error("Video KYC session not found.");
  if (session.status !== "scheduled") throw new Error("Only scheduled sessions can be cancelled.");

  const calendarId = getSharedKycCalendarId();
  await deleteGoogleEvent({ calendarId, calendarEventId: session.calendarEventId });

  await db.transaction(async (tx) => {
    await tx
      .update(videoKycSession)
      .set({
        status: "cancelled",
        completedAt: new Date(),
      })
      .where(eq(videoKycSession.id, session.id));

    await tx
      .update(helperProfile)
      .set({
        videoKycStatus: "pending_schedule",
        updatedAt: new Date(),
      })
      .where(eq(helperProfile.id, session.helperProfileId));
  });

  await enqueueHelperNotification({
    helperUserId: profile.userId,
    event: "video_kyc_cancelled",
    meta: {},
  });
}

export async function getLatestVideoKycSession(helperProfileId: string) {
  return db.query.videoKycSession.findFirst({
    where: eq(videoKycSession.helperProfileId, helperProfileId),
    orderBy: desc(videoKycSession.createdAt),
  });
}

export async function getScheduledVideoKycSessions() {
  return db.query.videoKycSession.findMany({
    where: eq(videoKycSession.status, "scheduled"),
    orderBy: videoKycSession.scheduledAt,
    with: {
      helperProfile: {
        columns: { id: true, userId: true },
        with: {
          user: { columns: { name: true, email: true } },
        },
      },
    },
  });
}

export async function getOpenVideoKycSessionById(sessionId: string) {
  return db.query.videoKycSession.findFirst({
    where: eq(videoKycSession.id, sessionId),
    with: {
      helperProfile: {
        columns: { id: true, userId: true },
      },
    },
  });
}

export async function canRevealJoinLink(params: { helperUserId: string; sessionId: string }) {
  const profile = await getHelperProfileByUserId(params.helperUserId);
  if (!profile) return { ok: false as const, reason: "profile_not_found" as const };

  const session = await db.query.videoKycSession.findFirst({
    where: and(eq(videoKycSession.id, params.sessionId), eq(videoKycSession.helperProfileId, profile.id)),
    columns: {
      status: true,
      meetLink: true,
      scheduledAt: true,
    },
  });

  if (!session) return { ok: false as const, reason: "session_not_found" as const };
  if (session.status !== "scheduled") return { ok: false as const, reason: "not_scheduled" as const };

  const notBeforeMinutes = envInt("VIDEO_KYC_JOIN_NOT_BEFORE_MINUTES", 10);
  const notAfterMinutes = envInt("VIDEO_KYC_JOIN_NOT_AFTER_MINUTES", 15);

  const now = new Date();
  const notBefore = addMinutes(session.scheduledAt, -notBeforeMinutes);
  const notAfter = addMinutes(session.scheduledAt, notAfterMinutes);

  if (now < notBefore) {
    return {
      ok: false as const,
      reason: "too_early" as const,
      scheduledAt: session.scheduledAt,
      notBefore,
      notAfter,
    };
  }
  if (now > notAfter) {
    return {
      ok: false as const,
      reason: "expired" as const,
      scheduledAt: session.scheduledAt,
      notBefore,
      notAfter,
    };
  }

  return { ok: true as const, meetLink: session.meetLink, scheduledAt: session.scheduledAt };
}

export async function resolveAdminEmailForSession(params: { sessionId: string; fallbackAdminUserId: string }) {
  const current = await db.query.videoKycSession.findFirst({
    where: eq(videoKycSession.id, params.sessionId),
    columns: { adminUserId: true },
  });

  const calendarOwnerUserId = current?.adminUserId ?? params.fallbackAdminUserId;
  const admin = await db.query.user.findFirst({
    where: eq(user.id, calendarOwnerUserId),
    columns: { email: true },
  });

  if (!admin?.email) {
    throw new Error("Admin email not found.");
  }

  return admin.email;
}
