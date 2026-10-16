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
import { cn } from "@/lib/utils";

function getTimeGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

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

const QUICK_SERVICES = [
  { id: "cleaner", label: "Cleaning", price: "₹199", icon: Sparkles, color: "text-amber-500 bg-amber-500/10" },
  { id: "electrician", label: "Electrician", price: "₹149", icon: PlugZap, color: "text-blue-500 bg-blue-500/10" },
  { id: "plumber", label: "Plumbing", price: "₹149", icon: Wrench, color: "text-cyan-500 bg-cyan-500/10" },
  { id: "driver", label: "Driver", price: "₹299", icon: Car, color: "text-emerald-500 bg-emerald-500/10" },
  { id: "chef", label: "Cook / Chef", price: "₹349", icon: Utensils, color: "text-orange-500 bg-orange-500/10" },
  { id: "delivery_helper", label: "Delivery", price: "₹99", icon: Package, color: "text-purple-500 bg-purple-500/10" },
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
  const primaryActiveBooking = inProgressBooking || activeBookings[0];
  const userName = session?.user?.name?.split(" ")[0] || "Customer";
  const greeting = getTimeGreeting();
  const recentCompleted = bookings.filter((b) => b.status === "completed").length;
  const totalSpent = bookings
    .filter((b) => b.status === "completed")
    .reduce((sum, booking) => {
      const amounts = booking as Booking & { finalAmount?: number | null };
      return sum + Number(amounts.finalAmount ?? booking.quotedAmount ?? 0);
    }, 0);
  const moneySaved = Math.round(totalSpent * 0.15);
  const recentHistory = [...bookings]
    .filter((booking) => booking.status === "completed")
    .slice(0, 3);

  return (
    <main className="space-y-8 pb-20 reveal-up">
      {/* 1. STICKY / PROMINENT ACTIVE BOOKING BANNER */}
      {primaryActiveBooking && (
        <aside aria-label="Active Booking Status" className="sticky top-2 z-30 rounded-2xl border border-primary/20 bg-background/90 p-4 shadow-lg backdrop-blur-xl transition-all">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="relative flex size-3">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-orange-400 opacity-75" />
                <span className="relative inline-flex size-3 rounded-full bg-orange-500" />
              </span>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black uppercase tracking-wider text-orange-600 dark:text-orange-400">
                    Active Booking Live
                  </span>
                  <StatusBadge status={primaryActiveBooking.status} />
                </div>
                <p className="text-sm font-bold text-foreground">
                  {categoryLabels[primaryActiveBooking.categoryId] || primaryActiveBooking.categoryId} &bull; {primaryActiveBooking.addressLine || "Doorstep service"}
                </p>
              </div>
            </div>
            <Link
              href={`/customer/bookings/${primaryActiveBooking.id}`}
              className="inline-flex items-center justify-center rounded-xl bg-primary px-5 py-2 text-xs font-bold text-primary-foreground shadow-sm hover:bg-primary/90 transition-transform active:scale-95"
            >
              Track Live <ArrowRight className="ml-1.5 size-3.5" />
            </Link>
          </div>
        </aside>
      )}

      {/* 2. PERSONALIZED GREETING HERO CARD */}
      <section className="overflow-hidden rounded-3xl border border-border/80 bg-gradient-to-br from-card via-card to-orange-500/5 p-6 shadow-sm lg:p-8">
        <div className="grid gap-6 lg:grid-cols-[1fr_auto] lg:items-center">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-orange-500/10 px-3 py-1 text-xs font-bold text-orange-600 dark:text-orange-400">
              <Sparkles className="size-3.5" /> Fast Doorstep Services in 10 Mins
            </div>
            <h1 className="mt-3 text-3xl font-black tracking-tight text-foreground sm:text-4xl">
              {greeting}, {userName}! 👋
            </h1>
            <p className="mt-2 text-[15px] font-medium text-muted-foreground">
              What do you need help with around the home today?
            </p>

            {/* Quick Search */}
            <div className="mt-6 relative max-w-xl">
              <label htmlFor="customer-home-search" className="sr-only">Search services</label>
              <Search className="absolute left-4 top-1/2 size-5 -translate-y-1/2 text-muted-foreground" />
              <input
                id="customer-home-search"
                type="text"
                placeholder="Search for cleaners, plumbers, electricians..."
                className="w-full rounded-2xl border border-border/80 bg-background/90 py-3.5 pl-12 pr-4 text-[15px] font-medium transition-all focus-visible:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20"
              />
            </div>
          </div>

          {/* 3. STATS STRIP: Total Bookings, Money Saved, Trusted Helpers */}
          <div className="grid grid-cols-3 gap-3 sm:gap-4 lg:min-w-[340px]">
            <div className="rounded-2xl border border-border/70 bg-background/80 p-3.5 text-center shadow-xs">
              <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Bookings</p>
              <p className="mt-1 text-2xl font-black tracking-tight text-foreground">{bookings.length}</p>
              <p className="text-[10px] text-muted-foreground font-medium">all-time</p>
            </div>
            <div className="rounded-2xl border border-border/70 bg-background/80 p-3.5 text-center shadow-xs">
              <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Saved</p>
              <p className="mt-1 text-2xl font-black tracking-tight text-emerald-600 dark:text-emerald-400">
                ₹{moneySaved.toLocaleString("en-IN")}
              </p>
              <p className="text-[10px] text-emerald-600/80 font-medium">with DOZO</p>
            </div>
            <div className="rounded-2xl border border-border/70 bg-background/80 p-3.5 text-center shadow-xs">
              <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Helpers</p>
              <p className="mt-1 text-2xl font-black tracking-tight text-foreground">
                {recentCompleted > 0 ? `${recentCompleted}` : "10k+"}
              </p>
              <p className="text-[10px] text-muted-foreground font-medium">verified pros</p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. QUICK-BOOKING CTA STRIP (Horizontal scroll on mobile) */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-black tracking-tight text-foreground">Popular Services</h2>
          <Link href="/customer/book" className="text-xs font-bold text-orange-600 hover:text-orange-700 dark:text-orange-400">
            View all services &rarr;
          </Link>
        </div>

        <div className="flex gap-3 overflow-x-auto pb-2 pt-1 scrollbar-none snap-x">
          {QUICK_SERVICES.map((category) => (
            <Link
              key={category.id}
              href={`/customer/book?category=${category.id}`}
              className="group flex min-w-[105px] snap-start flex-col items-center justify-center rounded-2xl border border-border/80 bg-card p-3.5 text-center shadow-xs transition-all duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-md active:scale-95"
            >
              <div className={`mb-2 flex size-12 items-center justify-center rounded-xl transition-transform group-hover:scale-110 ${category.color}`}>
                <category.icon className="size-6" />
              </div>
              <span className="text-xs font-bold text-foreground group-hover:text-primary transition-colors">
                {category.label}
              </span>
              <span className="mt-0.5 text-[11px] font-medium text-muted-foreground">
                from {category.price}
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* Grid Layout for Bookings and Sidebar */}
      <div className="grid gap-8 lg:grid-cols-[1fr_340px]">
        <div className="space-y-8">
          {/* Active Bookings Section */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-black tracking-tight">Active Bookings</h2>
                {activeBookings.length > 0 && (
                  <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-bold text-primary">
                    {activeBookings.length}
                  </span>
                )}
              </div>
              <Link href="/customer/bookings" className="text-sm font-bold text-muted-foreground hover:text-foreground">
                View all
              </Link>
            </div>

            {loading ? (
              <div className="h-40 rounded-2xl bg-muted/60 animate-pulse" />
            ) : activeBookings.length > 0 ? (
              <div className="space-y-3">
                {activeBookings.map((booking) => {
                  const isLive = booking.status === "in_progress";
                  return (
                    <div
                      key={booking.id}
                      className={cn(
                        "rounded-2xl border p-5 shadow-xs transition-all",
                        isLive
                          ? "border-emerald-500/40 bg-emerald-500/5 shadow-md"
                          : "border-border/80 bg-card hover:border-foreground/30"
                      )}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            {isLive && (
                              <span className="flex items-center gap-1.5 text-xs font-black uppercase text-emerald-600 dark:text-emerald-400">
                                <span className="size-2 rounded-full bg-emerald-500 animate-pulse" /> In Progress
                              </span>
                            )}
                            <StatusBadge status={booking.status} />
                            <span className="text-xs font-semibold text-muted-foreground uppercase">
                              {categoryLabels[booking.categoryId] || booking.categoryId}
                            </span>
                          </div>
                          <h3 className="text-lg font-bold text-foreground">
                            {booking.status === "accepted" ? "Helper is on the way" : booking.status === "in_progress" ? "Service in progress" : "Finding helper nearby..."}
                          </h3>
                          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                            <MapPin className="size-3.5 shrink-0" />
                            <span className="truncate max-w-sm">{booking.addressLine}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <div className="text-right">
                            <p className="text-xs text-muted-foreground font-semibold">Quote</p>
                            <p className="text-lg font-black text-foreground">₹{Number(booking.quotedAmount).toLocaleString("en-IN")}</p>
                          </div>
                          <Link
                            href={`/customer/bookings/${booking.id}`}
                            className="rounded-xl bg-foreground px-4 py-2.5 text-xs font-bold text-background hover:bg-foreground/90 transition-transform active:scale-95"
                          >
                            Details
                          </Link>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              /* Polished empty state illustration */
              <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-border/80 bg-card/60 p-10 text-center">
                <div className="mb-4 flex size-16 items-center justify-center rounded-2xl bg-orange-500/10 text-orange-500">
                  <Sparkles className="size-8" />
                </div>
                <h3 className="text-lg font-black tracking-tight text-foreground">No active bookings</h3>
                <p className="mt-1 max-w-sm text-sm font-medium text-muted-foreground">
                  Need a clean home, an electrician, or a driver? Book in 2 minutes and have a verified pro arrive in 10 minutes.
                </p>
                <Link href="/customer/book" className="mt-5">
                  <Button className="rounded-xl bg-orange-500 px-6 font-bold text-white shadow-lg shadow-orange-500/20 hover:bg-orange-600 transition-transform active:scale-95">
                    Book a Service Now
                  </Button>
                </Link>
              </div>
            )}
          </section>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Recent History */}
          <section className="rounded-2xl border border-border/80 bg-card p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-black tracking-tight text-foreground">Recent History</h2>
              <Link href="/customer/bookings" className="text-xs font-bold text-muted-foreground hover:text-foreground">
                View all
              </Link>
            </div>

            {recentHistory.length > 0 ? (
              <div className="space-y-3">
                {recentHistory.map((booking) => (
                  <Link
                    key={booking.id}
                    href={`/customer/bookings/${booking.id}`}
                    className="flex items-center justify-between rounded-xl border border-border/60 bg-background/70 p-3 hover:border-foreground/30 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex size-9 items-center justify-center rounded-xl bg-muted text-muted-foreground">
                        <History className="size-4" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-foreground">
                          {categoryLabels[booking.categoryId] || booking.categoryId}
                        </p>
                        <p className="text-[11px] text-muted-foreground">
                          ₹{Number(booking.quotedAmount).toLocaleString("en-IN")}
                        </p>
                      </div>
                    </div>
                    <StatusBadge status={booking.status} />
                  </Link>
                ))}
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-border/70 p-6 text-center">
                <p className="text-xs text-muted-foreground">No completed bookings yet</p>
              </div>
            )}
          </section>

          {/* Quick Actions */}
          <section className="rounded-2xl border border-border/80 bg-card p-5 shadow-xs space-y-3">
            <h2 className="text-base font-black tracking-tight text-foreground">Quick Actions</h2>
            <div className="space-y-2">
              <Link href="/customer/book" className="block">
                <Button variant="outline" className="w-full justify-start rounded-xl font-bold text-xs h-10" size="sm">
                  <ArrowRight className="mr-2 size-4 text-orange-500" /> Book New Service
                </Button>
              </Link>
              <Link href="/customer/payments" className="block">
                <Button variant="outline" className="w-full justify-start rounded-xl font-bold text-xs h-10" size="sm">
                  <CreditCard className="mr-2 size-4 text-muted-foreground" /> Payment Methods
                </Button>
              </Link>
              <Link href="/customer/reviews" className="block">
                <Button variant="outline" className="w-full justify-start rounded-xl font-bold text-xs h-10" size="sm">
                  <MessageSquareText className="mr-2 size-4 text-muted-foreground" /> My Reviews
                </Button>
              </Link>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
