"use client";

import { useState, useEffect } from "react";
import { IncomingJobsPanel } from "@/components/IncomingJobsPanel";
import { IncomingJobsMap } from "@/components/IncomingJobsMap";
import { useIncomingJobs } from "./useIncomingJobs";
import { useWebSocket } from "@/hooks/useWebsocket";
import { useSession } from "@/lib/auth/session";
import { publishHelperPresence } from "@/lib/realtime/client";
import { Badge } from "@/components/ui/badge";
import { CurrentJobPanel } from "@/components/CurrentJobPanel";

export default function HelperPage() {
  const user = useSession();
  const userId = user?.session?.user.id || "unknown";

  const { jobs, addJob, removeJob } = useIncomingJobs();
  const [activeBookingId, setActiveBookingId] = useState<string | null>(null);

  // Track the helper's own live location
  const [workerLocation, setWorkerLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);

  // Get initial position and start periodic heartbeat
  useEffect(() => {
    if (!userId || userId === "unknown") return;

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

  // High-frequency location updates for ACTIVE jobs
  useEffect(() => {
    if (!userId || userId === "unknown" || !activeBookingId) return;

    console.log(`🚀 [Tracking] Starting high-frequency tracking for job: ${activeBookingId}`);

    const trackInterval = setInterval(() => {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const lat = pos.coords.latitude;
          const lng = pos.coords.longitude;
          
          // Send high-frequency location update specifically for this booking
          import("@/lib/realtime/client").then(({ publishLocationUpdate }) => {
            publishLocationUpdate({
              helperUserId: userId,
              bookingId: activeBookingId,
              latitude: lat,
              longitude: lng,
            });
          });
          
          setWorkerLocation({ lat, lng });
        },
        (err) => console.warn("[Tracking] Failed to get GPS for high-frequency update:", err),
        { enableHighAccuracy: true }
      );
    }, 5000); // Every 5 seconds

    return () => {
      console.log("🛑 [Tracking] Stopping high-frequency tracking");
      clearInterval(trackInterval);
    };
  }, [userId, activeBookingId]);

  useWebSocket(userId, (msg) => {
    if (msg.type === "event" && msg.event === "booking_request") {
      addJob(msg.data);
    }

    if (msg.type === "event" && msg.event === "booking_update") {
      removeJob(msg.data.bookingId);
    }

    // Track the helper's own live location updates
    if (msg.type === "event" && msg.event === "location_update") {
      const d = msg.data as {
        helperUserId?: string;
        latitude?: number;
        longitude?: number;
      } | undefined;
      if (d?.helperUserId === userId && d.latitude != null && d.longitude != null) {
        setWorkerLocation({ lat: d.latitude, lng: d.longitude });
      }
    }
  });

  return (
    <main className="space-y-8 pb-20 max-w-4xl mx-auto">
      <div className="flex flex-col gap-2 reveal-up">
        <h1 className="text-4xl font-heading font-black tracking-tight">
          Service <span className="text-primary">Radar</span>
        </h1>
        <p className="text-muted-foreground font-medium">
          {activeBookingId ? "Focus on your current task" : "Accept nearby requests to start earning"}
        </p>
      </div>

      {activeBookingId ? (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-1000">
           <CurrentJobPanel 
             bookingId={activeBookingId} 
             onJobCompleted={() => setActiveBookingId(null)} 
           />
           <div className="space-y-4">
              <h3 className="text-xl font-heading font-bold px-1">Navigation</h3>
              <IncomingJobsMap
                jobs={[]}
                workerLocation={workerLocation}
              />
           </div>
        </div>
      ) : (
        <div className="space-y-8">
          <IncomingJobsMap
            jobs={jobs}
            workerLocation={workerLocation}
          />

          <section className="space-y-6">
            <div className="flex items-center justify-between px-1">
               <h2 className="text-2xl font-heading font-black tracking-tight">Requests</h2>
               <Badge className="bg-primary/10 text-primary border-none font-bold">{jobs.length} Nearby</Badge>
            </div>
            
            <IncomingJobsPanel
              jobs={jobs}
              removeJob={removeJob}
              onJobAccepted={(id) => setActiveBookingId(id)}
            />
          </section>
        </div>
      )}
    </main>
  );
}