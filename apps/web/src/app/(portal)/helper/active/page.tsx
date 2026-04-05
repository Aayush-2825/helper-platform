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

const ACTIVE_STATUS_PRIORITY = ["in_progress", "accepted"];

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

export default function HelperActiveJobPage() {
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
          throw new Error("Unable to load your jobs right now.");
        }

        const data = (await res.json()) as { bookings?: BookingRecord[] };
        if (cancelled) return;

        const allBookings = data.bookings ?? [];
        setBookings(allBookings);

        const activeBooking = pickActiveBooking(allBookings);
        if (activeBooking) {
          router.replace(`/helper/bookings/${activeBooking.id}`);
        }
      } catch (fetchError) {
        if (!cancelled) {
          setError(fetchError instanceof Error ? fetchError.message : "Unable to load your jobs right now.");
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
        <CardTitle>{hasAnyBooking ? "No Active Job" : "No Jobs Yet"}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {error ? (
          <div className="rounded-2xl border border-destructive/20 bg-destructive/5 p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="mt-0.5 size-5 text-destructive" />
              <div className="flex-1 space-y-3">
                <div>
                  <p className="text-sm font-medium text-foreground">Could not load active job</p>
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
            ? "You currently have no active assignment. Check incoming requests or review history."
            : "You do not have any jobs yet. Go online and monitor incoming requests."}
        </p>
        <div className="flex flex-wrap gap-3">
          <Link href="/helper/incoming-jobs" className={buttonVariants({ variant: "default", className: "rounded-2xl" })}>
            Open Incoming Jobs
          </Link>
          <Link
            href="/helper/job-history"
            className={cn(buttonVariants({ variant: "outline", className: "rounded-2xl" }))}
          >
            View History
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
