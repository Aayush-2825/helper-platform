"use client";

import { useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { authClient } from "@/lib/auth/client";
import { useSession } from "@/lib/auth/session";
import { normalizeRole, type AppRole } from "@/lib/auth/roles";
import { cn } from "@/lib/utils";
import { Navbar } from "@/components/navbar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

export interface NavLink {
  href: string;
  label: string;
  icon?: React.ReactNode;
}

interface DashboardLayoutProps {
  title: string;
  description: string;
  requiredRoles: AppRole[];
  navLinks: NavLink[];
  children: React.ReactNode;
}

export function DashboardLayout({
  title,
  description,
  requiredRoles,
  navLinks,
  children,
}: DashboardLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { session, loading } = useSession();

  useEffect(() => {
    if (loading) {
      return;
    }

    if (!session) {
      router.replace("/auth/signin");
      return;
    }

    const role = normalizeRole((session.user as { role?: string }).role);
    if (!requiredRoles.includes(role)) {
      router.replace("/dashboard");
    }
  }, [loading, requiredRoles, router, session]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <p className="text-sm text-muted-foreground">Checking access...</p>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  const role = normalizeRole((session.user as { role?: string }).role);
  if (!requiredRoles.includes(role)) {
    return null;
  }

  const currentNavLink = navLinks.find((link) => pathname === link.href);

  return (
    <div className="flex h-screen flex-col bg-background">
      {/* Navbar */}
      <Navbar title={title} />

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar - Hidden on mobile, visible on lg */}
        <aside className="hidden w-64 border-r bg-muted/30 lg:block">
          <ScrollArea className="h-full">
            <div className="p-6">
              <div className="mb-8">
                <p className="text-sm font-semibold text-foreground">{title}</p>
                <p className="text-xs text-muted-foreground">{description}</p>
              </div>

              <nav className="flex flex-col gap-1">
                {navLinks.map((link) => {
                  const isActive = pathname === link.href;
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      className={cn(
                        "group relative flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                        isActive
                          ? "bg-primary text-primary-foreground"
                          : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                      )}
                    >
                      {link.icon && (
                        <span className="h-4 w-4 flex-shrink-0">
                          {link.icon}
                        </span>
                      )}
                      <span className="flex-1 truncate">{link.label}</span>
                      {isActive && (
                        <ChevronRight className="h-4 w-4 opacity-0 transition-opacity group-hover:opacity-100" />
                      )}
                    </Link>
                  );
                })}
              </nav>

              <div className="mt-8 border-t pt-6 flex flex-col gap-2">
                <Link
                  href="/dashboard"
                  className={buttonVariants({
                    variant: "outline",
                    size: "sm",
                    className: "w-full justify-start",
                  })}
                >
                  Back to Dashboard
                </Link>
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start text-destructive hover:bg-destructive/10 hover:text-destructive"
                  onClick={async () => {
                    await authClient.signOut({
                      fetchOptions: {
                        onSuccess: () => {
                          router.replace("/auth/signin");
                        },
                      },
                    });
                  }}
                >
                  Sign out
                </Button>
              </div>
            </div>
          </ScrollArea>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-hidden">
          <ScrollArea className="h-full">
            <div className="flex flex-col gap-6 p-4 sm:p-6 lg:p-8">
              {/* Breadcrumb */}
              <Breadcrumb className="hidden sm:flex">
                <BreadcrumbList>
                  <BreadcrumbItem>
                    <BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator />
                  <BreadcrumbItem>
                    <BreadcrumbPage>{title}</BreadcrumbPage>
                  </BreadcrumbItem>
                  {currentNavLink && (
                    <>
                      <BreadcrumbSeparator />
                      <BreadcrumbItem>
                        <BreadcrumbPage>{currentNavLink.label}</BreadcrumbPage>
                      </BreadcrumbItem>
                    </>
                  )}
                </BreadcrumbList>
              </Breadcrumb>

              {/* Header */}
              <div className="flex flex-col gap-1 lg:hidden">
                <h1 className="text-2xl font-bold">{title}</h1>
                <p className="text-sm text-muted-foreground">{description}</p>
              </div>

              {/* Mobile Navigation - Horizontal Scroll */}
              <div className="lg:hidden">
                <ScrollArea className="w-full">
                  <div className="flex gap-2 pb-2">
                    {navLinks.map((link) => {
                      const isActive = pathname === link.href;
                      return (
                        <Link
                          key={link.href}
                          href={link.href}
                          className={cn(
                            buttonVariants({
                              size: "sm",
                              variant: isActive ? "default" : "outline",
                            }),
                            "flex-shrink-0"
                          )}
                        >
                          {link.icon && <span className="mr-1">{link.icon}</span>}
                          <span className="whitespace-nowrap">{link.label}</span>
                        </Link>
                      );
                    })}
                  </div>
                </ScrollArea>
              </div>

              {/* Page Content */}
              <div className="flex-1">{children}</div>
            </div>
          </ScrollArea>
        </main>
      </div>
    </div>
  );
}

