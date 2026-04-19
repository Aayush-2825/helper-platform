"use client";

import { useEffect } from "react";

import { syncWebPushSubscription } from "@/lib/notifications/push-client";

export function useHelperWebPush(enabled: boolean) {
  useEffect(() => {
    if (!enabled) {
      return;
    }

    const vapidPublicKey = process.env.NEXT_PUBLIC_WEB_PUSH_VAPID_PUBLIC_KEY;
    if (!vapidPublicKey || vapidPublicKey.trim().length === 0) {
      return;
    }

    void syncWebPushSubscription(vapidPublicKey.trim());
  }, [enabled]);
}
