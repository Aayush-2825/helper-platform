"use client";

import { useEffect, useState } from "react";
import { Loader2, TrendingUp, Wallet, Clock, CheckCircle2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { COMMISSION_RATE } from "@/lib/constants";

type Booking = {
  id: string;
  categoryId: string;
  addressLine: string;
  city: string;
  quotedAmount: number;
  finalAmount?: number | null;
  status: string;
  completedAt?: string | null;
  requestedAt: string;
};

const CATEGORY_LABELS: Record<string, string> = {
  driver: "Driver", electrician: "Electrician", plumber: "Plumber",
  cleaner: "Cleaner", chef: "Chef", delivery_helper: "Delivery Helper",
  caretaker: "Caretaker", security_guard: "Security Guard", other: "Other",
};

function formatINR(amount: number) {
  return `₹${amount.toLocaleString("en-IN")}`;
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

export default function HelperEarningsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchBookings() {
      try {
        const res = await fetch("/api/bookings");
        if (!res.ok) {
          const body = await res.json().catch(() => ({})) as { message?: string };
          setError(body.message ?? "Failed to load earnings.");
          return;
        }
        const data = await res.json() as { bookings: Booking[] };
        setBookings(data.bookings ?? []);
      } catch {
        setError("Network error. Please try again.");
      } finally {
        setLoading(false);
      }
    }
    void fetchBookings();
  }, []);

  const completed = bookings.filter((b) => b.status === "completed");
  const totalGross = completed.reduce((sum, b) => sum + (b.finalAmount ?? b.quotedAmount), 0);
  const totalCommission = Math.round(totalGross * COMMISSION_RATE);
  const totalNet = totalGross - totalCommission;
  const pending = bookings.filter((b) => b.status === "accepted" || b.status === "in_progress");
  const pendingAmount = pending.reduce((sum, b) => sum + b.quotedAmount, 0);

  return (
    <main className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Earnings</h1>
        <p className="text-sm text-muted-foreground">Track your payouts, pending balances, and job history.</p>
      </div>

      {loading ? (
        <div className="flex items-center gap-2 text-muted-foreground text-sm">
          <Loader2 className="h-4 w-4 animate-spin" /> Loading earnings…
        </div>
      ) : error ? (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400">
          {error}
        </div>
      ) : (
        <>
          {/* Summary cards */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Card className="surface-card border-none">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                  <TrendingUp className="h-4 w-4" /> Total earned (net)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">{formatINR(totalNet)}</p>
                <p className="text-xs text-muted-foreground mt-1">After 15% platform fee</p>
              </CardContent>
            </Card>

            <Card className="surface-card border-none">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                  <Wallet className="h-4 w-4" /> Gross earnings
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">{formatINR(totalGross)}</p>
                <p className="text-xs text-muted-foreground mt-1">Before platform fee</p>
              </CardContent>
            </Card>

            <Card className="surface-card border-none">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                  <Clock className="h-4 w-4" /> Pending
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">{formatINR(pendingAmount)}</p>
                <p className="text-xs text-muted-foreground mt-1">{pending.length} active job{pending.length !== 1 ? "s" : ""}</p>
              </CardContent>
            </Card>

            <Card className="surface-card border-none">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                  <CheckCircle2 className="h-4 w-4" /> Completed jobs
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">{completed.length}</p>
                <p className="text-xs text-muted-foreground mt-1">All time</p>
              </CardContent>
            </Card>
          </div>

          {/* Completed jobs list */}
          <Card className="surface-card border-none">
            <CardHeader>
              <CardTitle>Completed Jobs</CardTitle>
              <CardDescription>Earnings breakdown per completed booking.</CardDescription>
            </CardHeader>
            <CardContent>
              {completed.length === 0 ? (
                <p className="text-sm text-muted-foreground py-4 text-center">No completed jobs yet.</p>
              ) : (
                <div className="space-y-3">
                  {[...completed]
                    .sort((a, b) => new Date(b.completedAt ?? b.requestedAt).getTime() - new Date(a.completedAt ?? a.requestedAt).getTime())
                    .map((b) => {
                      const gross = b.finalAmount ?? b.quotedAmount;
                      const commission = Math.round(gross * COMMISSION_RATE);
                      const net = gross - commission;
                      return (
                        <div key={b.id} className="flex items-center justify-between rounded-lg border border-border/60 bg-background/70 p-3">
                          <div className="space-y-0.5">
                            <p className="text-sm font-medium">{CATEGORY_LABELS[b.categoryId] ?? b.categoryId}</p>
                            <p className="text-xs text-muted-foreground">{b.addressLine}, {b.city}</p>
                            {b.completedAt && (
                              <p className="text-xs text-muted-foreground">{formatDate(b.completedAt)}</p>
                            )}
                          </div>
                          <div className="text-right space-y-0.5">
                            <p className="text-sm font-semibold text-green-600">{formatINR(net)}</p>
                            <p className="text-xs text-muted-foreground">Gross {formatINR(gross)}</p>
                            <Badge variant="secondary" className="text-xs">−{formatINR(commission)} fee</Badge>
                          </div>
                        </div>
                      );
                    })}
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </main>
  );
}
