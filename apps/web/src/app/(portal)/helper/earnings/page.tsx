"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, Clock, IndianRupee, Loader2, TrendingUp, Wallet } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

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

type PaymentStatus = "created" | "authorized" | "captured" | "failed" | "refunded" | "partially_refunded";

type PaymentTransaction = {
  id: string;
  bookingId: string;
  amount: number;
  helperEarning: number;
  status: PaymentStatus;
  createdAt: string;
};

type PayoutStatus = "pending" | "processing" | "paid" | "failed" | "reversed";

type Payout = {
  id: string;
  amount: number;
  currency: string;
  status: PayoutStatus;
  providerTransferId?: string | null;
  processedAt?: string | null;
  failedReason?: string | null;
  periodStart?: string | null;
  periodEnd?: string | null;
  createdAt: string;
};

type PayoutSummary = {
  grossEarnings: number;
  platformFees: number;
  netEarnings: number;
  capturedCount: number;
  reservedBalance: number;
  activePayoutCount: number;
  paidOutAmount: number;
  availableBalance: number;
};

const CATEGORY_LABELS: Record<string, string> = {
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

function formatINR(amount: number) {
  return `₹${amount.toLocaleString("en-IN")}`;
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

export default function HelperEarningsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [payments, setPayments] = useState<PaymentTransaction[]>([]);
  const [payouts, setPayouts] = useState<Payout[]>([]);
  const [summary, setSummary] = useState<PayoutSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [requestingPayout, setRequestingPayout] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const [bookingsRes, paymentsRes, payoutsRes] = await Promise.all([
          fetch("/api/bookings", { credentials: "include" }),
          fetch("/api/payments?limit=100", { credentials: "include" }),
          fetch("/api/helper/payouts", { credentials: "include" }),
        ]);

        if (!bookingsRes.ok || !paymentsRes.ok || !payoutsRes.ok) {
          const failedRes = !bookingsRes.ok ? bookingsRes : !paymentsRes.ok ? paymentsRes : payoutsRes;
          const body = await failedRes.json().catch(() => ({})) as { message?: string };
          setError(body.message ?? "Failed to load earnings.");
          return;
        }

        const bookingsData = await bookingsRes.json() as { bookings: Booking[] };
        const paymentsData = await paymentsRes.json() as { payments: PaymentTransaction[] };
        const payoutsData = await payoutsRes.json() as { payouts?: Payout[]; summary?: PayoutSummary };
        setBookings(bookingsData.bookings ?? []);
        setPayments(paymentsData.payments ?? []);
        setPayouts(payoutsData.payouts ?? []);
        setSummary(payoutsData.summary ?? null);
        setWithdrawAmount(String(payoutsData.summary?.availableBalance ?? 0));
      } catch {
        setError("Network error. Please try again.");
      } finally {
        setLoading(false);
      }
    }

    void fetchData();
  }, []);

  const completed = bookings.filter((booking) => booking.status === "completed");
  const capturedPayments = payments.filter((payment) => payment.status === "captured");
  const totalGross = summary?.grossEarnings ?? capturedPayments.reduce((sum, payment) => sum + payment.amount, 0);
  const totalNet = summary?.netEarnings ?? capturedPayments.reduce((sum, payment) => sum + payment.helperEarning, 0);
  const totalFees = summary?.platformFees ?? Math.max(totalGross - totalNet, 0);
  const availableBalance = summary?.availableBalance ?? 0;

  const capturedBookingIds = new Set(capturedPayments.map((payment) => payment.bookingId));
  const awaitingCustomerPayment = completed.filter((booking) => !capturedBookingIds.has(booking.id));
  const awaitingCustomerPaymentAmount = awaitingCustomerPayment.reduce(
    (sum, booking) => sum + (booking.finalAmount ?? booking.quotedAmount),
    0,
  );

  const refreshEarnings = async () => {
    const [paymentsRes, payoutsRes] = await Promise.all([
      fetch("/api/payments?limit=100", { credentials: "include" }),
      fetch("/api/helper/payouts", { credentials: "include" }),
    ]);

    if (paymentsRes.ok) {
      const paymentsData = await paymentsRes.json() as { payments: PaymentTransaction[] };
      setPayments(paymentsData.payments ?? []);
    }

    if (payoutsRes.ok) {
      const payoutsData = await payoutsRes.json() as { payouts?: Payout[]; summary?: PayoutSummary };
      setPayouts(payoutsData.payouts ?? []);
      setSummary(payoutsData.summary ?? null);
      setWithdrawAmount(String(payoutsData.summary?.availableBalance ?? 0));
    }
  };

  const requestPayout = async () => {
    try {
      setError(null);
      setActionMessage(null);
      setRequestingPayout(true);

      const requestedAmount = Number(withdrawAmount);
      const payload = Number.isFinite(requestedAmount) && requestedAmount > 0
        ? { amount: Math.round(requestedAmount) }
        : {};

      const response = await fetch("/api/helper/payouts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });

      const data = await response.json().catch(() => ({})) as { message?: string; summary?: PayoutSummary; payout?: Payout };

      if (!response.ok) {
        throw new Error(data.message ?? "Unable to request payout.");
      }

      if (data.summary) {
        setSummary(data.summary);
        setWithdrawAmount(String(data.summary.availableBalance));
      }

      if (data.payout) {
        setPayouts((current) => [data.payout as Payout, ...current]);
      }

      setActionMessage(data.message ?? "Payout requested.");
      await refreshEarnings();
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Payout request failed.");
    } finally {
      setRequestingPayout(false);
    }
  };

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
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Card className="surface-card border-none">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                  <TrendingUp className="h-4 w-4" /> Total earned (net)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">{formatINR(totalNet)}</p>
                <p className="text-xs text-muted-foreground mt-1">After platform fee</p>
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
                <p className="text-2xl font-bold">{formatINR(awaitingCustomerPaymentAmount)}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {awaitingCustomerPayment.length} completed job{awaitingCustomerPayment.length !== 1 ? "s" : ""} awaiting customer payment
                </p>
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
                <p className="text-xs text-muted-foreground mt-1">{capturedPayments.length} paid out</p>
              </CardContent>
            </Card>
          </div>

          <section className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
            <Card className="surface-card-strong border-none">
              <CardHeader>
                <CardTitle>Balance & Reconciliation</CardTitle>
                <CardDescription>Gross earnings, platform fees, reservations, and paid out totals.</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <div className="rounded-2xl border border-border/50 bg-muted/20 p-4 space-y-1">
                  <p className="text-xs text-muted-foreground font-bold uppercase">Gross</p>
                  <p className="text-2xl font-black">{formatINR(totalGross)}</p>
                </div>
                <div className="rounded-2xl border border-border/50 bg-muted/20 p-4 space-y-1">
                  <p className="text-xs text-muted-foreground font-bold uppercase">Platform fee</p>
                  <p className="text-2xl font-black">{formatINR(totalFees)}</p>
                </div>
                <div className="rounded-2xl border border-border/50 bg-muted/20 p-4 space-y-1">
                  <p className="text-xs text-muted-foreground font-bold uppercase">Reserved</p>
                  <p className="text-2xl font-black">{formatINR(summary?.reservedBalance ?? 0)}</p>
                </div>
                <div className="rounded-2xl border border-border/50 bg-muted/20 p-4 space-y-1">
                  <p className="text-xs text-muted-foreground font-bold uppercase">Paid out</p>
                  <p className="text-2xl font-black">{formatINR(summary?.paidOutAmount ?? 0)}</p>
                </div>
              </CardContent>
            </Card>

            <Card className="surface-card border-none">
              <CardHeader>
                <CardTitle>Withdraw Funds</CardTitle>
                <CardDescription>Request a payout against your available balance.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Amount</label>
                  <div className="relative">
                    <IndianRupee className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      type="number"
                      min="1"
                      max={availableBalance}
                      value={withdrawAmount}
                      onChange={(event) => setWithdrawAmount(event.target.value)}
                      placeholder={availableBalance > 0 ? String(availableBalance) : "0"}
                      className="pl-10"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">Maximum available: {formatINR(availableBalance)}</p>
                </div>

                {actionMessage && <p className="text-sm text-green-600">{actionMessage}</p>}

                <Button
                  onClick={() => void requestPayout()}
                  disabled={requestingPayout || availableBalance <= 0}
                  className="w-full rounded-2xl"
                >
                  {requestingPayout ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" /> Requesting payout
                    </>
                  ) : (
                    "Request payout"
                  )}
                </Button>
              </CardContent>
            </Card>
          </section>

          <section className="space-y-3">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="text-xl font-heading font-bold">Payout History</h2>
                <p className="text-sm text-muted-foreground">Track payout requests, approvals, and failures.</p>
              </div>
              <Badge variant="outline">{payouts.length} records</Badge>
            </div>

            {payouts.length === 0 ? (
              <div className="bg-muted/20 border border-dashed border-border/50 rounded-3xl p-10 text-center text-sm text-muted-foreground">
                No payout requests yet.
              </div>
            ) : (
              <div className="surface-card divide-y divide-border/50">
                {payouts.map((payoutRecord) => (
                  <div key={payoutRecord.id} className="flex items-center justify-between gap-3 px-4 py-3">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium">{formatINR(payoutRecord.amount)}</p>
                      <p className="text-xs text-muted-foreground truncate">
                        {payoutRecord.periodStart ? formatDate(payoutRecord.periodStart) : ""}
                        {payoutRecord.periodEnd ? ` - ${formatDate(payoutRecord.periodEnd)}` : ""}
                      </p>
                      {payoutRecord.failedReason && (
                        <p className="text-xs text-destructive mt-1">{payoutRecord.failedReason}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <Badge
                        className={cn(
                          "capitalize",
                          payoutRecord.status === "paid"
                            ? "bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-400"
                            : payoutRecord.status === "failed" || payoutRecord.status === "reversed"
                              ? "bg-rose-100 text-rose-800 border-rose-200 dark:bg-rose-900/30 dark:text-rose-300"
                              : "bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300",
                        )}
                      >
                        {payoutRecord.status.replaceAll("_", " ")}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

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
                    .map((booking) => {
                      const gross = booking.finalAmount ?? booking.quotedAmount;
                      const payment = payments
                        .filter((item) => item.bookingId === booking.id)
                        .sort((left, right) => new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime())[0];
                      const commission = Math.round(gross * 0.15);
                      const net = payment?.status === "captured" ? payment.helperEarning : gross - commission;
                      const paymentBadge = payment ? payment.status.replaceAll("_", " ") : "pending";

                      return (
                        <div key={booking.id} className="flex items-center justify-between rounded-lg border border-border/60 bg-background/70 p-3">
                          <div className="space-y-0.5">
                            <p className="text-sm font-medium">{CATEGORY_LABELS[booking.categoryId] ?? booking.categoryId}</p>
                            <p className="text-xs text-muted-foreground">{booking.addressLine}, {booking.city}</p>
                            {booking.completedAt && <p className="text-xs text-muted-foreground">{formatDate(booking.completedAt)}</p>}
                          </div>
                          <div className="text-right space-y-0.5">
                            <p className="text-sm font-semibold text-green-600">{formatINR(net)}</p>
                            <p className="text-xs text-muted-foreground">Gross {formatINR(gross)}</p>
                            <div className="flex items-center justify-end gap-2">
                              <Badge variant="secondary" className="text-xs">−{formatINR(commission)} fee</Badge>
                              <Badge
                                className={cn(
                                  payment?.status === "captured"
                                    ? "bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-400"
                                    : "bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300",
                                )}
                              >
                                {paymentBadge}
                              </Badge>
                            </div>
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
