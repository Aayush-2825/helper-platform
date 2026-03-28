"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  CheckCircle2, Navigation2, MessageSquare, Phone, 
  MapPin, Clock, Loader2, ArrowRight 
} from "lucide-react";
import { cn } from "@/lib/utils";

interface CurrentJobPanelProps {
  bookingId: string;
  onJobCompleted: () => void;
}

export function CurrentJobPanel({ bookingId, onJobCompleted }: CurrentJobPanelProps) {
  const [booking, setBooking] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [completing, setCompleting] = useState(false);
  const [starting, setStarting] = useState(false);
  const [otp, setOtp] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchBooking() {
      try {
        const res = await fetch(`/api/bookings/${bookingId}`);
        if (res.ok) {
          const data = await res.json();
          setBooking(data.booking);
        }
      } catch (err) {
        console.error("Failed to fetch active booking:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchBooking();
  }, [bookingId]);

  const handleStart = async () => {
    if (!otp || otp.length < 4) {
      setError("Please enter the 4-digit Start OTP from the customer.");
      return;
    }
    setStarting(true);
    setError(null);
    try {
      const res = await fetch(`/api/bookings/${bookingId}/start`, { 
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ otp })
      });
      if (res.ok) {
        setBooking({ ...booking, status: "in_progress" });
        setOtp("");
      } else {
        const data = await res.json();
        setError(data.message || "Invalid OTP");
      }
    } catch (err) {
      console.error("Failed to start job:", err);
      setError("Connection error");
    } finally {
      setStarting(false);
    }
  };

  const handleComplete = async () => {
    if (!otp || otp.length < 4) {
      setError("Please enter the 4-digit Completion OTP from the customer.");
      return;
    }
    setCompleting(true);
    setError(null);
    try {
      const res = await fetch(`/api/bookings/${bookingId}/complete`, { 
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ otp })
      });
      if (res.ok) {
        onJobCompleted();
      } else {
        const data = await res.json();
        setError(data.message || "Invalid OTP");
      }
    } catch (err) {
      console.error("Failed to complete job:", err);
      setError("Connection error");
    } finally {
      setCompleting(false);
    }
  };

  if (loading) return (
     <Card className="surface-card p-8 text-center animate-pulse">
        <Loader2 className="size-8 animate-spin mx-auto text-primary opacity-50" />
     </Card>
  );

  if (!booking) return null;

  const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${booking.latitude},${booking.longitude}`;

  return (
    <div className="reveal-up">
      <Card className="surface-card-strong border-none overflow-hidden shadow-2xl relative">
        {/* Animated Background Pulse */}
        <div className="absolute top-0 right-0 p-4">
           <div className="relative size-3">
              <div className="absolute inset-0 rounded-full bg-green-500 animate-ping" />
              <div className="relative size-3 rounded-full bg-green-500" />
           </div>
        </div>

        <div className="p-6 space-y-6">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Badge className="bg-primary/10 text-primary border-none rounded-lg px-2 font-black text-[10px] uppercase">
                Active Job
              </Badge>
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
                ID: {bookingId.slice(-6).toUpperCase()}
              </span>
            </div>
            
            <h2 className="text-3xl font-heading font-black tracking-tight leading-none">
              In Progress
            </h2>

            <div className="space-y-3 bg-muted/20 p-4 rounded-[1.5rem] border border-border/50">
               <div className="flex items-start gap-3">
                  <MapPin className="size-5 text-primary shrink-0 mt-0.5" />
                  <div>
                     <p className="font-bold text-sm leading-tight">{booking.addressLine}</p>
                     <p className="text-xs text-muted-foreground">{booking.city}, {booking.state}</p>
                  </div>
               </div>
               <div className="flex items-center gap-3 border-t border-border/30 pt-3 mt-3">
                  <div className="size-10 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary">
                    {booking.customer?.user?.name?.[0] || "C"}
                  </div>
                  <div className="flex-1">
                     <p className="font-bold text-sm leading-tight">{booking.customer?.user?.name || "Customer"}</p>
                     <p className="text-[10px] font-bold text-muted-foreground uppercase">Verified User (4.8 ★)</p>
                  </div>
                  <div className="flex gap-2">
                     <Button size="icon" variant="ghost" className="rounded-full size-10 bg-muted/50 hover:bg-primary hover:text-white transition-all shadow-lg active:scale-95">
                        <Phone className="size-4" />
                     </Button>
                  </div>
               </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="relative">
                <input 
                    type="text" 
                    placeholder={booking.status === "accepted" ? "Enter Start OTP" : "Enter Completion OTP"}
                    maxLength={4}
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, ""))}
                    className="w-full h-16 bg-muted/30 border-2 border-border/50 rounded-2xl text-center text-3xl font-black tracking-[0.5em] placeholder:text-muted-foreground/30 placeholder:tracking-normal placeholder:text-sm focus:border-primary/50 focus:bg-primary/5 outline-none transition-all"
                />
            </div>
            {error && (
                <p className="text-[10px] font-bold text-destructive text-center animate-shake">{error}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Button 
              className="rounded-2xl h-14 font-black shadow-lg bg-muted hover:bg-muted/80 text-foreground"
              onClick={() => window.open(googleMapsUrl, "_blank")}
            >
              <Navigation2 className="size-5 mr-2" /> Navigate
            </Button>
            
            {booking.status !== "in_progress" ? (
               <Button 
                className="rounded-2xl h-14 font-black shadow-xl shadow-primary/20"
                onClick={handleStart}
                disabled={starting}
               >
                 {starting ? <Loader2 className="size-5 animate-spin" /> : <>Start Job <ArrowRight className="size-5 ml-2" /></>}
               </Button>
            ) : (
               <Button 
                className="rounded-2xl h-14 font-black shadow-xl shadow-green-500/20 bg-green-600 hover:bg-green-700 text-white"
                onClick={handleComplete}
                disabled={completing}
               >
                 {completing ? <Loader2 className="size-5 animate-spin" /> : <>Complete <CheckCircle2 className="size-5 ml-2" /></>}
               </Button>
            )}
          </div>
        </div>

        {/* Decorative Progress bar */}
        <div className="h-1 bg-muted w-full relative">
           <div className={cn(
             "h-full bg-primary transition-all duration-1000",
             booking.status === "accepted" ? "w-1/2" : "w-full"
           )} />
        </div>
      </Card>
    </div>
  );
}
