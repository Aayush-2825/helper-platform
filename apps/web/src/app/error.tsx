"use client";

import { useEffect } from "react";
import Link from "next/link";
import { RefreshCcw, Home, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden bg-background">
      {/* Ambient background glows */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 -z-10">
         <div className="size-[500px] bg-destructive/10 blur-[120px] rounded-full" />
      </div>

      <div className="max-w-md w-full text-center space-y-10 reveal-up">
        <div className="relative inline-block">
          <div className="size-24 rounded-3xl bg-destructive/10 border border-destructive/20 shadow-2xl flex items-center justify-center text-destructive animate-shake">
             <ShieldAlert className="size-12" />
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-4xl font-heading font-black tracking-tight">Protocol Error</h2>
          <p className="text-muted-foreground font-medium text-balance">
            Systems encountered an unexpected interruption. We&apos;ve logged the incident and our maintenance crew is on it.
          </p>
        </div>

        {process.env.NODE_ENV === "development" && (
           <div className="p-4 bg-muted/50 rounded-2xl border border-border/50 text-left overflow-auto max-h-40">
              <code className="text-xs text-destructive font-mono whitespace-pre">{error.message}</code>
           </div>
        )}

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
           <Button onClick={() => reset()} size="lg" className="rounded-full w-full sm:w-auto font-black shadow-xl shadow-primary/20 bg-primary text-white">
              <RefreshCcw className="size-4 mr-2" /> Resume Protocol
           </Button>
           <Button 
             render={<Link href="/" />}
             variant="outline" 
             size="lg" 
             className="rounded-full w-full sm:w-auto font-black border-2 font-black"
           >
              <Home className="size-4 mr-2" /> Abandon Ship
           </Button>
        </div>
      </div>
    </div>
  );
}
