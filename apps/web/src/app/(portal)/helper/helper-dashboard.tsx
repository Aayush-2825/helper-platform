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
  const [isOnline, setIsOnline] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch("/api/bookings", { credentials: "include" }).then(r => r.json()),
      fetch("/api/helper/profile", { credentials: "include" }).then(r => r.json())
    ]).then(([bookingData, profileData]) => {
      setBookings(bookingData.bookings ?? []);
      const profile = profileData.profile as HelperProfileSummary | undefined;
      setIsOnline(profile?.availabilityStatus === "online");
    }).catch(() => {});
  }, []);

  const activeJobs = bookings.filter((b) => b.status === "in_progress" || b.status === "accepted");
  const pendingRequests = bookings.filter((b) => b.status === "requested" || b.status === "matched");
  const completedJobs = bookings.filter((b) => b.status === "completed");
  const totalNet = completedJobs.reduce((sum, b) => sum + Math.round((b.finalAmount ?? b.quotedAmount) * (1 - COMMISSION_RATE)), 0);
  const acceptedJobs = bookings.filter((b) => b.status === "accepted").length;
  const latestPending = pendingRequests[0];
  const averageNetPerJob = completedJobs.length > 0 ? Math.round(totalNet / completedJobs.length) : 0;
  
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
    <main className="pb-24 max-w-lg mx-auto md:max-w-4xl space-y-8 fade-up">
      <section className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-xl border border-border/70 bg-card px-4 py-3">
          <p className="text-xs font-medium text-muted-foreground">Pending</p>
          <p className="text-2xl font-black tracking-tight">{pendingRequests.length}</p>
        </div>
        <div className="rounded-xl border border-border/70 bg-card px-4 py-3">
          <p className="text-xs font-medium text-muted-foreground">Accepted</p>
          <p className="text-2xl font-black tracking-tight">{acceptedJobs}</p>
        </div>
        <div className="rounded-xl border border-border/70 bg-card px-4 py-3">
          <p className="text-xs font-medium text-muted-foreground">Completed</p>
          <p className="text-2xl font-black tracking-tight">{completedJobs.length}</p>
        </div>
        <div className="rounded-xl border border-border/70 bg-card px-4 py-3">
          <p className="text-xs font-medium text-muted-foreground">Net Earnings</p>
          <p className="text-2xl font-black tracking-tight">₹{totalNet.toLocaleString("en-IN")}</p>
        </div>
      </section>

      {/* 1. FLAT AVAILABILITY TOGGLE */}
      <section>
        <button
          type="button"
          role="switch"
          aria-checked={isOnline}
          aria-label={isOnline ? "Set availability offline" : "Set availability online"}
          onClick={() => void toggleAvailability()}
          className={cn(
            "w-full cursor-pointer rounded-xl p-6 border transition-all duration-200 flex flex-col items-center justify-center min-h-40 text-left",
            isOnline 
              ? "bg-success/5 border-success/40" 
              : "bg-muted border-border"
          )}
        >
          <div className={cn(
            "size-16 rounded-full flex items-center justify-center transition-all duration-200 mb-3",
            isOnline ? "bg-success text-white" : "bg-muted-foreground text-background"
          )}>
            <Wifi className="size-8" />
          </div>
          <h2 className={cn(
            "text-2xl font-black tracking-tight",
            isOnline ? "text-success" : "text-muted-foreground"
          )}>
            {isOnline ? "YOU ARE ONLINE" : "YOU ARE OFFLINE"}
          </h2>
          <p className="text-muted-foreground font-semibold text-sm text-center mt-1">
            {isOnline ? "Waiting for nearby jobs..." : "Tap to start receiving jobs"}
          </p>
          <p className="mt-3 text-xs font-medium text-muted-foreground">
            {isOnline ? "You are visible to customers in your service area." : "Go online to receive incoming requests instantly."}
          </p>
        </button>
      </section>

      {/* 2. INCOMING REQUESTS (Prominent if Online) */}
      {isOnline && pendingRequests.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center gap-2 text-foreground font-bold text-lg">
             <div className="size-2 rounded-full bg-success animate-pulse" /> NEW JOB REQUEST
          </div>
          
          <div className="bg-card border border-border rounded-[12px] shadow-sm overflow-hidden flex flex-col">
             <div className="h-24 bg-muted flex items-center justify-center border-b border-border">
                 <Navigation className="size-8 text-muted-foreground" />
             </div>
             <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                   <div>
                  <h3 className="text-xl font-bold text-foreground">{latestPending ? (CATEGORY_LABELS[latestPending.categoryId] || "Service") : "New service request"}</h3>
                  <p className="text-muted-foreground font-medium text-sm mt-1">{latestPending?.addressLine || "Open incoming jobs to review details"}</p>
                   </div>
                   <div className="text-right">
                  <h4 className="text-2xl font-black text-foreground">₹{Number(latestPending?.quotedAmount ?? 0).toLocaleString("en-IN")}</h4>
                  <p className="text-[11px] uppercase tracking-wider text-muted-foreground font-bold">Quoted</p>
                   </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 mt-6">
                <Link
                  href="/helper/incoming-jobs"
                  className={cn(buttonVariants(), "h-12 rounded-lg text-[15px] font-bold bg-muted text-foreground hover:bg-muted/80 transition-colors border-none group flex items-center justify-center")}
                >
                  <XCircle className="mr-2 size-4 text-muted-foreground" /> Review Queue
                </Link>
                <Link
                  href="/helper/incoming-jobs"
                  className={cn(buttonVariants(), "h-12 rounded-lg text-[15px] font-bold bg-foreground text-background hover:bg-foreground/90 transition-colors border-none flex items-center justify-center")}
                >
                  <CheckCircle2 className="mr-2 size-4" /> Open Jobs
                </Link>
                </div>
             </div>
          </div>
        </section>
      )}

      {/* 3. JOB HISTORY / ACTIVE JOBS (If no pending) */}
      {(!isOnline || pendingRequests.length === 0) && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-foreground font-bold text-lg">Recent Activity</h2>
            <Link href="/helper/job-history" className="text-sm font-bold text-muted-foreground hover:text-foreground transition-colors">
              View all
            </Link>
          </div>
          
          {activeJobs.length > 0 ? (
            <div className="space-y-3">
              {activeJobs.map((job) => (
                <Link
                  key={job.id}
                  href={`/helper/bookings/${job.id}`}
                  className="bg-card border border-border rounded-[12px] p-5 flex items-center justify-between hover:border-foreground/30 transition-colors"
                >
                  <div>
                    <h3 className="font-bold text-[15px]">{CATEGORY_LABELS[job.categoryId] || job.categoryId}</h3>
                    <p className="text-sm text-muted-foreground mt-1">{job.addressLine || "Address details"}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-lg">₹{Number(job.quotedAmount).toLocaleString("en-IN")}</p>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider font-bold">{job.status}</p>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="bg-muted border border-dashed border-border rounded-[12px] p-8 text-center">
              <Wifi className="size-8 text-muted-foreground mx-auto mb-3" />
              <h3 className="font-bold text-[15px]">No active jobs</h3>
              <p className="text-muted-foreground text-sm mt-1">
                {isOnline ? "Waiting for incoming requests..." : "Go online to start receiving jobs"}
              </p>
            </div>
          )}
        </section>
      )}

      {/* 4. EARNINGS SUMMARY */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-foreground font-bold text-lg">Earnings</h2>
          <Link href="/helper/earnings" className="text-sm font-bold text-muted-foreground hover:text-foreground transition-colors">
            View details
          </Link>
        </div>
        
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-card border border-border rounded-[12px] p-5">
            <p className="text-xs font-medium text-muted-foreground mb-1">Total Net</p>
            <p className="text-2xl font-black tracking-tight">₹{totalNet.toLocaleString("en-IN")}</p>
            <p className="text-xs text-muted-foreground mt-1">{completedJobs.length} jobs</p>
          </div>
          <div className="bg-card border border-border rounded-[12px] p-5">
            <p className="text-xs font-medium text-muted-foreground mb-1">Avg per Job</p>
            <p className="text-2xl font-black tracking-tight">₹{averageNetPerJob.toLocaleString("en-IN")}</p>
            <p className="text-xs text-muted-foreground mt-1">after commission</p>
          </div>
        </div>
      </section>
    </main>
  );
}
