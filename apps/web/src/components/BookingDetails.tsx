"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRealtimeEvents } from "@/hooks/use-realtime-events";
import { useSession } from "@/lib/auth/session";
import { openRazorpayCheckout } from "@/lib/payments/checkout";
import { StatusBadge } from "@/components/StatusBadge";
import { BookingStatusTimeline, type BookingTimelineEvent } from "@/components/BookingStatusTimeline";
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
  Phone,
  ArrowLeft, 
  CheckCircle2, 
  XCircle,
  Play,
  AlertCircle
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

type BookingStatus =
  | "requested"
  | "matched"
  | "accepted"
  | "in_progress"
  | "completed"
  | "cancelled"
  | "expired"
  | "disputed";

type BookingDetailsRecord = {
  id: string;
  status: BookingStatus;
  requestedAt: string;
  acceptedAt?: string | null;
  startedAt?: string | null;
  completedAt?: string | null;
  cancelledAt?: string | null;
  category?: { name?: string | null } | null;
  customer?: { name?: string | null } | null;
  helper?: { name?: string | null } | null;
  addressLine: string;
  area?: string | null;
  city: string;
  state?: string | null;
  postalCode?: string | null;
  latitude?: string | number | null;
  longitude?: string | number | null;
  quotedAmount: number;
  scheduledFor?: string | null;
  notes?: string | null;
  startCode?: string | null;
  completeCode?: string | null;
  helperName?: string | null;
  helperPhone?: string | null;
  helperPhoneVisibleAt?: string | null;
  customerName?: string | null;
  customerPhone?: string | null;
  preferredContactMethod?: "call" | "sms" | "whatsapp" | "in_app" | null;
  canCustomerViewHelperPhone?: boolean;
  statusEvents?: BookingTimelineEvent[];
};

type PaymentStatus = "created" | "authorized" | "captured" | "failed" | "refunded" | "partially_refunded";

type PaymentTransaction = {
  id: string;
  bookingId: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  createdAt: string;
  failureReason?: string | null;
};

type RealtimeBookingUpdate = {
  bookingId?: string;
  status?: string;
  eventType?: string;
  message?: string;
  booking?: Partial<BookingDetailsRecord> & { id?: string };
  helperId?: string | null;
  helperName?: string | null;
  helperPhone?: string | null;
  latitude?: string | number | null;
  longitude?: string | number | null;
  startCode?: string | null;
  completeCode?: string | null;
};

interface BookingDetailsProps {
  bookingId: string;
  role: "customer" | "helper";
}

function formatElapsed(value: Date | string) {
  const start = typeof value === "string" ? new Date(value) : value;
  const diffMs = Math.max(0, Date.now() - start.getTime());
  const totalMinutes = Math.floor(diffMs / 60000);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }

  return `${minutes}m`;
}

function isBookingStatus(value: string): value is BookingStatus {
  return [
    "requested",
    "matched",
    "accepted",
    "in_progress",
    "completed",
    "cancelled",
    "expired",
    "disputed",
  ].includes(value);
}

export function BookingDetails({ bookingId, role }: BookingDetailsProps) {
  const { session } = useSession();
  const userId = session?.user?.id;
  const [booking, setBooking] = useState<BookingDetailsRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [otp, setOtp] = useState("");
  const [otpError, setOtpError] = useState<string | null>(null);
  const [payment, setPayment] = useState<PaymentTransaction | null>(null);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [paymentActionLoading, setPaymentActionLoading] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [, setElapsedNow] = useState(Date.now());
  const lastProcessedEventKey = useRef<string | null>(null);
  const disableAutoRefresh = useRef(false);

  const applyRealtimeBookingUpdate = useCallback((snapshot: Partial<BookingDetailsRecord> & { id?: string }) => {
    setBooking((previous) => {
      if (!previous) {
        return snapshot as BookingDetailsRecord;
      }

      return {
        ...previous,
        ...snapshot,
        category: snapshot.category ?? previous.category,
        customer: snapshot.customer ?? previous.customer,
        helper: snapshot.helper ?? previous.helper,
        statusEvents: snapshot.statusEvents ?? previous.statusEvents,
      };
    });
  }, []);

  const buildBookingPatch = useCallback((data: RealtimeBookingUpdate): Partial<BookingDetailsRecord> & { id?: string } => {
    const snapshot = data.booking ?? {};
    const nextStatus = snapshot.status ?? (data.status && isBookingStatus(data.status) ? data.status : undefined);

    return {
      ...snapshot,
      id: snapshot.id ?? data.bookingId,
      status: nextStatus,
      helperName: snapshot.helperName ?? data.helperName ?? undefined,
      helperPhone: snapshot.helperPhone ?? data.helperPhone ?? undefined,
      latitude: snapshot.latitude ?? data.latitude ?? undefined,
      longitude: snapshot.longitude ?? data.longitude ?? undefined,
      startCode: snapshot.startCode ?? data.startCode ?? undefined,
      completeCode: snapshot.completeCode ?? data.completeCode ?? undefined,
    };
  }, []);

  const fetchBooking = useCallback(async () => {
    try {
      const res = await fetch(`/api/bookings/${bookingId}`);
      if (res.status === 401) {
        disableAutoRefresh.current = true;
        setError("Session expired. Please sign in again.");
        return;
      }
      if (!res.ok) throw new Error("Failed to fetch booking");
      disableAutoRefresh.current = false;
      const data = (await res.json()) as { booking: BookingDetailsRecord };
      setBooking(data.booking);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch booking");
    } finally {
      setLoading(false);
    }
  }, [bookingId]);

  useEffect(() => {
    void fetchBooking();
  }, [fetchBooking]);

  const fetchPayment = useCallback(async () => {
    if (!booking || booking.status !== "completed") {
      setPayment(null);
      return;
    }

    setPaymentLoading(true);
    try {
      const res = await fetch(`/api/payments?bookingId=${bookingId}&limit=1`, { credentials: "include" });
      if (!res.ok) {
        setPayment(null);
        return;
      }
      const data = (await res.json()) as { payments?: PaymentTransaction[] };
      const latest = (data.payments ?? [])[0] ?? null;
      setPayment(latest);
    } finally {
      setPaymentLoading(false);
    }
  }, [booking, bookingId]);

  useEffect(() => {
    void fetchPayment();
  }, [fetchPayment]);

  const { eventMessages } = useRealtimeEvents({
    userId,
    eventTypes: ["booking_update", "location_update", "payment_update"],
  });

  useEffect(() => {
    if (!eventMessages.length || disableAutoRefresh.current) {
      return;
    }

    const latest = eventMessages[0];
    if (latest.type !== "event") {
      return;
    }

    const data = latest.data as RealtimeBookingUpdate | undefined;
    if (data?.bookingId !== bookingId) {
      return;
    }

    const nextEventKey = `${latest.event}:${latest.occurredAt ?? "na"}:${data?.bookingId ?? "na"}:${data?.status ?? "na"}`;
    if (lastProcessedEventKey.current === nextEventKey) {
      return;
    }
    lastProcessedEventKey.current = nextEventKey;

    if (latest.event === "booking_update") {
      const snapshot = buildBookingPatch(data);
      applyRealtimeBookingUpdate(snapshot);

      if (snapshot.status === "completed" || data.eventType === "completed") {
        void fetchPayment();
      }
    } else if (latest.event === "payment_update") {
      void fetchPayment();
    }
  }, [applyRealtimeBookingUpdate, buildBookingPatch, eventMessages, bookingId, fetchPayment]);

  const handleCustomerPayment = async () => {
    if (!booking || booking.status !== "completed") {
      return;
    }

    setPaymentError(null);
    setPaymentActionLoading(true);

    try {
      const createRes = await fetch("/api/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ bookingId, method: "upi" }),
      });

      const createData = (await createRes.json().catch(() => ({}))) as {
        message?: string;
        razorpay?: { keyId: string; orderId: string; amount: number; currency: string };
      };

      if (!createRes.ok || !createData.razorpay) {
        throw new Error(createData.message ?? "Failed to create payment order.");
      }

      const checkoutResult = await openRazorpayCheckout({
        keyId: createData.razorpay.keyId,
        orderId: createData.razorpay.orderId,
        amount: createData.razorpay.amount,
        currency: createData.razorpay.currency,
        bookingId,
        customerName: session?.user?.name,
        customerEmail: session?.user?.email,
      });

      const verifyRes = await fetch("/api/payments/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          razorpayOrderId: checkoutResult.razorpay_order_id,
          razorpayPaymentId: checkoutResult.razorpay_payment_id,
          razorpaySignature: checkoutResult.razorpay_signature,
        }),
      });

      const verifyData = (await verifyRes.json().catch(() => ({}))) as { message?: string };
      if (!verifyRes.ok) {
        throw new Error(verifyData.message ?? "Payment verification failed.");
      }

      await fetchPayment();
    } catch (error) {
      setPaymentError(error instanceof Error ? error.message : "Payment failed.");
    } finally {
      setPaymentActionLoading(false);
    }
  };

  const handleAction = async (action: "start" | "complete" | "cancel") => {
    if (actionLoading) return;

    if ((action === "start" || action === "complete") && role === "helper") {
      if (!otp || otp.length < 4) {
        setOtpError(`Please enter the 4-digit OTP to ${action === "start" ? "start" : "complete"} the job.`);
        return;
      }
      setOtpError(null);
    }
    let cancellationReason: string | undefined;
    if (action === "cancel" && role === "customer") {
      const promptMessage = isSearching
        ? "Optional reason for stopping helper search"
        : "Reason for cancellation (optional)";
      cancellationReason = window.prompt(promptMessage)?.trim() || undefined;
    }
    if (action === "cancel" && role === "customer") {
      const confirmationMessage = isSearching
        ? "Stop searching for helpers for this booking?"
        : "Are you sure you want to cancel this booking?";

      if (!confirm(confirmationMessage)) return;
    } else if (!confirm(`Are you sure you want to ${action} this booking?`)) {
      return;
    }
    setActionLoading(true);
    try {
      let body: string | undefined;
      if ((action === "start" || action === "complete") && role === "helper") {
        body = JSON.stringify({ otp });
      }
      if (action === "cancel" && role === "customer") {
        body = JSON.stringify({ reason: cancellationReason });
      }
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
    } catch (err) {
      alert(err instanceof Error ? err.message : `Failed to ${action} booking`);
    } finally {
      setActionLoading(false);
    }
  };

  const bookingIsInProgress = booking?.status === "in_progress";
  const bookingStartedAt = booking?.startedAt;

  useEffect(() => {
    if (!(bookingIsInProgress && bookingStartedAt)) {
      return;
    }

    const interval = setInterval(() => {
      setElapsedNow(Date.now());
    }, 30000);

    return () => clearInterval(interval);
  }, [bookingIsInProgress, bookingStartedAt]);

  if (loading) return <div className="flex items-center justify-center p-20"><Loader2 className="animate-spin text-primary" /></div>;
  if (error || !booking) return <div className="p-8 text-center text-destructive">{error || "Booking not found"}</div>;

  const isAccepted = booking.status === "accepted";
  const isInProgress = booking.status === "in_progress";
  const isSearching = booking.status === "requested" || booking.status === "matched";
  const showCustomerLiveGuide = role === "customer" && (isAccepted || isInProgress);
  const inProgressElapsed = isInProgress && booking.startedAt ? formatElapsed(booking.startedAt) : null;
  const hasMapCoordinates = booking.latitude != null && booking.longitude != null;
  const mapDestination = hasMapCoordinates
    ? `${encodeURIComponent(String(booking.latitude))},${encodeURIComponent(String(booking.longitude))}`
    : null;
  const canCustomerPay = role === "customer" && booking.status === "completed" && payment?.status !== "captured";
  const paymentStatusLabel = payment ? payment.status.replaceAll("_", " ") : "pending";

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
          <span className="font-semibold text-green-700 text-base">
            Job in Progress{inProgressElapsed ? ` • ${inProgressElapsed}` : ""}
          </span>
        </div>
      )}

      {showCustomerLiveGuide && (
        <Card className="border-blue-200 bg-blue-50/70 shadow-sm dark:border-blue-900/50 dark:bg-blue-950/20">
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-sm font-semibold text-blue-900 dark:text-blue-200">
              {isInProgress ? "Live Job Guidance" : "Before The Job Starts"}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 p-4 pt-0 text-sm text-blue-900/90 dark:text-blue-200/90">
            {isAccepted && (
              <>
                <p>1. The helper is on the way. Keep your phone reachable.</p>
                <p>2. Share the start OTP only after the helper arrives at your location.</p>
                <p>3. Once started, you will receive a completion OTP for job closure.</p>
              </>
            )}
            {isInProgress && (
              <>
                <p>1. Service is currently running.</p>
                {inProgressElapsed && <p>2. Elapsed time: {inProgressElapsed}.</p>}
                <p>3. Share the completion OTP only when all work is finished.</p>
                <p>4. Use cancellation only for genuine issues, or raise support if needed.</p>
              </>
            )}
          </CardContent>
        </Card>
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
      {(isAccepted || isInProgress) && mapDestination && (
        <Card className="overflow-hidden shadow-md border-primary/20 bg-card">
          <CardHeader className="p-4 border-b bg-muted/30">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <div className="size-2 rounded-full bg-green-500 animate-pulse" />
              Navigate to Service Location
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center gap-4 py-8">
            <a
              href={`https://www.google.com/maps/dir/?api=1&destination=${mapDestination}`}
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
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {booking.addressLine}
                  {booking.area ? `, ${booking.area}` : ""}
                  {booking.city ? `, ${booking.city}` : ""}
                  {booking.state ? `, ${booking.state}` : ""}
                  {booking.postalCode ? ` - ${booking.postalCode}` : ""}
                </p>
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
            {booking.scheduledFor && (
              <div className="flex items-start gap-3">
                <Clock className="size-4 text-primary mt-1 shrink-0" />
                <div>
                  <p className="text-sm font-medium">Scheduled For</p>
                  <p className="text-sm text-muted-foreground">{new Date(booking.scheduledFor).toLocaleString("en-IN")}</p>
                </div>
              </div>
            )}
            {booking.notes && (
              <div className="rounded-lg border p-3 bg-muted/20">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Task Notes</p>
                <p className="text-sm mt-1 leading-relaxed">{booking.notes}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {booking.status === "completed" && (
          <Card className="shadow-sm md:col-span-2">
            <CardHeader className="p-4 border-b">
              <CardTitle className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Payment</CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-3">
              {paymentError && (
                <div className="rounded-lg border border-destructive/20 bg-destructive/5 px-3 py-2 text-sm text-destructive flex items-center gap-2">
                  <AlertCircle className="size-4" />
                  {paymentError}
                </div>
              )}

              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-medium">Amount</p>
                  <p className="text-2xl font-semibold">₹{(payment?.amount ?? booking.quotedAmount).toLocaleString("en-IN")}</p>
                </div>
                <Badge className={
                  payment?.status === "captured"
                    ? "bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-400"
                    : "bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300"
                }>
                  {paymentLoading ? "checking" : paymentStatusLabel}
                </Badge>
              </div>

              {payment?.status === "failed" && payment.failureReason && (
                <p className="text-xs text-destructive">Last payment attempt failed: {payment.failureReason}</p>
              )}

              {canCustomerPay && (
                <Button
                  className="w-full sm:w-auto"
                  disabled={paymentActionLoading}
                  onClick={() => void handleCustomerPayment()}
                >
                  {paymentActionLoading ? (
                    <>
                      <Loader2 className="size-4 animate-spin mr-2" /> Processing
                    </>
                  ) : (
                    "Pay now"
                  )}
                </Button>
              )}
            </CardContent>
          </Card>
        )}

        <div className="md:col-span-2">
          <BookingStatusTimeline
            status={booking.status}
            requestedAt={booking.requestedAt}
            acceptedAt={booking.acceptedAt}
            startedAt={booking.startedAt}
            completedAt={booking.completedAt}
            cancelledAt={booking.cancelledAt}
            events={booking.statusEvents}
          />
        </div>

        <Card className="shadow-sm">
          <CardHeader className="p-4 border-b">
            <CardTitle className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              {role === "customer" ? "Helper Info" : "Customer Info"}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            {role === "customer" ? (
              booking.helper ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-4">
                    <div className="size-12 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center">
                      <User className="size-6 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-bold">{booking.helperName || booking.helper.name}</p>
                      <p className="text-xs text-muted-foreground">Verified Professional</p>
                    </div>
                  </div>

                  <div className="rounded-lg border p-3 bg-muted/20">
                    <div className="flex items-center gap-2">
                      <Phone className="size-4 text-muted-foreground" />
                      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Helper Contact</p>
                    </div>
                    {booking.helperPhone ? (
                      <p className="text-sm font-semibold mt-1">{booking.helperPhone}</p>
                    ) : (
                      <p className="text-xs text-muted-foreground mt-1">
                        Helper phone becomes visible once the professional starts the job.
                      </p>
                    )}
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center p-4 text-center border-2 border-dashed rounded-lg">
                  <Loader2 className="size-5 animate-spin text-muted-foreground mb-2" />
                  <p className="text-xs text-muted-foreground">Matching you with the best professional...</p>
                </div>
              )
            ) : (
              <div className="space-y-3">
                <div className="flex items-center gap-4">
                  <div className="size-12 rounded-full bg-green-500/10 border border-green-500/20 flex items-center justify-center">
                    <User className="size-6 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm font-bold">{booking.customerName || booking.customer?.name || "Customer"}</p>
                    <p className="text-xs text-muted-foreground">Customer</p>
                  </div>
                </div>

                <div className="rounded-lg border p-3 bg-muted/20 space-y-1">
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Contact Preferences</p>
                  <p className="text-sm font-medium">Phone: {booking.customerPhone || "Not provided"}</p>
                  <p className="text-xs text-muted-foreground">
                    Preferred method: {(booking.preferredContactMethod || "call").replace("_", " ")}
                  </p>
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

          {role === "customer" && (isSearching || isAccepted) && (
            <Button 
                variant="outline" 
                className="flex-1 gap-2 h-12 text-base text-destructive border-destructive hover:bg-destructive/5" 
                size="lg" 
                disabled={actionLoading}
                onClick={() => handleAction("cancel")}
            >
              <XCircle className="size-5" /> {isSearching ? "Stop Search" : "Cancel Booking"}
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
