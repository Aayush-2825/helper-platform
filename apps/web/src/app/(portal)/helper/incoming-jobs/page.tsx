"use client";

import { useEffect, useMemo, useState } from "react";
import { createIncomingJob, publishHelperPresence, publishLocationUpdate } from "@/lib/realtime/client";
import { useRealtimeEvents } from "@/hooks/use-realtime-events";
import { useSession } from "@/lib/auth/session";
import { normalizeRole } from "@/lib/auth/roles";

export default function HelperIncomingJobsPage() {
  const { session, loading } = useSession();
  const role = normalizeRole(session?.user.role);
  const sessionUserId = session?.user.id ?? "";
  const sessionUserRole = session?.user.role;
  const [helperId, setHelperId] = useState("hlp_9");
  const [bookingId, setBookingId] = useState("bk_123");
  const [sending, setSending] = useState(false);
  const [requestError, setRequestError] = useState<string | null>(null);
  const { connected, eventMessages } = useRealtimeEvents({
    maxEvents: 30,
    userId: sessionUserId || undefined,
    userRole: sessionUserRole,
    eventTypes: ["booking_request", "helper_presence", "location_update", "booking_update"],
    resourceId: sessionUserId || undefined,
  });

  useEffect(() => {
    if (sessionUserId) {
      setHelperId(sessionUserId);
    }
  }, [sessionUserId]);

  const incomingJobs = useMemo(
    () => eventMessages.filter((message) => message.event === "booking_request"),
    [eventMessages],
  );

  async function handleSimulateIncomingJob() {
    setSending(true);
    setRequestError(null);

    try {
      await Promise.all([
        publishHelperPresence({ helperUserId: helperId, status: "online", availableSlots: 1 }),
        publishLocationUpdate({
          helperUserId: helperId,
          bookingId,
          latitude: 12.9123,
          longitude: 77.6421,
          accuracy: 5,
        }),
        createIncomingJob({ bookingId, helperId, status: "pending" }),
      ]);
    } catch {
      setRequestError("Could not push realtime helper events. Check realtime service URL.");
    } finally {
      setSending(false);
    }
  }

  return (
    <main className="space-y-4 p-6">
      <h1 className="text-2xl font-semibold">Incoming Job Requests</h1>
      <p className="text-sm text-muted-foreground">Accept or reject nearby job requests.</p>

      {loading ? <p className="text-sm text-muted-foreground">Loading session...</p> : null}
      {!loading && role !== "helper" && role !== "admin" ? (
        <p className="text-sm text-amber-700">This workspace is intended for helper/admin roles.</p>
      ) : null}

      <section className="rounded-lg border p-4">
        <div className="mb-3 flex items-center gap-2 text-sm">
          <span className={connected ? "text-green-600" : "text-amber-600"}>{connected ? "WS connected" : "WS disconnected"}</span>
        </div>

        <div className="grid gap-2 sm:grid-cols-2">
          <label className="text-sm">
            Helper ID
            <input
              className="mt-1 w-full rounded border px-2 py-1"
              value={helperId}
              onChange={(event) => setHelperId(event.target.value)}
            />
          </label>
          <label className="text-sm">
            Booking ID
            <input
              className="mt-1 w-full rounded border px-2 py-1"
              value={bookingId}
              onChange={(event) => setBookingId(event.target.value)}
            />
          </label>
        </div>

        <button
          className="mt-3 rounded bg-primary px-3 py-2 text-sm text-primary-foreground disabled:opacity-60"
          disabled={sending}
          onClick={handleSimulateIncomingJob}
        >
          {sending ? "Sending..." : "Send Incoming Job"}
        </button>

        {requestError ? <p className="mt-2 text-sm text-red-600">{requestError}</p> : null}
      </section>

      <section className="rounded-lg border p-4">
        <h2 className="text-base font-medium">Live Incoming Jobs</h2>
        {incomingJobs.length === 0 ? (
          <p className="mt-2 text-sm text-muted-foreground">No incoming job events yet.</p>
        ) : (
          <ul className="mt-2 space-y-2 text-sm">
            {incomingJobs.map((message, index) => (
              <li key={`${message.occurredAt ?? "t"}-${index}`} className="rounded border p-2">
                <p className="font-medium">{message.event}</p>
                <pre className="mt-1 overflow-x-auto text-xs">{JSON.stringify(message.data, null, 2)}</pre>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
