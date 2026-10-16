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
import { Button } from "@repo/ui/components/ui/button";
import { StatusBadge } from "@features/shared/components/StatusBadge";
import type { Booking } from "@features/booking/components/BookingCard";

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

export default function CustomerDashboard() {
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
                <Link href="/customer/book" className="mt-4">
                  <Button size="sm" className="rounded-lg font-semibold">
                    Book a Service
                  </Button>
                </Link>
              </div>
            )}
          </section>

          {/* Service Categories */}
          <section className="fade-up delay-2">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold tracking-tight">Quick Book</h2>
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {CATEGORIES.map((category) => (
                <Link
                  key={category.id}
                  href={`/customer/book?category=${category.id}`}
                  className="bg-card border border-border rounded-xl p-4 flex flex-col items-center justify-center gap-2 hover:border-foreground/30 transition-colors group"
                >
                  <div className="size-10 rounded-full bg-muted flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                    <category.icon className="size-5 text-muted-foreground group-hover:text-primary transition-colors" />
                  </div>
                  <span className="text-sm font-semibold text-foreground">{category.label}</span>
                </Link>
              ))}
            </div>
          </section>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Recent History */}
          <section className="fade-up delay-3">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold tracking-tight">Recent History</h2>
              <Link href="/customer/bookings" className="text-sm font-bold text-muted-foreground hover:underline">
                View all
              </Link>
            </div>
            
            {recentHistory.length > 0 ? (
              <div className="space-y-3">
                {recentHistory.map((booking) => (
                  <Link
                    key={booking.id}
                    href={`/customer/bookings/${booking.id}`}
                    className="bg-card border border-border rounded-lg p-4 flex items-center justify-between hover:border-foreground/30 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="size-8 rounded-full bg-muted flex items-center justify-center">
                        <History className="size-4 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-foreground">{categoryLabels[booking.categoryId] || booking.categoryId}</p>
                        <p className="text-xs text-muted-foreground">₹{Number(booking.quotedAmount).toLocaleString("en-IN")}</p>
                      </div>
                    </div>
                    <StatusBadge status={booking.status} />
                  </Link>
                ))}
              </div>
            ) : (
              <div className="bg-muted border border-dashed border-border rounded-lg p-6 text-center">
                <p className="text-sm text-muted-foreground">No completed bookings yet</p>
              </div>
            )}
          </section>

          {/* Quick Actions */}
          <section className="fade-up delay-4">
            <h2 className="text-lg font-bold tracking-tight mb-4">Quick Actions</h2>
            <div className="space-y-2">
              <Link href="/customer/book">
                <Button variant="outline" className="w-full justify-start rounded-lg font-semibold" size="sm">
                  <ArrowRight className="mr-2 size-4" /> Book New Service
                </Button>
              </Link>
              <Link href="/customer/payments">
                <Button variant="outline" className="w-full justify-start rounded-lg font-semibold" size="sm">
                  <CreditCard className="mr-2 size-4" /> Payment Methods
                </Button>
              </Link>
              <Link href="/customer/reviews">
                <Button variant="outline" className="w-full justify-start rounded-lg font-semibold" size="sm">
                  <MessageSquareText className="mr-2 size-4" /> My Reviews
                </Button>
              </Link>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
