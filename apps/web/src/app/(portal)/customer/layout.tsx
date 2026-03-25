import { RoleSectionLayout } from "@/components/portal/role-section-layout";
import {
  LayoutDashboard,
  Plus,
  Calendar,
  CreditCard,
  Star,
} from "lucide-react";

const customerLinks = [
  { href: "/customer", label: "Overview", icon: <LayoutDashboard className="h-4 w-4" /> },
  { href: "/customer/book", label: "Book Helper", icon: <Plus className="h-4 w-4" /> },
  { href: "/customer/bookings", label: "My Bookings", icon: <Calendar className="h-4 w-4" /> },
  { href: "/customer/payments", label: "Payments", icon: <CreditCard className="h-4 w-4" /> },
  { href: "/customer/reviews", label: "Reviews", icon: <Star className="h-4 w-4" /> },
];

export default function CustomerLayout({ children }: { children: React.ReactNode }) {
  return (
    <RoleSectionLayout
      title="Customer Portal"
      description="Book helpers, manage payments, and track service quality."
      requiredRoles={["user", "customer", "admin"]}
      navLinks={customerLinks}
    >
      {children}
    </RoleSectionLayout>
  );
}
