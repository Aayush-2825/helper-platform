"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Menu, LogOut, Settings, LayoutDashboard } from "lucide-react";
import { authClient } from "@/lib/auth/client";
import { useSession } from "@/lib/auth/session";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface NavbarProps {
  title: string;
  onMenuClick?: () => void;
}

export function Navbar({ title, onMenuClick }: NavbarProps) {
  const router = useRouter();
  const { session, loading } = useSession();

  if (loading || !session) return null;

  const user = session.user as { name?: string; email?: string; image?: string };
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
    <nav className="surface-card sticky top-0 z-40 border-b">
      <div className="flex items-center justify-between gap-4 px-4 py-3 sm:px-6">
        {/* Left Section - Mobile Menu & Title */}
        <div className="flex items-center gap-3">
          <Sheet>
            <SheetTrigger
              render={<Button variant="ghost" size="icon" className="lg:hidden" />}
              aria-label="Toggle menu"
            >
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle menu</span>
            </SheetTrigger>
            <SheetContent side="left" className="w-64">
              <SheetHeader>
                <SheetTitle>{title}</SheetTitle>
              </SheetHeader>
              {/* Mobile nav content goes here */}
              <div className="mt-8">
                <p className="text-sm text-muted-foreground">Navigation items will be populated by layouts</p>
              </div>
            </SheetContent>
          </Sheet>

          <div className="hidden sm:block">
            <Link href="/dashboard" className="text-lg font-semibold hover:opacity-80 transition-opacity">
              {title}
            </Link>
          </div>
        </div>

        {/* Right Section - User Menu */}
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger
              render={<Button variant="ghost" className="relative h-10 w-10 rounded-full" />}
              aria-label="Open user menu"
            >
              <Avatar className="h-10 w-10">
                <AvatarImage src={user?.image} alt={user?.name} />
                <AvatarFallback className="bg-primary text-primary-foreground">
                  {initials}
                </AvatarFallback>
              </Avatar>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <div className="flex flex-col gap-2 p-2">
                <p className="text-sm font-medium">{user?.name}</p>
                <p className="text-xs text-muted-foreground">{user?.email}</p>
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

