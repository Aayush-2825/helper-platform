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
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-[90%] max-w-md lg:hidden">
      <nav className="surface-card flex items-center justify-between px-6 py-3 border border-white/20 shadow-2xl">
        {navItems.map((item) => {
          const isActive = isRouteActive(pathname, item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center gap-1 transition-all duration-300",
                isActive ? "text-primary scale-110" : "text-muted-foreground hover:text-foreground"
              )}
            >
              <item.icon className={cn("size-5", isActive && "stroke-[2.5px]")} />
              <span className="text-[10px] font-semibold">{item.label}</span>
              {isActive && (
                <span className="absolute -bottom-1.5 size-1 rounded-full bg-primary animate-in fade-in zoom-in duration-300" />
              )}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
