import { ReactNode } from "react";
import { cn } from "@/lib/utils";

type StatusType = "success" | "error" | "warning" | "info" | "pending";

interface StatusBadgeProps {
  status: StatusType;
  label: string | ReactNode;
  size?: "sm" | "md" | "lg";
  className?: string;
  dot?: boolean;
}

const statusConfig = {
  success: {
    bg: "bg-green-50 dark:bg-green-950",
    border: "border-green-200 dark:border-green-800",
    text: "text-green-700 dark:text-green-400",
    dot: "bg-green-500",
  },
  error: {
    bg: "bg-destructive/5",
    border: "border-destructive/20",
    text: "text-destructive",
    dot: "bg-destructive",
  },
  warning: {
    bg: "bg-amber-50 dark:bg-amber-950",
    border: "border-amber-200 dark:border-amber-800",
    text: "text-amber-700 dark:text-amber-400",
    dot: "bg-amber-500",
  },
  info: {
    bg: "bg-blue-50 dark:bg-blue-950",
    border: "border-blue-200 dark:border-blue-800",
    text: "text-blue-700 dark:text-blue-400",
    dot: "bg-blue-500",
  },
  pending: {
    bg: "bg-slate-50 dark:bg-slate-800",
    border: "border-slate-200 dark:border-slate-700",
    text: "text-slate-700 dark:text-slate-400",
    dot: "bg-slate-500",
  },
};

const sizeConfig = {
  sm: "px-2.5 py-1 text-xs",
  md: "px-3 py-1.5 text-sm",
  lg: "px-4 py-2 text-base",
};

export function StatusBadge({
  status,
  label,
  size = "md",
  className,
  dot = false,
}: StatusBadgeProps) {
  const config = statusConfig[status];
  const sizeClass = sizeConfig[size];

  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 rounded-full border font-semibold transition-colors",
        config.bg,
        config.border,
        config.text,
        sizeClass,
        className
      )}
    >
      {dot && <span className={cn("h-2 w-2 rounded-full", config.dot)} />}
      {label}
    </span>
  );
}

interface StatusIndicatorProps {
  status: StatusType;
  animate?: boolean;
  size?: "sm" | "md" | "lg";
}

export function StatusIndicator({
  status,
  animate = true,
  size = "md",
}: StatusIndicatorProps) {
  const config = statusConfig[status];
  const sizeClass = {
    sm: "h-2 w-2",
    md: "h-3 w-3",
    lg: "h-4 w-4",
  }[size];

  return (
    <span
      className={cn(
        "rounded-full inline-block",
        config.dot,
        sizeClass,
        animate && status === "pending" && "animate-pulse-soft"
      )}
    />
  );
}
