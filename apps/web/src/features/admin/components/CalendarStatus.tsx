"use client";

import { useEffect, useState } from "react";
import { Calendar, CheckCircle2, AlertCircle, Loader2, Link as LinkIcon } from "lucide-react";
import { Button } from "@repo/ui/components/ui/button";
import { authClient } from "@/lib/auth/client";
import { toast } from "sonner";

export function CalendarStatus() {
  const [status, setStatus] = useState<{
    isConnected: boolean;
    hasCalendarScope: boolean;
    hasRefreshToken: boolean;
    hasServiceAccount?: boolean;
    configured?: boolean;
    email: string;
  } | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchStatus = async () => {
    try {
      const res = await fetch("/api/admin/calendar/status");
      if (res.ok) {
        const data = await res.json();
        setStatus(data);
      }
    } catch (error) {
      console.error("Failed to fetch calendar status", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      if (params.get("calendar") === "connected") {
        toast.success("Google Calendar connected successfully!");
      } else if (params.get("calendar_error")) {
        toast.error(`Calendar connection error: ${params.get("calendar_error")}`);
      }
    }
    void fetchStatus();
  }, []);

  const handleConnect = () => {
    window.location.href = "/api/admin/calendar/connect";
  };

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground animate-pulse">
        <Loader2 className="size-4 animate-spin" />
        Checking calendar status...
      </div>
    );
  }

  const isFullyConnected =
    Boolean(status?.configured) ||
    Boolean(status?.hasServiceAccount) ||
    Boolean(status?.isConnected && status?.hasCalendarScope && status?.hasRefreshToken);

  return (
    <div className="flex flex-wrap items-center gap-4 rounded-2xl border border-border/50 bg-card/40 p-4">
      <div className="flex items-center gap-3">
        <div className={`flex size-10 items-center justify-center rounded-xl ${isFullyConnected ? 'bg-green-500/10 text-green-600' : 'bg-amber-500/10 text-amber-600'}`}>
          <Calendar className="size-5" />
        </div>
        <div>
          <p className="text-sm font-semibold">Google Calendar</p>
          <p className="text-xs text-muted-foreground">
            {isFullyConnected 
              ? status?.hasServiceAccount
                ? `Connected via Service Account (${status.email})`
                : `Connected to ${status?.email}`
              : "Not connected or missing permissions"}
          </p>
        </div>
      </div>

      <div className="ml-auto flex items-center gap-3">
        {isFullyConnected ? (
          <div className="flex items-center gap-1.5 text-xs font-medium text-green-600">
            <CheckCircle2 className="size-4" />
            Ready for KYC
          </div>
        ) : (
          <div className="flex items-center gap-1.5 text-xs font-medium text-amber-600">
            <AlertCircle className="size-4" />
            Action Required
          </div>
        )}
        
        <Button 
          variant={isFullyConnected ? "outline" : "default"} 
          size="sm" 
          className="h-9 rounded-xl font-semibold"
          onClick={() => void handleConnect()}
        >
          <LinkIcon className="mr-2 size-3.5" />
          {isFullyConnected ? "Reconnect" : "Connect Calendar"}
        </Button>
      </div>
    </div>
  );
}
