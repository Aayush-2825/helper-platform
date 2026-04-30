import { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown } from "lucide-react";

interface DashboardMetricProps {
  label: string;
  value: string | number;
  unit?: string;
  change?: number; // Percentage change (positive or negative)
  changeLabel?: string;
  icon?: React.ReactNode;
  className?: string;
}

export function DashboardMetric({
  label,
  value,
  unit,
  change,
  changeLabel,
  icon,
  className,
}: DashboardMetricProps) {
  const isPositive = change !== undefined && change >= 0;

  return (
    <div
      className={cn(
        "rounded-lg border border-border bg-card p-6 hover:shadow-md hover:border-border/80 transition-all duration-200",
        className
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            {label}
          </p>
          <p className="mt-2 text-3xl font-bold tracking-tight">
            {value}
            {unit && <span className="text-lg text-muted-foreground ml-1">{unit}</span>}
          </p>
          {change !== undefined && (
            <div
              className={cn(
                "mt-2 flex items-center gap-1 text-sm font-semibold",
                isPositive ? "text-green-600" : "text-destructive"
              )}
            >
              {isPositive ? (
                <TrendingUp className="h-4 w-4" />
              ) : (
                <TrendingDown className="h-4 w-4" />
              )}
              <span>{Math.abs(change)}%</span>
              {changeLabel && <span className="text-muted-foreground">{changeLabel}</span>}
            </div>
          )}
        </div>
        {icon && <div className="flex-shrink-0 text-muted-foreground">{icon}</div>}
      </div>
    </div>
  );
}

interface DashboardGridProps {
  children: ReactNode;
  columns?: 2 | 3 | 4;
}

export function DashboardGrid({ children, columns = 3 }: DashboardGridProps) {
  const gridCols = {
    2: "sm:grid-cols-2",
    3: "sm:grid-cols-2 lg:grid-cols-3",
    4: "sm:grid-cols-2 lg:grid-cols-4",
  };

  return (
    <div className={cn("grid gap-4", gridCols[columns])}>
      {children}
    </div>
  );
}

interface DashboardSectionProps {
  title: string;
  description?: string;
  action?: ReactNode;
  children: ReactNode;
}

export function DashboardSection({
  title,
  description,
  action,
  children,
}: DashboardSectionProps) {
  return (
    <section className="space-y-4">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold tracking-tight">{title}</h3>
          {description && (
            <p className="mt-1 text-sm text-muted-foreground">{description}</p>
          )}
        </div>
        {action && <div className="flex-shrink-0">{action}</div>}
      </div>
      {children}
    </section>
  );
}

interface StatsPillProps {
  label: string;
  value: string | number;
  variant?: "default" | "success" | "warning" | "destructive";
}

export function StatsPill({ label, value, variant = "default" }: StatsPillProps) {
  const variants = {
    default: "bg-muted text-muted-foreground",
    success: "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-400",
    warning: "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400",
    destructive: "bg-destructive/10 text-destructive",
  };

  return (
    <div className={cn("inline-flex items-center gap-2 rounded-full px-3 py-1", variants[variant])}>
      <span className="text-xs font-medium uppercase tracking-wider">{label}</span>
      <span className="font-bold">{value}</span>
    </div>
  );
}
