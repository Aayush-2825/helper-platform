self.addEventListener("push", (event) => {
  if (!event.data) {
    return;
  }

  let payload;
  try {
    payload = event.data.json();
  } catch {
    payload = { title: "New booking request", body: event.data.text() };
  }

  const title = payload.title || "New booking request";
  const options = {
    body: payload.body || "You have a new booking request.",
    icon: "/next.svg",
    badge: "/next.svg",
    data: {
      url: payload.url || "/helper/incoming-jobs",
      bookingId: payload.bookingId || null,
    },
    tag: payload.bookingId ? `booking-${payload.bookingId}` : "booking-request",
    renotify: true,
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const targetUrl = event.notification.data?.url || "/helper/incoming-jobs";

  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then((windowClients) => {
      for (const client of windowClients) {
        if ("focus" in client) {
          client.navigate(targetUrl);
          return client.focus();
        }
      }

      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }

      return undefined;
    }),
  );
});
