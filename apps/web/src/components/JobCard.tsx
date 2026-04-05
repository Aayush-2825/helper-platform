"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/StatusBadge";
import type { Booking } from "@/components/BookingCard";
import Link from "next/link";

const categoryLabels: Record<string, string> = {
  driver: "Driver",
  electrician: "Electrician",
  plumber: "Plumber",
  cleaner: "Cleaner",
  chef: "Chef",
  delivery_helper: "Delivery Helper",
  caretaker: "Caretaker",
  security_guard: "Security Guard",
  other: "Other",
};

function formatDateTime(value: Date | string): string {
  const date = typeof value === "string" ? new Date(value) : value;
  return date.toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

type JobCardProps = {
  booking: Booking;
  onStart?: (id: string) => Promise<void>;
  onComplete?: (id: string) => Promise<void>;
};

export function JobCard({ booking, onStart, onComplete }: JobCardProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const status = booking.status;
  const showAcceptedAt =
    status === "accepted" || status === "in_progress" || status === "completed";
  const showStartedAt = status === "in_progress" || status === "completed";
  const showCompletedAt = status === "completed";

  async function handleStart() {
    if (!onStart) return;
    setLoading(true);
    setError(null);
    try {
      await onStart(booking.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to start job");
    } finally {
      setLoading(false);
    }
  }

  async function handleComplete() {
    if (!onComplete) return;
    setLoading(true);
    setError(null);
    try {
      await onComplete(booking.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to complete job");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="overflow-hidden">
      <Link href={`/helper/bookings/${booking.id}`} className="block p-4 space-y-2 hover:bg-muted/50 transition-colors">
        <div className="flex items-center justify-between">
          <span className="font-medium">
            {categoryLabels[booking.categoryId] ?? booking.categoryId}
          </span>
          <StatusBadge status={booking.status} />
        </div>

        <div className="text-sm text-muted-foreground">
          {booking.addressLine}, {booking.city}
        </div>

        <div className="text-sm font-medium">₹{booking.quotedAmount.toLocaleString("en-IN")}</div>

        <div className="text-xs text-muted-foreground">
          Requested: {formatDateTime(booking.requestedAt)}
        </div>

        {showAcceptedAt && booking.acceptedAt && (
          <div className="text-xs text-muted-foreground">
            Accepted: {formatDateTime(booking.acceptedAt)}
          </div>
        )}

        {showStartedAt && booking.startedAt && (
          <div className="text-xs text-muted-foreground">
            Started: {formatDateTime(booking.startedAt)}
          </div>
        )}

        {showCompletedAt && booking.completedAt && (
          <div className="text-xs text-muted-foreground">
            Completed: {formatDateTime(booking.completedAt)}
          </div>
        )}
      </Link>

      {(error || (status === "accepted" && onStart) || (status === "in_progress" && onComplete)) && (
        <div className="px-4 pb-4 space-y-2">
            {error && (
              <div className="text-xs text-destructive">{error}</div>
            )}

            {status === "accepted" && onStart && (
              <Button
                size="sm"
                disabled={loading}
                onClick={handleStart}
                className="w-full"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Starting…
                  </>
                ) : (
                  "Start Job"
                )}
              </Button>
            )}

            {status === "in_progress" && onComplete && (
              <Button
                size="sm"
                disabled={loading}
                onClick={handleComplete}
                className="w-full"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Completing…
                  </>
                ) : (
                  "Complete Job"
                )}
              </Button>
            )}
        </div>
      )}
    </Card>
  );
}
