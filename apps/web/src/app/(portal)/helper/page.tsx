"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  ArrowRight, Coins, ShieldCheck,
  TrendingUp, Wifi, Navigation, CheckCircle2, XCircle
} from "lucide-react";
import { COMMISSION_RATE } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

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

export default function HelperHomePage() {
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
    try {
      // Optimistic update for low-tech user feedback speed
      setIsOnline(!isOnline);
      await fetch("/api/helper/availability", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ availabilityStatus: newStatus }),
      });
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
                <Button className="h-12 rounded-lg text-[15px] font-bold bg-muted text-foreground hover:bg-muted/80 transition-colors border-none group" render={<Link href="/helper/incoming-jobs" />}>
                  <XCircle className="mr-2 size-4 text-muted-foreground" /> Review Queue
                  </Button>
                <Button className="h-12 rounded-lg text-[15px] font-bold bg-foreground text-background hover:bg-foreground/90 transition-colors border-none" render={<Link href="/helper/incoming-jobs" />}>
                  <CheckCircle2 className="mr-2 size-4" /> Open Jobs
                  </Button>
                </div>
             </div>
          </div>
        </section>
      )}

      {/* ACTIVE TASKS */}
      {activeJobs.length > 0 && (
        <section>
           <h3 className="text-xl font-bold mb-4 tracking-tight">Active Task</h3>
           {activeJobs.map(job => (
             <Link key={job.id} href={`/helper/bookings/${job.id}`} className="block">
               <div className="bg-foreground text-background p-6 rounded-[12px] border-none flex flex-col justify-between items-center sm:flex-row gap-4 hover:opacity-95 transition-opacity">
                  <div className="text-center sm:text-left">
                    <div className="bg-white/20 text-white w-fit mx-auto sm:mx-0 mb-3 px-2 py-1 rounded text-[10px] font-bold uppercase tracking-widest">
                      {job.status === "in_progress" ? "In Progress" : "Go to location"}
                    </div>
                    <h4 className="text-xl font-black">{CATEGORY_LABELS[job.categoryId] || job.categoryId}</h4>
                    <p className="text-white/70 font-semibold text-sm mt-1">{job.addressLine || "Check map for details"}</p>
                  </div>
                  <div className="size-12 rounded-full bg-background flex items-center justify-center shrink-0">
                    <ArrowRight className="size-5 text-foreground" />
                  </div>
               </div>
             </Link>
           ))}
        </section>
      )}

      {/* 3. SIMPLIFIED EARNINGS GRAPH */}
      <section>
         <h3 className="text-xl font-bold mb-4 tracking-tight">Your Earnings</h3>
         <div className="bg-card border border-border p-6 rounded-[12px]">
            <div className="flex justify-between items-end mb-8">
               <div>
                  <p className="text-muted-foreground font-semibold uppercase tracking-widest text-xs">Today</p>
                  <h4 className="text-4xl font-black text-foreground tracking-tighter mt-1">
                    ₹{totalNet.toLocaleString("en-IN")}
                  </h4>
               </div>
               <div className="bg-success/10 text-success font-bold px-3 py-1 rounded-sm text-xs flex items-center">
                 <TrendingUp className="size-3 mr-1"/> Avg ₹{averageNetPerJob.toLocaleString("en-IN")}/job
               </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-lg border border-border/70 bg-background px-4 py-3">
                <p className="text-xs font-medium text-muted-foreground">Completed Jobs</p>
                <p className="mt-1 text-2xl font-black tracking-tight">{completedJobs.length}</p>
              </div>
              <div className="rounded-lg border border-border/70 bg-background px-4 py-3">
                <p className="text-xs font-medium text-muted-foreground">Total Net</p>
                <p className="mt-1 text-2xl font-black tracking-tight">₹{totalNet.toLocaleString("en-IN")}</p>
              </div>
              <div className="rounded-lg border border-border/70 bg-background px-4 py-3">
                <p className="text-xs font-medium text-muted-foreground">Average Net</p>
                <p className="mt-1 text-2xl font-black tracking-tight">₹{averageNetPerJob.toLocaleString("en-IN")}</p>
              </div>
            </div>
         </div>
      </section>

      {/* QUICK ACTIONS */}
      <section className="grid grid-cols-2 gap-4">
         <Link href="/helper/earnings">
           <div className="bg-card border border-border p-4 rounded-[12px] flex flex-col items-center justify-center text-center gap-2 hover:border-foreground/30 transition-colors">
             <div className="size-10 rounded-full bg-muted flex items-center justify-center text-foreground">
                <Coins className="size-5" />
             </div>
             <p className="font-bold text-sm">Payouts</p>
           </div>
         </Link>

         <Link href="/helper/verification">
           <div className="bg-card border border-border p-4 rounded-[12px] flex flex-col items-center justify-center text-center gap-2 hover:border-foreground/30 transition-colors">
             <div className="size-10 rounded-full bg-muted flex items-center justify-center text-foreground">
                <ShieldCheck className="size-5" />
             </div>
             <p className="font-bold text-sm">Profile</p>
           </div>
         </Link>
      </section>

      <section className="grid gap-4 sm:grid-cols-3">
        <Link href="/helper/incoming-jobs" className="rounded-xl border border-border/70 bg-background p-4 transition-colors hover:border-primary/40 hover:bg-primary/5">
          <p className="font-bold">Incoming Queue</p>
          <p className="mt-1 text-sm text-muted-foreground">Review and accept nearby requests.</p>
        </Link>
        <Link href="/helper/active" className="rounded-xl border border-border/70 bg-background p-4 transition-colors hover:border-primary/40 hover:bg-primary/5">
          <p className="font-bold">Active Job</p>
          <p className="mt-1 text-sm text-muted-foreground">Track current booking progress.</p>
        </Link>
        <Link href="/helper/job-history" className="rounded-xl border border-border/70 bg-background p-4 transition-colors hover:border-primary/40 hover:bg-primary/5">
          <p className="font-bold">History</p>
          <p className="mt-1 text-sm text-muted-foreground">Review completed services and ratings.</p>
        </Link>
      </section>

    </main>
  );
}
