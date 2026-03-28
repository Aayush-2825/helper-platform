"use client";

import { useEffect, useState } from "react";
import { useWebSocket } from "@/hooks/useWebsocket";
import { useSession } from "@/lib/auth/session";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, CheckCircle2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { TrackingMap } from "./TrackingMap";

interface BookingStatusProps {
  bookingId: string;
  onClose: () => void;
}

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

  const { send } = useWebSocket(session?.user.id || "unknown", (msg) => {
    if (msg.type === "event" && msg.event === "booking_update" && msg.data.bookingId === bookingId) {
      console.log("🔔 Booking update received:", msg.data);
      const newStatus = msg.data.status || msg.data.eventType;
      if (newStatus) setStatus(newStatus);
      
      if (msg.data.helperName) {
        setHelperName(msg.data.helperName);
      }
      if (msg.data.helperId) {
          setHelperId(msg.data.helperId);
      }
      
      if (newStatus === "matching_update" && msg.data.message) {
          setSearchMessage(msg.data.message);
      }
      
      if (newStatus === "accepted") {
          // Re-fetch to get helper details if they weren't in the message
          void fetch(`/api/bookings/${bookingId}`).then(async (res) => {
              if (res.ok) {
                  const data = await res.json();
                  if (data.booking.helper) {
                      setHelperName(data.booking.helper.user.name);
                      setHelperId(data.booking.helper.user.id);
                  }
                  if (data.booking.startCode) setStartOTP(data.booking.startCode);
                  if (data.booking.completeCode) setCompleteOTP(data.booking.completeCode);
              }
          });
      }
    }
  });

  useEffect(() => {
    async function fetchBooking() {
      try {
        const res = await fetch(`/api/bookings/${bookingId}`);
        if (res.ok) {
          const data = await res.json();
          setStatus(data.booking.status);
          if (data.booking.helper) {
            setHelperName(data.booking.helper.user.name);
            setHelperId(data.booking.helper.user.id);
          }
          if (data.booking.latitude && data.booking.longitude) {
              setLocation({ 
                  lat: parseFloat(data.booking.latitude), 
                  lng: parseFloat(data.booking.longitude) 
              });
          }
          if (data.booking.startCode) setStartOTP(data.booking.startCode);
          if (data.booking.completeCode) setCompleteOTP(data.booking.completeCode);
        }
      } catch (err) {
        console.error("Failed to fetch booking status:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchBooking();

    // ✅ CLEANUP: Cancel search if user leaves during 'requested' state
    return () => {
        if (status === "requested") {
            console.log("🔌 [Cleanup] Cancelling search for booking:", bookingId);
            send({ type: "cancel_search", bookingId } as any);
        }
    };
  }, [bookingId, status, send]);

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
              {status === "requested" ? "Searching for Helper" : 
               status === "accepted" ? "Helper is on the Way" : 
               status.charAt(0).toUpperCase() + status.slice(1)}
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
                <p className="font-bold text-xl leading-tight">Assigning a professional...</p>
                <p className="text-sm text-muted-foreground max-w-[240px] mx-auto">
                  {searchMessage}
                </p>
              </div>
              <div className="flex gap-2 justify-center">
                  {[1,2,3].map(i => (
                      <div key={i} className={`size-1.5 rounded-full bg-primary/30 animate-bounce delay-${i*100}`} />
                  ))}
              </div>
            </div>
          )}

          {status === "accepted" && (
            <div className="space-y-6">
              {/* Helper Profile Info */}
              <div className="flex items-center gap-4 bg-muted/30 p-4 rounded-[1.5rem] border border-border/50">
                <div className="size-14 rounded-2xl bg-primary/20 flex items-center justify-center text-primary font-bold text-xl">
                  {helperName?.[0] || "H"}
                </div>
                <div className="flex-1">
                  <p className="font-bold text-lg leading-tight">{helperName || "A Professional"}</p>
                  <p className="text-xs text-muted-foreground">Certified Helper • 4.9 ★</p>
                </div>
                <div className="flex gap-2">
                    <Button size="icon" variant="outline" className="rounded-full size-10 hover:bg-primary hover:text-white transition-all shadow-lg active:scale-95">
                        <CheckCircle2 className="size-5" />
                    </Button>
                </div>
              </div>

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
                  Provide the Start OTP to the professional to begin, and the Complete OTP only after the work is finished to your satisfaction.
              </p>

              {location && (
                <div className="rounded-[2rem] overflow-hidden border border-border/50 shadow-inner h-64 relative group">
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
                <p className="text-sm text-muted-foreground max-w-[240px] mx-auto">
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
