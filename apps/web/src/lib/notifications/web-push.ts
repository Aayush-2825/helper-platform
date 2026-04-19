import webpush from "web-push";
import { and, eq, inArray } from "drizzle-orm";

import { db } from "@/db";
import { helperWebPushSubscription } from "@/db/schema";

type BookingPushPayload = {
  bookingId: string;
  categoryId: string;
  city: string;
  addressLine: string;
  quotedAmount: number;
  expiresAt?: string;
};

type WebPushSubscriptionPayload = {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
  expirationTime?: number | null;
};

let configured = false;

function getWebPushConfig() {
  const publicKey = process.env.NEXT_PUBLIC_WEB_PUSH_VAPID_PUBLIC_KEY;
  const privateKey = process.env.WEB_PUSH_VAPID_PRIVATE_KEY;
  const subjectEmail = process.env.WEB_PUSH_CONTACT_EMAIL;

  if (!publicKey || !privateKey || !subjectEmail) {
    return null;
  }

  return {
    publicKey,
    privateKey,
    subject: `mailto:${subjectEmail}`,
  };
}

function ensureConfigured(): boolean {
  if (configured) {
    return true;
  }

  const config = getWebPushConfig();
  if (!config) {
    return false;
  }

  webpush.setVapidDetails(config.subject, config.publicKey, config.privateKey);
  configured = true;
  return true;
}

export function getPublicVapidKey() {
  return process.env.NEXT_PUBLIC_WEB_PUSH_VAPID_PUBLIC_KEY || "";
}

export async function sendBookingPushToHelpers(helperUserIds: string[], payload: BookingPushPayload) {
  if (!ensureConfigured()) {
    return;
  }

  const uniqueHelperUserIds = [...new Set(helperUserIds.filter(Boolean))];
  if (uniqueHelperUserIds.length === 0) {
    return;
  }

  const subscriptions = await db.query.helperWebPushSubscription.findMany({
    where: and(
      inArray(helperWebPushSubscription.userId, uniqueHelperUserIds),
      eq(helperWebPushSubscription.isActive, true),
    ),
    columns: {
      id: true,
      endpoint: true,
      p256dh: true,
      auth: true,
    },
  });

  const body = JSON.stringify({
    title: "New booking request",
    body: `${payload.categoryId} • ${payload.city} • Rs ${payload.quotedAmount}`,
    bookingId: payload.bookingId,
    city: payload.city,
    addressLine: payload.addressLine,
    quotedAmount: payload.quotedAmount,
    expiresAt: payload.expiresAt,
    url: `/helper/incoming-jobs?bookingId=${encodeURIComponent(payload.bookingId)}`,
  });

  await Promise.allSettled(
    subscriptions.map(async (subscription) => {
      const pushSubscription: WebPushSubscriptionPayload = {
        endpoint: subscription.endpoint,
        keys: {
          p256dh: subscription.p256dh,
          auth: subscription.auth,
        },
      };

      try {
        await webpush.sendNotification(pushSubscription, body);
        await db
          .update(helperWebPushSubscription)
          .set({
            lastUsedAt: new Date(),
            updatedAt: new Date(),
          })
          .where(eq(helperWebPushSubscription.id, subscription.id));
      } catch (error) {
        const statusCode = (error as { statusCode?: number })?.statusCode;
        if (statusCode === 404 || statusCode === 410) {
          await db
            .update(helperWebPushSubscription)
            .set({
              isActive: false,
              updatedAt: new Date(),
            })
            .where(eq(helperWebPushSubscription.id, subscription.id));
        }
      }
    }),
  );
}
