"use client";

import { useEffect, useState } from "react";
import { useRealtimeEvents } from "@/hooks/use-realtime-events";
import { useSession } from "@/lib/auth/session";
import { StatusBadge } from "@/components/StatusBadge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { buttonVariants } from "@/components/ui/button-variants";
import { Badge } from "@/components/ui/badge";
import { 
  Loader2, 
  MapPin, 
  Clock, 
  IndianRupee, 
  User, 
  ArrowLeft, 
  CheckCircle2, 
  XCircle,
  Play
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface BookingDetailsProps {
  bookingId: string;
  role: "customer" | "helper";
}

export function BookingDetails({ bookingId, role }: BookingDetailsProps) {
  const [booking, setBooking] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [otp, setOtp] = useState("");
  const [otpError, setOtpError] = useState<string | null>(null);

  const fetchBooking = async () => {
    try {
      const res = await fetch(`/api/bookings/${bookingId}`);
      if (!res.ok) throw new Error("Failed to fetch booking");
      const data = await res.json();
      setBooking(data.booking);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBooking();
  }, [bookingId]);

  const { eventMessages } = useRealtimeEvents({
    eventTypes: ["booking_update", "location_update"],
  });

  useEffect(() => {
    if (!eventMessages.length) return;
    for (const msg of eventMessages) {
      const data = msg.data as any;
      if (msg.type === "event" && msg.event === "booking_update" && data?.bookingId === bookingId) {
        fetchBooking(); // Refresh data on update
      }
    }
  }, [eventMessages, bookingId]);

  const handleAction = async (action: "start" | "complete" | "cancel") => {
    if ((action === "start" || action === "complete") && role === "helper") {
      if (!otp || otp.length < 4) {
        setOtpError(`Please enter the 4-digit OTP to ${action === "start" ? "start" : "complete"} the job.`);
        return;
      }
      setOtpError(null);
    }
    if (!confirm(`Are you sure you want to ${action} this booking?`)) return;
    setActionLoading(true);
    try {
      const body = (action === "start" || action === "complete") && role === "helper" ? JSON.stringify({ otp }) : undefined;
      const res = await fetch(`/api/bookings/${bookingId}/${action}`, {
        method: "POST",
        headers: body ? { "Content-Type": "application/json" } : undefined,
        body,
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || `Failed to ${action} booking`);
      }
      setOtp("");
      await fetchBooking();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) return <div className="flex items-center justify-center p-20"><Loader2 className="animate-spin text-primary" /></div>;
  if (error || !booking) return <div className="p-8 text-center text-destructive">{error || "Booking not found"}</div>;

  const isAccepted = booking.status === "accepted";
  const isInProgress = booking.status === "in_progress";
  const isRequested = booking.status === "requested";

  const showMap = isAccepted || isInProgress;
  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-24 mt-4 px-4 sm:px-0">
      {isAccepted && role === "customer" && booking.startCode && (
        <div className="flex items-center gap-3 p-4 mb-2 rounded-lg bg-yellow-50 border border-yellow-200 shadow-sm">
          <span className="font-semibold text-yellow-700 text-base">OTP to Start Job:</span>
          <span className="text-2xl font-mono tracking-widest text-yellow-900 bg-yellow-100 px-3 py-1 rounded-lg border border-yellow-300">
            {booking.startCode}
          </span>
        </div>
      )}
      {isInProgress && role === "customer" && booking.completeCode && (
        <div className="flex items-center gap-3 p-4 mb-2 rounded-lg bg-blue-50 border border-blue-200 shadow-sm">
          <span className="font-semibold text-blue-700 text-base">OTP to End Job:</span>
          <span className="text-2xl font-mono tracking-widest text-blue-900 bg-blue-100 px-3 py-1 rounded-lg border border-blue-300">
            {booking.completeCode}
          </span>
        </div>
      )}
      {isInProgress && (
        <div className="flex items-center gap-3 p-4 mb-2 rounded-lg bg-green-50 border border-green-200 shadow-sm animate-pulse">
          <Play className="size-5 text-green-600" />
          <span className="font-semibold text-green-700 text-base">Job in Progress</span>
        </div>
      )}
      <div className="flex items-center gap-4">
        <Link href={role === "customer" ? "/customer/bookings" : "/helper/job-history"}>
          <Button variant="ghost" size="icon" className="rounded-full">
            <ArrowLeft className="size-5" />
          </Button>
        </Link>
        <div className="flex-1 min-w-0">
          <h1 className="text-xl font-bold truncate">{booking.category?.name || "Booking Details"}</h1>
          <p className="text-xs text-muted-foreground font-mono">ID: {booking.id.slice(0, 8)}</p>
        </div>
        <div className="shrink-0">
          <StatusBadge status={booking.status} />
        </div>
      </div>

      {/* Navigation Button instead of Tracking Map */}
      {(isAccepted || isInProgress) && (
        <Card className="overflow-hidden shadow-md border-primary/20 bg-card">
          <CardHeader className="p-4 border-b bg-muted/30">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <div className="size-2 rounded-full bg-green-500 animate-pulse" />
              Navigate to Service Location
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center gap-4 py-8">
            <a
              href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(booking.latitude)},${encodeURIComponent(booking.longitude)}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{ textDecoration: "none" }}
            >
              <Button
                className="gap-2 text-base font-semibold px-6 py-3"
                size="lg"
              >
                <MapPin className="size-5" /> Open in Google Maps
              </Button>
            </a>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="shadow-sm">
          <CardHeader className="p-4 border-b">
            <CardTitle className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Service Details</CardTitle>
          </CardHeader>
          <CardContent className="p-4 space-y-4">
            <div className="flex items-start gap-3">
              <MapPin className="size-4 text-primary mt-1 shrink-0" />
              <div>
                <p className="text-sm font-medium">Pickup/Service Address</p>
                <p className="text-sm text-muted-foreground leading-relaxed">{booking.addressLine}, {booking.city}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Clock className="size-4 text-primary mt-1 shrink-0" />
              <div>
                <p className="text-sm font-medium">Booking Time</p>
                <p className="text-sm text-muted-foreground">{new Date(booking.requestedAt).toLocaleString("en-IN")}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <IndianRupee className="size-4 text-primary mt-1 shrink-0" />
              <div>
                <p className="text-sm font-medium">Quoted Amount</p>
                <p className="text-lg font-bold">₹{booking.quotedAmount.toLocaleString("en-IN")}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="p-4 border-b">
            <CardTitle className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              {role === "customer" ? "Helper Info" : "Customer Info"}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            {role === "customer" ? (
              booking.helper ? (
                <div className="flex items-center gap-4">
                  <div className="size-12 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center">
                    <User className="size-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-bold">{booking.helper.name}</p>
                    <p className="text-xs text-muted-foreground">Verified Professional</p>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center p-4 text-center border-2 border-dashed rounded-lg">
                  <Loader2 className="size-5 animate-spin text-muted-foreground mb-2" />
                  <p className="text-xs text-muted-foreground">Matching you with the best professional...</p>
                </div>
              )
            ) : (
              <div className="flex items-center gap-4">
                <div className="size-12 rounded-full bg-green-500/10 border border-green-500/20 flex items-center justify-center">
                  <User className="size-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm font-bold">{booking.customer.name}</p>
                  <p className="text-xs text-muted-foreground">Customer</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Persistent Bottom Actions */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-background/80 backdrop-blur-lg border-t z-50 md:sticky md:bottom-4 md:rounded-xl md:shadow-lg md:border md:mb-6">
        <div className="max-w-3xl mx-auto flex gap-3">

          {role === "helper" && (isAccepted || isInProgress) && (
            <div className="flex-1 flex flex-col gap-2">
              <div className="flex gap-2 items-center">
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]{4,6}"
                  maxLength={6}
                  className="border rounded px-3 py-2 text-lg font-mono tracking-widest w-32 focus:outline-none focus:ring focus:border-primary"
                  placeholder={isAccepted ? "Enter OTP to Start" : "Enter OTP to Complete"}
                  value={otp}
                  onChange={e => setOtp(e.target.value.replace(/\D/g, ""))}
                  disabled={actionLoading}
                />
                {isAccepted ? (
                  <Button
                    className="gap-2 h-12 text-base font-semibold"
                    size="lg"
                    disabled={actionLoading || !otp || otp.length < 4}
                    onClick={() => handleAction("start")}
                  >
                    <Play className="size-5 fill-current" /> Start Job
                  </Button>
                ) : (
                  <Button
                    className="gap-2 h-12 text-base font-semibold bg-green-600 hover:bg-green-700"
                    size="lg"
                    disabled={actionLoading || !otp || otp.length < 4}
                    onClick={() => handleAction("complete")}
                  >
                    <CheckCircle2 className="size-5" /> Complete Job
                  </Button>
                )}
              </div>
              {otpError && <div className="text-xs text-destructive mt-1">{otpError}</div>}
            </div>
          )}

          {role === "customer" && (isRequested || isAccepted) && (
            <Button 
                variant="outline" 
                className="flex-1 gap-2 h-12 text-base text-destructive border-destructive hover:bg-destructive/5" 
                size="lg" 
                disabled={actionLoading}
                onClick={() => handleAction("cancel")}
            >
              <XCircle className="size-5" /> Cancel Booking
            </Button>
          )}
          
          {(booking.status === "completed" || booking.status === "cancelled") && (
              <Link 
                href={role === "customer" ? "/customer/bookings" : "/helper/job-history"}
                className={cn(buttonVariants({ variant: "secondary" }), "flex-1 h-12")}
              >
                  Back to History
              </Link>
          )}
        </div>
      </div>
    </div>
  );
}
