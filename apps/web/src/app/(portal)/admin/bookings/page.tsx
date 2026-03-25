"use client";

import { useRealtimeEvents } from "@/hooks/use-realtime-events";
import { useSession } from "@/lib/auth/session";

export default function AdminBookingsPage() {
  const { session } = useSession();
  const userId = session?.user.id;
  const userRole = session?.user.role;

  const { connected, eventMessages } = useRealtimeEvents({
    maxEvents: 60,
    userId,
    userRole,
    eventTypes: ["booking_request", "booking_update", "helper_presence", "location_update", "notification", "payment_update"],
  });

  return (
    <main className="space-y-4 p-6">
      <h1 className="text-2xl font-semibold">Booking Monitoring</h1>
      <p className="text-sm text-muted-foreground">Track live bookings and investigate exceptions.</p>

      <section className="rounded-lg border p-4 text-sm">
        WS: <span className={connected ? "text-green-600" : "text-amber-600"}>{connected ? "Connected" : "Disconnected"}</span>
      </section>

      <section className="rounded-lg border p-4">
        <h2 className="text-base font-medium">Live Event Stream</h2>
        {eventMessages.length === 0 ? (
          <p className="mt-2 text-sm text-muted-foreground">No realtime events yet.</p>
        ) : (
          <ul className="mt-2 space-y-2 text-sm">
            {eventMessages.map((message, index) => (
              <li key={`${message.occurredAt ?? "t"}-${index}`} className="rounded border p-2">
                <p className="font-medium">{message.event}</p>
                <p className="text-xs text-muted-foreground">{message.occurredAt ?? "Unknown time"}</p>
                <pre className="mt-1 overflow-x-auto text-xs">{JSON.stringify(message.data, null, 2)}</pre>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
