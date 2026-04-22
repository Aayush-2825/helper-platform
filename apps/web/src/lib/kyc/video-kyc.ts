import { createSign } from "node:crypto";
import { and, desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { helperProfile, videoKycSession } from "@/db/schema";
import { enqueueHelperNotification } from "@/lib/notifications/helper-events";

type ServiceAccount = {
  client_email: string;
  private_key: string;
  token_uri?: string;
};

function normalizeJsonEnvValue(raw: string) {
  const trimmed = raw.trim();
  if (
    (trimmed.startsWith("'") && trimmed.endsWith("'")) ||
    (trimmed.startsWith("\"") && trimmed.endsWith("\""))
  ) {
    return trimmed.slice(1, -1).trim();
  }

  return trimmed;
}

function base64Url(input: string | Buffer) {
  return Buffer.from(input)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
}

function parseServiceAccount(): ServiceAccount {
  const raw = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
  const json = raw ? normalizeJsonEnvValue(raw) : raw;
  if (!json) {
    throw new Error("GOOGLE_SERVICE_ACCOUNT_JSON is required for video KYC scheduling.");
  }

  let parsed: ServiceAccount;
  try {
    parsed = JSON.parse(json) as ServiceAccount;
  } catch (error) {
    const hasNewlines = json.includes("\n") || json.includes("\r");
    throw new Error(
      `Invalid GOOGLE_SERVICE_ACCOUNT_JSON JSON: ${(error as Error).message}${
        hasNewlines
          ? " (Tip: the service account JSON must be a single line; the private_key should contain escaped newlines like \\\\n, not actual line breaks.)"
          : ""
      }`,
    );
  }
  if (!parsed.client_email || !parsed.private_key) {
    throw new Error("GOOGLE_SERVICE_ACCOUNT_JSON is missing client_email/private_key.");
  }

  return parsed;
}

async function getGoogleAccessToken() {
  const serviceAccount = parseServiceAccount();
  const tokenUri = serviceAccount.token_uri ?? "https://oauth2.googleapis.com/token";
  const now = Math.floor(Date.now() / 1000);

  const header = base64Url(JSON.stringify({ alg: "RS256", typ: "JWT" }));
  const claims = base64Url(
    JSON.stringify({
      iss: serviceAccount.client_email,
      scope: "https://www.googleapis.com/auth/calendar",
      aud: tokenUri,
      exp: now + 3600,
      iat: now,
    }),
  );

  const signer = createSign("RSA-SHA256");
  signer.update(`${header}.${claims}`);
  const signature = base64Url(signer.sign(serviceAccount.private_key));
  const assertion = `${header}.${claims}.${signature}`;

  const response = await fetch(tokenUri, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion,
    }),
  });

  if (!response.ok) {
    const details = await response.text();
    throw new Error(`Unable to get Google access token: ${details}`);
  }

  const data = (await response.json()) as { access_token?: string };
  if (!data.access_token) {
    throw new Error("Google OAuth token response did not include access_token.");
  }

  return data.access_token;
}

function addMinutes(date: Date, minutes: number) {
  const updated = new Date(date);
  updated.setMinutes(updated.getMinutes() + minutes);
  return updated;
}

function getAdminCalendarId(adminEmail: string) {
  const raw = process.env.KYC_ADMIN_CALENDAR_MAP;
  if (raw) {
    try {
      const normalized = normalizeJsonEnvValue(raw);
      const parsed = JSON.parse(normalized) as Record<string, string>;
      const mapped = parsed?.[adminEmail];
      if (mapped) {
        return mapped;
      }
    } catch (error) {
      throw new Error(`Invalid KYC_ADMIN_CALENDAR_MAP JSON: ${(error as Error).message}`);
    }
  }

  const fallback = process.env.GOOGLE_KYC_CALENDAR_ID;
  if (!fallback) {
    throw new Error("Missing GOOGLE_KYC_CALENDAR_ID (or KYC_ADMIN_CALENDAR_MAP for this admin).");
  }

  return fallback;
}

async function createGoogleMeetEvent(params: {
  calendarId: string;
  summary: string;
  description: string;
  start: Date;
  end: Date;
  attendees: Array<{ email: string }>;
}) {
  const accessToken = await getGoogleAccessToken();
  const response = await fetch(
    `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(params.calendarId)}/events?conferenceDataVersion=1`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        summary: params.summary,
        description: params.description,
        start: { dateTime: params.start.toISOString() },
        end: { dateTime: params.end.toISOString() },
        attendees: params.attendees,
        conferenceData: {
          createRequest: {
            requestId: crypto.randomUUID(),
            conferenceSolutionKey: { type: "hangoutsMeet" },
          },
        },
        sendUpdates: "all",
      }),
    },
  );

  if (!response.ok) {
    const details = await response.text();
    throw new Error(`Failed to schedule Google Meet video KYC: ${details}`);
  }

  const eventPayload = (await response.json()) as {
    id?: string;
    start?: { dateTime?: string };
    hangoutLink?: string;
    conferenceData?: { entryPoints?: Array<{ uri?: string; entryPointType?: string }> };
  };

  const meetLink =
    eventPayload.hangoutLink ??
    eventPayload.conferenceData?.entryPoints?.find((entry) => entry.entryPointType === "video")?.uri;
  const calendarEventId = eventPayload.id;

  if (!calendarEventId || !meetLink) {
    throw new Error("Google Calendar event response is missing meeting details.");
  }

  return {
    calendarEventId,
    meetLink,
    scheduledAt: eventPayload.start?.dateTime ? new Date(eventPayload.start.dateTime) : params.start,
  };
}

async function updateGoogleEventTime(params: {
  calendarId: string;
  calendarEventId: string;
  start: Date;
  end: Date;
}) {
  const accessToken = await getGoogleAccessToken();
  const response = await fetch(
    `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(params.calendarId)}/events/${encodeURIComponent(params.calendarEventId)}?sendUpdates=all`,
    {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        start: { dateTime: params.start.toISOString() },
        end: { dateTime: params.end.toISOString() },
      }),
    },
  );

  if (!response.ok) {
    const details = await response.text();
    throw new Error(`Failed to reschedule Google Meet video KYC: ${details}`);
  }

  const payload = (await response.json()) as { start?: { dateTime?: string } };
  return payload.start?.dateTime ? new Date(payload.start.dateTime) : params.start;
}

async function deleteGoogleEvent(params: { calendarId: string; calendarEventId: string }) {
  const accessToken = await getGoogleAccessToken();
  const response = await fetch(
    `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(params.calendarId)}/events/${encodeURIComponent(params.calendarEventId)}?sendUpdates=all`,
    {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
  );

  if (!response.ok) {
    const details = await response.text();
    throw new Error(`Failed to cancel Google Meet video KYC: ${details}`);
  }
}

export async function scheduleVideoKYC(params: {
  helperProfileId: string;
  scheduledAt: Date;
  attemptNumber: number;
  adminEmail: string;
  adminUserId?: string;
  durationMinutes?: number;
}) {
  const profile = await db.query.helperProfile.findFirst({
    where: eq(helperProfile.id, params.helperProfileId),
    columns: {
      id: true,
      userId: true,
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

  if (!profile?.user?.email) {
    throw new Error("Cannot schedule video KYC without helper email.");
  }

  const durationMinutes = params.durationMinutes ?? 20;
  const start = params.scheduledAt;
  const end = addMinutes(start, durationMinutes);

  const calendarId = getAdminCalendarId(params.adminEmail);
  const event = await createGoogleMeetEvent({
    calendarId,
    summary: `KYC Verification - ${profile.user.name ?? "Helper"}`,
    description: "Identity verification call for helper onboarding.",
    start,
    end,
    attendees: [{ email: profile.user.email }, { email: params.adminEmail }],
  });

  await db.transaction(async (tx) => {
    await tx.insert(videoKycSession).values({
      id: crypto.randomUUID(),
      helperProfileId: params.helperProfileId,
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

  const durationMinutes = params.durationMinutes ?? 20;
  const start = params.scheduledAt;
  const end = addMinutes(start, durationMinutes);
  const calendarId = getAdminCalendarId(params.adminEmail);
  const nextScheduledAt = await updateGoogleEventTime({
    calendarId,
    calendarEventId: session.calendarEventId,
    start,
    end,
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
    columns: {
      userId: true,
    },
  });

  if (profile?.userId) {
    await enqueueHelperNotification({
      helperUserId: profile.userId,
      event: "video_kyc_rescheduled",
      meta: {
        scheduledAt: nextScheduledAt.toISOString(),
      },
    });
  }
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

  const calendarId = getAdminCalendarId(params.adminEmail);
  await deleteGoogleEvent({ calendarId, calendarEventId: session.calendarEventId });

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
    columns: {
      userId: true,
    },
  });

  if (profile?.userId) {
    await enqueueHelperNotification({
      helperUserId: profile.userId,
      event: "video_kyc_cancelled",
      meta: { adminNotes: params.adminNotes },
    });
  }
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
        columns: {
          id: true,
          userId: true,
        },
        with: {
          user: {
            columns: {
              name: true,
              email: true,
            },
          },
        },
      },
    },
  });
}

export async function getOpenVideoKycSessionById(sessionId: string) {
  return db.query.videoKycSession.findFirst({
    where: and(eq(videoKycSession.id, sessionId)),
    with: {
      helperProfile: {
        columns: {
          id: true,
          userId: true,
        },
      },
    },
  });
}
