"use client";

import type { AppRole } from "@/lib/auth/roles";
import { DashboardLayout, NavLink } from "../dashboard-layout";

interface RoleSectionLayoutProps {
  title: string;
  description: string;
  requiredRoles: AppRole[];
  accessDeniedRedirect: string;
  navLinks: NavLink[];
  children: React.ReactNode;
}

export function RoleSectionLayout({
  title,
  description,
  requiredRoles,
  accessDeniedRedirect,
  navLinks,
  children,
}: RoleSectionLayoutProps) {
  return (
    <DashboardLayout
      title={title}
      description={description}
      requiredRoles={requiredRoles}
      accessDeniedRedirect={accessDeniedRedirect}
      navLinks={navLinks}
    >
      {children}
    </DashboardLayout>
  );
}

