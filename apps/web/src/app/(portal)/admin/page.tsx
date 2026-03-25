import Link from "next/link";
import { ArrowRight, BadgeCheck, BarChart3, BookUser, BriefcaseBusiness, HandCoins, Scale } from "lucide-react";
import { buttonVariants } from "@/components/ui/button-variants";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

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
    <main className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {adminActions.map((action) => (
        <Card key={action.href} className="surface-card border-none">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <action.icon className="text-primary" />
              {action.title}
            </CardTitle>
            <CardDescription>{action.description}</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href={action.href} className={buttonVariants({ size: "sm" })}>
              Open
              <ArrowRight data-icon="inline-end" />
            </Link>
          </CardContent>
        </Card>
      ))}
    </main>
  );
}
