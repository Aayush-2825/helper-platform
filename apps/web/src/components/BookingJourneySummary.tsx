"use client";

import { BadgeCheck, Ban, Clock3, CircleDashed, Layers3 } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type SummaryBooking = {
  status: string;
  requestedAt: Date | string;
  acceptedAt?: Date | string | null;
  startedAt?: Date | string | null;
  completedAt?: Date | string | null;
  cancelledAt?: Date | string | null;
};

function getTimestamp(value?: Date | string | null) {
  if (!value) {
    return null;
  }

  const date = typeof value === "string" ? new Date(value) : value;
  return Number.isNaN(date.getTime()) ? null : date;
}

function getLatestActivity(booking: SummaryBooking) {
  switch (booking.status) {
    case "completed":
      return getTimestamp(booking.completedAt) ?? getTimestamp(booking.startedAt) ?? getTimestamp(booking.acceptedAt) ?? getTimestamp(booking.requestedAt);
    case "in_progress":
      return getTimestamp(booking.startedAt) ?? getTimestamp(booking.acceptedAt) ?? getTimestamp(booking.requestedAt);
    case "accepted":
      return getTimestamp(booking.acceptedAt) ?? getTimestamp(booking.requestedAt);
    case "cancelled":
      return getTimestamp(booking.cancelledAt) ?? getTimestamp(booking.requestedAt);
    default:
      return getTimestamp(booking.requestedAt);
  }
}

function formatDate(value: Date) {
  return value.toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function BookingJourneySummary({
  bookings,
  activeStatuses,
  title = "Journey snapshot",
}: {
  bookings: SummaryBooking[];
  activeStatuses: string[];
  title?: string;
}) {
  const activeSet = new Set(activeStatuses);
  const activeCount = bookings.filter((booking) => activeSet.has(booking.status)).length;
  const completedCount = bookings.filter((booking) => booking.status === "completed").length;
  const closedCount = bookings.filter((booking) => booking.status === "cancelled" || booking.status === "expired").length;
  const requestedCount = bookings.filter((booking) => booking.status === "requested").length;

  const latestBooking = [...bookings]
    .map((booking) => ({ booking, activity: getLatestActivity(booking) }))
    .filter((item) => item.activity)
    .sort((a, b) => (b.activity?.getTime() ?? 0) - (a.activity?.getTime() ?? 0))[0];

  const latestLabel = latestBooking
    ? `${latestBooking.booking.status.replaceAll("_", " ")} · ${formatDate(latestBooking.activity as Date)}`
    : "No recent activity yet";

  return (
    <Card className="border-border/70 bg-linear-to-br from-background via-background to-muted/30 shadow-sm">
      <CardContent className="space-y-4 p-4 sm:p-5">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">{title}</p>
            <p className="text-sm text-muted-foreground">A quick view of where your bookings stand right now.</p>
          </div>
          <Layers3 className="size-5 text-primary" />
        </div>

        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <SummaryTile
            icon={CircleDashed}
            label="Active"
            value={activeCount}
            tone="text-amber-700"
            surface="bg-amber-100/70 dark:bg-amber-900/20"
            detail={requestedCount > 0 ? `${requestedCount} still searching` : "Working bookings"}
          />
          <SummaryTile
            icon={BadgeCheck}
            label="Completed"
            value={completedCount}
            tone="text-green-700"
            surface="bg-green-100/70 dark:bg-green-900/20"
            detail="Finished bookings"
          />
          <SummaryTile
            icon={Ban}
            label="Closed"
            value={closedCount}
            tone="text-rose-700"
            surface="bg-rose-100/70 dark:bg-rose-900/20"
            detail="Cancelled or expired"
          />
          <SummaryTile
            icon={Clock3}
            label="Total"
            value={bookings.length}
            tone="text-sky-700"
            surface="bg-sky-100/70 dark:bg-sky-900/20"
            detail={latestLabel}
          />
        </div>
      </CardContent>
    </Card>
  );
}

function SummaryTile({
  icon: Icon,
  label,
  value,
  detail,
  tone,
  surface,
}: {
  icon: typeof Layers3;
  label: string;
  value: number;
  detail: string;
  tone: string;
  surface: string;
}) {
  return (
    <div className={cn("rounded-2xl border p-3", surface)}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">{label}</p>
          <p className={cn("mt-1 text-2xl font-semibold", tone)}>{value}</p>
        </div>
        <Icon className={cn("size-4", tone)} />
      </div>
      <p className="mt-3 text-xs leading-relaxed text-muted-foreground">{detail}</p>
    </div>
  );
}