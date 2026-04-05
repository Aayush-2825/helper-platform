"use client";

import { useCallback, useEffect, useState } from "react";
import { useRealtimeEvents } from "@/hooks/use-realtime-events";
import { useSession } from "@/lib/auth/session";
import { BookingCard, type Booking } from "@/components/BookingCard";
import { BookingJourneySummary } from "@/components/BookingJourneySummary";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, RefreshCw, Wifi, WifiOff } from "lucide-react";
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
  eventType: "accepted" | "in_progress" | "completed" | "cancelled" | "expired";
  acceptedAt?: string;
  startedAt?: string;
  completedAt?: string;
};

const ACTIVE_STATUSES = new Set(["requested", "matched", "accepted", "in_progress"]);
const PAST_STATUSES = new Set(["completed", "cancelled", "expired"]);

export default function CustomerBookingsPage() {
  const { session, loading: sessionLoading } = useSession();
  const userId = session?.user.id;
  const userRole = session?.user.role;

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [syncError, setSyncError] = useState<string | null>(null);

  const fetchBookings = useCallback(async (options?: { background?: boolean }) => {
    const background = options?.background ?? false;

    if (background) {
      setRefreshing(true);
      setSyncError(null);
    } else {
      setLoading(true);
      setFetchError(null);
    }

    try {
      const res = await fetch("/api/bookings", { credentials: "include" });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        const message = (body as { message?: string }).message ?? "Failed to load bookings.";
        if (background) {
          setSyncError(message);
        } else {
          setFetchError(message);
        }
        return;
      }

      const data = (await res.json()) as { bookings: Booking[] };
      setBookings(data.bookings ?? []);
      if (background) {
        setSyncError(null);
      }
    } catch {
      if (background) {
        setSyncError("Live sync failed. Showing the last loaded state.");
      } else {
        setFetchError("Failed to load bookings. Please try again.");
      }
    } finally {
      if (background) {
        setRefreshing(false);
      } else {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    if (sessionLoading) {
      return;
    }

    if (!session?.user?.id) {
      setFetchError("You need to sign in to view your bookings.");
      setLoading(false);
      return;
    }

    void fetchBookings();
  }, [fetchBookings, session?.user?.id, sessionLoading]);

  const { connected, eventMessages } = useRealtimeEvents({
    userId,
    userRole,
    eventTypes: ["booking_update"],
  });

  const latestEvent = eventMessages[0];

  useEffect(() => {
    if (!latestEvent || latestEvent.type !== "event" || latestEvent.event !== "booking_update") {
      return;
    }

    const data = latestEvent.data as BookingUpdateEventData | undefined;
    if (!data?.bookingId) {
      return;
    }

    void fetchBookings({ background: true });
  }, [fetchBookings, latestEvent]);

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
          <p className="text-sm text-muted-foreground">Track active, completed, cancelled, and expired bookings.</p>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <Badge variant="secondary" className="gap-1.5">
              {connected ? <Wifi className="h-3.5 w-3.5" /> : <WifiOff className="h-3.5 w-3.5" />}
              {connected ? "Live updates on" : "Live updates off"}
            </Badge>
            {refreshing && (
              <Badge variant="outline" className="gap-1.5">
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                Syncing
              </Badge>
            )}
          </div>
        </div>
        <div className="flex shrink-0 flex-col items-end gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="gap-2"
            onClick={() => void fetchBookings({ background: true })}
            disabled={loading || refreshing}
          >
            <RefreshCw className={cn("h-4 w-4", refreshing && "animate-spin")} />
            Refresh
          </Button>
          {!loading && (
            <Badge variant="secondary" className="shrink-0">
              {bookings.length} total
            </Badge>
          )}
        </div>
      </div>

      {loading && <LoadingSkeleton />}

      {!loading && fetchError && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400">
          {fetchError}
        </div>
      )}

      {!loading && !fetchError && syncError && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800 dark:border-amber-800 dark:bg-amber-900/20 dark:text-amber-300">
          {syncError}
        </div>
      )}

      {!loading && !fetchError && (
        <div className="space-y-8">
          <BookingJourneySummary
            bookings={bookings}
            activeStatuses={["requested", "matched", "accepted", "in_progress"]}
            title="Customer journey snapshot"
          />

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
