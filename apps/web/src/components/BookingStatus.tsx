"use client";

import { useCallback, useEffect, useState } from "react";
import { useWebSocket } from "@/hooks/useWebsocket";
import { useSession } from "@/lib/auth/session";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, CheckCircle2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { TrackingMap } from "./TrackingMap";

interface BookingStatusProps {
  bookingId: string;
  onClose: () => void;
}

type RealtimeBookingSnapshot = {
  status?: string;
  helperId?: string | null;
  helperName?: string | null;
  helperPhone?: string | null;
  latitude?: number | string | null;
  longitude?: number | string | null;
  startCode?: string | null;
  completeCode?: string | null;
};

type BookingRealtimeEventData = {
  bookingId?: string;
  status?: string;
  eventType?: string;
  message?: string;
  booking?: RealtimeBookingSnapshot;
  helperId?: string | null;
  helperName?: string | null;
  helperPhone?: string | null;
  latitude?: number | string | null;
  longitude?: number | string | null;
  startCode?: string | null;
  completeCode?: string | null;
};

export function BookingStatus({ bookingId, onClose }: BookingStatusProps) {
  const { session } = useSession();
  const [status, setStatus] = useState<string>("requested");
  const [helperName, setHelperName] = useState<string | null>(null);
  const [helperId, setHelperId] = useState<string | undefined>(undefined);
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [searchMessage, setSearchMessage] = useState<string>("We've notified nearby professionals. Hang tight!");
  const [loading, setLoading] = useState(true);
  const [startOTP, setStartOTP] = useState<string | null>(null);
  const [completeOTP, setCompleteOTP] = useState<string | null>(null);

  const applyBookingSnapshot = useCallback((snapshot: RealtimeBookingSnapshot) => {
    if (snapshot.status) {
      setStatus(snapshot.status);
    }

    if (snapshot.helperName !== undefined) {
      setHelperName(snapshot.helperName);
    }

    if (snapshot.helperId !== undefined) {
      setHelperId(snapshot.helperId ?? undefined);
    }

    if (snapshot.latitude != null && snapshot.longitude != null) {
      setLocation({
        lat: Number(snapshot.latitude),
        lng: Number(snapshot.longitude),
      });
    }

    if (snapshot.startCode !== undefined) {
      setStartOTP(snapshot.startCode);
    }

    if (snapshot.completeCode !== undefined) {
      setCompleteOTP(snapshot.completeCode);
    }
  }, []);

  const stateLabel =
    status === "requested"
      ? "Searching for a helper"
      : status === "matched"
        ? "Helpers are reviewing your request"
        : status === "accepted"
          ? "A helper has accepted"
          : status === "in_progress"
            ? "Work is in progress"
            : status === "completed"
              ? "Booking completed"
              : status === "cancelled"
                ? "Booking cancelled"
                : "Booking status";

  const stateCopy =
    status === "requested"
      ? searchMessage
      : status === "matched"
        ? "We have sent your request to matching professionals. The first eligible helper to respond will take the job."
        : status === "accepted"
          ? "Your helper is assigned. Keep the start OTP ready when they arrive."
          : status === "in_progress"
            ? "The job is active. Share the completion OTP only after the work is finished."
            : status === "completed"
              ? "This booking is finished and available in your history."
              : status === "cancelled"
                ? "This booking will no longer proceed."
                : searchMessage;

  const syncBookingState = useCallback(async () => {
    try {
      const res = await fetch(`/api/bookings/${bookingId}`);
      if (!res.ok) return;

      const data = await res.json();
      setStatus(data.booking.status);

      const helperRecord = data.booking.helper;
      const helperProfileRecord = data.booking.helperProfile;
      const nextHelperName =
        helperRecord?.name ??
        helperRecord?.user?.name ??
        helperProfileRecord?.user?.name ??
        null;
      const nextHelperId =
        helperRecord?.id ??
        helperRecord?.user?.id ??
        helperProfileRecord?.user?.id ??
        data.booking.helperId ??
        undefined;

      setHelperName(nextHelperName);
      setHelperId(nextHelperId);

      if (data.booking.latitude && data.booking.longitude) {
        setLocation({
          lat: parseFloat(data.booking.latitude),
          lng: parseFloat(data.booking.longitude),
        });
      }
      if (data.booking.startCode) setStartOTP(data.booking.startCode);
      if (data.booking.completeCode) setCompleteOTP(data.booking.completeCode);
    } catch (err) {
      console.error("Failed to fetch booking status:", err);
    }
  }, [bookingId]);

  useWebSocket(session?.user.id || "unknown", (msg) => {
    if (msg.type !== "event") return;

    if (msg.event !== "matching_update" && msg.event !== "booking_update") {
      return;
    }

    const data = msg.data as BookingRealtimeEventData | undefined;
    if (!data || data.bookingId !== bookingId) return;

    console.log("🔔 Booking realtime event received:", data);

    const snapshot = data.booking ?? data;
    if (msg.event === "matching_update") {
      if (data.status) {
        setStatus(data.status);
      }
      if (data.message) {
        setSearchMessage(data.message);
      }
      applyBookingSnapshot(snapshot);
      return;
    }

    applyBookingSnapshot(snapshot);

    if (data.message) {
      setSearchMessage(data.message);
    }

    if (data.eventType) {
      setStatus(data.eventType);
    }
  });

  useEffect(() => {
    const initialize = async () => {
      await syncBookingState();
      setLoading(false);
    };

    void initialize();
  }, [bookingId, syncBookingState]);

  if (loading) {
    return (
      <Card className="mt-4">
        <CardContent className="pt-6 flex flex-col items-center justify-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Loading booking status...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="reveal-up">
      <div className="surface-card-strong border-none overflow-hidden">
        {/* Header with status pulse */}
        <div className="p-6 border-b border-border/30 bg-primary/5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative size-3">
              <div className={cn(
                "absolute inset-0 rounded-full animate-ping opacity-75",
                status === "requested" ? "bg-amber-500" : status === "accepted" ? "bg-green-500" : "bg-muted"
              )} />
              <div className={cn(
                "relative size-3 rounded-full",
                status === "requested" ? "bg-amber-500" : status === "accepted" ? "bg-green-500" : "bg-muted"
              )} />
            </div>
            <h2 className="text-lg font-heading font-bold">
              {stateLabel}
            </h2>
          </div>
          <Badge variant="outline" className="rounded-full px-3 font-bold border-primary/20 bg-primary/5">
            {bookingId.slice(-6).toUpperCase()}
          </Badge>
        </div>

        <div className="p-6 space-y-6">
          {status === "requested" && (
            <div className="space-y-6 text-center py-4">
              <div className="relative flex justify-center">
                 <div className="size-24 rounded-full bg-primary/10 flex items-center justify-center animate-pulse">
                    <Loader2 className="size-12 animate-spin text-primary opacity-50" />
                 </div>
                 <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 size-16 rounded-full border-2 border-primary/30 border-dashed animate-[spin_10s_linear_infinite]" />
              </div>
              <div className="space-y-2">
                <p className="font-bold text-xl leading-tight">Finding the best available helper...</p>
                <p className="text-sm text-muted-foreground max-w-60 mx-auto">
                  {stateCopy}
                </p>
              </div>
              <div className="flex gap-2 justify-center">
                  {[1,2,3].map(i => (
                      <div key={i} className={`size-1.5 rounded-full bg-primary/30 animate-bounce delay-${i*100}`} />
                  ))}
              </div>
            </div>
          )}

          {status === "matched" && (
            <div className="space-y-6 text-center py-4">
              <div className="relative flex justify-center">
                <div className="size-24 rounded-full bg-primary/10 flex items-center justify-center animate-pulse">
                  <Loader2 className="size-12 animate-spin text-primary opacity-50" />
                </div>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 size-16 rounded-full border-2 border-primary/30 border-dashed animate-[spin_10s_linear_infinite]" />
              </div>
              <div className="space-y-2">
                <p className="font-bold text-xl leading-tight">Helpers are reviewing your request</p>
                <p className="text-sm text-muted-foreground max-w-60 mx-auto">
                  {stateCopy}
                </p>
              </div>
              <div className="flex gap-2 justify-center">
                {[1, 2, 3].map((i) => (
                  <div key={i} className={`size-1.5 rounded-full bg-primary/30 animate-bounce delay-${i * 100}`} />
                ))}
              </div>
            </div>
          )}

          {status === "accepted" && (
            <div className="space-y-6">
              {/* Helper Profile Info */}
              {helperName ? (
                <div className="flex items-center gap-4 bg-muted/30 p-4 rounded-2xl border border-border/50">
                  <div className="size-14 rounded-2xl bg-primary/20 flex items-center justify-center text-primary font-bold text-xl">
                    {helperName[0]?.toUpperCase() || "H"}
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-lg leading-tight">{helperName}</p>
                    <p className="text-xs text-muted-foreground">Helper assigned from live booking data</p>
                  </div>
                  <div className="flex gap-2">
                      <Button size="icon" variant="outline" className="rounded-full size-10 hover:bg-primary hover:text-white transition-all shadow-lg active:scale-95">
                          <CheckCircle2 className="size-5" />
                      </Button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-4 bg-muted/30 p-4 rounded-2xl border border-border/50">
                  <div className="size-14 rounded-2xl bg-muted flex items-center justify-center text-muted-foreground font-bold text-xl">
                    ?
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-lg leading-tight">Awaiting helper details</p>
                    <p className="text-xs text-muted-foreground">The backend has not sent an assigned helper yet.</p>
                  </div>
                </div>
              )}

              {/* OTP Section */}
              <div className="grid grid-cols-2 gap-4">
                  <div className="surface-card p-4 rounded-2xl border border-border/50 text-center space-y-1">
                      <p className="text-[10px] font-bold text-muted-foreground uppercase">Start Job OTP</p>
                      <p className="text-2xl font-black tracking-widest text-primary">{startOTP || "----"}</p>
                  </div>
                  <div className="surface-card p-4 rounded-2xl border border-border/50 text-center space-y-1">
                      <p className="text-[10px] font-bold text-muted-foreground uppercase">Complete Job OTP</p>
                      <p className="text-2xl font-black tracking-widest text-primary">{completeOTP || "----"}</p>
                  </div>
              </div>
              <p className="text-[10px] text-center text-muted-foreground font-medium px-4">
                  {stateCopy}
              </p>

              {location && (
                <div className="rounded-3xl overflow-hidden border border-border/50 shadow-inner h-64 relative group">
                  <TrackingMap 
                    bookingId={bookingId} 
                    customerLocation={location}
                    helperId={helperId}
                  />
                  <div className="absolute bottom-4 left-4 right-4 bg-background/80 backdrop-blur-md p-3 rounded-2xl text-[10px] font-bold uppercase tracking-wider text-center border border-white/20 shadow-xl opacity-0 group-hover:opacity-100 transition-opacity">
                    Live Tracking Active
                  </div>
                </div>
              )}
              
              <div className="grid grid-cols-2 gap-3">
                <Button className="rounded-2xl h-12 font-bold shadow-lg shadow-primary/20" variant="default" onClick={() => window.location.href = "/customer/bookings"}>
                    View Order
                </Button>
                <Button className="rounded-2xl h-12 font-bold" variant="outline" onClick={onClose}>
                    Minimise
                </Button>
              </div>
            </div>
          )}

          {(status === "expired" || status === "cancelled") && (
            <div className="space-y-6 text-center py-4">
              <div className="size-20 rounded-full bg-destructive/10 flex items-center justify-center mx-auto">
                <XCircle className="size-10 text-destructive" />
              </div>
              <div className="space-y-2">
                <p className="font-bold text-xl text-destructive leading-tight">
                    {status === "expired" ? "No Helpers Found" : "Booking Cancelled"}
                </p>
                <p className="text-sm text-muted-foreground max-w-60 mx-auto">
                    {status === "expired" 
                        ? "Sorry, no helpers were available at this time. Please try again later."
                        : "This booking has been cancelled and will not proceed."}
                </p>
              </div>
              <Button variant="outline" className="w-full rounded-2xl h-14 font-bold" onClick={onClose}>
                Return to Dashboard
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
