"use client";

import Link from "next/link";
import { useSession } from "@/lib/auth/session";
import { normalizeRole } from "@/lib/auth/roles";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Clock,
  Briefcase,
  ShieldAlert,
  LayoutDashboard,
  ArrowRight,
} from "lucide-react";

const rolePortals = [
  {
    role: "customer" as const,
    name: "Customer Portal",
    description: "Book services, manage bookings, and track payments",
    href: "/customer",
    icon: Clock,
    color: "bg-blue-500",
    requiredRoles: ["user", "customer", "admin"],
  },
  {
    role: "helper" as const,
    name: "Helper Portal",
    description: "Accept jobs, manage availability, and track earnings",
    href: "/helper",
    icon: Briefcase,
    color: "bg-emerald-500",
    requiredRoles: ["helper", "admin"],
  },
  {
    role: "admin" as const,
    name: "Admin Console",
    description: "Monitor operations, verify helpers, and resolve disputes",
    href: "/admin",
    icon: ShieldAlert,
    color: "bg-purple-500",
    requiredRoles: ["admin"],
  },
];

export function RolePortals() {
  const { session, loading } = useSession();

  if (loading || !session) return null;

  const userRole = normalizeRole((session.user as { role?: string }).role);
  const availablePortals = rolePortals.filter((portal) =>
    portal.requiredRoles.includes(userRole)
  );

  if (availablePortals.length === 0) return null;

  return (
    <section className="grid gap-4">
      <div>
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <LayoutDashboard className="h-5 w-5 text-primary" />
          Available Portals
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          Access your role-specific workspace
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-3">
        {availablePortals.map((portal) => {
          const Icon = portal.icon;
          return (
            <Card
              key={portal.role}
              className="surface-card border-none hover:shadow-md transition-shadow"
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-base flex items-center gap-2">
                      <div className={`${portal.color} p-2 rounded-lg text-white`}>
                        <Icon className="h-4 w-4" />
                      </div>
                      {portal.name}
                    </CardTitle>
                  </div>
                  <Badge variant="secondary" className="capitalize">
                    {portal.role}
                  </Badge>
                </div>
                <CardDescription className="mt-2">
                  {portal.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full justify-between">
                  <Link href={portal.href} className="flex items-center justify-between w-full">
                    Access Portal
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </section>
  );
}

