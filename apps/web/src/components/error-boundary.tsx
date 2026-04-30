"use client";

import { useEffect } from "react";
import Link from "next/link";
import { RefreshCcw, Home, AlertCircle } from "lucide-react";
import { Button } from "@repo/ui/components/ui/button";

interface ErrorBoundaryProps {
  error: Error & { digest?: string };
  reset: () => void;
  title?: string;
  description?: string;
  showDetails?: boolean;
}

export function ErrorBoundary({
  error,
  reset,
  title = "Something went wrong",
  description = "We encountered an unexpected error. Our team has been notified and we're working to fix it. Please try again in a moment.",
  showDetails = process.env.NODE_ENV === "development",
}: ErrorBoundaryProps) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden bg-background">
      {/* Ambient background glows */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 -z-10">
        <div className="size-125 bg-destructive/10 blur-3xl rounded-full" />
      </div>

      <div className="max-w-md w-full text-center space-y-8 reveal-up">
        <div className="relative inline-block">
          <div className="size-24 rounded-2xl bg-destructive/10 border border-destructive/20 shadow-lg flex items-center justify-center text-destructive">
            <AlertCircle className="size-12" />
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-3xl font-heading font-bold tracking-tight">{title}</h2>
          <p className="text-muted-foreground text-base leading-relaxed">{description}</p>
        </div>

        {showDetails && (
          <div className="p-4 bg-muted/50 rounded-lg border border-border/50 text-left overflow-auto max-h-40">
            <p className="text-xs text-muted-foreground font-mono mb-2">Error details (dev only):</p>
            <code className="text-xs text-destructive font-mono whitespace-pre-wrap wrap-break-word">
              {error.message}
            </code>
          </div>
        )}

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Button
            onClick={() => reset()}
            size="lg"
            className="rounded-lg w-full sm:w-auto font-semibold shadow-md hover:shadow-lg transition-all"
          >
            <RefreshCcw className="size-4 mr-2" /> Try again
          </Button>
          <Link href="/">
            <Button
              variant="outline"
              size="lg"
              className="rounded-lg w-full sm:w-auto font-semibold"
            >
              <Home className="size-4 mr-2" /> Go home
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
