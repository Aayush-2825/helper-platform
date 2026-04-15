"use client";

import { useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ChevronRight, LogOut } from "lucide-react";
import { authClient } from "@/lib/auth/client";
import { useSession } from "@/lib/auth/session";
import { normalizeRole, type AppRole } from "@/lib/auth/roles";
import { cn } from "@/lib/utils";
import { Navbar } from "@/components/navbar";
import { BottomNav } from "@/components/BottomNav";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Breadcrumb,
  BreadcrumbItem,
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
  accessDeniedRedirect: string;
  navLinks: NavLink[];
  children: React.ReactNode;
}

export function DashboardLayout({
  title,
  description,
  requiredRoles,
  accessDeniedRedirect,
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
      router.replace(accessDeniedRedirect);
    }
  }, [accessDeniedRedirect, loading, requiredRoles, router, session]);

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
  const [titleLead, ...titleTail] = title.split(" ");
  const titleAccent = titleTail.join(" ");

  return (
    <div className="flex min-h-dvh flex-col bg-background selection:bg-primary selection:text-white">
      {/* Navbar */}
      <Navbar title={title} />

      <div className="relative flex flex-1 overflow-hidden">
        {/* Sidebar - Hidden on mobile, visible on lg */}
        <aside className="relative hidden w-76 border-r border-border/40 bg-card/20 backdrop-blur-3xl lg:block">
          {/* Decorative background glow for sidebar */}
          <div className="absolute top-0 -left-20 w-40 h-40 bg-primary/10 blur-[80px] rounded-full pointer-events-none" />
          
          <ScrollArea className="h-full relative z-10">
            <div className="space-y-10 p-7">
              <div className="space-y-3 reveal-up">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Portal</p>
                <h1 className="text-2xl font-heading font-black tracking-tight text-foreground leading-tight">
                  {titleLead}
                  {titleAccent ? <span className="block text-primary">{titleAccent}</span> : null}
                </h1>
                <p className="text-sm leading-relaxed text-muted-foreground">{description}</p>
              </div>

              <nav className="flex flex-col gap-1.5 reveal-up delay-1">
                {navLinks.map((link) => {
                  const isActive = pathname === link.href;
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      className={cn(
                        "group relative flex items-center gap-3 rounded-xl border px-4 py-3 text-sm font-semibold transition-all duration-300",
                        isActive
                          ? "border-primary/30 bg-primary/10 text-primary shadow-sm"
                          : "border-transparent text-muted-foreground hover:border-border/70 hover:bg-accent/30 hover:text-foreground"
                      )}
                    >
                      {link.icon && (
                        <span className={cn(
                          "size-5 shrink-0 transition-transform duration-300 group-hover:scale-105",
                          isActive ? "text-primary" : "text-primary/60 group-hover:text-primary"
                        )}>
                          {link.icon}
                        </span>
                      )}
                      <span className="flex-1 truncate tracking-tight">{link.label}</span>
                      {isActive && (
                         <div className="absolute right-3 size-2 rounded-full bg-primary" />
                      )}
                    </Link>
                  );
                })}
              </nav>

              <div className="flex flex-col gap-3 border-t border-border/40 pt-8 reveal-up delay-2">
                <Link
                  href="/dashboard"
                  className={buttonVariants({
                    variant: "ghost",
                    size: "default",
                    className: "w-full justify-start rounded-xl font-semibold text-muted-foreground hover:text-primary hover:bg-primary/5",
                  })}
                >
                  <ChevronRight className="mr-2 h-4 w-4 rotate-180" />
                  Portal Overview
                </Link>
                <Button
                  variant="ghost"
                  size="default"
                  className="w-full justify-start rounded-xl font-semibold text-destructive/70 transition-colors hover:bg-destructive/10 hover:text-destructive"
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
                  <LogOut className="mr-2 h-4 w-4 rotate-180" />
                  Sign out
                </Button>
              </div>
            </div>
          </ScrollArea>
        </aside>

        {/* Main Content */}
        <main className="relative flex-1 overflow-hidden">
          {/* Dynamic Background Glow based on Title */}
          <div className={cn(
            "absolute -top-40 -right-40 w-150 h-150 blur-[140px] rounded-full opacity-20 pointer-events-none -z-10 animate-pulse",
            title.toLowerCase().includes("admin") ? "bg-teal-500" : 
            title.toLowerCase().includes("helper") ? "bg-orange-500" : "bg-primary"
          )} />

          <ScrollArea className="h-full">
            <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 p-6 pb-32 pt-8 sm:p-8 sm:pb-32 lg:p-10 lg:pb-16">
              {/* Breadcrumb - Hidden on very small screens */}
              <Breadcrumb className="hidden rounded-lg border border-border/50 bg-background/70 px-3 py-2 backdrop-blur md:flex">
                <BreadcrumbList>
                  <BreadcrumbItem>
                    <Link href="/dashboard" className="hover:text-primary transition-colors"> Dashboard </Link>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator />
                  <BreadcrumbItem>
                    <BreadcrumbPage className="font-semibold">{title}</BreadcrumbPage>
                  </BreadcrumbItem>
                  {currentNavLink && (
                    <>
                      <BreadcrumbSeparator />
                      <BreadcrumbItem>
                        <BreadcrumbPage className="text-primary font-bold">{currentNavLink.label}</BreadcrumbPage>
                      </BreadcrumbItem>
                    </>
                  )}
                </BreadcrumbList>
              </Breadcrumb>

              {/* Mobile Header */}
              <div className="flex flex-col gap-2 lg:hidden">
                <h1 className="text-3xl font-heading font-bold tracking-tight">{currentNavLink?.label ?? title}</h1>
                <p className="text-sm text-muted-foreground">{description}</p>
              </div>

              {/* Page Content */}
              <div className="flex-1 reveal-up">{children}</div>
            </div>
          </ScrollArea>
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <BottomNav />
    </div>
  );
}

