import { RoleSectionLayout } from "@/components/portal/role-section-layout";
import {
  LayoutDashboard,
  Users,
  UserCheck,
  FileText,
  Briefcase,
  CreditCard,
  TriangleAlert,
  BarChart3,
} from "lucide-react";

const adminLinks = [
  { href: "/admin", label: "Overview", icon: <LayoutDashboard className="h-4 w-4" /> },
  { href: "/admin/users", label: "Users", icon: <Users className="h-4 w-4" /> },
  { href: "/admin/helpers", label: "Helpers", icon: <UserCheck className="h-4 w-4" /> },
  { href: "/admin/verifications", label: "Verifications", icon: <FileText className="h-4 w-4" /> },
  { href: "/admin/bookings", label: "Bookings", icon: <Briefcase className="h-4 w-4" /> },
  { href: "/admin/payments", label: "Payments", icon: <CreditCard className="h-4 w-4" /> },
  { href: "/admin/disputes", label: "Disputes", icon: <TriangleAlert className="h-4 w-4" /> },
  { href: "/admin/analytics", label: "Analytics", icon: <BarChart3 className="h-4 w-4" /> },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <RoleSectionLayout
      title="Admin Console"
      description="Verify helpers, monitor operations, and resolve disputes."
      requiredRoles={["admin"]}
      navLinks={adminLinks}
    >
      {children}
    </RoleSectionLayout>
  );
}
