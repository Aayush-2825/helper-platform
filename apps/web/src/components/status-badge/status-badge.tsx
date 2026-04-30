import { LucideIcon, Circle } from "lucide-react";
import { cn } from "@/lib/utils";
import React from "react";

type StatusType = "success" | "error" | "warning" | "info" | "pending";

interface StatusBadgeProps {
  status: StatusType;
  label?: string;
  size?: "sm" | "md" | "lg";
  animated?: boolean;
  className?: string;
}

const sizeMap = {
  sm: "px-2 py-0.5 text-xs",
  md: "px-3 py-1 text-sm",
  lg: "px-4 py-1.5 text-base",
};

export function StatusBadge({ status, label, size = "md", animated = true, className }: StatusBadgeProps) {
  const base = "inline-flex items-center gap-2 rounded-full font-semibold";
  const statusStyles: Record<StatusType, string> = {
    success: "bg-green-100 text-green-800 border border-green-200",
    error: "bg-destructive/10 text-destructive border border-destructive/20",
    warning: "bg-amber-100 text-amber-800 border border-amber-200",
    info: "bg-blue-100 text-blue-800 border border-blue-200",
    pending: "bg-slate-50 text-slate-700 border border-slate-200",
  };

  const animClass = animated ? "transition-all duration-300 ease-in-out" : "";

  return (
    <span className={cn(base, sizeMap[size], statusStyles[status], animClass, className)}>
      <span
        className={cn("inline-block h-2.5 w-2.5 rounded-full", {
          "bg-green-600": status === "success",
          "bg-destructive": status === "error",
          "bg-amber-600": status === "warning",
          "bg-blue-600": status === "info",
          "bg-slate-500 animate-pulse": status === "pending",
        })}
        aria-hidden
      />
      <span>{label ?? status}</span>
    </span>
  );
}
