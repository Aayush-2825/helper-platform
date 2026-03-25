import Link from "next/link";
import { ArrowRight, CalendarRange, Coins, RadioTower, ShieldCheck } from "lucide-react";
import { buttonVariants } from "@/components/ui/button-variants";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const helperActions = [
  {
    title: "Incoming Jobs",
    description: "Accept or reject nearby requests in real time.",
    href: "/helper/incoming-jobs",
    icon: RadioTower,
  },
  {
    title: "Job History",
    description: "Review completed and canceled assignments.",
    href: "/helper/job-history",
    icon: CalendarRange,
  },
  {
    title: "Earnings",
    description: "Track payouts and settlement summaries.",
    href: "/helper/earnings",
    icon: Coins,
  },
  {
    title: "Verification",
    description: "Submit and track KYC verification status.",
    href: "/helper/verification",
    icon: ShieldCheck,
  },
];

export default function HelperHomePage() {
  return (
    <main className="grid gap-4 sm:grid-cols-2">
      {helperActions.map((action) => (
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
