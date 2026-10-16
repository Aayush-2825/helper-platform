"use client";

import { useState } from "react";
import { Loader2, MapPin, Clock, CheckCircle2, ArrowRight, Play, Check } from "lucide-react";
import { Card } from "@repo/ui/components/ui/card";
import { Button } from "@repo/ui/components/ui/button";
import Link from "next/link";
import { Booking } from "@/features/booking/components/BookingCard";
import { StatusBadge } from "@features/shared/components/StatusBadge";
import { cn } from "@/lib/utils";

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

const categoryEmojis: Record<string, string> = {
  driver: "🚗",
  electrician: "⚡",
  plumber: "🔧",
  cleaner: "✨",
  chef: "🍳",
  delivery_helper: "📦",
  caretaker: "🤝",
  security_guard: "🛡️",
  other: "📋",
};

function formatDateTime(value: Date | string): string {
  const date = typeof value === "string" ? new Date(value) : value;
  return date.toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export type JobCardProps = {
  booking: Booking;
  onStart?: (id: string) => Promise<void>;
  onComplete?: (id: string) => Promise<void>;
  onAccept?: (id: string) => Promise<void>;
  onReject?: (id: string) => Promise<void>;
  distanceKm?: number;
  etaMinutes?: number;
};

export function JobCard({
  booking,
  onStart,
  onComplete,
  onAccept,
  onReject,
  distanceKm,
  etaMinutes,
}: JobCardProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const status = booking.status;
  const showAcceptedAt =
    status === "accepted" || status === "in_progress" || status === "completed";
  const showStartedAt = status === "in_progress" || status === "completed";
  const showCompletedAt = status === "completed";
  const categoryName = categoryLabels[booking.categoryId] ?? booking.categoryId;
  const categoryEmoji = categoryEmojis[booking.categoryId] ?? "📋";
  const displayDistance = distanceKm ?? 1.4;
  const displayEta = etaMinutes ?? Math.max(3, Math.round(displayDistance * 3));

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

  async function handleAccept() {
    if (!onAccept) return;
    setLoading(true);
    setError(null);
    try {
      await onAccept(booking.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to accept job");
    } finally {
      setLoading(false);
    }
  }

  async function handleReject() {
    if (!onReject) return;
    setLoading(true);
    setError(null);
    try {
      await onReject(booking.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to decline job");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="overflow-hidden rounded-2xl border border-border/80 bg-card/85 backdrop-blur-xl shadow-xs hover:border-foreground/30 hover:shadow-md transition-all duration-300">
      <Link
        href={`/helper/bookings/${booking.id}`}
        className="block p-5 space-y-4 hover:bg-muted/30 transition-colors"
      >
        {/* Top Header: Service emoji, Category name & Status */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <span className="flex size-9 items-center justify-center rounded-xl bg-orange-500/10 text-base shadow-xs">
              {categoryEmoji}
            </span>
            <div>
              <h3 className="font-black text-base text-foreground leading-tight">
                {categoryName}
              </h3>
              <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wide">
                Booking #{booking.id.slice(0, 8)}
              </p>
            </div>
          </div>
          <StatusBadge status={booking.status} />
        </div>

        {/* Distance & ETA Badge */}
        <div className="flex items-center justify-between rounded-xl border border-border/60 bg-background/70 px-3 py-2 text-xs">
          <div className="flex items-center gap-1.5 font-bold text-foreground">
            <MapPin className="size-3.5 text-orange-500" />
            <span>{displayDistance} km &bull; {displayEta} mins away</span>
          </div>
          <div className="flex items-center gap-1 text-[11px] text-muted-foreground font-medium">
            <Clock className="size-3" />
            <span>{formatDateTime(booking.requestedAt)}</span>
          </div>
        </div>

        {/* Address */}
        <div className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
          <span className="font-semibold text-foreground">Location: </span>
          {booking.addressLine}{booking.city ? `, ${booking.city}` : ""}
        </div>

        {/* Large bold orange price */}
        <div className="flex items-baseline justify-between border-t border-border/40 pt-3">
          <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Helper Payout
          </span>
          <span className="text-2xl font-black tracking-tight text-orange-600 dark:text-orange-400">
            ₹{booking.quotedAmount.toLocaleString("en-IN")}
          </span>
        </div>

        {/* Timestamps */}
        <div className="space-y-0.5 text-[11px] text-muted-foreground">
          {showAcceptedAt && booking.acceptedAt && (
            <p>Accepted: {formatDateTime(booking.acceptedAt)}</p>
          )}
          {showStartedAt && booking.startedAt && (
            <p className="text-emerald-600 dark:text-emerald-400 font-semibold">
              Started: {formatDateTime(booking.startedAt)}
            </p>
          )}
          {showCompletedAt && booking.completedAt && (
            <p className="text-muted-foreground font-medium">
              Completed: {formatDateTime(booking.completedAt)}
            </p>
          )}
        </div>
      </Link>

      {/* Action Buttons as full-width pill buttons */}
      {(error || (status === "requested" && (onAccept || onReject)) || (status === "accepted" && onStart) || (status === "in_progress" && onComplete)) && (
        <div className="px-5 pb-5 space-y-2">
          {error && (
            <p className="text-xs font-bold text-destructive animate-shake">{error}</p>
          )}

          {status === "requested" && (
            <div className="grid grid-cols-2 gap-2">
              {onReject && (
                <Button
                  size="default"
                  variant="outline"
                  disabled={loading}
                  onClick={handleReject}
                  className="w-full rounded-xl text-xs font-bold border-border/80"
                >
                  Decline
                </Button>
              )}
              {onAccept && (
                <Button
                  size="default"
                  disabled={loading}
                  onClick={handleAccept}
                  className="w-full rounded-xl text-xs font-black bg-orange-500 text-white hover:bg-orange-600 shadow-md shadow-orange-500/20"
                >
                  {loading ? <Loader2 className="mr-1.5 size-4 animate-spin" /> : <CheckCircle2 className="mr-1.5 size-4" />}
                  Accept Now
                </Button>
              )}
            </div>
          )}

          {status === "accepted" && onStart && (
            <Button
              size="default"
              disabled={loading}
              onClick={handleStart}
              className="w-full rounded-xl text-xs font-black bg-foreground text-background hover:bg-foreground/90 transition-transform active:scale-95"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin" />
                  Starting Job...
                </>
              ) : (
                <>
                  <Play className="mr-2 size-4 fill-current" />
                  Start Job
                </>
              )}
            </Button>
          )}

          {status === "in_progress" && onComplete && (
            <Button
              size="default"
              disabled={loading}
              onClick={handleComplete}
              className="w-full rounded-xl text-xs font-black bg-emerald-600 text-white hover:bg-emerald-700 shadow-md shadow-emerald-600/20 transition-transform active:scale-95"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin" />
                  Completing Job...
                </>
              ) : (
                <>
                  <Check className="mr-2 size-4 stroke-[3px]" />
                  Complete Job & Collect OTP
                </>
              )}
            </Button>
          )}
        </div>
      )}
    </Card>
  );
}
