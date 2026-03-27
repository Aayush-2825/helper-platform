"use client";

import { useState, useEffect, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
}: {
  job: IncomingJob;
  removeJob: (bookingId: string) => void;
  onJobAccepted?: (bookingId: string) => void;
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
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [job.expiresAt]);

  const isExpired = secondsLeft === 0;
  const isActing = actionState !== "idle";
  const timerPercentage = job.expiresAt ? (secondsLeft / 60) * 100 : 100;

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

  return (
    <div className={cn("reveal-up", isExpired && "opacity-50 grayscale pointer-events-none")}>
      <Card className="surface-card-strong border-none overflow-hidden group active:scale-[0.98] transition-all">
        <div className="p-5 flex flex-col gap-4">
          <div className="flex justify-between items-start gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Badge className="bg-primary/10 text-primary border-none rounded-lg px-2 font-black text-[10px] uppercase tracking-wider">
                   {formatCategory(job.categoryId)}
                </Badge>
                {job.distanceKm !== undefined && (
                   <span className="text-[10px] font-bold text-muted-foreground uppercase">{job.distanceKm}km away</span>
                )}
              </div>
              <p className="font-heading font-black text-xl leading-tight">New Request</p>
              <p className="text-xs text-muted-foreground font-medium truncate max-w-[200px]">{job.addressLine}</p>
            </div>

            <div className="relative size-14 flex items-center justify-center">
               <svg className="size-full -rotate-90">
                  <circle cx="28" cy="28" r="24" className="fill-none stroke-muted/20 stroke-2" />
                  <circle 
                    cx="28" cy="28" r="24" 
                    className={cn("fill-none stroke-[3] transition-all duration-1000", secondsLeft < 10 ? "stroke-destructive" : "stroke-primary")}
                    strokeDasharray={150.8}
                    strokeDashoffset={150.8 - (150.8 * timerPercentage) / 100}
                  />
               </svg>
               <span className={cn("absolute font-black text-xs", secondsLeft < 10 ? "text-destructive" : "text-primary")}>
                  {secondsLeft}s
               </span>
            </div>
          </div>

          <div className="flex items-center justify-between border-t border-border/30 pt-4">
            <div className="flex flex-col">
               <span className="text-[10px] font-bold text-muted-foreground uppercase">Estimated Earning</span>
               <span className="text-2xl font-black tracking-tighter text-primary">₹{job.quotedAmount}</span>
            </div>
            <div className="flex gap-2">
               <Button 
                 variant="ghost" 
                 size="icon" 
                 className="rounded-2xl size-12 bg-muted/50 hover:bg-destructive/10 hover:text-destructive group/btn"
                 onClick={() => removeJob(job.bookingId)}
               >
                  <XCircle className="size-5" />
               </Button>
               <Button 
                className="rounded-2xl h-12 px-6 font-black shadow-lg shadow-primary/20 active:scale-95"
                disabled={isActing || isExpired}
                onClick={handleAccept}
               >
                 {actionState === "accepting" ? <Loader2 className="size-5 animate-spin" /> : "Accept Now"}
               </Button>
            </div>
          </div>

          {(acceptError || rejectError) && (
            <p className="text-[10px] font-bold text-destructive animate-shake">{acceptError || rejectError}</p>
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
  if (jobs.length === 0) {
    return (
      <div className="reveal-up">
        <div className="surface-card border-none bg-muted/10 p-12 text-center space-y-4 rounded-[2rem]">
          <div className="relative size-20 mx-auto">
             <div className="absolute inset-0 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
             <div className="absolute inset-4 rounded-full bg-primary/10 flex items-center justify-center">
                <RadioTower className="size-6 text-primary animate-pulse" />
             </div>
          </div>
          <div className="space-y-1">
            <p className="font-bold text-lg">Looking for jobs...</p>
            <p className="text-sm text-muted-foreground">Nearby requests will appear here in real-time.</p>
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
        />
      ))}
    </div>
  );
}
