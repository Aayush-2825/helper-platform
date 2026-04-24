import { db } from "@/db";
import { account, user } from "@/db/schema";
import { and, eq } from "drizzle-orm";

type GoogleApiErrorDetails = {
  raw: string;
  code?: number;
  reason?: string;
  message?: string;
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

async function refreshGoogleAccessToken(refreshToken: string) {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error("Missing GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET in environment.");
  }

  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      refresh_token: refreshToken,
      grant_type: "refresh_token",
    }),
  });

  if (!response.ok) {
    const details = await response.text();
    throw new Error(`Unable to refresh Google access token: ${details}`);
  }

  return (await response.json()) as { access_token: string; expires_in: number };
}

export async function getGoogleCalendarAccessToken(userId?: string) {
  let targetUserId = userId;

  if (!targetUserId) {
    const primaryAdmin = await db.query.user.findFirst({
      where: eq(user.role, "admin"),
      columns: { id: true },
    });
    if (!primaryAdmin) {
      throw new Error("No admin user found to use for Google Calendar.");
    }
    targetUserId = primaryAdmin.id;
  }

  const googleAccount = await db.query.account.findFirst({
    where: and(eq(account.userId, targetUserId), eq(account.providerId, "google")),
  });

  if (!googleAccount) {
    throw new Error(`User ${targetUserId} does not have a Google account linked.`);
  }

  const now = new Date();
  if (
    googleAccount.accessToken &&
    googleAccount.accessTokenExpiresAt &&
    googleAccount.accessTokenExpiresAt.getTime() > now.getTime() + 60000
  ) {
    return googleAccount.accessToken;
  }

  if (!googleAccount.refreshToken) {
    throw new Error(`User ${targetUserId} google account is missing a refresh token. Please re-login.`);
  }

  const refreshed = await refreshGoogleAccessToken(googleAccount.refreshToken);
  const expiresAt = new Date(Date.now() + refreshed.expires_in * 1000);

  await db
    .update(account)
    .set({
      accessToken: refreshed.access_token,
      accessTokenExpiresAt: expiresAt,
      updatedAt: new Date(),
    })
    .where(eq(account.id, googleAccount.id));

  return refreshed.access_token;
}


async function readGoogleApiError(response: Response): Promise<GoogleApiErrorDetails> {
  const raw = await response.text();

  try {
    const parsed = JSON.parse(raw) as {
      error?: { message?: string; code?: number; errors?: Array<{ reason?: string; message?: string }> };
    };
    return {
      raw,
      code: parsed.error?.code,
      reason: parsed.error?.errors?.[0]?.reason,
      message: parsed.error?.message,
    };
  } catch {
    return { raw };
  }
}

function isRetryableStatus(status: number) {
  return status === 429 || status === 500 || status === 502 || status === 503 || status === 504;
}

async function googleFetchJson<T>(
  url: string,
  init: RequestInit & { accessToken: string; timeoutMs?: number; retries?: number },
) {
  const { accessToken, timeoutMs = 12_000, retries = 2, ...rest } = init;

  for (let attempt = 0; attempt <= retries; attempt += 1) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const response = await fetch(url, {
        ...rest,
        signal: controller.signal,
        headers: {
          Authorization: `Bearer ${accessToken}`,
          ...(rest.headers ?? {}),
        },
      });

      if (!response.ok) {
        const details = await readGoogleApiError(response);
        if (attempt < retries && isRetryableStatus(response.status)) {
          await new Promise<void>((resolve) => setTimeout(resolve, 250 * Math.pow(2, attempt)));
          continue;
        }
        const message = details.message ? `${details.message} (${details.reason ?? "unknown"})` : details.raw;
        throw new Error(message);
      }

      return (await response.json()) as T;
    } finally {
      clearTimeout(timeout);
    }
  }

  throw new Error("Google Calendar request failed after retries.");
}

export function normalizeCalendarId(value: string) {
  const normalized = normalizeJsonEnvValue(value).trim();
  if (!normalized) {
    throw new Error("Google Calendar ID is empty.");
  }
  return normalized;
}

export async function ensureCalendarAccessible(calendarId: string, userId?: string) {
  const accessToken = await getGoogleCalendarAccessToken(userId);
  await googleFetchJson<Record<string, unknown>>(
    `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}`,
    {
      accessToken,
      method: "GET",
    },
  );
}

function extractMeetLink(payload: {
  hangoutLink?: string;
  conferenceData?: { entryPoints?: Array<{ uri?: string; entryPointType?: string }> };
}) {
  return (
    payload.hangoutLink ??
    payload.conferenceData?.entryPoints?.find((entry) => entry.entryPointType === "video")?.uri ??
    null
  );
}

async function fetchEvent(params: { accessToken: string; calendarId: string; eventId: string }) {
  return googleFetchJson<{
    id?: string;
    start?: { dateTime?: string };
    hangoutLink?: string;
    conferenceData?: {
      entryPoints?: Array<{ uri?: string; entryPointType?: string }>;
      createRequest?: { status?: { statusCode?: string } };
    };
  }>(
    `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(params.calendarId)}/events/${encodeURIComponent(params.eventId)}?conferenceDataVersion=1`,
    { accessToken: params.accessToken, method: "GET" },
  );
}

export function buildFallbackMeetingLink(sessionKey: string) {
  const configuredBase = process.env.VIDEO_KYC_FALLBACK_MEETING_BASE_URL?.trim();
  const baseUrl = configuredBase && configuredBase.length > 0 ? configuredBase : "https://meet.jit.si";
  const normalizedBase = baseUrl.replace(/\/+$/, "");
  const room = `helper-video-kyc-${sessionKey.replace(/[^a-zA-Z0-9-]/g, "-")}`;
  return `${normalizedBase}/${room}`;
}

async function attachFallbackMeetingLinkToEvent(params: {
  accessToken: string;
  calendarId: string;
  eventId: string;
  description: string;
  fallbackMeetLink: string;
}) {
  await fetch(
    `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(params.calendarId)}/events/${encodeURIComponent(params.eventId)}`,
    {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${params.accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        description: `${params.description}\n\nVideo call link: ${params.fallbackMeetLink}`,
        location: params.fallbackMeetLink,
      }),
    },
  ).catch(() => {});
}

export async function createGoogleMeetEvent(params: {
  calendarId: string;
  summary: string;
  description: string;
  start: Date;
  end: Date;
  attendees: Array<{ email: string }>;
  userId?: string;
}) {
  const accessToken = await getGoogleCalendarAccessToken(params.userId);
  await ensureCalendarAccessible(params.calendarId, params.userId);

  const response = await fetch(
    `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(params.calendarId)}/events?conferenceDataVersion=1&sendUpdates=all`,
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
      }),
    },
  );

  if (!response.ok) {
    const details = await readGoogleApiError(response);
    throw new Error(details.raw);
  }

  const eventPayload = (await response.json()) as {
    id?: string;
    start?: { dateTime?: string };
    hangoutLink?: string;
    conferenceData?: {
      entryPoints?: Array<{ uri?: string; entryPointType?: string }>;
      createRequest?: { status?: { statusCode?: string } };
    };
  };

  let latestPayload = eventPayload;
  let calendarEventId = latestPayload.id;
  let meetLink = extractMeetLink(latestPayload);

  if (!meetLink && calendarEventId) {
    for (let attempt = 0; attempt < 4; attempt += 1) {
      const currentEventId = calendarEventId;
      if (!currentEventId) break;
      await new Promise<void>((resolve) => setTimeout(resolve, 750));
      latestPayload = await fetchEvent({
        accessToken,
        calendarId: params.calendarId,
        eventId: currentEventId,
      });
      calendarEventId = latestPayload.id;
      meetLink = extractMeetLink(latestPayload);
      if (meetLink) break;
    }
  }

  if (!meetLink && calendarEventId) {
    const fallbackMeetLink = buildFallbackMeetingLink(calendarEventId);
    await attachFallbackMeetingLinkToEvent({
      accessToken,
      calendarId: params.calendarId,
      eventId: calendarEventId,
      description: params.description,
      fallbackMeetLink,
    });
    meetLink = fallbackMeetLink;
  }

  if (!calendarEventId || !meetLink) {
    throw new Error(
      "Google Calendar event response is missing meeting details. Verify Meet is enabled for the calendar and retry.",
    );
  }

  return {
    calendarEventId,
    meetLink,
    scheduledAt: latestPayload.start?.dateTime ? new Date(latestPayload.start.dateTime) : params.start,
  };
}

export async function updateGoogleEventTime(params: {
  calendarId: string;
  calendarEventId: string;
  start: Date;
  end: Date;
  userId?: string;
}) {
  const accessToken = await getGoogleCalendarAccessToken(params.userId);
  const payload = await googleFetchJson<{ start?: { dateTime?: string } }>(
    `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(params.calendarId)}/events/${encodeURIComponent(params.calendarEventId)}?sendUpdates=all`,
    {
      accessToken,
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        start: { dateTime: params.start.toISOString() },
        end: { dateTime: params.end.toISOString() },
      }),
    },
  );

  return payload.start?.dateTime ? new Date(payload.start.dateTime) : params.start;
}

export async function deleteGoogleEvent(params: { calendarId: string; calendarEventId: string; userId?: string }) {
  const accessToken = await getGoogleCalendarAccessToken(params.userId);
  const response = await fetch(
    `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(params.calendarId)}/events/${encodeURIComponent(params.calendarEventId)}?sendUpdates=all`,
    {
      method: "DELETE",
      headers: { Authorization: `Bearer ${accessToken}` },
    },
  );

  if (!response.ok) {
    const details = await readGoogleApiError(response);
    throw new Error(details.raw);
  }
}

export async function getCalendarBusyIntervals(params: {
  calendarId: string;
  timeMin: Date;
  timeMax: Date;
  userId?: string;
}) {
  const accessToken = await getGoogleCalendarAccessToken(params.userId);
  const payload = await googleFetchJson<{
    calendars?: Record<string, { busy?: Array<{ start: string; end: string }> }>;
  }>("https://www.googleapis.com/calendar/v3/freeBusy", {
    accessToken,
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      timeMin: params.timeMin.toISOString(),
      timeMax: params.timeMax.toISOString(),
      items: [{ id: params.calendarId }],
    }),
  });

  const busy = payload.calendars?.[params.calendarId]?.busy ?? [];
  return busy
    .map((interval) => ({
      start: new Date(interval.start),
      end: new Date(interval.end),
    }))
    .filter((interval) => !Number.isNaN(interval.start.getTime()) && !Number.isNaN(interval.end.getTime()));
}
