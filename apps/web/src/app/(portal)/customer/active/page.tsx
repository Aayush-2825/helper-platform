"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, Loader2, RefreshCcw } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type BookingRecord = {
  id: string;
  status: string;
  requestedAt: string;
};

const ACTIVE_STATUS_PRIORITY = ["in_progress", "accepted", "matched", "requested"];

function pickActiveBooking(bookings: BookingRecord[]) {
  const sorted = [...bookings].sort(
    (a, b) => new Date(b.requestedAt).getTime() - new Date(a.requestedAt).getTime(),
  );

  for (const status of ACTIVE_STATUS_PRIORITY) {
    const found = sorted.find((booking) => booking.status === status);
    if (found) return found;
  }

  return null;
}

export default function CustomerActiveBookingPage() {
  const router = useRouter();
  const [bookings, setBookings] = useState<BookingRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadToken, setReloadToken] = useState(0);

  useEffect(() => {
    let cancelled = false;

    async function loadBookings() {
      setError(null);
      try {
        const res = await fetch("/api/bookings", { credentials: "include" });
        if (!res.ok) {
          throw new Error("Unable to load your bookings right now.");
        }

        const data = (await res.json()) as { bookings?: BookingRecord[] };
        if (cancelled) return;

        const allBookings = data.bookings ?? [];
        setBookings(allBookings);

        const activeBooking = pickActiveBooking(allBookings);
        if (activeBooking) {
          router.replace(`/customer/bookings/${activeBooking.id}`);
        }
      } catch (fetchError) {
        if (!cancelled) {
          setError(fetchError instanceof Error ? fetchError.message : "Unable to load your bookings right now.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void loadBookings();

    return () => {
      cancelled = true;
    };
  }, [reloadToken, router]);

  const hasAnyBooking = useMemo(() => bookings.length > 0, [bookings]);

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Loader2 className="size-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <Card className="surface-card-strong border-none max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>{hasAnyBooking ? "No Active Booking" : "No Booking Yet"}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {error ? (
          <div className="rounded-2xl border border-destructive/20 bg-destructive/5 p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="mt-0.5 size-5 text-destructive" />
              <div className="flex-1 space-y-3">
                <div>
                  <p className="text-sm font-medium text-foreground">Could not load active booking</p>
                  <p className="text-sm text-muted-foreground">{error}</p>
                </div>
                <Button variant="outline" className="gap-2 rounded-2xl" onClick={() => setReloadToken((value) => value + 1)}>
                  <RefreshCcw className="size-4" />
                  Retry
                </Button>
              </div>
            </div>
          </div>
        ) : null}
        <p className="text-sm text-muted-foreground">
          {hasAnyBooking
            ? "You don't have an active request right now. Start a new booking or review your history."
            : "Start your first booking to get matched with nearby helpers."}
        </p>
        <div className="flex flex-wrap gap-3">
          <Link href="/customer/book" className={buttonVariants({ variant: "default", className: "rounded-2xl" })}>
            Start Booking
          </Link>
          <Link
            href="/customer/bookings"
            className={cn(buttonVariants({ variant: "outline", className: "rounded-2xl" }))}
          >
            View Bookings
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
