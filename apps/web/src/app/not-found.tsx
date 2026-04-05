"use client";

import Link from "next/link";
import { Search, MapPin, Home } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden bg-background">
      {/* Ambient background glows */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 -z-10">
         <div className="size-[500px] bg-primary/20 blur-[120px] rounded-full animate-pulse" />
      </div>

      <div className="max-w-md w-full text-center space-y-10 reveal-up">
        <div className="relative inline-block">
          <h1 className="text-[12rem] font-heading font-black leading-none tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-primary to-transparent opacity-20">
            404
          </h1>
          <div className="absolute inset-0 flex items-center justify-center">
             <div className="size-24 rounded-3xl bg-card border border-border shadow-2xl flex items-center justify-center animate-bounce">
                <Search className="size-10 text-primary" />
             </div>
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-4xl font-heading font-black tracking-tight">Lost in the Radar?</h2>
          <p className="text-muted-foreground font-medium text-balance">
            We couldn&apos;t find the page you&apos;re looking for. Maybe it&apos;s moved to a new service zone.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
           <Button 
             render={<Link href="/" />}
             size="lg" 
             className="rounded-full w-full sm:w-auto font-black shadow-xl shadow-primary/20 bg-primary text-white"
           >
              <Home className="size-4 mr-2" /> Back Home
           </Button>
           <Button 
             render={<Link href="/dashboard" />}
             variant="outline" 
             size="lg" 
             className="rounded-full w-full sm:w-auto font-black border-2"
           >
              Browse Services
           </Button>
        </div>

        <div className="pt-12 flex items-center justify-center gap-6 opacity-40">
           <div className="flex items-center gap-2">
              <MapPin className="size-4" />
              <span className="text-[10px] font-bold uppercase tracking-widest">Global Ops</span>
           </div>
           <div className="size-1 rounded-full bg-muted-foreground" />
           <span className="text-[10px] font-bold uppercase tracking-widest">v{process.env.NEXT_PUBLIC_APP_VERSION || "1.0.0"}</span>
        </div>
      </div>
    </div>
  );
}
