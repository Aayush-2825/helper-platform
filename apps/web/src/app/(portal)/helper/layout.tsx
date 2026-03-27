"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { RoleSectionLayout } from "@/components/portal/role-section-layout";
import {
  LayoutDashboard,
  Inbox,
  History,
  DollarSign,
  Clock,
  CheckCircle2,
} from "lucide-react";
import { useHelperLocation } from "@/hooks/useHelperLocation";
import { useSession } from "@/lib/auth/session";

const helperLinks = [
  { href: "/helper", label: "Overview", icon: <LayoutDashboard className="h-4 w-4" /> },
  { href: "/helper/incoming-jobs", label: "Incoming Jobs", icon: <Inbox className="h-4 w-4" /> },
  { href: "/helper/job-history", label: "Job History", icon: <History className="h-4 w-4" /> },
  { href: "/helper/earnings", label: "Earnings", icon: <DollarSign className="h-4 w-4" /> },
  { href: "/helper/availability", label: "Availability", icon: <Clock className="h-4 w-4" /> },
  { href: "/helper/verification", label: "Verification", icon: <CheckCircle2 className="h-4 w-4" /> },
];

export default function HelperLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { session } = useSession();
  const [inProgressBookingId, setInProgressBookingId] = useState<string | undefined>();

  useEffect(() => {
    fetch("/api/bookings", { credentials: "include" })
      .then((r) => r.json())
      .then((data: { bookings?: Array<{ id: string; status: string }> }) => {
        const active = data.bookings?.find((b) => b.status === "in_progress");
        setInProgressBookingId(active?.id);
      })
      .catch(() => {});
  }, []);

  useHelperLocation(session?.user.id, inProgressBookingId, !!inProgressBookingId);

  const isHelperAccessSetupRoute =
    pathname === "/helper/onboarding" || pathname.startsWith("/helper/verification-pending");

  if (isHelperAccessSetupRoute) {
    return <>{children}</>;
  }

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
