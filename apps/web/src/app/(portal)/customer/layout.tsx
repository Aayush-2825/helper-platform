import { RoleSectionLayout } from "@/components/portal/role-section-layout";
import {
  LayoutDashboard,
  Plus,
  Calendar,
  CreditCard,
  Star,
  Activity,
} from "lucide-react";

const customerLinks = [
  { href: "/customer", label: "Overview", icon: <LayoutDashboard className="h-4 w-4" /> },
  { href: "/customer/book", label: "Start Booking", icon: <Plus className="h-4 w-4" /> },
  { href: "/customer/active", label: "Active Booking", icon: <Activity className="h-4 w-4" /> },
  { href: "/customer/bookings", label: "Track Bookings", icon: <Calendar className="h-4 w-4" /> },
  { href: "/customer/payments", label: "Payments", icon: <CreditCard className="h-4 w-4" /> },
  { href: "/customer/reviews", label: "Reviews", icon: <Star className="h-4 w-4" /> },
];

export default function CustomerLayout({ children }: { children: React.ReactNode }) {
  return (
    <RoleSectionLayout
      title="Customer Portal"
      description="Discover, book, track, and review helpers in one flow."
      requiredRoles={["user", "customer", "admin"]}
      accessDeniedRedirect="/customer"
      navLinks={customerLinks}
    >
      {children}
    </RoleSectionLayout>
  );
}
