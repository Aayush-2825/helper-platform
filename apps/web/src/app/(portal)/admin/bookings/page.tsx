"use client";

import { useEffect, useMemo, useState } from "react";
import { AlertCircle, CheckCircle2, Loader2, RefreshCcw, Search, Wifi, WifiOff } from "lucide-react";
import { useRealtimeEvents } from "@/hooks/use-realtime-events";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useSession } from "@/lib/auth/session";
import { cn } from "@/lib/utils";

type BookingStatus =
  | "requested"
  | "matched"
  | "accepted"
  | "in_progress"
  | "completed"
  | "cancelled"
  | "expired"
  | "disputed";

type BookingSummary = {
  id: string;
  customerId: string;
  helperId: string | null;
  status: BookingStatus;
  categoryId: string;
  customerName: string | null;
  helperName: string | null;
  addressLine: string;
  city: string;
  requestedAt: string;
  scheduledFor: string | null;
  completedAt: string | null;
  cancelledAt: string | null;
  quotedAmount: number;
  finalAmount: number | null;
  currency: string;
};

type BookingsResponse = {
  bookings?: BookingSummary[];
  message?: string;
};

const statusOptions: Array<{ label: string; value: BookingStatus | "all" }> = [
  { label: "All statuses", value: "all" },
  { label: "Requested", value: "requested" },
  { label: "Matched", value: "matched" },
  { label: "Accepted", value: "accepted" },
  { label: "In progress", value: "in_progress" },
  { label: "Completed", value: "completed" },
  { label: "Cancelled", value: "cancelled" },
  { label: "Expired", value: "expired" },
  { label: "Disputed", value: "disputed" },
];

const realtimeTypes = ["booking_request", "booking_update", "notification", "payment_update"] as const;

function formatDate(value?: string | null): string {
  if (!value) {
    return "-";
  }

  return new Date(value).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function money(amount: number, currency = "INR"): string {
  if (currency !== "INR") {
    return `${currency} ${amount.toLocaleString("en-IN")}`;
  }

  return `Rs ${amount.toLocaleString("en-IN")}`;
}

function getEventDetails(data: unknown): { bookingId: string | null; eventType: string | null } {
  if (!data || typeof data !== "object") {
    return { bookingId: null, eventType: null };
  }

  const payload = data as Record<string, unknown>;
  const bookingId = typeof payload.bookingId === "string" ? payload.bookingId : null;
  const eventType = typeof payload.eventType === "string" ? payload.eventType : null;

  return { bookingId, eventType };
}

const bookingStatusStyles: Record<BookingStatus, string> = {
  requested: "border-slate-200 bg-slate-100 text-slate-800 dark:border-slate-700/50 dark:bg-slate-700/20 dark:text-slate-200",
  matched: "border-indigo-200 bg-indigo-100 text-indigo-800 dark:border-indigo-700/50 dark:bg-indigo-700/20 dark:text-indigo-200",
  accepted: "border-cyan-200 bg-cyan-100 text-cyan-800 dark:border-cyan-700/50 dark:bg-cyan-700/20 dark:text-cyan-200",
  in_progress: "border-amber-200 bg-amber-100 text-amber-800 dark:border-amber-700/50 dark:bg-amber-700/20 dark:text-amber-200",
  completed: "border-green-200 bg-green-100 text-green-800 dark:border-green-700/50 dark:bg-green-700/20 dark:text-green-200",
  cancelled: "border-rose-200 bg-rose-100 text-rose-800 dark:border-rose-700/50 dark:bg-rose-700/20 dark:text-rose-200",
  expired: "border-zinc-200 bg-zinc-100 text-zinc-800 dark:border-zinc-700/50 dark:bg-zinc-700/20 dark:text-zinc-200",
  disputed: "border-orange-200 bg-orange-100 text-orange-800 dark:border-orange-700/50 dark:bg-orange-700/20 dark:text-orange-200",
};

export default function AdminBookingsPage() {
  const { session } = useSession();
  const userId = session?.user.id;
  const userRole = session?.user.role;

  const [bookings, setBookings] = useState<BookingSummary[]>([]);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<BookingStatus | "all">("all");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { connected, eventMessages } = useRealtimeEvents({
    maxEvents: 80,
    userId,
    userRole,
    eventTypes: [...realtimeTypes],
  });

  const fetchBookings = async (isManualRefresh = false) => {
    setError(null);

    if (isManualRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    try {
      const response = await fetch("/api/bookings?limit=200", {
        credentials: "include",
      });

      const payload = (await response.json().catch(() => ({}))) as BookingsResponse;

      if (!response.ok) {
        throw new Error(payload.message ?? "Could not load bookings.");
      }

      setBookings(payload.bookings ?? []);
    } catch (fetchError) {
      setBookings([]);
      setError(fetchError instanceof Error ? fetchError.message : "Unable to load bookings.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    void fetchBookings();
  }, []);

  const filteredBookings = useMemo(() => {
    const search = query.trim().toLowerCase();

    return bookings.filter((booking) => {
      if (statusFilter !== "all" && booking.status !== statusFilter) {
        return false;
      }

      if (!search) {
        return true;
      }

      const haystack = [
        booking.id,
        booking.customerId,
        booking.helperId ?? "",
        booking.customerName ?? "",
        booking.helperName ?? "",
        booking.addressLine,
        booking.city,
        booking.categoryId,
        booking.status,
      ]
        .join(" ")
        .toLowerCase();

      return haystack.includes(search);
    });
  }, [bookings, query, statusFilter]);

  const metrics = useMemo(() => {
    const activeStatuses: BookingStatus[] = ["requested", "matched", "accepted", "in_progress"];

    return {
      total: bookings.length,
      active: bookings.filter((booking) => activeStatuses.includes(booking.status)).length,
      completed: bookings.filter((booking) => booking.status === "completed").length,
      exceptions: bookings.filter((booking) => ["cancelled", "expired", "disputed"].includes(booking.status)).length,
      unassigned: bookings.filter((booking) => !booking.helperId).length,
    };
  }, [bookings]);

  const latestEvents = useMemo(() => eventMessages.slice(0, 12), [eventMessages]);

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-2">
          <h1 className="text-3xl font-heading font-black tracking-tight">Booking Operations</h1>
          <p className="text-sm text-muted-foreground">Monitor booking states, spot unresolved exceptions, and triage live activity.</p>
        </div>

        <div className="flex items-center gap-2">
          <Badge
            className={cn(
              "h-9 rounded-full border px-3 text-xs font-semibold uppercase tracking-[0.16em]",
              connected
                ? "border-green-200 bg-green-100 text-green-800 dark:border-green-700/50 dark:bg-green-700/20 dark:text-green-200"
                : "border-amber-200 bg-amber-100 text-amber-800 dark:border-amber-700/50 dark:bg-amber-700/20 dark:text-amber-200",
            )}
          >
            {connected ? <Wifi className="mr-1.5 size-3.5" /> : <WifiOff className="mr-1.5 size-3.5" />}
            {connected ? "Realtime connected" : "Realtime disconnected"}
          </Badge>

          <Button variant="outline" className="h-11 rounded-2xl font-semibold" onClick={() => void fetchBookings(true)}>
            {refreshing ? <Loader2 className="mr-2 size-4 animate-spin" /> : <RefreshCcw className="mr-2 size-4" />}
            Refresh
          </Button>
        </div>
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
            <p className="text-sm text-muted-foreground">Total Bookings</p>
            <p className="text-2xl font-bold">{loading ? "-" : metrics.total}</p>
          </CardContent>
        </Card>
        <Card className="surface-card-strong border-none">
          <CardContent className="space-y-1 p-5">
            <p className="text-sm text-muted-foreground">Active</p>
            <p className="text-2xl font-bold">{loading ? "-" : metrics.active}</p>
          </CardContent>
        </Card>
        <Card className="surface-card-strong border-none">
          <CardContent className="space-y-1 p-5">
            <p className="text-sm text-muted-foreground">Completed</p>
            <p className="text-2xl font-bold">{loading ? "-" : metrics.completed}</p>
          </CardContent>
        </Card>
        <Card className="surface-card-strong border-none">
          <CardContent className="space-y-1 p-5">
            <p className="text-sm text-muted-foreground">Exceptions</p>
            <p className="text-2xl font-bold">{loading ? "-" : metrics.exceptions}</p>
          </CardContent>
        </Card>
        <Card className="surface-card-strong border-none">
          <CardContent className="space-y-1 p-5">
            <p className="text-sm text-muted-foreground">Unassigned</p>
            <p className="text-2xl font-bold">{loading ? "-" : metrics.unassigned}</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.8fr_1fr]">
        <Card className="surface-card-strong border-none">
          <CardContent className="space-y-5 p-5 sm:p-6">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="relative flex-1">
                <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search booking, customer, helper, city, category..."
                  className="h-12 pl-11"
                />
              </div>

              <select
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value as BookingStatus | "all")}
                className="h-12 rounded-2xl border border-border/50 bg-card/60 px-4 text-sm font-medium outline-none transition-all focus-visible:border-primary/50 focus-visible:ring-4 focus-visible:ring-primary/10"
              >
                {statusOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {loading ? (
              <div className="grid gap-3">
                {[1, 2, 3, 4].map((item) => (
                  <div key={item} className="h-20 animate-pulse rounded-2xl bg-muted/60" />
                ))}
              </div>
            ) : filteredBookings.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-border/70 p-10 text-center text-sm text-muted-foreground">
                No bookings match the current filters.
              </div>
            ) : (
              <div className="overflow-hidden rounded-3xl border border-border/60">
                <table className="w-full border-collapse text-left">
                  <thead className="bg-muted/40 text-xs uppercase tracking-[0.18em] text-muted-foreground">
                    <tr>
                      <th className="px-4 py-3 font-semibold">Booking</th>
                      <th className="px-4 py-3 font-semibold">Customer</th>
                      <th className="px-4 py-3 font-semibold">Helper</th>
                      <th className="px-4 py-3 font-semibold">Schedule</th>
                      <th className="px-4 py-3 font-semibold">Status</th>
                      <th className="px-4 py-3 font-semibold">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60">
                    {filteredBookings.map((booking) => (
                      <tr key={booking.id} className="bg-card/20 transition-colors hover:bg-muted/20">
                        <td className="px-4 py-4 align-top">
                          <p className="font-medium">#{booking.id.slice(0, 8)}</p>
                          <p className="text-xs text-muted-foreground">{booking.addressLine}, {booking.city}</p>
                          <p className="text-xs text-muted-foreground">Category {booking.categoryId.slice(0, 8)}</p>
                        </td>
                        <td className="px-4 py-4 align-top">
                          <p className="font-medium">{booking.customerName ?? "Customer"}</p>
                          <p className="text-xs text-muted-foreground">ID {booking.customerId.slice(0, 8)}</p>
                        </td>
                        <td className="px-4 py-4 align-top">
                          <p className="font-medium">{booking.helperName ?? "Unassigned"}</p>
                          <p className="text-xs text-muted-foreground">
                            {booking.helperId ? `ID ${booking.helperId.slice(0, 8)}` : "Waiting for match"}
                          </p>
                        </td>
                        <td className="px-4 py-4 align-top text-xs text-muted-foreground">
                          <p>Requested {formatDate(booking.requestedAt)}</p>
                          <p>Scheduled {formatDate(booking.scheduledFor)}</p>
                          <p>Completed {formatDate(booking.completedAt)}</p>
                        </td>
                        <td className="px-4 py-4 align-top">
                          <Badge
                            className={cn(
                              "rounded-full border px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em]",
                              bookingStatusStyles[booking.status],
                            )}
                          >
                            {booking.status.replace("_", " ")}
                          </Badge>
                        </td>
                        <td className="px-4 py-4 align-top text-sm">
                          <p className="font-semibold">{money(booking.finalAmount ?? booking.quotedAmount, booking.currency)}</p>
                          <p className="text-xs text-muted-foreground">Quoted {money(booking.quotedAmount, booking.currency)}</p>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="surface-card-strong border-none">
          <CardContent className="space-y-4 p-5 sm:p-6">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold">Live Event Stream</h2>
              <p className="text-xs text-muted-foreground">{latestEvents.length} recent</p>
            </div>

            {latestEvents.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-border/60 p-6 text-center text-sm text-muted-foreground">
                No realtime booking activity yet.
              </div>
            ) : (
              <ul className="space-y-3">
                {latestEvents.map((message, index) => {
                  const details = getEventDetails(message.data);

                  return (
                    <li key={`${message.occurredAt ?? "event"}-${index}`} className="rounded-2xl border border-border/60 bg-card/40 p-3">
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary">{message.event.replace("_", " ")}</p>
                        <span className="text-[11px] text-muted-foreground">{formatDate(message.occurredAt)}</span>
                      </div>
                      <p className="mt-1 text-sm text-foreground/90">
                        {details.eventType ? `Event ${details.eventType.replace("_", " ")}` : "Realtime update received"}
                      </p>
                      {details.bookingId ? (
                        <p className="mt-1 text-xs text-muted-foreground">Booking #{details.bookingId.slice(0, 8)}</p>
                      ) : (
                        <p className="mt-1 text-xs text-muted-foreground">No booking id in payload</p>
                      )}
                    </li>
                  );
                })}
              </ul>
            )}

            <div className="rounded-2xl border border-green-200 bg-green-50/70 px-3 py-2 text-xs text-green-700 dark:border-green-700/40 dark:bg-green-900/20 dark:text-green-300">
              <CheckCircle2 className="mr-1 inline size-3.5" />
              Live events appear here without reloading the page.
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
