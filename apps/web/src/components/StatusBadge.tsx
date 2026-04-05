import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type BookingStatus = "requested" | "matched" | "accepted" | "in_progress" | "completed" | "cancelled" | "expired";

const statusConfig: Record<
  BookingStatus,
  { label: string; className: string; pulse?: boolean }
> = {
  requested: {
    label: "Searching for helper…",
    className: "bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800",
    pulse: true,
  },
  matched: {
    label: "Helpers notified",
    className: "bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800",
    pulse: true,
  },
  accepted: {
    label: "Helper accepted",
    className: "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800",
  },
  in_progress: {
    label: "Job in progress",
    className: "bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/30 dark:text-purple-400 dark:border-purple-800",
  },
  completed: {
    label: "Completed",
    className: "bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800",
  },
  cancelled: {
    label: "Cancelled",
    className: "bg-gray-100 text-gray-600 border-gray-200 dark:bg-gray-800/50 dark:text-gray-400 dark:border-gray-700",
  },
  expired: {
    label: "Expired",
    className: "bg-rose-100 text-rose-800 border-rose-200 dark:bg-rose-900/30 dark:text-rose-300 dark:border-rose-800",
  },
};

export function StatusBadge({ status }: { status: string }) {
  const config = statusConfig[status as BookingStatus] ?? {
    label: status,
    className: "bg-secondary text-secondary-foreground",
  };

  return (
    <span className="inline-flex items-center gap-1.5">
      {config.pulse && (
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500" />
        </span>
      )}
      <Badge className={cn(config.className)}>{config.label}</Badge>
    </span>
  );
}
