"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Calendar, User, Search, Inbox, Wallet } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSession } from "@/lib/auth/session";
import { normalizeRole } from "@/lib/auth/roles";

const customerNavItems = [
  { label: "Home", href: "/customer", icon: Home },
  { label: "Book", href: "/customer/book", icon: Search },
  { label: "Bookings", href: "/customer/bookings", icon: Calendar },
  { label: "Profile", href: "/account/settings", icon: User },
];

const helperNavItems = [
  { label: "Home", href: "/helper", icon: Home },
  { label: "Jobs", href: "/helper/incoming-jobs", icon: Inbox },
  { label: "History", href: "/helper/job-history", icon: Calendar },
  { label: "Wallet", href: "/helper/earnings", icon: Wallet },
  { label: "Profile", href: "/account/settings", icon: User },
];

function isRouteActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function BottomNav() {
  const pathname = usePathname();
  const { session } = useSession();

  if (pathname.startsWith("/admin") || pathname.startsWith("/auth")) {
    return null;
  }

  const role = normalizeRole((session?.user as { role?: string } | undefined)?.role);
  const isHelperContext = role === "helper" || pathname.startsWith("/helper");
  const navItems = isHelperContext ? helperNavItems : customerNavItems;

  return (
    <div className="fixed bottom-3 left-1/2 z-50 w-[94%] max-w-md -translate-x-1/2 lg:hidden animate-in fade-in slide-in-from-bottom-5 duration-500 ease-out">
      <nav
        aria-label="Portal navigation"
        className="flex h-16 items-center justify-around rounded-2xl border border-border/80 bg-background/85 px-2 py-1 shadow-2xl shadow-primary/10 backdrop-blur-xl transition-all"
      >
        {navItems.map((item) => {
          const isActive = isRouteActive(pathname, item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isActive ? "page" : undefined}
              className={cn(
                "relative flex h-full flex-1 flex-col items-center justify-center gap-1 rounded-xl px-1 py-1 text-center select-none active:scale-95 transition-all duration-300",
                isActive
                  ? "text-primary font-bold"
                  : "text-muted-foreground hover:text-foreground font-medium"
              )}
            >
              {/* Active indicator: small filled pill above the active tab icon */}
              {isActive && (
                <span className="absolute top-1.5 h-1 w-5 rounded-full bg-primary shadow-[0_0_8px_rgba(30,27,75,0.4)] dark:shadow-[0_0_8px_rgba(129,140,248,0.5)] animate-in fade-in zoom-in-75 duration-300" />
              )}
              <div
                className={cn(
                  "relative mt-1 flex items-center justify-center transition-all duration-300",
                  isActive && "drop-shadow-[0_2px_8px_rgba(249,115,22,0.35)]"
                )}
              >
                <item.icon
                  className={cn(
                    "size-5 transition-transform duration-300",
                    isActive ? "stroke-[2.5px] scale-105" : "stroke-[1.75px]"
                  )}
                />
              </div>
              <span className="text-[11px] leading-none tracking-tight">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
