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

type BookingStatus = "requested" | "accepted" | "in_progress" | "completed" | "cancelled";

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

export function BookingCard({ booking }: { booking: Booking }) {
  const status = booking.status as BookingStatus;
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
