"use client";

import { useState, useEffect, useRef } from "react";
import { Card } from "@repo/ui/components/ui/card";
import { Button } from "@repo/ui/components/ui/button";
import { Badge } from "@repo/ui/components/ui/badge";
import { Loader2, RadioTower, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { IncomingJob } from "@/app/(portal)/helper/incoming-jobs/useIncomingJobs";

const CATEGORY_LABELS: Record<string, string> = {
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

const CATEGORY_EMOJIS: Record<string, string> = {
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

function formatCategory(categoryId: string): string {
  return CATEGORY_LABELS[categoryId] ?? categoryId;
}

function getSecondsRemaining(expiresAt?: string): number {
  if (!expiresAt) return Infinity;
  return Math.max(0, Math.floor((new Date(expiresAt).getTime() - Date.now()) / 1000));
}

type ActionState = "idle" | "accepting" | "rejecting";

function JobCard({
  job,
  removeJob,
  onJobAccepted,
  onJobExpired,
}: {
  job: IncomingJob;
  removeJob: (bookingId: string) => void;
  onJobAccepted?: (bookingId: string) => void;
  onJobExpired?: (bookingId: string) => void;
}) {
  const [secondsLeft, setSecondsLeft] = useState(() => getSecondsRemaining(job.expiresAt));
  const [actionState, setActionState] = useState<ActionState>("idle");
  const [acceptError, setAcceptError] = useState<string | null>(null);
  const [rejectError, setRejectError] = useState<string | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!job.expiresAt) return;
    intervalRef.current = setInterval(() => {
      setSecondsLeft(getSecondsRemaining(job.expiresAt));
    }, 1000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [job.expiresAt]);

  useEffect(() => {
    if (secondsLeft === 0 && job.expiresAt) {
      onJobExpired?.(job.bookingId);
    }
  }, [job.bookingId, job.expiresAt, onJobExpired, secondsLeft]);

  const isExpired = secondsLeft === 0;
  const isActing = actionState !== "idle";
  const timerPercentage = job.expiresAt ? Math.min(100, Math.max(0, (secondsLeft / 60) * 100)) : 100;
  const distanceKm = job.distanceKm ?? 1.2;
  const etaMins = Math.max(2, Math.round(distanceKm * 3));
  const categoryEmoji = CATEGORY_EMOJIS[job.categoryId] ?? "📋";

  const acceptLabel = isExpired
    ? "Expired"
    : actionState === "accepting"
      ? "Accepting..."
      : "Accept Request";

  async function handleAccept() {
    setActionState("accepting");
    setAcceptError(null);
    try {
      const res = await fetch(`/api/bookings/${job.bookingId}/accept`, { method: "POST" });
      if (res.ok) {
        onJobAccepted?.(job.bookingId);
        removeJob(job.bookingId);
      } else {
        const body = await res.json().catch(() => ({}));
        setAcceptError(body?.error || body?.message || "Failed to accept");
        setActionState("idle");
      }
    } catch {
      setAcceptError("Network error");
      setActionState("idle");
    }
  }

  async function handleReject() {
    setActionState("rejecting");
    setRejectError(null);
    try {
      const reason = "Helper rejected from incoming queue";
      const res = await fetch(`/api/bookings/${job.bookingId}/reject`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason }),
      });
      if (res.ok) {
        removeJob(job.bookingId);
      } else {
        const body = await res.json().catch(() => ({}));
        setRejectError(body?.error || body?.message || "Failed to reject");
        setActionState("idle");
      }
    } catch {
      setRejectError("Network error");
      setActionState("idle");
    }
  }

  return (
    <div className={cn("reveal-up transition-all", isExpired && "opacity-50 grayscale")}>
      <Card className="overflow-hidden rounded-3xl border border-orange-500/40 bg-card/90 shadow-2xl backdrop-blur-2xl ring-1 ring-orange-500/20">
        <div className="p-5 sm:p-6 space-y-5">
          {/* Top Info Bar */}
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="flex size-12 items-center justify-center rounded-2xl bg-orange-500/10 text-xl shadow-xs">
                {categoryEmoji}
              </span>
              <div>
                <div className="flex items-center gap-2">
                  <Badge className="bg-orange-500/15 text-orange-600 dark:text-orange-400 border-none rounded-lg px-2.5 py-0.5 text-xs font-black uppercase tracking-wider">
                    {formatCategory(job.categoryId)}
                  </Badge>
                  <span className="text-xs font-bold text-muted-foreground uppercase">
                    {distanceKm} km &bull; {etaMins} mins
                  </span>
                </div>
                <h3 className="mt-1 font-heading font-black text-xl leading-tight text-foreground">
                  {isExpired ? "Request expired" : "New Instant Request"}
                </h3>
              </div>
            </div>

            {/* Circular Countdown Ring */}
            <div className="relative flex size-14 shrink-0 items-center justify-center">
              <svg className="size-full -rotate-90">
                <circle cx="28" cy="28" r="23" className="fill-none stroke-muted/30 stroke-3" />
                <circle
                  cx="28"
                  cy="28"
                  r="23"
                  className={cn(
                    "fill-none stroke-3 transition-all duration-1000",
                    secondsLeft < 15 ? "stroke-destructive" : "stroke-orange-500"
                  )}
                  strokeDasharray={144.5}
                  strokeDashoffset={144.5 - (144.5 * timerPercentage) / 100}
                />
              </svg>
              <span
                className={cn(
                  "absolute font-black text-xs",
                  secondsLeft < 15 ? "text-destructive animate-pulse" : "text-orange-600 dark:text-orange-400"
                )}
              >
                {Number.isFinite(secondsLeft) ? `${secondsLeft}s` : "--"}
              </span>
            </div>
          </div>

          {/* Location & Details Strip */}
          <div className="rounded-2xl border border-border/70 bg-background/80 p-3.5 space-y-1">
            <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
              Customer Pickup / Destination
            </p>
            <p className="text-sm font-semibold text-foreground line-clamp-2">
              {job.addressLine || "Doorstep service request"}
            </p>
          </div>

          {/* Pricing & Full-Width Pill Buttons */}
          <div className="border-t border-border/50 pt-4 space-y-4">
            <div className="flex items-baseline justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Your Net Earnings
                </p>
                <p className="text-3xl font-black tracking-tight text-orange-600 dark:text-orange-400">
                  ₹{job.quotedAmount.toLocaleString("en-IN")}
                </p>
              </div>
              <span className="text-xs font-bold text-emerald-600 bg-emerald-500/10 px-2.5 py-1 rounded-full">
                Guaranteed Payout
              </span>
            </div>

            <div className="grid grid-cols-[1fr_2.5fr] gap-3">
              <Button
                variant="outline"
                size="default"
                className="h-13 rounded-2xl font-bold text-xs border-border/80 hover:bg-destructive/10 hover:text-destructive active:scale-95 transition-all"
                disabled={isActing || isExpired}
                onClick={handleReject}
              >
                {actionState === "rejecting" ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  "Decline"
                )}
              </Button>

              <Button
                size="default"
                className={cn(
                  "h-13 rounded-2xl font-black text-sm text-white bg-orange-500 hover:bg-orange-600 transition-all active:scale-95 shadow-xl shadow-orange-500/30",
                  !isExpired && "ring-4 ring-orange-500/30 animate-pulse"
                )}
                disabled={isActing || isExpired}
                onClick={handleAccept}
              >
                {actionState === "accepting" ? (
                  <Loader2 className="size-5 animate-spin mr-2" />
                ) : null}
                {acceptLabel}
              </Button>
            </div>
          </div>

          {(acceptError || rejectError) && (
            <p className="text-xs font-bold text-destructive animate-shake text-center">
              {acceptError || rejectError}
            </p>
          )}
          {isExpired && (
            <p className="text-xs font-bold text-muted-foreground text-center">
              This offer expired and was removed from your queue.
            </p>
          )}
        </div>
      </Card>
    </div>
  );
}

export function IncomingJobsPanel({
  jobs,
  removeJob,
  onJobAccepted,
}: {
  jobs: IncomingJob[];
  removeJob: (bookingId: string) => void;
  onJobAccepted?: (bookingId: string) => void;
}) {
  // Vibration hook when new jobs arrive for delivery driver feel
  useEffect(() => {
    if (jobs.length > 0 && typeof navigator !== "undefined" && "vibrate" in navigator) {
      try {
        navigator.vibrate([200, 100, 200, 100, 400]);
      } catch {
        // ignore if vibration is blocked
      }
    }
  }, [jobs.length]);

  if (jobs.length === 0) {
    return (
      <div className="reveal-up">
        <div className="surface-card border border-border/80 bg-card/60 p-12 text-center space-y-4 rounded-3xl backdrop-blur-md">
          <div className="relative size-20 mx-auto">
            <div className="absolute inset-0 rounded-full border-4 border-orange-500/20 border-t-orange-500 animate-spin" />
            <div className="absolute inset-4 rounded-full bg-orange-500/10 flex items-center justify-center">
              <RadioTower className="size-6 text-orange-500 animate-pulse" />
            </div>
          </div>
          <div className="space-y-1">
            <p className="font-black text-lg text-foreground">Listening for nearby jobs...</p>
            <p className="text-xs font-medium text-muted-foreground max-w-sm mx-auto">
              Keep your availability online. When a customer nearby requests help, it will sound and appear here instantly.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="grid gap-4">
      {jobs.map((job) => (
        <JobCard
          key={job.bookingId}
          job={job}
          removeJob={removeJob}
          onJobAccepted={onJobAccepted}
          onJobExpired={removeJob}
        />
      ))}
    </div>
  );
}
