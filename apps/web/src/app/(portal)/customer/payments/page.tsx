"use client";

import { useEffect, useState } from "react";
import { Loader2, CheckCircle2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { Booking as BaseBooking } from "@/components/BookingCard";

type Booking = BaseBooking & { finalAmount?: number | null };

const categoryLabels: Record<string, string> = {
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

function formatDate(value: Date | string): string {
  const date = typeof value === "string" ? new Date(value) : value;
  return date.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

function SkeletonRow() {
  return (
    <div className="flex items-center justify-between gap-3 px-4 py-3">
      <div className="space-y-1.5 flex-1">
        <div className="h-4 w-28 rounded bg-muted animate-pulse" />
        <div className="h-3 w-44 rounded bg-muted animate-pulse" />
      </div>
      <div className="h-4 w-16 rounded bg-muted animate-pulse" />
    </div>
  );
}

export default function CustomerPaymentsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/bookings", { credentials: "include" })
      .then((res) => res.json() as Promise<{ bookings?: Booking[] }>)
      .then((data) => setBookings(data.bookings ?? []))
      .catch(() => setBookings([]))
      .finally(() => setLoading(false));
  }, []);

  const completed = bookings.filter((b) => b.status === "completed");
  const pending = bookings.filter((b) => b.status === "accepted" || b.status === "in_progress");

  const totalPaid = completed.reduce((sum, b) => sum + (b.finalAmount ?? b.quotedAmount ?? 0), 0);
  const totalPending = pending.reduce((sum, b) => sum + (b.quotedAmount ?? 0), 0);

  return (
    <main className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Payments</h1>
        <p className="text-sm text-muted-foreground">View transaction status and receipts.</p>
      </div>

      {/* Summary cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="surface-card reveal-up delay-1 p-5 space-y-1">
          <p className="text-sm text-muted-foreground">Total Paid</p>
          {loading ? (
            <Loader2 className="size-5 animate-spin text-muted-foreground" />
          ) : (
            <p className="text-3xl font-semibold text-green-600">
              ₹{totalPaid.toLocaleString("en-IN")}
            </p>
          )}
        </div>
        <div className="surface-card reveal-up delay-2 p-5 space-y-1">
          <p className="text-sm text-muted-foreground">Pending</p>
          {loading ? (
            <Loader2 className="size-5 animate-spin text-muted-foreground" />
          ) : (
            <p className="text-3xl font-semibold text-amber-600">
              ₹{totalPending.toLocaleString("en-IN")}
            </p>
          )}
        </div>
        <div className="surface-card reveal-up delay-3 p-5 space-y-1">
          <p className="text-sm text-muted-foreground">Transactions</p>
          {loading ? (
            <Loader2 className="size-5 animate-spin text-muted-foreground" />
          ) : (
            <p className="text-3xl font-semibold">{completed.length}</p>
          )}
        </div>
      </div>

      {/* Transaction list */}
      <div className="space-y-3">
        <h2 className="text-lg font-semibold">Transaction History</h2>

        {loading ? (
          <div className="surface-card divide-y divide-border/50">
            {[1, 2, 3].map((i) => (
              <SkeletonRow key={i} />
            ))}
          </div>
        ) : completed.length === 0 ? (
          <div className="surface-card p-10 text-center">
            <p className="text-muted-foreground text-sm">No completed payments yet.</p>
          </div>
        ) : (
          <div className="surface-card divide-y divide-border/50">
            {[...completed]
              .sort(
                (a, b) =>
                  new Date(b.completedAt ?? b.requestedAt).getTime() -
                  new Date(a.completedAt ?? a.requestedAt).getTime(),
              )
              .map((booking) => (
                <div
                  key={booking.id}
                  className="flex items-center justify-between gap-3 px-4 py-3"
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium">
                      {categoryLabels[booking.categoryId] ?? booking.categoryId}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {booking.addressLine}, {booking.city}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatDate(booking.completedAt ?? booking.requestedAt)}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-sm font-semibold">
                      ₹{(booking.finalAmount ?? booking.quotedAmount).toLocaleString("en-IN")}
                    </span>
                    <Badge className="bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-400 gap-1">
                      <CheckCircle2 className="size-3" />
                      Paid
                    </Badge>
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>
    </main>
  );
}
