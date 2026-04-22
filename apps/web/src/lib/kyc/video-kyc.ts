import { createSign } from "node:crypto";
import { and, desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { helperProfile, user, videoKycSession } from "@/db/schema";
import { enqueueHelperNotification } from "@/lib/notifications/helper-events";

type ServiceAccount = {
  client_email: string;
  private_key: string;
  token_uri?: string;
};

function base64Url(input: string | Buffer) {
  return Buffer.from(input)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
}

function parseServiceAccount(): ServiceAccount {
  const json = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
  if (!json) {
    throw new Error("GOOGLE_SERVICE_ACCOUNT_JSON is required for video KYC scheduling.");
  }

  const parsed = JSON.parse(json) as ServiceAccount;
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

function getNextBusinessDayTenAmIst() {
  const now = new Date();
  const istNow = new Date(now.toLocaleString("en-US", { timeZone: "Asia/Kolkata" }));
  const day = istNow.getDay();
  const addDays = day === 5 ? 3 : day === 6 ? 2 : 1;

  const scheduled = new Date(istNow);
  scheduled.setDate(istNow.getDate() + addDays);
  scheduled.setHours(10, 0, 0, 0);

  const end = new Date(scheduled);
  end.setMinutes(end.getMinutes() + 20);

  return { start: scheduled, end };
}

export async function scheduleVideoKYC(helperProfileId: string, attemptNumber = 1) {
  const profile = await db.query.helperProfile.findFirst({
    where: eq(helperProfile.id, helperProfileId),
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

  const calendarId = process.env.GOOGLE_KYC_CALENDAR_ID;
  const adminEmail = process.env.KYC_ADMIN_EMAIL;
  if (!calendarId || !adminEmail) {
    throw new Error("Missing GOOGLE_KYC_CALENDAR_ID or KYC_ADMIN_EMAIL.");
  }

  const { start, end } = getNextBusinessDayTenAmIst();
  const accessToken = await getGoogleAccessToken();

  const response = await fetch(
    `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events?conferenceDataVersion=1`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        summary: `KYC Verification - ${profile.user.name ?? "Helper"}`,
        description: "Identity verification call for helper onboarding.",
        start: { dateTime: start.toISOString(), timeZone: "Asia/Kolkata" },
        end: { dateTime: end.toISOString(), timeZone: "Asia/Kolkata" },
        attendees: [{ email: profile.user.email }, { email: adminEmail }],
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

  await db.transaction(async (tx) => {
    await tx.insert(videoKycSession).values({
      id: crypto.randomUUID(),
      helperProfileId,
      meetLink,
      calendarEventId,
      scheduledAt: eventPayload.start?.dateTime ? new Date(eventPayload.start.dateTime) : start,
      attemptNumber,
      status: "scheduled",
    });

    await tx
      .update(helperProfile)
      .set({
        videoKycStatus: "scheduled",
        updatedAt: new Date(),
      })
      .where(eq(helperProfile.id, helperProfileId));
  });

  await enqueueHelperNotification({
    helperUserId: profile.userId,
    event: "video_kyc_scheduled",
    meta: {
      meetLink,
      scheduledAt: eventPayload.start?.dateTime ?? start.toISOString(),
    },
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
