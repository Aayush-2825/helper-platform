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
  MoreHorizontal,
  Sparkles,
  PlugZap,
  Wrench,
  Utensils,
  Package,
  Heart,
  PlayCircle,
} from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
  { id: "cleaner", label: "Cleaner", icon: Sparkles, color: "oklch(0.65 0.15 160)" },
  { id: "electrician", label: "Electrician", icon: PlugZap, color: "oklch(0.7 0.2 80)" },
  { id: "plumber", label: "Plumber", icon: Wrench, color: "oklch(0.6 0.15 200)" },
  { id: "driver", label: "Driver", icon: Car, color: "oklch(0.6 0.15 250)" },
  { id: "chef", label: "Chef", icon: Utensils, color: "oklch(0.6 0.18 40)" },
  { id: "delivery_helper", label: "Delivery", icon: Package, color: "oklch(0.55 0.18 25)" },
  { id: "caretaker", label: "Caretaker", icon: Heart, color: "oklch(0.65 0.12 340)" },
  { id: "other", label: "More", icon: MoreHorizontal, color: "oklch(0.6 0.02 240)" },
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
  const userName = session?.user?.name?.split(" ")[0] || "there";

  return (
    <main className="space-y-10">
      {/* Welcome Hero */}
      <section className="space-y-6">
        <div className="reveal-up">
          <h1 className="text-4xl font-heading font-bold tracking-tight">
            Hello, <span className="text-primary">{userName}!</span>
          </h1>
          <p className="text-muted-foreground mt-2 text-lg">
            What do you need help with today?
          </p>
        </div>

        {/* Search Bar */}
        <div className="relative reveal-up delay-1 max-w-2xl">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search for 'electrician', 'cleaning'..."
            className="w-full pl-12 pr-4 py-4 rounded-3xl bg-card border border-border/50 shadow-xl focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all text-lg"
          />
        </div>
      </section>

      {/* Active Requests */}
      {!loading && activeBookings.length > 0 && (
        <section className="reveal-up delay-2">
          {inProgressBooking && (
            <div className="surface-card-strong mb-5 border border-green-300/50 bg-gradient-to-r from-green-50 via-green-50 to-emerald-50 p-5 dark:border-green-800 dark:from-green-950/30 dark:via-green-950/20 dark:to-emerald-950/20">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.18em] text-green-700 dark:text-green-300">
                    <span className="relative flex h-2 w-2">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-500 opacity-75" />
                      <span className="relative inline-flex h-2 w-2 rounded-full bg-green-600" />
                    </span>
                    Live Job Running
                  </p>
                  <h3 className="mt-1 text-xl font-heading font-black">Your service is currently in progress</h3>
                  <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                    <span className="inline-flex items-center gap-1.5"><PlayCircle className="size-4 text-green-600" /> Track helper progress</span>
                    <span className="inline-flex items-center gap-1.5"><PlayCircle className="size-4 text-green-600" /> Keep completion OTP ready</span>
                  </div>
                </div>
                <Link
                  href={`/customer/bookings/${inProgressBooking.id}`}
                  className={buttonVariants({ variant: "default", className: "rounded-2xl px-6" })}
                >
                  Open Live Job
                </Link>
              </div>
            </div>
          )}

          <div className="surface-card-strong p-5 mb-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.18em] text-primary">Current Journey</p>
              <h3 className="text-xl font-heading font-black mt-1">Active Booking Journey</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Track matching, arrival, and completion from one place.
              </p>
            </div>
            <Link
              href="/customer/active"
              className={buttonVariants({ variant: "default", className: "rounded-2xl px-6" })}
            >
              Continue
            </Link>
          </div>

          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-heading font-bold">Active Requests</h2>
            <Link href="/customer/bookings" className="text-primary text-sm font-semibold hover:underline">
              View all
            </Link>
          </div>
          <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar">
            {activeBookings.map((booking) => (
              <Link
                key={booking.id}
                href={`/customer/bookings/${booking.id}`}
                className="surface-card p-5 min-w-70 flex flex-col gap-3 group"
              >
                <div className="flex items-center justify-between">
                  <Badge className="bg-primary/10 text-primary border-none text-[10px] uppercase tracking-wider font-bold">
                    {categoryLabels[booking.categoryId] || booking.categoryId}
                  </Badge>
                  <StatusBadge status={booking.status} />
                </div>
                <div>
                  <p className="font-bold text-lg leading-tight truncate">
                    {booking.status === "in_progress"
                      ? "Service is in progress"
                      : booking.status === "accepted"
                        ? "Helper is on the way"
                        : booking.status === "matched"
                          ? "Helpers notified nearby"
                          : "Finding helper..."}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1 truncate">
                    {booking.addressLine}
                  </p>
                </div>
                <div className="mt-2 flex items-center text-primary text-sm font-bold group-hover:gap-2 transition-all">
                  Track Status <ArrowRight className="size-4 ml-1" />
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Service Grid */}
      <section className="reveal-up delay-3">
        <h2 className="text-xl font-heading font-bold mb-6">Our Services</h2>
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4 sm:gap-6">
          {CATEGORIES.map((cat) => (
            <Link
              key={cat.id}
              href={`/customer/book?category=${cat.id}`}
              className="flex flex-col items-center gap-3 transition-all duration-300 hover:scale-110 active:scale-95 group"
            >
              <div
                className="size-16 sm:size-20 rounded-2xl flex items-center justify-center shadow-lg transition-all duration-300 group-hover:rotate-6 group-hover:shadow-2xl"
                style={{ backgroundColor: `${cat.color}15`, border: `1px solid ${cat.color}30` }}
              >
                <cat.icon className="size-8 sm:size-10" style={{ color: cat.color }} />
              </div>
              <span className="text-sm font-bold text-center tracking-tight text-foreground/80 group-hover:text-primary">
                {cat.label}
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* Bottom Actions */}
      <section className="grid sm:grid-cols-2 gap-6 reveal-up delay-4 pb-10">
        <Card className="surface-card-strong border-none p-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-xl">
              <CreditCard className="text-primary size-6" />
              Manage Payments
            </CardTitle>
            <CardDescription className="text-muted-foreground font-medium">
              View transaction history and invoices.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/customer/payments" className={buttonVariants({ variant: "default", className: "w-full rounded-2xl py-6 text-lg" })}>
              Open Wallet
            </Link>
          </CardContent>
        </Card>
        <Card className="surface-card border-none p-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-xl">
              <MessageSquareText className="text-accent size-6" />
              Help & Support
            </CardTitle>
            <CardDescription className="text-muted-foreground font-medium">
              Get assistance with your bookings.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/customer/reviews" className={buttonVariants({ variant: "outline", className: "w-full rounded-2xl py-6 text-lg" })}>
              Contact Us
            </Link>
          </CardContent>
        </Card>
      </section>
    </main>
  );
}
