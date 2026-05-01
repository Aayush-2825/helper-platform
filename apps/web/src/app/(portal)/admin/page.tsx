import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  BarChart3,
  BookUser,
  BriefcaseBusiness,
  HandCoins,
  Wallet,
  Scale,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  Clock,
  Users,
} from "lucide-react";
import { Button, } from "@repo/ui/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@repo/ui/components/ui/card";
import {
  AdminStatsCard,
  AdminCardSection,
  DashboardMetric,
  StatsPill,
} from "@/components/dashboard";

const adminActions = [
  {
    title: "Users",
    description: "Search, review, and manage customer accounts.",
    href: "/admin/users",
    icon: BookUser,
  },
  {
    title: "Helpers",
    description: "Manage helper profiles and operational status.",
    href: "/admin/helpers",
    icon: BriefcaseBusiness,
  },
  {
    title: "Verifications",
    description: "Approve or reject pending helper KYC.",
    href: "/admin/verifications",
    icon: BadgeCheck,
  },
  {
    title: "Payments",
    description: "Audit payment records, commissions, and refunds.",
    href: "/admin/payments",
    icon: HandCoins,
  },
  {
    title: "Disputes",
    description: "Resolve user-helper conflicts and escalations.",
    href: "/admin/disputes",
    icon: Scale,
  },
  {
    title: "Payouts",
    description: "Track helper withdrawals, settlements, and failures.",
    href: "/admin/payouts",
    icon: Wallet,
  },
  {
    title: "Analytics",
    description: "Track marketplace growth and service quality KPIs.",
    href: "/admin/analytics",
    icon: BarChart3,
  },
];

export default function AdminHomePage() {
  return (
    <div className="space-y-12">
      {/* Header */}
      <div className="reveal-up space-y-3 px-1">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
          Admin control center
        </p>
        <h2 className="text-4xl font-heading font-black tracking-tight">
          Marketplace <span className="text-primary">Control</span>
        </h2>
        <p className="max-w-3xl text-muted-foreground font-medium">
          Monitor platform health, verify providers, and manage operations with real-time dashboards and actionable insights.
        </p>
      </div>

      {/* Key Metrics */}
      <AdminCardSection title="Platform Metrics" subtitle="Real-time overview of marketplace health">
        <AdminStatsCard
          title="Active Users"
          value="2,847"
          subvalue="Last 30 days"
          icon={<Users className="h-5 w-5" />}
          trend={{ value: 12, label: "vs last month", positive: true }}
          variant="success"
        />
        <AdminStatsCard
          title="Pending Verifications"
          value="34"
          subvalue="Awaiting review"
          icon={<Clock className="h-5 w-5" />}
          trend={{ value: 8, label: "new today", positive: false }}
          variant="warning"
        />
        <AdminStatsCard
          title="Open Disputes"
          value="12"
          subvalue="Requires action"
          icon={<AlertCircle className="h-5 w-5" />}
          trend={{ value: 3, label: "unresolved", positive: false }}
          variant="danger"
        />
        <AdminStatsCard
          title="Completed Bookings"
          value="1,294"
          subvalue="This month"
          icon={<CheckCircle2 className="h-5 w-5" />}
          trend={{ value: 18, label: "vs last month", positive: true }}
          variant="success"
        />
      </AdminCardSection>

      {/* Financial Overview */}
      <AdminCardSection 
        title="Financial Overview" 
        subtitle="Payment and settlement tracking"
        columns={3}
      >
        <DashboardMetric
          label="Total Revenue"
          value="$48,920"
          change={24}
          changeLabel="vs last month"
          icon={<HandCoins className="h-5 w-5" />}
        />
        <DashboardMetric
          label="Pending Payouts"
          value="$8,450"
          change={-5}
          changeLabel="decrease"
          icon={<Wallet className="h-5 w-5" />}
        />
        <DashboardMetric
          label="Payment Success Rate"
          value="98.7%"
          unit="%"
          change={2}
          changeLabel="improvement"
          icon={<TrendingUp className="h-5 w-5" />}
        />
      </AdminCardSection>

      {/* Quick Actions Overview */}
      <section className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold tracking-tight">Quick Access</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Jump to key operational areas
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <Card className="surface-card-strong border-none hover:shadow-md transition-shadow duration-200">
            <CardContent className="p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
                    User operations
                  </p>
                  <p className="mt-2 text-lg font-bold tracking-tight">
                    Customer & Helper
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Manage accounts and verifications
                  </p>
                </div>
                <div className="shrink-0">
                  <div className="flex gap-1">
                    <StatsPill label="Users" value="2.8K" variant="default" />
                  </div>
                </div>
              </div>
              <div className="mt-4 flex gap-2">
                <Link href="/admin/users">
                  <Button size="sm" variant="outline" className="h-8">
                    Users
                  </Button>
                </Link>
                <Link href="/admin/helpers">
                  <Button size="sm" variant="outline" className="h-8">
                    Helpers
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          <Card className="surface-card-strong border-none hover:shadow-md transition-shadow duration-200">
            <CardContent className="p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
                    Financial operations
                  </p>
                  <p className="mt-2 text-lg font-bold tracking-tight">
                    Payments & Disputes
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Audit and resolve transactions
                  </p>
                </div>
                <div className="shrink-0">
                  <StatsPill label="Pending" value="12" variant="warning" />
                </div>
              </div>
              <div className="mt-4 flex gap-2">
                <Link href="/admin/payments">
                  <Button size="sm" variant="outline" className="h-8">
                    Payments
                  </Button>
                </Link>
                <Link href="/admin/disputes">
                  <Button size="sm" variant="outline" className="h-8">
                    Disputes
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          <Card className="surface-card-strong border-none hover:shadow-md transition-shadow duration-200">
            <CardContent className="p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
                    Performance operations
                  </p>
                  <p className="mt-2 text-lg font-bold tracking-tight">
                    Marketplace Analytics
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Track growth and quality KPIs
                  </p>
                </div>
                <div className="shrink-0">
                  <TrendingUp className="h-5 w-5 text-green-600" />
                </div>
              </div>
              <div className="mt-4">
                <Link href="/admin/analytics">
                  <Button size="sm" variant="outline" className="h-8">
                    View Analytics
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Core Operations Grid */}
      <div className="border-t border-border pt-8">
        <h3 className="mb-4 text-lg font-semibold tracking-tight">Core Operations</h3>
        <main className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {adminActions.map((action, index) => {
            const Icon = action.icon;
            const delayClass = ["delay-0", "delay-[50ms]", "delay-[100ms]", "delay-[150ms]", "delay-[200ms]", "delay-[250ms]"][index] ?? "delay-[300ms]";
            return (
              <Card
                key={action.href}
                className={`surface-card-strong border-none group transition-all hover:-translate-y-2 hover:shadow-2xl reveal-up ${delayClass}`}
              >
                <CardHeader className="p-7 pb-3">
                  <div className="size-16 rounded-3xl bg-primary/10 flex items-center justify-center text-primary mb-6 transition-transform group-hover:scale-110 group-hover:rotate-3 shadow-inner">
                    <Icon className="size-8" />
                  </div>
                  <CardTitle className="text-2xl font-heading font-bold group-hover:text-primary transition-colors">
                    {action.title}
                  </CardTitle>
                  <CardDescription className="text-sm font-medium leading-relaxed mt-2 line-clamp-2">
                    {action.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-7 pt-0">
                  <Link href={action.href}>
                    <Button className="w-full h-12 rounded-2xl font-black shadow-lg shadow-primary/10 group-hover:shadow-primary/20">
                      Manage {action.title}
                      <ArrowRight className="size-4 ml-2 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            );
          })}
        </main>
      </div>
    </div>
  );
}
