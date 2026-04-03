"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  ArrowRight, CalendarRange, Coins, RadioTower, ShieldCheck,
  Clock, CheckCircle2, TrendingUp, Wifi,
} from "lucide-react";
import { buttonVariants } from "@/components/ui/button-variants";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useSession } from "@/lib/auth/session";
import { COMMISSION_RATE } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

type Booking = {
  id: string;
  status: string;
  quotedAmount: number;
  finalAmount?: number | null;
  categoryId: string;
};

const CATEGORY_LABELS: Record<string, string> = {
  cleaner: "Cleaner", electrician: "Electrician", plumber: "Plumber",
  driver: "Driver", chef: "Chef", delivery_helper: "Delivery Helper",
  caretaker: "Caretaker", other: "Other",
};

const helperActions = [
  {
    title: "Incoming Jobs",
    description: "Accept or reject nearby requests in real time.",
    href: "/helper/incoming-jobs",
    icon: RadioTower,
  },
  {
    title: "Job History",
    description: "Review active, completed, and canceled assignments.",
    href: "/helper/job-history",
    icon: CalendarRange,
  },
  {
    title: "Earnings",
    description: "Track payouts and settlement summaries.",
    href: "/helper/earnings",
    icon: Coins,
  },
  {
    title: "Availability",
    description: "Switch status between online and offline.",
    href: "/helper/availability",
    icon: Wifi,
  },
  {
    title: "Verification",
    description: "Submit and track KYC verification status.",
    href: "/helper/verification",
    icon: ShieldCheck,
  },
];

export default function HelperHomePage() {
  const { session } = useSession();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isOnline, setIsOnline] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch bookings and profile status
    Promise.all([
      fetch("/api/bookings", { credentials: "include" }).then(r => r.json()),
      fetch("/api/helper/profile", { credentials: "include" }).then(r => r.json())
    ]).then(([bookingData, profileData]) => {
      setBookings(bookingData.bookings ?? []);
      setIsOnline(profileData.profile?.availabilityStatus === "online");
    }).catch(() => {})
    .finally(() => setLoading(false));
  }, []);

  const activeJobs = bookings.filter((b) => b.status === "accepted" || b.status === "in_progress");
  const completedJobs = bookings.filter((b) => b.status === "completed");
  const totalNet = completedJobs.reduce((sum, b) => sum + Math.round((b.finalAmount ?? b.quotedAmount) * (1 - COMMISSION_RATE)), 0);
  const userName = session?.user?.name?.split(" ")[0] || "Partner";

  const toggleAvailability = async () => {
    const newStatus = isOnline ? "offline" : "online";
    try {
      const res = await fetch("/api/helper/availability", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ availabilityStatus: newStatus }),
      });
      if (res.ok) {
        setIsOnline(!isOnline);
      }
    } catch {}
  };

  return (
    <main className="space-y-10 pb-20">
      {/* Welcome Hero & Quick Toggle */}
      <section className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 reveal-up">
        <div className="space-y-1">
          <h1 className="text-4xl font-heading font-bold tracking-tight">
            Hello, <span className="text-primary">{userName}!</span>
          </h1>
          <p className="text-muted-foreground text-lg font-medium">
            You are currently <span className={cn("font-bold", isOnline ? "text-green-500" : "text-muted-foreground")}>
              {isOnline ? "Online" : "Offline"}
            </span>
          </p>
        </div>
        
        <div className="flex items-center gap-4 bg-card/40 border border-border/50 p-2 rounded-[2rem] shadow-xl backdrop-blur-xl">
           <span className="text-sm font-bold ml-4 mr-2">{isOnline ? "Go Offline" : "Go Online"}</span>
           <Button 
             onClick={toggleAvailability}
             className={cn(
               "size-14 rounded-full shadow-2xl transition-all duration-500 flex items-center justify-center p-0",
               isOnline ? "bg-green-500 hover:bg-green-600 scale-110" : "bg-muted-foreground/20 hover:bg-muted-foreground/30"
             )}
           >
             <Wifi className={cn("size-6 transition-all", isOnline ? "text-white scale-110" : "text-muted-foreground")} />
           </Button>
        </div>
      </section>

      {/* Stats Overview */}
      <section className="grid gap-6 sm:grid-cols-2 reveal-up delay-1">
        <Card className="surface-card-strong border-none p-2 overflow-hidden relative group">
          <div className="absolute -right-4 -top-4 size-32 bg-primary/10 rounded-full blur-3xl group-hover:bg-primary/20 transition-all" />
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-lg font-bold text-muted-foreground">
              <TrendingUp className="size-5 text-primary" /> Today's Earning
            </CardTitle>
          </CardHeader>
          <CardContent>
             <div className="flex items-baseline gap-2">
                <span className="text-4xl font-heading font-black tracking-tighter">₹{totalNet.toLocaleString("en-IN")}</span>
                <span className="text-sm text-green-500 font-bold">+12% vs last week</span>
             </div>
             <p className="text-xs text-muted-foreground mt-4 font-medium uppercase tracking-widest">Payouts every Monday</p>
          </CardContent>
        </Card>

        <Card className="surface-card border-none p-2">
           <CardHeader>
             <CardTitle className="text-lg font-bold">Service Stats</CardTitle>
           </CardHeader>
           <CardContent className="grid grid-cols-2 gap-4">
              <div className="bg-muted/30 p-4 rounded-2xl space-y-1">
                 <p className="text-xs text-muted-foreground font-bold uppercase">Jobs Done</p>
                 <p className="text-2xl font-black">{completedJobs.length}</p>
              </div>
              <div className="bg-muted/30 p-4 rounded-2xl space-y-1">
                 <p className="text-xs text-muted-foreground font-bold uppercase">Rating</p>
                 <p className="text-2xl font-black">4.9 ★</p>
              </div>
           </CardContent>
        </Card>
      </section>

      {/* Active Jobs Section */}
      <section className="reveal-up delay-2">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-heading font-bold">Ongoing Tasks</h2>
          <Link href="/helper/job-history" className="text-primary text-sm font-semibold hover:underline">
            History
          </Link>
        </div>
        
        {activeJobs.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2">
            {activeJobs.map((b) => (
              <Card key={b.id} className="surface-card border-none p-1 transition-all hover:translate-y-[-4px] active:scale-95 group">
                <Link href="/helper/incoming-jobs" className="p-5 flex flex-col gap-4">
                  <div className="flex items-center justify-between">
                    <Badge className="bg-primary/10 text-primary border-none rounded-lg px-2 py-1 font-bold text-[10px]">
                      {CATEGORY_LABELS[b.categoryId] || b.categoryId}
                    </Badge>
                    <span className="text-lg font-black tracking-tighter text-primary">₹{b.quotedAmount}</span>
                  </div>
                  <div>
                    <p className="font-bold text-lg leading-tight group-hover:text-primary transition-colors">Helper Request #{b.id.slice(-4).toUpperCase()}</p>
                    <p className="text-xs text-muted-foreground mt-1">Status: {b.status === "in_progress" ? "In Progress" : "Accepted"}</p>
                  </div>
                  <div className="flex items-center text-sm font-bold text-primary gap-2 mt-2">
                    Manage Task <ArrowRight className="size-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </Link>
              </Card>
            ))}
          </div>
        ) : (
          <div className="bg-muted/20 border border-dashed border-border/50 rounded-[2rem] p-12 text-center space-y-4">
             <div className="size-16 rounded-full bg-muted/40 flex items-center justify-center mx-auto">
                <Clock className="size-8 text-muted-foreground" />
             </div>
             <div className="space-y-1">
                <p className="font-bold text-lg">No active jobs</p>
                <p className="text-sm text-muted-foreground">Go online to start receiving requests near you.</p>
             </div>
          </div>
        )}
      </section>

      {/* Helper Quick Links */}
      <section className="grid sm:grid-cols-3 gap-6 reveal-up delay-3">
        {helperActions.filter(a => a.href !== "/helper/availability").map((action) => (
          <Link 
            key={action.href} 
            href={action.href}
            className="surface-card p-6 flex flex-col gap-4 hover:scale-105 active:scale-95 transition-all group"
          >
            <div className="size-12 rounded-2xl bg-primary/10 flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all">
                <action.icon className="size-6" />
            </div>
            <div className="space-y-1">
                <p className="font-bold text-lg leading-tight">{action.title}</p>
                <p className="text-xs text-muted-foreground font-medium">{action.description}</p>
            </div>
          </Link>
        ))}
      </section>
    </main>
  );
}
