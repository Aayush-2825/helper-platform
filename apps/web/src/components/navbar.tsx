"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { LogOut, Settings, LayoutDashboard, PanelTop } from "lucide-react";
import { authClient } from "@/lib/auth/client";
import { useSession } from "@/lib/auth/session";
import { normalizeRole } from "@/lib/auth/roles";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface NavbarProps {
  title: string;
}

export function Navbar({ title }: NavbarProps) {
  const router = useRouter();
  const { session, loading } = useSession();

  if (loading || !session) return null;

  const user = session.user as { name?: string; email?: string; image?: string };
  const role = normalizeRole((session.user as { role?: string }).role);
  const initials = user?.name
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase() || user?.email?.[0]?.toUpperCase() || "U";

  const handleSignOut = async () => {
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          router.replace("/auth/signin");
        },
      },
    });
  };

  return (
    <nav className="sticky top-0 z-40 border-b border-border/40 bg-background/70 backdrop-blur-xl">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-3 px-5 py-3 sm:px-6">
        <div className="flex min-w-0 items-center gap-3">
          <div className="hidden size-9 shrink-0 items-center justify-center rounded-lg border border-border/60 bg-card text-primary sm:flex">
            <PanelTop className="size-4" />
          </div>
          <Link
            href="/dashboard"
            className="block min-w-0 max-w-[min(56vw,20rem)] text-lg font-heading font-bold leading-tight transition-opacity hover:opacity-80"
          >
            <span className="block truncate">{title}</span>
          </Link>
          <Badge variant="secondary" className="hidden capitalize sm:inline-flex">{role}</Badge>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="hidden rounded-lg md:inline-flex" render={<Link href="/dashboard" />}>
            <LayoutDashboard className="mr-1.5 size-4" /> Overview
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger
              render={<Button type="button" variant="ghost" className="relative h-11 w-11 rounded-full" />}
              aria-label="Open user menu"
            >
              <Avatar className="h-11 w-11">
                <AvatarImage src={user?.image} alt={user?.name ?? "User avatar"} />
                <AvatarFallback className="bg-primary text-primary-foreground">
                  {initials}
                </AvatarFallback>
              </Avatar>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 max-w-[calc(100vw-1rem)]">
              <div className="flex flex-col gap-2 p-2">
                <p className="text-sm font-medium">{user?.name}</p>
                <p className="text-xs text-muted-foreground">{user?.email}</p>
                <Badge variant="outline" className="w-fit capitalize">{role}</Badge>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <Link href="/dashboard" className="flex items-center gap-2 w-full">
                  <LayoutDashboard className="h-4 w-4" />
                  Dashboard
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Link href="/account/settings" className="flex items-center gap-2 w-full">
                  <Settings className="h-4 w-4" />
                  Settings
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleSignOut} className="flex items-center gap-2 text-destructive">
                <LogOut className="h-4 w-4" />
                Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </nav>
  );
}

