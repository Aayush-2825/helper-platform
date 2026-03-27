"use client";

import { useEffect, useState } from "react";
import { useRealtimeEvents } from "@/hooks/use-realtime-events";
import { useSession } from "@/lib/auth/session";
import { BookingCard, type Booking } from "@/components/BookingCard";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

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

type BookingUpdateEventData = {
  bookingId: string;
  eventType: "accepted" | "in_progress" | "completed" | "cancelled";
  acceptedAt?: string;
  startedAt?: string;
  completedAt?: string;
};

const ACTIVE_STATUSES = new Set(["requested", "accepted", "in_progress"]);
const PAST_STATUSES = new Set(["completed", "cancelled"]);

export default function CustomerBookingsPage() {
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

  const sorted = [...bookings].sort(
    (a, b) => new Date(b.requestedAt).getTime() - new Date(a.requestedAt).getTime(),
  );

  const activeBookings = sorted.filter((b) => ACTIVE_STATUSES.has(b.status));
  const pastBookings = sorted.filter((b) => PAST_STATUSES.has(b.status));

  return (
    <main className="space-y-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">My Bookings</h1>
          <p className="text-sm text-muted-foreground">Track active, completed, and canceled bookings.</p>
        </div>
        {!loading && (
          <Badge variant="secondary" className="shrink-0 mt-1">
            {bookings.length} total
          </Badge>
        )}
      </div>

      {loading && <LoadingSkeleton />}

      {!loading && fetchError && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400">
          {fetchError}
        </div>
      )}

      {!loading && !fetchError && (
        <div className="space-y-8">
          {/* Active section */}
          <section className="space-y-3">
            <h2
              className={cn(
                "text-base font-semibold flex items-center gap-2",
                activeBookings.length > 0 && "animate-pulse",
              )}
            >
              Active
              <Badge className="bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400">
                {activeBookings.length}
              </Badge>
            </h2>
            {activeBookings.length === 0 ? (
              <div className="surface-card p-8 text-center">
                <p className="text-muted-foreground text-sm">No active bookings right now.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {activeBookings.map((booking) => (
                  <div key={booking.id} className="surface-card p-0 overflow-hidden">
                    <BookingCard booking={booking} />
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Past section */}
          <section className="space-y-3">
            <h2 className="text-base font-semibold flex items-center gap-2">
              Past
              <Badge variant="secondary">{pastBookings.length}</Badge>
            </h2>
            {pastBookings.length === 0 ? (
              <div className="surface-card p-8 text-center">
                <p className="text-muted-foreground text-sm">No past bookings yet.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {pastBookings.map((booking) => (
                  <div key={booking.id} className="surface-card p-0 overflow-hidden">
                    <BookingCard booking={booking} />
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      )}
    </main>
  );
}
