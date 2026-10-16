export function base64UrlToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  return Uint8Array.from([...rawData].map((char) => char.charCodeAt(0)));
}

export async function registerWebPushSubscription(vapidPublicKey: string, userInitiated = false) {
  if (!("serviceWorker" in navigator) || !("PushManager" in window) || typeof Notification === "undefined") {
    return null;
  }

  let permission = Notification.permission;
  if (permission !== "granted") {
    if (!userInitiated) {
      // Modern browsers disallow Notification.requestPermission() outside a user gesture
      return null;
    }
    try {
      permission = await Notification.requestPermission();
    } catch {
      return null;
    }
    if (permission !== "granted") {
      return null;
    }
  }

  try {
    const registration = await navigator.serviceWorker.register("/sw.js");

    const existing = await registration.pushManager.getSubscription();
    if (existing) {
      return existing;
    }

    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: base64UrlToUint8Array(vapidPublicKey),
    });

    return subscription;
  } catch (err) {
    console.warn("[Push] Failed to register subscription:", err);
    return null;
  }
}

export async function syncWebPushSubscription(vapidPublicKey: string) {
  const subscription = await registerWebPushSubscription(vapidPublicKey);
  if (!subscription) {
    return false;
  }

  const response = await fetch("/api/helper/push-subscriptions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify(subscription.toJSON()),
  });

  return response.ok;
}
