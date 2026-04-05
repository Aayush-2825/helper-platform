"use client";

import { useState, useEffect } from "react";
import { IncomingJobsPanel } from "@/components/IncomingJobsPanel";
import { IncomingJobsMap } from "@/components/IncomingJobsMap";
import { useIncomingJobs } from "./useIncomingJobs";
import { useWebSocket } from "@/hooks/useWebsocket";
import { useSession } from "@/lib/auth/session";
import { publishHelperPresence, publishLocationUpdate } from "@/lib/realtime/client";
import { Badge } from "@/components/ui/badge";
import { CurrentJobPanel } from "@/components/CurrentJobPanel";
import type { IncomingJob } from "./useIncomingJobs";
import { RadioTower } from "lucide-react";

function distanceMeters(
  from: { lat: number; lng: number },
  to: { lat: number; lng: number },
) {
  const earthRadiusMeters = 6371000;
  const toRad = (value: number) => (value * Math.PI) / 180;
  const dLat = toRad(to.lat - from.lat);
  const dLng = toRad(to.lng - from.lng);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(from.lat)) * Math.cos(toRad(to.lat)) *
      Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return earthRadiusMeters * c;
}

function PageHeader({ activeBookingId }: { activeBookingId: string | null }) {
  return (
    <div className="flex flex-col gap-2 reveal-up">
      <h1 className="text-4xl font-heading font-black tracking-tight">
        Service <span className="text-primary">Radar</span>
      </h1>
      <p className="text-muted-foreground font-medium">
        {activeBookingId ? "Focus on your current task" : "Accept nearby requests to start earning"}
      </p>
    </div>
  );
}

function ActiveJobView({
  activeBookingId,
  workerLocation,
  onJobCompleted,
}: {
  activeBookingId: string;
  workerLocation: { lat: number; lng: number } | null;
  onJobCompleted: () => void;
}) {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-1000">
      <CurrentJobPanel bookingId={activeBookingId} onJobCompleted={onJobCompleted} />
      <div className="space-y-4">
        <h3 className="text-xl font-heading font-bold px-1">Navigation</h3>
        <IncomingJobsMap jobs={[]} workerLocation={workerLocation} />
      </div>
    </div>
  );
}

function RequestListView({
  jobs,
  workerLocation,
  removeJob,
  onJobAccepted,
  connected,
  connectionError,
}: {
  jobs: IncomingJob[];
  workerLocation: { lat: number; lng: number } | null;
  removeJob: (bookingId: string) => void;
  onJobAccepted: (bookingId: string) => void;
  connected: boolean;
  connectionError: string | null;
}) {
  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-3xl border border-border/60 bg-card px-4 py-3 shadow-sm">
        <div className="flex items-center gap-3">
          <div className={connected ? "size-2.5 rounded-full bg-green-500" : "size-2.5 rounded-full bg-amber-500"} />
          <div>
            <p className="text-sm font-bold leading-tight">{connected ? "Live queue connected" : "Reconnecting job queue"}</p>
            <p className="text-xs text-muted-foreground">
              {connectionError ?? (connected ? "You will see new requests as they arrive." : "Incoming requests may be delayed until the connection returns.")}
            </p>
          </div>
        </div>
        <Badge variant="outline" className="rounded-full border-border/60 bg-muted/40 px-3 font-bold">
          <RadioTower className="mr-2 size-3.5" />
          {jobs.length} open
        </Badge>
      </div>

      <IncomingJobsMap jobs={jobs} workerLocation={workerLocation} />

      <section className="space-y-6">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-2xl font-heading font-black tracking-tight">Requests</h2>
          <Badge className="bg-primary/10 text-primary border-none font-bold">{jobs.length} Nearby</Badge>
        </div>

        <IncomingJobsPanel jobs={jobs} removeJob={removeJob} onJobAccepted={onJobAccepted} />
      </section>
    </div>
  );
}

export default function HelperPage() {
  const { session, loading: sessionLoading } = useSession();
  const userId = session?.user.id ?? "";

  const { jobs, addJob, removeJob, replaceJobs } = useIncomingJobs();
  const [activeBookingId, setActiveBookingId] = useState<string | null>(null);

  // Track the helper's own live location
  const [workerLocation, setWorkerLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);

  // Get initial position and start periodic heartbeat
  useEffect(() => {
    if (!userId) return;

    let heartbeatInterval: NodeJS.Timeout;

    const sendPresence = (lat?: number, lng?: number) => {
      publishHelperPresence({
        helperUserId: userId,
        status: "online",
        ...(lat != null ? { latitude: lat } : {}),
        ...(lng != null ? { longitude: lng } : {}),
      });
    };

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        setWorkerLocation({ lat, lng });
        
        // Send initial presence
        sendPresence(lat, lng);

        // Start heartbeat every 30 seconds
        heartbeatInterval = setInterval(() => {
          navigator.geolocation.getCurrentPosition(
            (p) => sendPresence(p.coords.latitude, p.coords.longitude),
            () => sendPresence(), // fallback if GPS fails during heartbeat
          );
        }, 30000);
      },
      () => {
        // Geolocation denied — still send presence as "online" without coords
        sendPresence();
        heartbeatInterval = setInterval(() => sendPresence(), 30000);
      },
    );

    return () => {
      if (heartbeatInterval) clearInterval(heartbeatInterval);
    };
  }, [userId]);

  useEffect(() => {
    if (sessionLoading || !userId) return;

    let cancelled = false;

    async function loadIncomingJobs() {
      try {
        const res = await fetch("/api/helpers/incoming-jobs", { credentials: "include" });
        if (!res.ok) return;

        const data = (await res.json()) as {
          jobs?: Array<{
            candidateId?: string;
            bookingId: string;
            customer?: { id: string; name?: string };
            category?: { id?: string; slug?: string };
            addressLine?: string;
            city?: string;
            quotedAmount?: number;
            expiresAt?: string | null;
            distanceKm?: number;
            latitude?: number;
            longitude?: number;
          }>;
        };

        if (cancelled) return;

        replaceJobs(
          (data.jobs ?? []).map((job) => ({
            bookingId: job.bookingId,
            candidateId: job.candidateId,
            customerId: job.customer?.id ?? "",
            customerName: job.customer?.name,
            categoryId: job.category?.slug ?? job.category?.id ?? "other",
            addressLine: job.addressLine ?? "",
            city: job.city ?? "",
            quotedAmount: job.quotedAmount ?? 0,
            expiresAt: job.expiresAt ?? undefined,
            distanceKm: job.distanceKm,
            latitude: job.latitude,
            longitude: job.longitude,
          })),
        );
      } catch (error) {
        console.warn("[IncomingJobs] Failed to load initial jobs:", error);
      }
    }

    void loadIncomingJobs();

    return () => {
      cancelled = true;
    };
  }, [sessionLoading, replaceJobs, userId]);

  // High-frequency location updates for ACTIVE jobs
  useEffect(() => {
    if (!userId || !activeBookingId) return;

    const ACTIVE_INTERVAL_MS = 7000;
    const BACKGROUND_INTERVAL_MS = 15000;
    const FORCE_SEND_AFTER_MS = 45000;
    const MIN_MOVE_METERS = 20;

    let cancelled = false;
    let timeoutId: ReturnType<typeof setTimeout> | null = null;
    let lastSentAt = 0;
    let lastSentCoords: { lat: number; lng: number } | null = null;

    const scheduleNext = () => {
      if (cancelled) return;
      const hidden = typeof document !== "undefined" && document.visibilityState !== "visible";
      const delay = hidden ? BACKGROUND_INTERVAL_MS : ACTIVE_INTERVAL_MS;
      timeoutId = setTimeout(tick, delay);
    };

    const shouldSend = (lat: number, lng: number, now: number) => {
      if (!lastSentCoords) return true;
      if (now - lastSentAt >= FORCE_SEND_AFTER_MS) return true;
      return distanceMeters(lastSentCoords, { lat, lng }) >= MIN_MOVE_METERS;
    };

    const tick = () => {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          if (cancelled) return;

          const lat = pos.coords.latitude;
          const lng = pos.coords.longitude;
          const now = Date.now();

          setWorkerLocation({ lat, lng });

          if (shouldSend(lat, lng, now)) {
            publishLocationUpdate({
              helperUserId: userId,
              bookingId: activeBookingId,
              latitude: lat,
              longitude: lng,
            });

            lastSentCoords = { lat, lng };
            lastSentAt = now;
          }

          scheduleNext();
        },
        (err) => {
          if (!cancelled) {
            console.warn("[Tracking] Failed to get GPS for active-job update:", err);
            scheduleNext();
          }
        },
        { enableHighAccuracy: true },
      );
    };

    tick();

    return () => {
      cancelled = true;
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [userId, activeBookingId]);

  const { connected, error: connectionError } = useWebSocket(userId, (msg) => {
    if (msg.type === "event" && msg.event === "booking_request") {
      const {
        bookingId,
        customerId,
        customerName,
        categoryId,
        addressLine,
        city,
        quotedAmount,
        expiresAt,
        distanceKm,
        latitude,
        longitude,
        candidates,
      } = (msg.data ?? {}) as {
        bookingId?: string;
        customerId?: string;
        customerName?: string;
        categoryId?: string;
        addressLine?: string;
        city?: string;
        quotedAmount?: number;
        expiresAt?: string;
        distanceKm?: number;
        latitude?: number;
        longitude?: number;
        candidates?: Array<{ helperId?: string; candidateId?: string }>;
      };

      const matchingCandidate = candidates?.find(({ helperId }) => helperId === userId);
      if (!bookingId || !matchingCandidate) return;

      const expiresInSeconds = expiresAt
        ? Math.max(0, Math.floor((new Date(expiresAt).getTime() - Date.now()) / 1000))
        : undefined;

      addJob({
        bookingId,
        candidateId: matchingCandidate.candidateId,
        customerId: customerId ?? "",
        customerName,
        categoryId: categoryId ?? "other",
        addressLine: addressLine ?? "",
        city: city ?? "",
        quotedAmount: quotedAmount ?? 0,
        expiresAt,
        expiresInSeconds,
        distanceKm,
        latitude,
        longitude,
      });
    }

    if (msg.type === "event" && msg.event === "booking_update") {
      const data = msg.data as { bookingId?: string } | undefined;
      if (data?.bookingId) {
        removeJob(data.bookingId);
      }
    }

    // Track the helper's own live location updates
    if (msg.type === "event" && msg.event === "location_update") {
      const d = msg.data as {
        helperUserId?: string;
        latitude?: number;
        longitude?: number;
      } | undefined;
      if (!d) return;
      if (d.helperUserId === userId && d.latitude != null && d.longitude != null) {
        setWorkerLocation({ lat: d.latitude, lng: d.longitude });
      }
    }
  });

  return (
    <main className="space-y-8 pb-20 max-w-4xl mx-auto">
      <PageHeader activeBookingId={activeBookingId} />

      {activeBookingId ? (
        <ActiveJobView
          activeBookingId={activeBookingId}
          workerLocation={workerLocation}
          onJobCompleted={() => setActiveBookingId(null)}
        />
      ) : (
        <RequestListView
          jobs={jobs}
          workerLocation={workerLocation}
          removeJob={removeJob}
          onJobAccepted={(id) => setActiveBookingId(id)}
          connected={connected}
          connectionError={connectionError}
        />
      )}
    </main>
  );
}