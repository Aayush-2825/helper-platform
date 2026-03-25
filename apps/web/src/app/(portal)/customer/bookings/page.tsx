"use client";

import { useMemo } from "react";
import { useRealtimeEvents } from "@/hooks/use-realtime-events";
import { useSession } from "@/lib/auth/session";

export default function CustomerBookingsPage() {
  const { session } = useSession();
  const userId = session?.user.id;
  const userRole = session?.user.role;

  const { connected, eventMessages, error } = useRealtimeEvents({
    maxEvents: 40,
    userId,
    userRole,
    eventTypes: ["booking_update", "notification", "payment_update"],
  });

  const bookingEvents = useMemo(
    () => eventMessages.filter((message) => message.event.startsWith("booking.")),
    [eventMessages],
  );

  return (
    <main className="space-y-4 p-6">
      <h1 className="text-2xl font-semibold">My Bookings</h1>
      <p className="text-sm text-muted-foreground">Track active, completed, and canceled bookings.</p>

      <section className="rounded-lg border p-4">
        <p className="text-sm">
          Socket status: <span className={connected ? "text-green-600" : "text-amber-600"}>{connected ? "Connected" : "Disconnected"}</span>
        </p>
        {error ? <p className="mt-2 text-sm text-red-600">{error}</p> : null}
      </section>

      <section className="rounded-lg border p-4">
        <h2 className="text-base font-medium">Live Booking Timeline</h2>
        {bookingEvents.length === 0 ? (
          <p className="mt-2 text-sm text-muted-foreground">No booking events received yet.</p>
        ) : (
          <ul className="mt-2 space-y-2 text-sm">
            {bookingEvents.map((message, index) => (
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
