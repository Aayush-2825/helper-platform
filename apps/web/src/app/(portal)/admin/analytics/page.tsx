"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { AlertCircle, BarChart3, Loader2, RefreshCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

type AnalyticsResponse = {
  metrics: {
    bookings: {
      total: number;
      completed: number;
      cancelled: number;
      accepted: number;
    };
    payments: {
      total: number;
      captured: number;
      failed: number;
      gross: number;
    };
    helpers: {
      total: number;
      approved: number;
      online: number;
    };
    disputes: {
      total: number;
      open: number;
      resolved: number;
    };
    reviews: {
      total: number;
      averageRating: string;
    };
  };
};

function asPercent(value: number): string {
  return `${(value * 100).toFixed(1)}%`;
}

function asINR(value: number): string {
  return `Rs ${value.toLocaleString("en-IN")}`;
}

async function fetchAnalytics() {
  const response = await fetch("/api/admin/analytics", { credentials: "include" });

  const payload = (await response.json().catch(() => ({}))) as AnalyticsResponse | { message?: string };

  if (!response.ok) {
    throw new Error("message" in payload ? payload.message ?? "Could not load analytics." : "Could not load analytics.");
  }

  return payload as AnalyticsResponse;
}

export default function AdminAnalyticsPage() {
  const analyticsQuery = useQuery({
    queryKey: ["admin", "analytics"],
    queryFn: fetchAnalytics,
    refetchInterval: 60_000,
  });

  const metrics = analyticsQuery.data?.metrics;

  const derived = useMemo(() => {
    if (!metrics) {
      return null;
    }

    const bookingTotal = Math.max(metrics.bookings.total, 1);
    const paymentTotal = Math.max(metrics.payments.total, 1);
    const disputeTotal = Math.max(metrics.disputes.total, 1);
    const helperTotal = Math.max(metrics.helpers.total, 1);

    return {
      bookingCompletionRate: metrics.bookings.completed / bookingTotal,
      bookingCancellationRate: metrics.bookings.cancelled / bookingTotal,
      paymentCaptureRate: metrics.payments.captured / paymentTotal,
      paymentFailureRate: metrics.payments.failed / paymentTotal,
      disputeResolutionRate: metrics.disputes.resolved / disputeTotal,
      helperApprovalRate: metrics.helpers.approved / helperTotal,
      helperOnlineRate: metrics.helpers.online / helperTotal,
      averageRating: Number(metrics.reviews.averageRating),
    };
  }, [metrics]);

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-2">
          <h1 className="text-3xl font-heading font-black tracking-tight">Platform Analytics</h1>
          <p className="text-sm text-muted-foreground">Live marketplace health for bookings, payments, supply quality, and trust operations.</p>
        </div>
        <Button
          variant="outline"
          className="h-11 rounded-2xl font-semibold"
          onClick={() => analyticsQuery.refetch()}
          disabled={analyticsQuery.isFetching}
        >
          {analyticsQuery.isFetching ? <Loader2 className="mr-2 size-4 animate-spin" /> : <RefreshCcw className="mr-2 size-4" />}
          Refresh
        </Button>
      </div>

      {analyticsQuery.error && (
        <div className="flex items-center gap-2 rounded-2xl border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          <AlertCircle className="size-4 shrink-0" />
          {analyticsQuery.error instanceof Error ? analyticsQuery.error.message : "Could not load analytics."}
        </div>
      )}

      {analyticsQuery.isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {[1, 2, 3, 4].map((item) => (
            <div key={item} className="h-28 animate-pulse rounded-3xl bg-muted/60" />
          ))}
        </div>
      ) : null}

      {metrics && derived ? (
        <>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <Card className="surface-card-strong border-none">
              <CardContent className="space-y-1 p-5">
                <p className="text-sm text-muted-foreground">Bookings (30d)</p>
                <p className="text-2xl font-bold">{metrics.bookings.total}</p>
                <p className="text-xs text-muted-foreground">Completion {asPercent(derived.bookingCompletionRate)}</p>
              </CardContent>
            </Card>
            <Card className="surface-card-strong border-none">
              <CardContent className="space-y-1 p-5">
                <p className="text-sm text-muted-foreground">Payment Gross (30d)</p>
                <p className="text-2xl font-bold">{asINR(metrics.payments.gross)}</p>
                <p className="text-xs text-muted-foreground">Capture {asPercent(derived.paymentCaptureRate)}</p>
              </CardContent>
            </Card>
            <Card className="surface-card-strong border-none">
              <CardContent className="space-y-1 p-5">
                <p className="text-sm text-muted-foreground">Helpers</p>
                <p className="text-2xl font-bold">{metrics.helpers.total}</p>
                <p className="text-xs text-muted-foreground">Approved {asPercent(derived.helperApprovalRate)}</p>
              </CardContent>
            </Card>
            <Card className="surface-card-strong border-none">
              <CardContent className="space-y-1 p-5">
                <p className="text-sm text-muted-foreground">Disputes (30d)</p>
                <p className="text-2xl font-bold">{metrics.disputes.total}</p>
                <p className="text-xs text-muted-foreground">Resolved {asPercent(derived.disputeResolutionRate)}</p>
              </CardContent>
            </Card>
          </div>

          <Card className="surface-card-strong border-none">
            <CardContent className="space-y-5 p-6">
              <div className="inline-flex items-center gap-2 text-sm font-semibold text-primary">
                <BarChart3 className="size-4" />
                Operational Breakdown
              </div>
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                <div className="rounded-2xl border border-border/60 bg-muted/20 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">Booking cancellation rate</p>
                  <p className="mt-2 text-2xl font-black">{asPercent(derived.bookingCancellationRate)}</p>
                </div>
                <div className="rounded-2xl border border-border/60 bg-muted/20 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">Payment failure rate</p>
                  <p className="mt-2 text-2xl font-black">{asPercent(derived.paymentFailureRate)}</p>
                </div>
                <div className="rounded-2xl border border-border/60 bg-muted/20 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">Helpers online now</p>
                  <p className="mt-2 text-2xl font-black">{asPercent(derived.helperOnlineRate)}</p>
                </div>
                <div className="rounded-2xl border border-border/60 bg-muted/20 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">Average rating (30d)</p>
                  <p className="mt-2 text-2xl font-black">{derived.averageRating.toFixed(2)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      ) : null}
    </div>
  );
}
