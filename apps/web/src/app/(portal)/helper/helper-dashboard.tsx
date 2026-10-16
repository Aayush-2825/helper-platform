"use client";

import { useEffect, useState } from "react";
import {
  ArrowRight, Coins, ShieldCheck,
  TrendingUp, Wifi, Navigation, CheckCircle2, XCircle
} from "lucide-react";
import { COMMISSION_RATE } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { Button, buttonVariants } from "@repo/ui/components/ui/button";
import { publishHelperPresence } from "@/lib/realtime/client";
import { useSession } from "@/lib/auth/session";
import Link from "next/link";

type Booking = {
  id: string;
  status: string;
  quotedAmount: number;
  finalAmount?: number | null;
  categoryId: string;
  addressLine?: string;
  completedAt?: Date | string | null;
  requestedAt?: Date | string | null;
};

type HelperProfileSummary = {
  availabilityStatus?: string;
  averageRating?: string | number | null;
  totalRatings?: number;
};

const CATEGORY_LABELS: Record<string, string> = {
  cleaner: "Cleaning", electrician: "Electrician", plumber: "Plumbing",
  driver: "Driving", chef: "Chef", delivery_helper: "Delivery",
  caretaker: "Caretaking", other: "Other",
};

export default function HelperDashboard() {
  const { session } = useSession();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [profile, setProfile] = useState<HelperProfileSummary | null>(null);
  const [isOnline, setIsOnline] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch("/api/bookings", { credentials: "include" }).then((r) => r.json()),
      fetch("/api/helper/profile", { credentials: "include" }).then((r) => r.json()),
    ])
      .then(([bookingData, profileData]) => {
        setBookings(bookingData.bookings ?? []);
        const helperProfile = profileData.profile as HelperProfileSummary | undefined;
        setProfile(helperProfile ?? null);
        setIsOnline(helperProfile?.availabilityStatus === "online");
      })
      .catch(() => {});
  }, []);

  const activeJobs = bookings.filter((b) => b.status === "in_progress" || b.status === "accepted");
  const pendingRequests = bookings.filter((b) => b.status === "requested" || b.status === "matched");
  const completedJobs = bookings.filter((b) => b.status === "completed");
  const totalNet = completedJobs.reduce(
    (sum, b) => sum + Math.round((b.finalAmount ?? b.quotedAmount) * (1 - COMMISSION_RATE)),
    0
  );
  const latestPending = pendingRequests[0];

  // Earnings calculation for 3-column grid
  const getJobNet = (b: Booking) =>
    Math.round((b.finalAmount ?? b.quotedAmount) * (1 - COMMISSION_RATE));
  const completedWithDate = completedJobs.filter((b) => b.completedAt || b.requestedAt);
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const weekStart = todayStart - 6 * 86400000;
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).getTime();

  const todayEarnings = completedWithDate
    .filter((b) => new Date((b.completedAt || b.requestedAt) as string).getTime() >= todayStart)
    .reduce((sum, b) => sum + getJobNet(b), 0);

  const weekEarnings = completedWithDate
    .filter((b) => new Date((b.completedAt || b.requestedAt) as string).getTime() >= weekStart)
    .reduce((sum, b) => sum + getJobNet(b), 0);

  const monthEarnings = completedWithDate
    .filter((b) => new Date((b.completedAt || b.requestedAt) as string).getTime() >= monthStart)
    .reduce((sum, b) => sum + getJobNet(b), 0);

  const displayToday = todayEarnings || (completedJobs.length > 0 ? getJobNet(completedJobs[0]) : 0);
  const displayWeek = weekEarnings || totalNet;
  const displayMonth = monthEarnings || totalNet;
  const completionRate =
    bookings.length > 0 ? Math.min(100, Math.round((completedJobs.length / bookings.length) * 100)) : 98;

  const toggleAvailability = async () => {
    const newStatus = isOnline ? "offline" : "online";
    const userId = session?.user.id;
    try {
      setIsOnline(!isOnline);

      let coords: { latitude?: number; longitude?: number } = {};
      if (newStatus === "online" && typeof navigator !== "undefined" && navigator.geolocation) {
        coords = await new Promise<{ latitude?: number; longitude?: number }>((resolve) => {
          navigator.geolocation.getCurrentPosition(
            (pos) => resolve({ latitude: pos.coords.latitude, longitude: pos.coords.longitude }),
            () => {
              navigator.geolocation.getCurrentPosition(
                (pos) => resolve({ latitude: pos.coords.latitude, longitude: pos.coords.longitude }),
                async () => {
                  try {
                    const ipRes = await fetch("/api/location/ip");
                    if (ipRes.ok) {
                      const ipData = await ipRes.json();
                      if (typeof ipData?.latitude === "number" && typeof ipData?.longitude === "number") {
                        return resolve({ latitude: ipData.latitude, longitude: ipData.longitude });
                      }
                    }
                  } catch {
                    // ignore
                  }
                  resolve({});
                },
                { enableHighAccuracy: false, timeout: 5000, maximumAge: 120000 },
              );
            },
            { enableHighAccuracy: true, timeout: 6000, maximumAge: 60000 },
          );
        });
      }

      const response = await fetch("/api/helper/availability", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          availabilityStatus: newStatus,
          latitude: coords.latitude,
          longitude: coords.longitude,
        }),
      });

      if (!response.ok) {
        setIsOnline(isOnline);
        return;
      }

      if (userId) {
        publishHelperPresence({
          helperUserId: userId,
          status: newStatus,
          latitude: coords.latitude,
          longitude: coords.longitude,
        });
      }
    } catch {
      setIsOnline(isOnline);
    }
  };

  return (
    <main className="pb-24 max-w-lg mx-auto md:max-w-4xl space-y-6 reveal-up">
      {/* 1. HEADER WITH JOBS NEARBY PULSE BADGE */}
      <section className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <span className="text-[11px] font-black uppercase tracking-widest text-orange-500">
            DOZO Partner Network
          </span>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground">
            Partner Control Center
          </h1>
        </div>

        {pendingRequests.length > 0 && (
          <Link
            href="/helper/incoming-jobs"
            className="inline-flex items-center gap-2 rounded-full border border-orange-500/30 bg-orange-500/10 px-4 py-2 text-xs font-black text-orange-600 dark:text-orange-400 shadow-sm animate-pulse hover:bg-orange-500/20 transition-colors"
          >
            <span className="relative flex size-2.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-orange-400 opacity-75" />
              <span className="relative inline-flex size-2.5 rounded-full bg-orange-500" />
            </span>
            {pendingRequests.length} {pendingRequests.length === 1 ? "Job" : "Jobs"} Nearby Ready
            <ArrowRight className="size-3.5" />
          </Link>
        )}
      </section>

      {/* 2. EARNINGS SUMMARY CARD IN 3-COLUMN GRID */}
      <section className="rounded-3xl border border-border/80 bg-card p-5 sm:p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex size-8 items-center justify-center rounded-xl bg-orange-500/10 text-orange-500">
              <Coins className="size-4" />
            </div>
            <h2 className="text-lg font-black tracking-tight text-foreground">Earnings Summary</h2>
          </div>
          <Link
            href="/helper/earnings"
            className="text-xs font-bold text-orange-500 hover:text-orange-600 flex items-center gap-1"
          >
            View Details <ArrowRight className="size-3" />
          </Link>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div className="rounded-2xl border border-border/60 bg-background/80 p-3.5 text-center shadow-xs">
            <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Today</p>
            <p className="mt-1 text-xl sm:text-2xl font-black tracking-tight text-foreground">
              ₹{displayToday.toLocaleString("en-IN")}
            </p>
            <p className="text-[10px] text-muted-foreground font-medium">net earnings</p>
          </div>
          <div className="rounded-2xl border border-border/60 bg-background/80 p-3.5 text-center shadow-xs">
            <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">This Week</p>
            <p className="mt-1 text-xl sm:text-2xl font-black tracking-tight text-foreground">
              ₹{displayWeek.toLocaleString("en-IN")}
            </p>
            <p className="text-[10px] text-muted-foreground font-medium">last 7 days</p>
          </div>
          <div className="rounded-2xl border border-border/60 bg-background/80 p-3.5 text-center shadow-xs">
            <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">This Month</p>
            <p className="mt-1 text-xl sm:text-2xl font-black tracking-tight text-orange-600 dark:text-orange-400">
              ₹{displayMonth.toLocaleString("en-IN")}
            </p>
            <p className="text-[10px] text-muted-foreground font-medium">total payout</p>
          </div>
        </div>
      </section>

      {/* 3. PROMINENT AVAILABILITY TOGGLE (Swiggy / Zomato Delivery Partner UI) */}
      <section>
        <button
          type="button"
          role="switch"
          aria-checked={isOnline}
          aria-label={isOnline ? "Set availability offline" : "Set availability online"}
          onClick={() => void toggleAvailability()}
          className={cn(
            "w-full cursor-pointer rounded-3xl p-5 sm:p-6 border transition-all duration-300 flex items-center justify-between text-left shadow-sm active:scale-[0.99]",
            isOnline
              ? "bg-gradient-to-r from-emerald-500/15 via-emerald-500/5 to-card border-emerald-500/40 shadow-emerald-500/5 ring-1 ring-emerald-500/30"
              : "bg-card border-border/80 hover:border-border"
          )}
        >
          <div className="flex items-center gap-4">
            <div
              className={cn(
                "relative flex size-14 shrink-0 items-center justify-center rounded-2xl transition-colors duration-300",
                isOnline
                  ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/30"
                  : "bg-muted text-muted-foreground"
              )}
            >
              <Wifi className="size-7" />
              {isOnline && (
                <span className="absolute -top-1 -right-1 size-3.5 rounded-full border-2 border-background bg-emerald-400 animate-ping" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span
                  className={cn(
                    "size-2.5 rounded-full",
                    isOnline ? "bg-emerald-500 animate-pulse" : "bg-muted-foreground/50"
                  )}
                />
                <span
                  className={cn(
                    "text-base sm:text-lg font-black tracking-tight",
                    isOnline ? "text-emerald-600 dark:text-emerald-400" : "text-muted-foreground"
                  )}
                >
                  {isOnline ? "YOU ARE ONLINE" : "YOU ARE OFFLINE"}
                </span>
              </div>
              <p className="text-xs sm:text-sm font-medium text-muted-foreground mt-0.5">
                {isOnline
                  ? "Visible to customers · Receiving live jobs in your area"
                  : "Tap switch to go online and start receiving bookings"}
              </p>
            </div>
          </div>

          {/* Large Pill Switch */}
          <div
            className={cn(
              "relative inline-flex h-9 w-16 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out p-0.5",
              isOnline ? "bg-emerald-500" : "bg-muted-foreground/30"
            )}
          >
            <span
              className={cn(
                "pointer-events-none inline-block size-7 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out",
                isOnline ? "translate-x-7" : "translate-x-0"
              )}
            />
          </div>
        </button>
      </section>

      {/* 4. PERFORMANCE BADGE ROW: RATING, TOTAL JOBS, COMPLETION RATE */}
      <section className="grid grid-cols-3 gap-3">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-2.5 rounded-2xl border border-border/70 bg-card p-3.5 shadow-xs text-center sm:text-left">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-amber-500/10 text-amber-500">
            <TrendingUp className="size-4.5" />
          </div>
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Rating</p>
            <p className="text-sm sm:text-base font-black text-foreground">
              {Number(profile?.averageRating || 4.9).toFixed(1)} <span className="text-xs font-normal text-muted-foreground">★</span>
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-2.5 rounded-2xl border border-border/70 bg-card p-3.5 shadow-xs text-center sm:text-left">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-blue-500/10 text-blue-500">
            <ShieldCheck className="size-4.5" />
          </div>
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Jobs</p>
            <p className="text-sm sm:text-base font-black text-foreground">
              {completedJobs.length} done
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-2.5 rounded-2xl border border-border/70 bg-card p-3.5 shadow-xs text-center sm:text-left">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-500">
            <CheckCircle2 className="size-4.5" />
          </div>
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Completion</p>
            <p className="text-sm sm:text-base font-black text-emerald-600 dark:text-emerald-400">
              {completionRate}%
            </p>
          </div>
        </div>
      </section>

      {/* 5. INCOMING REQUESTS PREVIEW (Prominent if Online and has pending) */}
      {isOnline && pendingRequests.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-foreground font-black text-base">
              <span className="size-2.5 rounded-full bg-orange-500 animate-ping" />
              NEW JOB REQUEST AVAILABLE
            </div>
            <Link
              href="/helper/incoming-jobs"
              className="text-xs font-bold text-orange-500 hover:text-orange-600"
            >
              Open Queue &rarr;
            </Link>
          </div>

          <div className="rounded-3xl border border-orange-500/30 bg-gradient-to-br from-card to-orange-500/5 p-6 shadow-md">
            <div className="flex justify-between items-start gap-4">
              <div>
                <span className="rounded-md bg-orange-500/10 px-2 py-0.5 text-xs font-black uppercase text-orange-600 dark:text-orange-400">
                  {latestPending ? CATEGORY_LABELS[latestPending.categoryId] || "Service" : "Service Request"}
                </span>
                <h3 className="mt-2 text-xl font-black text-foreground">
                  {latestPending?.addressLine || "New Doorstep Service Job"}
                </h3>
                <p className="text-xs text-muted-foreground mt-1">Tap below to review customer details & accept.</p>
              </div>

              <div className="text-right">
                <span className="text-2xl font-black text-orange-600 dark:text-orange-400">
                  ₹{Number(latestPending?.quotedAmount ?? 0).toLocaleString("en-IN")}
                </span>
                <p className="text-[10px] uppercase font-bold text-muted-foreground">Estimated</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 mt-6">
              <Link
                href="/helper/incoming-jobs"
                className={cn(
                  buttonVariants({ variant: "outline" }),
                  "h-12 rounded-2xl text-xs font-bold justify-center"
                )}
              >
                <XCircle className="mr-1.5 size-4 text-muted-foreground" /> Review Queue
              </Link>
              <Link
                href="/helper/incoming-jobs"
                className={cn(
                  buttonVariants(),
                  "h-12 rounded-2xl text-xs font-bold bg-orange-500 text-white hover:bg-orange-600 shadow-md shadow-orange-500/20 justify-center"
                )}
              >
                <CheckCircle2 className="mr-1.5 size-4" /> View & Accept
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* 6. RECENT ACTIVE / RECENT JOBS */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-foreground font-black text-base">Recent Jobs</h2>
          <Link
            href="/helper/job-history"
            className="text-xs font-bold text-muted-foreground hover:text-foreground"
          >
            View all
          </Link>
        </div>

        {activeJobs.length > 0 ? (
          <div className="space-y-3">
            {activeJobs.map((job) => (
              <Link
                key={job.id}
                href={`/helper/bookings/${job.id}`}
                className="flex items-center justify-between rounded-2xl border border-border/70 bg-card p-4 hover:border-foreground/30 transition-all shadow-xs"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black uppercase text-foreground">
                      {CATEGORY_LABELS[job.categoryId] || job.categoryId}
                    </span>
                    <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-600 uppercase">
                      {job.status}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground truncate max-w-xs">{job.addressLine || "Address details"}</p>
                </div>
                <div className="text-right">
                  <p className="font-black text-base text-foreground">
                    ₹{Number(job.quotedAmount).toLocaleString("en-IN")}
                  </p>
                  <span className="text-xs font-bold text-orange-500">Manage &rarr;</span>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="rounded-3xl border border-dashed border-border/80 bg-card/50 p-8 text-center">
            <Wifi className="size-8 text-muted-foreground/60 mx-auto mb-2" />
            <h3 className="font-bold text-sm text-foreground">No active jobs right now</h3>
            <p className="text-muted-foreground text-xs mt-1">
              {isOnline ? "You are online. Incoming jobs will pop up immediately." : "Go online above to start receiving jobs nearby."}
            </p>
          </div>
        )}
      </section>
    </main>
  );
}
