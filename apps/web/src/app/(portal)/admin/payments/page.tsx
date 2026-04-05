"use client";

import { useEffect, useMemo, useState } from "react";
import { AlertCircle, CheckCircle2, Copy, Loader2, RefreshCcw, Search, ShieldAlert, WalletCards } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type BookingSummary = {
  id: string;
  status: string;
  categoryId: string;
  addressLine: string;
  city: string;
  customerName?: string | null;
  helperId?: string | null;
  requestedAt?: string;
  finalAmount?: number | null;
  quotedAmount: number;
  currency?: string;
};

type PaymentTransaction = {
  id: string;
  bookingId: string;
  customerId: string;
  helperProfileId?: string | null;
  method: string;
  status: "created" | "authorized" | "captured" | "failed" | "refunded" | "partially_refunded";
  provider: string;
  providerOrderId?: string | null;
  providerPaymentId?: string | null;
  amount: number;
  platformFee: number;
  helperEarning: number;
  currency: string;
  failureReason?: string | null;
  capturedAt?: string | null;
  failedAt?: string | null;
  createdAt: string;
};

function formatDate(value?: string | null): string {
  if (!value) {
    return "—";
  }

  return new Date(value).toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function money(amount: number, currency = "INR"): string {
  if (currency !== "INR") {
    return `${currency} ${amount.toLocaleString("en-IN")}`;
  }

  return `₹${amount.toLocaleString("en-IN")}`;
}

export default function AdminPaymentsPage() {
  const [bookings, setBookings] = useState<BookingSummary[]>([]);
  const [payments, setPayments] = useState<PaymentTransaction[]>([]);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<PaymentTransaction["status"] | "all">("all");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const fetchPayments = async (isManualRefresh = false) => {
    setError(null);
    if (isManualRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    try {
      const [bookingsRes, paymentsRes] = await Promise.all([
        fetch("/api/bookings?limit=200", { credentials: "include" }),
        fetch("/api/payments?limit=200", { credentials: "include" }),
      ]);

      if (!bookingsRes.ok) {
        throw new Error("Could not load bookings.");
      }

      if (!paymentsRes.ok) {
        throw new Error("Could not load payments.");
      }

      const bookingsData = (await bookingsRes.json()) as { bookings?: BookingSummary[] };
      const paymentsData = (await paymentsRes.json()) as { payments?: PaymentTransaction[] };

      setBookings(bookingsData.bookings ?? []);
      setPayments(paymentsData.payments ?? []);
    } catch (fetchError) {
      setBookings([]);
      setPayments([]);
      setError(fetchError instanceof Error ? fetchError.message : "Unable to load payments.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    void fetchPayments();
  }, []);

  const bookingById = useMemo(() => new Map(bookings.map((booking) => [booking.id, booking])), [bookings]);

  const filteredPayments = useMemo(() => {
    const search = query.trim().toLowerCase();

    return payments.filter((payment) => {
      if (statusFilter !== "all" && payment.status !== statusFilter) {
        return false;
      }

      if (!search) {
        return true;
      }

      const booking = bookingById.get(payment.bookingId);
      const haystack = [
        payment.id,
        payment.bookingId,
        payment.customerId,
        payment.helperProfileId ?? "",
        payment.providerPaymentId ?? "",
        payment.providerOrderId ?? "",
        payment.status,
        booking?.addressLine ?? "",
        booking?.city ?? "",
        booking?.customerName ?? "",
      ]
        .join(" ")
        .toLowerCase();

      return haystack.includes(search);
    });
  }, [bookingById, payments, query, statusFilter]);

  const summary = useMemo(() => {
    const captured = payments.filter((payment) => payment.status === "captured");
    const failed = payments.filter((payment) => payment.status === "failed");
    const refunds = payments.filter((payment) => payment.status === "refunded" || payment.status === "partially_refunded");

    return {
      gross: captured.reduce((total, payment) => total + payment.amount, 0),
      platformFee: captured.reduce((total, payment) => total + payment.platformFee, 0),
      helperPayouts: captured.reduce((total, payment) => total + payment.helperEarning, 0),
      failed: failed.length,
      refunds: refunds.length,
      pending: payments.filter((payment) => payment.status === "created" || payment.status === "authorized").length,
    };
  }, [payments]);

  const handleCopy = async (value: string) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopiedId(value);
      window.setTimeout(() => setCopiedId((current) => (current === value ? null : current)), 1600);
    } catch {
      setError("Could not copy to clipboard.");
    }
  };

  const statusStyles: Record<PaymentTransaction["status"], string> = {
    created: "bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-900/30 dark:text-slate-300",
    authorized: "bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300",
    captured: "bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-300",
    failed: "bg-rose-100 text-rose-800 border-rose-200 dark:bg-rose-900/30 dark:text-rose-300",
    refunded: "bg-cyan-100 text-cyan-800 border-cyan-200 dark:bg-cyan-900/30 dark:text-cyan-300",
    partially_refunded: "bg-indigo-100 text-indigo-800 border-indigo-200 dark:bg-indigo-900/30 dark:text-indigo-300",
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-2">
          <h1 className="text-3xl font-heading font-black tracking-tight">Payments and Revenue</h1>
          <p className="text-sm text-muted-foreground">Audit payment transactions, commissions, and refund states.</p>
        </div>
        <Button variant="outline" className="h-11 rounded-2xl font-semibold" onClick={() => void fetchPayments(true)}>
          {refreshing ? <Loader2 className="mr-2 size-4 animate-spin" /> : <RefreshCcw className="mr-2 size-4" />}
          Refresh
        </Button>
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-2xl border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          <AlertCircle className="size-4 shrink-0" />
          {error}
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <Card className="surface-card-strong border-none">
          <CardContent className="space-y-1 p-5">
            <p className="text-sm text-muted-foreground">Captured Revenue</p>
            <p className="text-2xl font-bold">{loading ? "—" : money(summary.gross)}</p>
          </CardContent>
        </Card>
        <Card className="surface-card-strong border-none">
          <CardContent className="space-y-1 p-5">
            <p className="text-sm text-muted-foreground">Platform Fee</p>
            <p className="text-2xl font-bold">{loading ? "—" : money(summary.platformFee)}</p>
          </CardContent>
        </Card>
        <Card className="surface-card-strong border-none">
          <CardContent className="space-y-1 p-5">
            <p className="text-sm text-muted-foreground">Helper Payouts</p>
            <p className="text-2xl font-bold">{loading ? "—" : money(summary.helperPayouts)}</p>
          </CardContent>
        </Card>
        <Card className="surface-card-strong border-none">
          <CardContent className="space-y-1 p-5">
            <p className="text-sm text-muted-foreground">Open Orders</p>
            <p className="text-2xl font-bold">{loading ? "—" : summary.pending}</p>
          </CardContent>
        </Card>
        <Card className="surface-card-strong border-none">
          <CardContent className="space-y-1 p-5">
            <p className="text-sm text-muted-foreground">Failures / Refunds</p>
            <p className="text-2xl font-bold">{loading ? "—" : `${summary.failed} / ${summary.refunds}`}</p>
          </CardContent>
        </Card>
      </div>

      <Card className="surface-card-strong border-none">
        <CardContent className="space-y-5 p-5 sm:p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search payment ID, booking, customer, helper, provider order..."
                className="h-12 pl-11"
              />
            </div>

            <div className="flex items-center gap-3">
              <select
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value as PaymentTransaction["status"] | "all")}
                className="h-12 rounded-2xl border border-border/50 bg-card/60 px-4 text-sm font-medium outline-none transition-all focus-visible:border-primary/50 focus-visible:ring-4 focus-visible:ring-primary/10"
              >
                <option value="all">All statuses</option>
                <option value="created">Created</option>
                <option value="authorized">Authorized</option>
                <option value="captured">Captured</option>
                <option value="failed">Failed</option>
                <option value="refunded">Refunded</option>
                <option value="partially_refunded">Partially refunded</option>
              </select>
            </div>
          </div>

          {loading ? (
            <div className="grid gap-3">
              {[1, 2, 3, 4].map((item) => (
                <div key={item} className="h-20 animate-pulse rounded-2xl bg-muted/60" />
              ))}
            </div>
          ) : filteredPayments.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-border/70 p-10 text-center text-sm text-muted-foreground">
              No payment transactions match the current filters.
            </div>
          ) : (
            <div className="overflow-hidden rounded-3xl border border-border/60">
              <table className="w-full border-collapse text-left">
                <thead className="bg-muted/40 text-xs uppercase tracking-[0.18em] text-muted-foreground">
                  <tr>
                    <th className="px-4 py-3 font-semibold">Transaction</th>
                    <th className="px-4 py-3 font-semibold">Booking</th>
                    <th className="px-4 py-3 font-semibold">Amounts</th>
                    <th className="px-4 py-3 font-semibold">Status</th>
                    <th className="px-4 py-3 font-semibold">Dates</th>
                    <th className="px-4 py-3 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {filteredPayments.map((payment) => {
                    const booking = bookingById.get(payment.bookingId);

                    return (
                      <tr key={payment.id} className="bg-card/20 transition-colors hover:bg-muted/20">
                        <td className="px-4 py-4 align-top">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2 font-medium">
                              <WalletCards className="size-4 text-primary" />
                              <span className="truncate">{payment.id}</span>
                            </div>
                            <p className="text-xs text-muted-foreground">{payment.provider} • {payment.method}</p>
                            {payment.providerOrderId && (
                              <p className="text-xs text-muted-foreground">Order: {payment.providerOrderId}</p>
                            )}
                            {payment.providerPaymentId && (
                              <p className="text-xs text-muted-foreground">Payment: {payment.providerPaymentId}</p>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-4 align-top">
                          <div className="space-y-1">
                            <p className="font-medium">{booking?.addressLine ?? "Unknown booking"}</p>
                            <p className="text-xs text-muted-foreground">{booking?.city ?? "—"}</p>
                            <p className="text-xs text-muted-foreground">Booking {payment.bookingId}</p>
                          </div>
                        </td>
                        <td className="px-4 py-4 align-top">
                          <div className="space-y-1 text-sm">
                            <p className="font-semibold">{money(payment.amount, payment.currency)}</p>
                            <p className="text-xs text-muted-foreground">Fee {money(payment.platformFee, payment.currency)}</p>
                            <p className="text-xs text-muted-foreground">Helper {money(payment.helperEarning, payment.currency)}</p>
                          </div>
                        </td>
                        <td className="px-4 py-4 align-top">
                          <Badge className={cn("rounded-full border px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em]", statusStyles[payment.status])}>
                            {payment.status === "captured" ? <CheckCircle2 className="mr-1 size-3" /> : null}
                            {payment.status.replaceAll("_", " ")}
                          </Badge>
                          {payment.failureReason && payment.status === "failed" && (
                            <p className="mt-2 max-w-[18rem] text-xs text-destructive">{payment.failureReason}</p>
                          )}
                        </td>
                        <td className="px-4 py-4 align-top text-sm">
                          <div className="space-y-1 text-muted-foreground">
                            <p>Created {formatDate(payment.createdAt)}</p>
                            <p>Captured {formatDate(payment.capturedAt)}</p>
                            <p>Failed {formatDate(payment.failedAt)}</p>
                          </div>
                        </td>
                        <td className="px-4 py-4 align-top text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="rounded-2xl"
                            onClick={() => void handleCopy(payment.id)}
                          >
                            <Copy className="mr-2 size-3.5" />
                            {copiedId === payment.id ? "Copied" : "Copy ID"}
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="surface-card border-dashed border-border/70">
          <CardContent className="flex items-start gap-3 p-5">
            <ShieldAlert className="mt-1 size-5 text-amber-600" />
            <div className="space-y-1">
              <p className="font-semibold">Refund controls</p>
              <p className="text-sm text-muted-foreground">Capture support and reversal actions can be layered here once refund mutation endpoints are introduced.</p>
            </div>
          </CardContent>
        </Card>
        <Card className="surface-card border-dashed border-border/70">
          <CardContent className="flex items-start gap-3 p-5">
            <CheckCircle2 className="mt-1 size-5 text-green-600" />
            <div className="space-y-1">
              <p className="font-semibold">Audit trail</p>
              <p className="text-sm text-muted-foreground">The dashboard is backed by live payment records and can be extended with reconciliation notes and refund actions.</p>
            </div>
          </CardContent>
        </Card>
        <Card className="surface-card border-dashed border-border/70">
          <CardContent className="flex items-start gap-3 p-5">
            <Loader2 className="mt-1 size-5 text-primary" />
            <div className="space-y-1">
              <p className="font-semibold">Next step</p>
              <p className="text-sm text-muted-foreground">Wire receipt generation and payout settlement into the payment capture path after this dashboard is validated.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
