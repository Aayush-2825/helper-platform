import { ReactNode } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@repo/ui/components/ui/card";
import { cn } from "@/lib/utils";

interface AdminStatsCardProps {
  title: string;
  description?: string;
  value?: string | number;
  subvalue?: string;
  icon?: ReactNode;
  variant?: "default" | "success" | "warning" | "danger";
  trend?: {
    value: number;
    label: string;
    positive: boolean;
  };
  className?: string;
}

export function AdminStatsCard({
  title,
  description,
  value,
  subvalue,
  icon,
  variant = "default",
  trend,
  className,
}: AdminStatsCardProps) {
  const variantStyles = {
    default:
      "border-border hover:border-primary/50 bg-card hover:bg-card/80",
    success:
      "border-green-200/50 bg-green-50/30 dark:border-green-900/30 dark:bg-green-950/10 hover:border-green-300",
    warning:
      "border-amber-200/50 bg-amber-50/30 dark:border-amber-900/30 dark:bg-amber-950/10 hover:border-amber-300",
    danger:
      "border-destructive/20 bg-destructive/5 hover:border-destructive/50 dark:bg-destructive/10",
  };

  return (
    <Card
      className={cn(
        "transition-all duration-200 hover:shadow-md",
        variantStyles[variant],
        className
      )}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1">
            <CardTitle className="text-base font-semibold">{title}</CardTitle>
            {description && (
              <CardDescription className="mt-1 text-xs">
                {description}
              </CardDescription>
            )}
          </div>
          {icon && (
            <div className="flex-shrink-0 text-muted-foreground/60">
              {icon}
            </div>
          )}
        </div>
      </CardHeader>
      {(value || trend) && (
        <CardContent>
          <div className="space-y-2">
            {value && (
              <div>
                <p className="text-2xl font-bold tracking-tight">{value}</p>
                {subvalue && (
                  <p className="text-xs text-muted-foreground">{subvalue}</p>
                )}
              </div>
            )}
            {trend && (
              <div
                className={cn(
                  "flex items-center gap-1 text-xs font-semibold",
                  trend.positive ? "text-green-600" : "text-destructive"
                )}
              >
                <span>{trend.positive ? "↑" : "↓"}</span>
                <span>{trend.value}%</span>
                <span className="text-muted-foreground font-normal">
                  {trend.label}
                </span>
              </div>
            )}
          </div>
        </CardContent>
      )}
    </Card>
  );
}

interface AdminCardSectionProps {
  title: string;
  subtitle?: string;
  action?: ReactNode;
  children: ReactNode;
  columns?: 2 | 3 | 4;
}

export function AdminCardSection({
  title,
  subtitle,
  action,
  children,
  columns = 3,
}: AdminCardSectionProps) {
  const colClass = {
    2: "grid-cols-1 sm:grid-cols-2",
    3: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
    4: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4",
  };

  return (
    <section className="space-y-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="font-semibold tracking-tight">{title}</h3>
          {subtitle && (
            <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
          )}
        </div>
        {action}
      </div>
      <div className={cn("grid gap-4", colClass[columns])}>{children}</div>
    </section>
  );
}

interface AdminTableCardProps {
  title: string;
  description?: string;
  action?: ReactNode;
  children: ReactNode;
}

export function AdminTableCard({
  title,
  description,
  action,
  children,
}: AdminTableCardProps) {
  return (
    <Card className="border-border">
      <CardHeader className="border-b border-border pb-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <CardTitle className="text-lg">{title}</CardTitle>
            {description && (
              <CardDescription className="mt-1">{description}</CardDescription>
            )}
          </div>
          {action}
        </div>
      </CardHeader>
      <CardContent className="p-0">{children}</CardContent>
    </Card>
  );
}
