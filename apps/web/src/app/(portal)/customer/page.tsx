"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSession } from "@/lib/auth/session";
import {
  ArrowRight,
  CreditCard,
  MessageSquareText,
  Search,
  Car,
  Sparkles,
  PlugZap,
  Wrench,
  Utensils,
  Package,
  History,
  MapPin
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/StatusBadge";
import type { Booking } from "@/components/BookingCard";

const categoryLabels: Record<string, string> = {
  cleaner: "Cleaner",
  electrician: "Electrician",
  plumber: "Plumber",
  driver: "Driver",
  chef: "Chef",
  delivery_helper: "Delivery Helper",
  caretaker: "Caretaker / Babysitter",
  other: "Other",
};

const ACTIVE_STATUSES = new Set(["requested", "matched", "accepted", "in_progress"]);

const CATEGORIES = [
  { id: "cleaner", label: "Cleaner", icon: Sparkles },
  { id: "electrician", label: "Electrician", icon: PlugZap },
  { id: "plumber", label: "Plumber", icon: Wrench },
  { id: "driver", label: "Driver", icon: Car },
  { id: "chef", label: "Chef", icon: Utensils },
  { id: "delivery_helper", label: "Delivery", icon: Package },
];

export default function CustomerHomePage() {
  const { session } = useSession();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/bookings", { credentials: "include" })
      .then((res) => res.json() as Promise<{ bookings?: Booking[] }>)
      .then((data) => setBookings(data.bookings ?? []))
      .catch(() => setBookings([]))
      .finally(() => setLoading(false));
  }, []);

  const activeBookings = bookings.filter((b) => ACTIVE_STATUSES.has(b.status));
  const inProgressBooking = activeBookings.find((booking) => booking.status === "in_progress");
  const userName = session?.user?.name?.split(" ")[0] || "Customer";
  const recentCompleted = bookings.filter((b) => b.status === "completed").length;
  const totalSpent = bookings
    .filter((b) => b.status === "completed")
    .reduce((sum, booking) => {
      const amounts = booking as Booking & { finalAmount?: number | null };
      return sum + Number(amounts.finalAmount ?? booking.quotedAmount ?? 0);
    }, 0);
  const recentHistory = [...bookings]
    .filter((booking) => booking.status === "completed")
    .slice(0, 3);

  return (
    <main className="space-y-10 pb-20">
      <section className="fade-up overflow-hidden rounded-2xl border border-border/70 bg-card/70 p-6 shadow-sm lg:p-8">
        <div className="grid gap-6 lg:grid-cols-[1fr_auto] lg:items-end">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">Customer workspace</p>
            <h1 className="mt-2 text-3xl font-black tracking-tight lg:text-4xl">Welcome back, {userName}</h1>
            <p className="mt-2 text-[15px] font-medium text-muted-foreground">What do you need help with today?</p>

            <div className="mt-6 relative max-w-2xl">
              <label htmlFor="customer-home-search" className="sr-only">Search services</label>
              <Search className="absolute left-4 top-1/2 size-5 -translate-y-1/2 text-muted-foreground" />
              <input
                id="customer-home-search"
                type="text"
                placeholder="Search for cleaners, electricians, etc."
                className="w-full rounded-xl bg-muted/40 py-3 pl-12 pr-4 text-[15px] font-medium transition-shadow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3 lg:min-w-80">
            <div className="rounded-xl border border-border/60 bg-background/80 px-4 py-3">
              <p className="text-xs font-medium text-muted-foreground">Active</p>
              <p className="text-2xl font-black tracking-tight">{activeBookings.length}</p>
            </div>
            <div className="rounded-xl border border-border/60 bg-background/80 px-4 py-3">
              <p className="text-xs font-medium text-muted-foreground">Completed</p>
              <p className="text-2xl font-black tracking-tight">{recentCompleted}</p>
            </div>
            <div className="rounded-xl border border-border/60 bg-background/80 px-4 py-3">
              <p className="text-xs font-medium text-muted-foreground">Total Spent</p>
              <p className="text-2xl font-black tracking-tight">₹{totalSpent.toLocaleString("en-IN")}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Grid Layout for Dashboard */}
      <div className="grid lg:grid-cols-[1fr_350px] gap-10">
        <div className="space-y-10">
          
          {/* Active Bookings Section */}
          <section className="fade-up delay-1">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold tracking-tight">Active Bookings</h2>
              <Link href="/customer/bookings" className="text-foreground text-sm font-bold hover:underline">
                View all
              </Link>
            </div>
            
            {loading ? (
              <div className="h-40 bg-muted rounded-[12px] animate-pulse" />
            ) : activeBookings.length > 0 ? (
              <div className="space-y-4">
                {inProgressBooking && (
                  <div className="bg-card border-x-4 border-y border-y-border border-x-success rounded-[12px] p-6 shadow-sm">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2 text-xs font-bold uppercase text-success mb-2">
                           <div className="size-2 rounded-full bg-success animate-pulse" /> Live Job
                        </div>
                        <h3 className="text-xl font-bold">{categoryLabels[inProgressBooking.categoryId] || "Service"} in progress</h3>
                        <p className="text-sm text-muted-foreground mt-1">Helper is actively working on your request.</p>
                      </div>
                      <Link
                        href={`/customer/bookings/${inProgressBooking.id}`}
                        className="bg-foreground text-background px-6 py-3 rounded-lg font-bold text-center hover:bg-foreground/90 transition-colors text-[15px]"
                      >
                        Track
                      </Link>
                    </div>
                  </div>
                )}
                
                {activeBookings.filter(b => b.id !== inProgressBooking?.id).map((booking) => (
                  <Link
                    key={booking.id}
                    href={`/customer/bookings/${booking.id}`}
                    className="bg-card border border-border p-5 rounded-[12px] flex flex-col gap-3 group hover:border-foreground/30 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                         {categoryLabels[booking.categoryId] || booking.categoryId}
                      </span>
                      <StatusBadge status={booking.status} />
                    </div>
                    <div className="flex items-start gap-3 mt-1">
                       <MapPin className="size-5 text-muted-foreground shrink-0 mt-0.5" />
                       <div>
                         <p className="font-bold text-[15px] leading-tight text-foreground">
                           {booking.status === "accepted" ? "Helper is on the way" : "Finding helper..."}
                         </p>
                         <p className="text-sm text-muted-foreground mt-1 truncate">
                           {booking.addressLine}
                         </p>
                       </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="bg-background border border-dashed border-border rounded-[12px] p-8 mt-2 text-center flex flex-col items-center">
                <Package className="size-8 text-muted-foreground mb-3" />
                <h3 className="font-bold text-[15px]">No active jobs</h3>
                <p className="text-muted-foreground text-sm mt-1">You don&apos;t have any requests right now.</p>
              </div>
            )}
          </section>

          {/* Quick Book Services */}
          <section className="fade-up delay-2">
            <h2 className="text-xl font-bold tracking-tight mb-4">Book Again</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {CATEGORIES.map((cat) => (
                <Link
                  key={cat.id}
                  href={`/customer/book?category=${cat.id}`}
                  className="bg-card border border-border rounded-[12px] p-5 flex flex-col items-center text-center gap-3 hover:border-foreground/50 transition-colors"
                >
                  <div className="size-10 rounded-full bg-muted flex items-center justify-center text-foreground">
                    <cat.icon className="size-5" />
                  </div>
                  <span className="font-bold text-sm text-foreground">{cat.label}</span>
                </Link>
              ))}
            </div>
          </section>

          <section className="fade-up delay-3">
            <h2 className="mb-4 text-xl font-bold tracking-tight">Quick Actions</h2>
            <div className="grid gap-4 sm:grid-cols-3">
              <Link href="/customer/book" className="rounded-xl border border-border/70 bg-background p-4 transition-colors hover:border-primary/40 hover:bg-primary/5">
                <p className="font-bold">Start New Booking</p>
                <p className="mt-1 text-sm text-muted-foreground">Book a helper in under 1 minute.</p>
              </Link>
              <Link href="/customer/active" className="rounded-xl border border-border/70 bg-background p-4 transition-colors hover:border-primary/40 hover:bg-primary/5">
                <p className="font-bold">Track Active Job</p>
                <p className="mt-1 text-sm text-muted-foreground">Follow helper status in real time.</p>
              </Link>
              <Link href="/customer/payments" className="rounded-xl border border-border/70 bg-background p-4 transition-colors hover:border-primary/40 hover:bg-primary/5">
                <p className="font-bold">Manage Payments</p>
                <p className="mt-1 text-sm text-muted-foreground">See invoices and wallet activity.</p>
              </Link>
            </div>
          </section>
          
        </div>

        {/* Sidebar Data Dashboard */}
        <div className="space-y-6 fade-up delay-3 lg:border-l lg:border-border lg:pl-10">
          <div className="bg-card border border-border rounded-[12px] p-6">
            <div className="flex items-center justify-between mb-4 text-muted-foreground">
               <h3 className="font-semibold text-xs tracking-wider uppercase">DOZO Wallet</h3>
               <CreditCard className="size-4" />
            </div>
            <h2 className="text-4xl font-black mt-1 tracking-tight text-foreground">₹{totalSpent.toLocaleString("en-IN")}</h2>
            <p className="mt-2 text-xs font-medium text-muted-foreground">Total paid for completed bookings</p>
            <Link href="/customer/payments" className="mt-6 flex items-center justify-center gap-2 w-full bg-accent text-white hover:bg-accent/90 font-bold py-3 rounded-lg transition-colors text-sm">
              Manage Funds
            </Link>
          </div>

          <div className="bg-background pt-4">
            <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold tracking-tight">Recent History</h3>
                <Link href="/customer/bookings" className="text-foreground text-xs font-bold hover:underline">View All</Link>
            </div>
            
            <div className="space-y-4">
              {recentHistory.length > 0 ? recentHistory.map((booking) => {
                const amounts = booking as Booking & { finalAmount?: number | null };
                const amount = Number(amounts.finalAmount ?? booking.quotedAmount ?? 0);
                return (
                 <Link key={booking.id} href={`/customer/bookings/${booking.id}`} className="flex justify-between items-center py-3 border-b border-border last:border-0 hover:bg-muted/30 px-2 -mx-2 rounded-lg transition-colors">
                   <div className="flex items-center gap-3">
                     <div className="size-10 rounded-full bg-muted flex items-center justify-center">
                       <History className="size-4 text-muted-foreground" />
                     </div>
                     <div>
                      <p className="font-bold text-sm">{categoryLabels[booking.categoryId] || "Service"}</p>
                      <p className="text-xs text-muted-foreground capitalize">{booking.status.replace("_", " ")}</p>
                     </div>
                   </div>
                   <span className="font-bold text-sm text-foreground">₹{amount.toLocaleString("en-IN")}</span>
                 </Link>
                );
              }) : (
                <p className="text-sm text-muted-foreground">No completed bookings yet.</p>
              )}
            </div>
          </div>
          
          <div className="bg-muted/50 rounded-[12px] p-4 mt-6">
             <div className="flex items-center gap-3 mb-2">
                <MessageSquareText className="size-5 text-foreground" />
                <h3 className="font-bold text-[15px]">Need Help?</h3>
             </div>
             <p className="text-sm text-muted-foreground font-medium mb-4">Contact support or browse our help center.</p>
             <Button variant="outline" className="w-full justify-between font-bold h-10 rounded-lg bg-background" render={<Link href="/help" />}>
               Help Center <ArrowRight className="size-4" />
             </Button>
          </div>
        </div>
      </div>
    </main>
  );
}
