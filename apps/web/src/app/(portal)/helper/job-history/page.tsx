"use client";

import { useEffect, useState } from "react";
import { useRealtimeEvents } from "@/hooks/use-realtime-events";
import { useSession } from "@/lib/auth/session";
import { JobCard } from "@/components/JobCard";
import { BookingJourneySummary } from "@/components/BookingJourneySummary";
import { Card, CardContent } from "@/components/ui/card";
import type { Booking } from "@/components/BookingCard";

function LoadingSkeleton() {
  return (
    <div className="space-y-4">
      {[1, 2, 3].map((i) => (
        <Card key={i}>
          <CardContent className="p-4 space-y-2">
            <div className="flex items-center justify-between">
              <div className="h-4 w-24 rounded bg-muted animate-pulse" />
              <div className="h-5 w-28 rounded bg-muted animate-pulse" />
            </div>
            <div className="h-3 w-48 rounded bg-muted animate-pulse" />
            <div className="h-3 w-16 rounded bg-muted animate-pulse" />
            <div className="h-3 w-36 rounded bg-muted animate-pulse" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export default function HelperJobHistoryPage() {
  const { session } = useSession();
  const userId = session?.user.id;
  const userRole = session?.user.role;

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchBookings() {
      try {
        const res = await fetch("/api/bookings");
        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          setFetchError((body as { message?: string }).message ?? "Failed to load bookings.");
          return;
        }
        const data = (await res.json()) as { bookings: Booking[] };
        setBookings(data.bookings ?? []);
      } catch {
        setFetchError("Failed to load bookings. Please try again.");
      } finally {
        setLoading(false);
      }
    }

    void fetchBookings();
  }, []);

  const { eventMessages } = useRealtimeEvents({
    userId,
    userRole,
    eventTypes: ["booking_update"],
  });

  useEffect(() => {
    if (eventMessages.length === 0) return;
    setBookings((prev) => {
      let next = [...prev];
      for (const msg of eventMessages) {
        if (msg.type !== "event" || msg.event !== "booking_update") continue;
        const data = msg.data as { bookingId?: string; eventType?: string; acceptedAt?: string; startedAt?: string; completedAt?: string } | undefined;
        if (!data?.bookingId) continue;
        const statusMap: Record<string, string> = {
          accepted: "accepted",
          in_progress: "in_progress",
          completed: "completed",
          cancelled: "cancelled",
        };
        const newStatus = statusMap[data.eventType ?? ""];
        if (!newStatus) continue;
        next = next.map((b) => {
          if (b.id !== data.bookingId) return b;
          return {
            ...b,
            status: newStatus,
            ...(data.acceptedAt ? { acceptedAt: data.acceptedAt } : {}),
            ...(data.startedAt ? { startedAt: data.startedAt } : {}),
            ...(data.completedAt ? { completedAt: data.completedAt } : {}),
          };
        });
      }
      return next;
    });
  }, [eventMessages]);

  const sortDesc = (a: Booking, b: Booking) =>
    new Date(b.requestedAt).getTime() - new Date(a.requestedAt).getTime();

  const activeJobs = bookings
    .filter((b) => b.status === "accepted" || b.status === "in_progress")
    .sort(sortDesc);

  const pastJobs = bookings
    .filter((b) => b.status === "completed" || b.status === "cancelled")
    .sort(sortDesc);

  const isEmpty = !loading && !fetchError && bookings.length === 0;

  return (
    <main className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-semibold">Job History</h1>
        <p className="text-sm text-muted-foreground">Review your active and past jobs.</p>
      </div>

      {loading && <LoadingSkeleton />}

      {!loading && fetchError && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400">
          {fetchError}
        </div>
      )}

      {isEmpty && (
        <div className="rounded-lg border p-8 text-center">
          <p className="text-muted-foreground">No jobs yet. Accepted jobs will appear here.</p>
        </div>
      )}

      {!loading && !fetchError && bookings.length > 0 && (
        <>
          <BookingJourneySummary
            bookings={bookings}
            activeStatuses={["accepted", "in_progress"]}
            title="Helper workload snapshot"
          />

          <section className="space-y-3">
            <h2 className="text-lg font-medium">Active Jobs</h2>
            {activeJobs.length === 0 ? (
              <p className="text-sm text-muted-foreground">No active jobs.</p>
            ) : (
              <div className="space-y-4">
                {activeJobs.map((booking) => (
                  <JobCard key={booking.id} booking={booking} />
                ))}
              </div>
            )}
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-medium">Past Jobs</h2>
            {pastJobs.length === 0 ? (
              <p className="text-sm text-muted-foreground">No past jobs.</p>
            ) : (
              <div className="space-y-4">
                {pastJobs.map((booking) => (
                  <JobCard key={booking.id} booking={booking} />
                ))}
              </div>
            )}
          </section>
        </>
      )}
    </main>
  );
}
