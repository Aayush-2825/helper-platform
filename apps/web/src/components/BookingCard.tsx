import { Card, CardContent } from "@/components/ui/card";
import { StatusBadge } from "@/components/StatusBadge";
import Link from "next/link";

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

type BookingStatus = "requested" | "matched" | "accepted" | "in_progress" | "completed" | "cancelled" | "expired";

export type Booking = {
  id: string;
  categoryId: string;
  addressLine: string;
  city: string;
  quotedAmount: number;
  requestedAt: Date | string;
  acceptedAt?: Date | string | null;
  startedAt?: Date | string | null;
  completedAt?: Date | string | null;
  status: BookingStatus | string;
};

function formatDateTime(value: Date | string): string {
  const date = typeof value === "string" ? new Date(value) : value;
  return date.toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatElapsed(value: Date | string): string {
  const start = typeof value === "string" ? new Date(value) : value;
  const diffMs = Math.max(0, Date.now() - start.getTime());
  const totalMinutes = Math.floor(diffMs / 60000);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }

  return `${minutes}m`;
}

export function BookingCard({ booking }: { booking: Booking }) {
  const status = booking.status as BookingStatus;
  const isInProgress = status === "in_progress";
  const showAcceptedAt =
    status === "accepted" || status === "in_progress" || status === "completed";
  const showStartedAt = status === "in_progress" || status === "completed";
  const showCompletedAt = status === "completed";

  return (
    <Link href={`/customer/bookings/${booking.id}`} className="block transition-transform active:scale-[0.98]">
      <Card className="hover:border-primary/50 transition-colors">
        <CardContent className="p-4 space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-medium">
              {categoryLabels[booking.categoryId] ?? booking.categoryId}
            </span>
            <StatusBadge status={booking.status} />
          </div>

          <div className="text-sm text-muted-foreground">
            {booking.addressLine}, {booking.city}
          </div>

          <div className="text-sm font-medium">₹{booking.quotedAmount.toLocaleString("en-IN")}</div>

          {isInProgress && (
            <div className="rounded-lg border border-green-300/60 bg-green-50 px-3 py-2 text-xs text-green-800 dark:border-green-800 dark:bg-green-900/20 dark:text-green-300">
              <p className="font-semibold">Service in progress right now.</p>
              <p className="mt-0.5 opacity-90">
                Keep this booking open. Share the completion OTP only when the helper finishes.
              </p>
            </div>
          )}

          <div className="text-xs text-muted-foreground">
            Requested: {formatDateTime(booking.requestedAt)}
          </div>

          {showAcceptedAt && booking.acceptedAt && (
            <div className="text-xs text-muted-foreground">
              Accepted: {formatDateTime(booking.acceptedAt)}
            </div>
          )}

          {showStartedAt && booking.startedAt && (
            <div className="text-xs text-muted-foreground">
              Started: {formatDateTime(booking.startedAt)}
            </div>
          )}

          {isInProgress && booking.startedAt && (
            <div className="text-xs font-semibold text-green-700 dark:text-green-300">
              Elapsed: {formatElapsed(booking.startedAt)}
            </div>
          )}

          {showCompletedAt && booking.completedAt && (
            <div className="text-xs text-muted-foreground">
              Completed: {formatDateTime(booking.completedAt)}
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}
