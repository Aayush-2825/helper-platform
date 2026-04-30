"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { RoleSectionLayout } from "@features/shared/components/portal/role-section-layout";
import {
  LayoutDashboard,
  Inbox,
  History,
  DollarSign,
  Clock,
  CheckCircle2,
  Activity,
} from "lucide-react";
import { useHelperLocation } from "@features/helper/hooks/useHelperLocation";
import { useHelperWebPush } from "@features/helper/hooks/useHelperWebPush";
import { useSession } from "@/lib/auth/session";

const helperLinks = [
  { href: "/helper", label: "Overview", icon: <LayoutDashboard className="h-4 w-4" /> },
  { href: "/helper/availability", label: "Availability", icon: <Clock className="h-4 w-4" /> },
  { href: "/helper/active", label: "Active Job", icon: <Activity className="h-4 w-4" /> },
  { href: "/helper/incoming-jobs", label: "Incoming Jobs", icon: <Inbox className="h-4 w-4" /> },
  { href: "/helper/job-history", label: "Active & History", icon: <History className="h-4 w-4" /> },
  { href: "/helper/earnings", label: "Earnings", icon: <DollarSign className="h-4 w-4" /> },
  { href: "/helper/verification", label: "Verification", icon: <CheckCircle2 className="h-4 w-4" /> },
];

export default function HelperLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { session } = useSession();
  const [inProgressBookingId, setInProgressBookingId] = useState<string | undefined>();
  const [isAccessCheckLoading, setIsAccessCheckLoading] = useState(true);

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
  useHelperWebPush(Boolean(session?.user.id));

  const isHelperAccessSetupRoute =
    pathname === "/helper/onboarding" ||
    pathname.startsWith("/helper/verification-pending") ||
    pathname === "/helper/verification" ||
    pathname.startsWith("/helper/video-kyc");

  useEffect(() => {
    let isCancelled = false;

    if (!session?.user?.id) {
      setIsAccessCheckLoading(false);
      return;
    }

    fetch("/api/helpers/onboarding", { credentials: "include" })
      .then(async (response) => {
        if (!response.ok) {
          throw new Error("Failed to load helper onboarding status");
        }

        const data = (await response.json()) as {
          canStartService?: boolean;
          landingPath?: string;
        };

        if (isCancelled) {
          return;
        }

        if (!data.canStartService && !isHelperAccessSetupRoute) {
          router.replace(data.landingPath || "/helper/verification");
          return;
        }

        setIsAccessCheckLoading(false);
      })
      .catch(() => {
        if (!isCancelled) {
          setIsAccessCheckLoading(false);
        }
      });

    return () => {
      isCancelled = true;
    };
  }, [isHelperAccessSetupRoute, router, session?.user?.id]);

  if (isAccessCheckLoading && !isHelperAccessSetupRoute) {
    return null;
  }

  if (isHelperAccessSetupRoute) {
    return <>{children}</>;
  }

  return (
    <RoleSectionLayout
      title="Helper Portal"
      description="Go online, accept jobs, complete tasks, and track payouts."
      requiredRoles={["helper", "admin"]}
      accessDeniedRedirect="/dashboard"
      navLinks={helperLinks}
    >
      {children}
    </RoleSectionLayout>
  );
}
