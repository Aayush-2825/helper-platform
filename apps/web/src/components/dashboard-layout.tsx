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

  return (
    <div className="flex h-screen flex-col bg-background selection:bg-primary selection:text-white">
      {/* Navbar */}
      <Navbar title={title} />

      <div className="flex flex-1 overflow-hidden relative">
        {/* Sidebar - Hidden on mobile, visible on lg */}
        <aside className="hidden w-80 border-r border-border/40 bg-card/20 backdrop-blur-3xl lg:block relative overflow-hidden">
          {/* Decorative background glow for sidebar */}
          <div className="absolute top-0 -left-20 w-40 h-40 bg-primary/10 blur-[80px] rounded-full pointer-events-none" />
          
          <ScrollArea className="h-full relative z-10">
            <div className="p-8 space-y-12">
              <div className="space-y-2 reveal-up">
                <h1 className="text-3xl font-heading font-black tracking-tight text-foreground leading-[0.9]">
                  {title.split(" ")[0]} <br />
                  <span className="text-primary">{title.split(" ").slice(1).join(" ")}</span>
                </h1>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground opacity-60">{description}</p>
              </div>

              <nav className="flex flex-col gap-1.5 reveal-up delay-1">
                {navLinks.map((link) => {
                  const isActive = pathname === link.href;
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      className={cn(
                        "group relative flex items-center gap-4 rounded-2xl px-5 py-3.5 text-sm font-bold transition-all duration-500",
                        isActive
                          ? "bg-primary text-primary-foreground shadow-2xl shadow-primary/30 scale-105 z-10"
                          : "text-muted-foreground hover:bg-accent/50 hover:text-foreground hover:translate-x-1"
                      )}
                    >
                      {link.icon && (
                        <span className={cn(
                          "size-5 flex-shrink-0 transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3",
                          isActive ? "text-white" : "text-primary/60 group-hover:text-primary"
                        )}>
                          {link.icon}
                        </span>
                      )}
                      <span className="flex-1 truncate tracking-tight">{link.label}</span>
                      {isActive && (
                         <div className="absolute right-4 size-1.5 rounded-full bg-white animate-pulse" />
                      )}
                    </Link>
                  );
                })}
              </nav>

              <div className="pt-12 border-t border-border/40 flex flex-col gap-3 reveal-up delay-2">
                <Link
                  href="/dashboard"
                  className={buttonVariants({
                    variant: "ghost",
                    size: "default",
                    className: "w-full justify-start rounded-2xl font-bold text-muted-foreground hover:text-primary hover:bg-primary/5",
                  })}
                >
                  <ChevronRight className="mr-2 h-4 w-4 rotate-180" />
                  Portal Overview
                </Link>
                <Button
                  variant="ghost"
                  size="default"
                  className="w-full justify-start rounded-2xl font-bold text-destructive/70 hover:bg-destructive/10 hover:text-destructive transition-colors"
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
        <main className="flex-1 overflow-hidden relative">
          {/* Dynamic Background Glow based on Title */}
          <div className={cn(
            "absolute -top-40 -right-40 w-[600px] h-[600px] blur-[140px] rounded-full opacity-20 pointer-events-none -z-10 animate-pulse",
            title.toLowerCase().includes("admin") ? "bg-teal-500" : 
            title.toLowerCase().includes("helper") ? "bg-orange-500" : "bg-primary"
          )} />

          <ScrollArea className="h-full">
            <div className="flex flex-col gap-10 p-6 pt-8 sm:p-10 lg:p-14 pb-32 lg:pb-16">
              {/* Breadcrumb - Hidden on very small screens */}
              <Breadcrumb className="hidden md:flex">
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
                <h1 className="text-3xl font-heading font-bold tracking-tight">{title}</h1>
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

