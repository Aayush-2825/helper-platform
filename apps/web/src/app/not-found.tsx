"use client";

import Link from "next/link";
import { Search, Home, HelpCircle } from "lucide-react";
import { Button } from "@repo/ui/components/ui/button";

export default function NotFound() {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background p-6">
      <div className="absolute left-1/2 top-1/2 -z-10 size-125 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/10 blur-3xl" />

      <div className="reveal-up w-full max-w-lg space-y-6 text-center">
        <div className="surface-card-strong space-y-6 rounded-4xl border-none p-8 shadow-2xl shadow-primary/5 sm:p-10">
          <div className="mx-auto flex size-20 items-center justify-center rounded-3xl border border-border bg-background shadow-lg">
            <Search className="size-10 text-primary" />
          </div>

          <div className="space-y-3">
            <p className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Error 404</p>
            <h1 className="text-3xl font-heading font-bold tracking-tight sm:text-4xl">Page not found</h1>
            <p className="text-base leading-relaxed text-muted-foreground">
              The page you&apos;re looking for doesn&apos;t exist or may have moved. Let&apos;s get you back on track.
            </p>
          </div>

          <div className="flex flex-col justify-center gap-3 sm:flex-row">
            <Link href="/">
              <Button size="lg" className="w-full rounded-2xl font-semibold shadow-md transition-all hover:shadow-lg sm:w-auto">
                <Home className="mr-2 size-4" /> Go home
              </Button>
            </Link>
            <Link href="/help">
              <Button variant="outline" size="lg" className="w-full rounded-2xl font-semibold sm:w-auto">
                <HelpCircle className="mr-2 size-4" /> Get help
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
