import { CheckCircle2, Circle, Clock3, MapPin, SquareDashed, XCircle } from "lucide-react";

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

type TimelineStep = {
  key: Exclude<BookingStatus, "cancelled" | "expired" | "disputed">;
  label: string;
  description: string;
  icon: typeof Circle;
};

type TimelineFeedItem = {
  key: string;
  label: string;
  timestamp: string | null;
  note?: string | null;
  actorName?: string | null;
  actorRole?: string | null;
};

export type BookingTimelineEvent = {
  id: string;
  status: BookingStatus | string;
  createdAt: string | Date;
  note?: string | null;
  actorName?: string | null;
  actorRole?: string | null;
};

type BookingTimelineProps = {
  status: string;
  requestedAt?: string | Date | null;
  acceptedAt?: string | Date | null;
  startedAt?: string | Date | null;
  completedAt?: string | Date | null;
  cancelledAt?: string | Date | null;
  events?: BookingTimelineEvent[];
};

const timelineSteps: TimelineStep[] = [
  {
    key: "requested",
    label: "Request placed",
    description: "Your booking is created and ready for matching.",
    icon: Clock3,
  },
  {
    key: "matched",
    label: "Helpers notified",
    description: "Nearby verified helpers are being invited to accept.",
    icon: MapPin,
  },
  {
    key: "accepted",
    label: "Helper accepted",
    description: "A helper has confirmed the job and is preparing.",
    icon: CheckCircle2,
  },
  {
    key: "in_progress",
    label: "Job in progress",
    description: "The service has started and is now being completed.",
    icon: SquareDashed,
  },
  {
    key: "completed",
    label: "Completed",
    description: "The booking has been finished successfully.",
    icon: CheckCircle2,
  },
];

function getTerminalStatusConfig(status: BookingStatus) {
  switch (status) {
    case "cancelled":
      return {
        label: "Cancelled",
        description: "This booking was cancelled before completion.",
      };
    case "expired":
      return {
        label: "Expired",
        description: "Matching timed out before a helper accepted the request.",
      };
    case "disputed":
      return {
        label: "Disputed",
        description: "This booking is under review.",
      };
    default:
      return null;
  }
}

function formatTimelineTime(value: string | Date | null | undefined) {
  if (!value) {
    return null;
  }

  const date = typeof value === "string" ? new Date(value) : value;
  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return date.toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getTimelineEventLabel(status: string) {
  switch (status) {
    case "requested":
      return "Request placed";
    case "matched":
      return "Helpers notified";
    case "accepted":
      return "Helper accepted";
    case "in_progress":
      return "Job in progress";
    case "completed":
      return "Completed";
    case "cancelled":
      return "Cancelled";
    case "expired":
      return "Expired";
    case "disputed":
      return "Disputed";
    default:
      return status.replaceAll("_", " ");
  }
}

function getActiveStepIndex(status: BookingStatus) {
  const terminalIndex = timelineSteps.length - 1;

  if (status === "completed") return terminalIndex;
  if (status === "in_progress") return 3;
  if (status === "accepted") return 2;
  if (status === "matched") return 1;
  return 0;
}

export function BookingStatusTimeline({
  status,
  requestedAt,
  acceptedAt,
  startedAt,
  completedAt,
  cancelledAt,
  events,
}: BookingTimelineProps) {
  const normalizedStatus = status as BookingStatus;
  const terminalStatus = getTerminalStatusConfig(normalizedStatus);
  const isTerminal = terminalStatus !== null;
  const activeStepIndex = getActiveStepIndex(normalizedStatus);
  const isCompletedBooking = normalizedStatus === "completed";

  const timelineEvents: TimelineFeedItem[] = (events && events.length > 0
    ? [...events]
        .sort((left, right) => {
          const leftDate = typeof left.createdAt === "string" ? new Date(left.createdAt) : left.createdAt;
          const rightDate = typeof right.createdAt === "string" ? new Date(right.createdAt) : right.createdAt;
          return leftDate.getTime() - rightDate.getTime();
        })
        .map((event) => ({
          key: event.id,
          label: getTimelineEventLabel(event.status),
          timestamp: formatTimelineTime(event.createdAt),
          note: event.note,
          actorName: event.actorName,
          actorRole: event.actorRole,
        }))
    : [
        {
          key: "requested",
          label: "Request placed",
          timestamp: formatTimelineTime(requestedAt),
        },
        {
          key: "matched",
          label: "Helpers notified",
          timestamp:
            normalizedStatus === "matched" || normalizedStatus === "accepted" || normalizedStatus === "in_progress" || normalizedStatus === "completed"
              ? formatTimelineTime(acceptedAt) ?? "In progress"
              : null,
        },
        {
          key: "accepted",
          label: "Helper accepted",
          timestamp: formatTimelineTime(acceptedAt),
        },
        {
          key: "in_progress",
          label: "Job in progress",
          timestamp: formatTimelineTime(startedAt),
        },
        {
          key: "completed",
          label: "Completed",
          timestamp: formatTimelineTime(completedAt),
        },
        {
          key: "cancelled",
          label: "Cancelled",
          timestamp: formatTimelineTime(cancelledAt),
        },
      ]).filter((event) => event.timestamp);

  return (
    <div className="rounded-2xl border bg-card/80 p-4 shadow-sm">
      <div className="mb-4 flex items-center gap-2">
        <div className="size-2 rounded-full bg-primary" />
        <p className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Booking Timeline</p>
      </div>

      <div className="space-y-4">
        <div className="rounded-xl border bg-background/70 p-3">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Event Feed</p>
          <div className="mt-3 space-y-2">
            {timelineEvents.map((event) => (
              <div key={event.key} className="rounded-lg bg-muted/30 px-3 py-2">
                <div className="flex items-center justify-between gap-4">
                  <span className="text-sm font-medium">{event.label}</span>
                  <span className="text-xs text-muted-foreground">{event.timestamp}</span>
                </div>
                {(event.actorName || event.note) && (
                  <p className="mt-1 text-xs text-muted-foreground">
                    {event.actorName ? `By ${event.actorName}` : null}
                    {event.actorName && event.note ? " · " : null}
                    {event.note ?? null}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>

        {timelineSteps.map((step, index) => {
          const isComplete = index < activeStepIndex || (isCompletedBooking && index === activeStepIndex);
          const isCurrent = index === activeStepIndex && !isTerminal && !isCompletedBooking;
          const StepIcon = step.icon;

          return (
            <div key={step.key} className="flex gap-3">
              <div className="flex flex-col items-center pt-0.5">
                <div
                  className={cn(
                    "flex size-8 items-center justify-center rounded-full border",
                    isCurrent && "border-primary bg-primary text-primary-foreground shadow-sm",
                    isComplete && !isCurrent && "border-green-500 bg-green-500 text-white",
                    !isComplete && !isCurrent && "border-muted-foreground/30 bg-background text-muted-foreground",
                  )}
                >
                  <StepIcon className="size-4" />
                </div>
                {index < timelineSteps.length - 1 && (
                  <div
                    className={cn(
                      "h-full w-px flex-1 min-h-5 bg-border",
                      index < activeStepIndex && "bg-green-500",
                    )}
                  />
                )}
              </div>

              <div className="pb-3">
                <p className={cn("text-sm font-medium", isCurrent && "text-primary", isComplete && !isCurrent && "text-foreground")}>{step.label}</p>
                <p className="text-xs text-muted-foreground">{step.description}</p>
              </div>
            </div>
          );
        })}

        {isTerminal && (
          <div className="mt-2 rounded-xl border border-dashed bg-muted/30 p-3">
            <div className="flex items-center gap-2">
              <XCircle className="size-4 text-muted-foreground" />
              <p className="text-sm font-medium">{terminalStatus?.label}</p>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">{terminalStatus?.description}</p>
          </div>
        )}
      </div>
    </div>
  );
}