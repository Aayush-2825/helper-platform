import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  BarChart3,
  BookUser,
  BriefcaseBusiness,
  HandCoins,
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
    title: "Analytics",
    description: "Track marketplace growth and service quality KPIs.",
    href: "/admin/analytics",
    icon: BarChart3,
  },
];

export default function AdminHomePage() {
  return (
    <div className="space-y-12">
      <div className="reveal-up space-y-2 px-1">
        <h2 className="text-4xl font-heading font-black tracking-tight">
          Marketplace <span className="text-primary">Control</span>
        </h2>
        <p className="text-muted-foreground font-medium">
          Manage global operations, verify providers, and handle service
          disputes.
        </p>
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
              <CardHeader className="p-8 pb-4">
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
              <CardContent className="p-8 pt-0">
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

      

      {/* Decorative footer for admin */}
      <div className="reveal-up delay-3 pt-12 border-t border-border/40 text-center opacity-40 selection:bg-teal-500">
        <p className="text-[10px] font-black uppercase tracking-[0.2em]">
          Administrative Security Protocol v2.4.0 (Teal Branch)
        </p>
      </div>
    </div>
  );
}
