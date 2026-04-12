"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  ArrowRight, Coins, ShieldCheck,
  TrendingUp, Wifi, BellRing, Navigation, CheckCircle2, XCircle
} from "lucide-react";
import { useSession } from "@/lib/auth/session";
import { COMMISSION_RATE } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

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
  const { session } = useSession();
  const router = useRouter();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isOnline, setIsOnline] = useState(false);
  const [helperProfile, setHelperProfile] = useState<HelperProfileSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/bookings", { credentials: "include" }).then(r => r.json()),
      fetch("/api/helper/profile", { credentials: "include" }).then(r => r.json())
    ]).then(([bookingData, profileData]) => {
      setBookings(bookingData.bookings ?? []);
      setHelperProfile(profileData.profile ?? null);
      setIsOnline(profileData.profile?.availabilityStatus === "online");
    }).catch(() => {})
    .finally(() => setLoading(false));
  }, []);

  const activeJobs = bookings.filter((b) => b.status === "in_progress" || b.status === "accepted");
  const pendingRequests = bookings.filter((b) => b.status === "requested" || b.status === "matched"); // Emulated for UI purposes
  const completedJobs = bookings.filter((b) => b.status === "completed");
  const totalNet = completedJobs.reduce((sum, b) => sum + Math.round((b.finalAmount ?? b.quotedAmount) * (1 - COMMISSION_RATE)), 0);
  
  const userName = session?.user?.name?.split(" ")[0] || "Partner";

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
      {/* 1. FLAT AVAILABILITY TOGGLE */}
      <section>
        <div 
          onClick={toggleAvailability}
          className={cn(
            "cursor-pointer rounded-[12px] p-6 border transition-all duration-200 flex flex-col items-center justify-center min-h-[160px]",
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
        </div>
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
                     <h3 className="text-xl font-bold text-foreground">House Cleaning</h3>
                     <p className="text-muted-foreground font-medium text-sm mt-1">2.4 km away • HSR Layout</p>
                   </div>
                   <div className="text-right">
                     <h4 className="text-2xl font-black text-foreground">₹450</h4>
                     <p className="text-[11px] uppercase tracking-wider text-muted-foreground font-bold">Estimated</p>
                   </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 mt-6">
                  <Button className="h-12 rounded-[8px] text-[15px] font-bold bg-muted text-foreground hover:bg-muted/80 transition-colors border-none group">
                     <XCircle className="mr-2 size-4 text-muted-foreground" /> Reject
                  </Button>
                  <Button className="h-12 rounded-[8px] text-[15px] font-bold bg-foreground text-background hover:bg-foreground/90 transition-colors border-none">
                     <CheckCircle2 className="mr-2 size-4" /> Accept
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
                 <TrendingUp className="size-3 mr-1"/> Top 10%
               </div>
            </div>

            {/* Flat Bar Graph */}
            <div className="flex items-end justify-between h-32 gap-3 mt-4">
               {[10, 40, 20, 60, 30, 90, 50].map((height, i) => (
                 <div key={i} className="w-full flex justify-center group relative h-full items-end">
                    {/* Tooltip emulation */}
                    <div className="absolute -top-8 opacity-0 group-hover:opacity-100 transition-opacity bg-foreground text-background text-xs font-bold py-1 px-2 rounded-[4px]">
                       ₹{height * 10}
                    </div>
                    {/* Bar */}
                    <div 
                      className={cn(
                        "w-full max-w-[2rem] rounded-t-sm transition-colors duration-200",
                        height === 90 ? "bg-foreground" : "bg-muted hover:bg-muted-foreground/30"
                      )}
                      style={{ height: `${height}%` }}
                    />
                 </div>
               ))}
            </div>
            <div className="flex justify-between text-[11px] font-bold text-muted-foreground mt-4 px-1">
               <span>M</span><span>T</span><span>W</span><span>T</span><span>F</span><span>S</span><span>S</span>
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

    </main>
  );
}
