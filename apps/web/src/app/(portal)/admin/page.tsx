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
} from "lucide-react";
import { Button, } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

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
      <div className="reveal-up space-y-3 px-1">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">Admin control center</p>
        <h2 className="text-4xl font-heading font-black tracking-tight">
          Marketplace <span className="text-primary">Control</span>
        </h2>
        <p className="max-w-3xl text-muted-foreground font-medium">
          Manage global operations, verify providers, and handle service disputes with a single operational workspace.
        </p>
      </div>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <Card className="surface-card-strong border-none">
          <CardContent className="p-5">
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">User operations</p>
            <p className="mt-2 text-lg font-bold tracking-tight">Customer and helper management</p>
            <p className="mt-1 text-sm text-muted-foreground">Review accounts, verifications, and role-specific health from dedicated modules.</p>
          </CardContent>
        </Card>
        <Card className="surface-card-strong border-none">
          <CardContent className="p-5">
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">Financial operations</p>
            <p className="mt-2 text-lg font-bold tracking-tight">Payments, disputes, and payouts</p>
            <p className="mt-1 text-sm text-muted-foreground">Use finance and dispute queues for real-time reconciliation and resolution workflows.</p>
          </CardContent>
        </Card>
        <Card className="surface-card-strong border-none">
          <CardContent className="p-5">
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">Performance operations</p>
            <p className="mt-2 text-lg font-bold tracking-tight">Marketplace performance analytics</p>
            <p className="mt-1 text-sm text-muted-foreground">Track growth and service quality through live analytics dashboards.</p>
          </CardContent>
        </Card>
      </section>

      <div className="flex items-center justify-between px-1">
        <h3 className="text-2xl font-heading font-black tracking-tight">Core Operations</h3>
        <Button render={<Link href="/admin/analytics" />} variant="outline" className="rounded-xl font-semibold">
          View Analytics
        </Button>
      </div>

      <main className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {adminActions.map((action, index) => {
          const Icon = action.icon;
          return (
            <Card
              key={action.href}
              className="surface-card-strong border-none group transition-all hover:-translate-y-2 hover:shadow-2xl reveal-up"
              style={{ animationDelay: `${index * 50}ms` }}
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
                <Button
                  render={<Link href={action.href} />}
                  className="w-full h-12 rounded-2xl font-black shadow-lg shadow-primary/10 group-hover:shadow-primary/20"
                >
                  Manage {action.title}
                  <ArrowRight className="size-4 ml-2 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </main>
    </div>
  );
}
