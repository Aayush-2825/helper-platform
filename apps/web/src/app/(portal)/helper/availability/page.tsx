"use client";

import { useEffect, useState } from "react";
import { Loader2, Wifi, WifiOff, Clock } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { publishHelperPresence } from "@/lib/realtime/client";
import { useSession } from "@/lib/auth/session";
import { useWebSocket } from "@/hooks/useWebsocket";

type AvailabilityStatus = "online" | "offline" | "busy";

const statusConfig: Record<AvailabilityStatus, { label: string; color: string; icon: React.ReactNode }> = {
  online: { label: "Online", color: "bg-green-500", icon: <Wifi className="h-4 w-4" /> },
  offline: { label: "Offline", color: "bg-gray-400", icon: <WifiOff className="h-4 w-4" /> },
  busy: { label: "Busy", color: "bg-yellow-500", icon: <Clock className="h-4 w-4" /> },
};

export default function HelperAvailabilityPage() {
  const { session } = useSession();
  useWebSocket(session?.user.id || "", () => {});
  const [status, setStatus] = useState<AvailabilityStatus>("offline");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchStatus() {
      try {
        const res = await fetch("/api/helper/profile");
        if (!res.ok) {
          setLoadError("Could not load your current status. Please refresh to try again.");
          return;
        }
        const data = await res.json() as { profile?: { availabilityStatus?: AvailabilityStatus } };
        setStatus(data.profile?.availabilityStatus ?? "offline");
      } catch {
        setLoadError("Could not load your current status. Please refresh to try again.");
      } finally {
        setLoading(false);
      }
    }
    void fetchStatus();
  }, []);

  async function handleStatusChange(newStatus: AvailabilityStatus) {
    setSaving(true);
    setError(null);
    setSuccessMsg(null);
    try {
      const res = await fetch("/api/helper/availability", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ availabilityStatus: newStatus }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({})) as { message?: string };
        setError(body.message ?? "Failed to update status.");
        return;
      }
      setStatus(newStatus);
      setSuccessMsg(`Status updated to ${statusConfig[newStatus].label}`);
      // Broadcast presence update via WS — include current GPS coords so the
      // realtime server can persist them for matching and map display
      if (session?.user.id) {
        const userId = session.user.id;
        if (newStatus === "online" && navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            (pos) => {
              publishHelperPresence({
                helperUserId: userId,
                status: newStatus,
                latitude: pos.coords.latitude,
                longitude: pos.coords.longitude,
              });
            },
            () => {
              // No GPS — still broadcast status without coords
              publishHelperPresence({ helperUserId: userId, status: newStatus });
            },
            { timeout: 5000 },
          );
        } else {
          publishHelperPresence({ helperUserId: userId, status: newStatus });
        }
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  const current = statusConfig[status];

  return (
    <main className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Availability</h1>
        <p className="text-sm text-muted-foreground">Switch your status so customers know when you&apos;re ready to accept jobs.</p>
      </div>

      {loading ? (
        <div className="flex items-center gap-2 text-muted-foreground text-sm">
          <Loader2 className="h-4 w-4 animate-spin" /> Loading status…
        </div>
      ) : (
        <>
          {loadError && <p className="text-sm text-destructive">{loadError}</p>}
          <Card className="surface-card border-none max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <span className={`inline-block h-2.5 w-2.5 rounded-full ${current.color}`} />
              Current status: {current.label}
            </CardTitle>
            <CardDescription>Select a new status below to update your availability.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex flex-wrap gap-3">
              {(Object.entries(statusConfig) as [AvailabilityStatus, typeof statusConfig[AvailabilityStatus]][]).map(([key, cfg]) => (
                <Button
                  key={key}
                  variant={status === key ? "default" : "outline"}
                  disabled={saving || status === key}
                  onClick={() => handleStatusChange(key)}
                  className="gap-2"
                >
                  {saving && status !== key ? null : cfg.icon}
                  {saving && status !== key ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                  {cfg.label}
                </Button>
              ))}
            </div>

            {error && <p className="text-sm text-destructive">{error}</p>}
            {successMsg && <p className="text-sm text-green-600">{successMsg}</p>}
          </CardContent>
        </Card>
        </>
      )}

      <Card className="surface-card border-none max-w-md">
        <CardHeader>
          <CardTitle className="text-base">Status guide</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p><span className="font-medium text-foreground">Online</span> — You&apos;ll receive incoming job requests.</p>
          <p><span className="font-medium text-foreground">Busy</span> — You&apos;re on a job and won&apos;t receive new requests.</p>
          <p><span className="font-medium text-foreground">Offline</span> — You won&apos;t receive any job requests.</p>
        </CardContent>
      </Card>
    </main>
  );
}
