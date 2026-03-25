import { RoleSectionLayout } from "@/components/portal/role-section-layout";
import {
  LayoutDashboard,
  Inbox,
  History,
  DollarSign,
  Clock,
  CheckCircle2,
} from "lucide-react";

const helperLinks = [
  { href: "/helper", label: "Overview", icon: <LayoutDashboard className="h-4 w-4" /> },
  { href: "/helper/incoming-jobs", label: "Incoming Jobs", icon: <Inbox className="h-4 w-4" /> },
  { href: "/helper/job-history", label: "Job History", icon: <History className="h-4 w-4" /> },
  { href: "/helper/earnings", label: "Earnings", icon: <DollarSign className="h-4 w-4" /> },
  { href: "/helper/availability", label: "Availability", icon: <Clock className="h-4 w-4" /> },
  { href: "/helper/verification", label: "Verification", icon: <CheckCircle2 className="h-4 w-4" /> },
];

export default function HelperLayout({ children }: { children: React.ReactNode }) {
  return (
    <RoleSectionLayout
      title="Helper Portal"
      description="Accept jobs, update availability, and manage earnings."
      requiredRoles={["helper", "admin"]}
      navLinks={helperLinks}
    >
      {children}
    </RoleSectionLayout>
  );
}
