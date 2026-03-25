import Link from "next/link";
import { ArrowRight, CalendarClock, CreditCard, MessageSquareText, PlusCircle } from "lucide-react";
import { buttonVariants } from "@/components/ui/button-variants";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const customerActions = [
  {
    title: "Create Booking",
    description: "Start a new helper request with location and task details.",
    href: "/customer/book",
    icon: PlusCircle,
  },
  {
    title: "My Bookings",
    description: "Track live requests and completed services.",
    href: "/customer/bookings",
    icon: CalendarClock,
  },
  {
    title: "Payments",
    description: "See transaction status, receipts, and payment methods.",
    href: "/customer/payments",
    icon: CreditCard,
  },
  {
    title: "Reviews",
    description: "Rate completed jobs and view feedback history.",
    href: "/customer/reviews",
    icon: MessageSquareText,
  },
];

export default function CustomerHomePage() {
  return (
    <main className="grid gap-4 sm:grid-cols-2">
      {customerActions.map((action) => (
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
