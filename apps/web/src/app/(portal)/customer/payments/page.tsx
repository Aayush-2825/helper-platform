"use client";

import { useEffect, useState } from "react";
import { Loader2, CheckCircle2, AlertCircle, Download } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Booking as BaseBooking } from "@/components/BookingCard";
import { useSession } from "@/lib/auth/session";
import { openRazorpayCheckout } from "@/lib/payments/checkout";
import { cn } from "@/lib/utils";

type Booking = BaseBooking & { finalAmount?: number | null };

type PaymentStatus = "created" | "authorized" | "captured" | "failed" | "refunded" | "partially_refunded";

type PaymentTransaction = {
  id: string;
  bookingId: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  providerOrderId?: string | null;
  providerPaymentId?: string | null;
  failureReason?: string | null;
  createdAt: string;
};

const categoryLabels: Record<string, string> = {
  driver: "Driver",
  electrician: "Electrician",
  plumber: "Plumber",
  cleaner: "Cleaner",
  chef: "Chef",
  delivery_helper: "Delivery Helper",
  caretaker: "Caretaker",
  security_guard: "Security Guard",
  other: "Other",
};

function formatDate(value: Date | string): string {
  const date = typeof value === "string" ? new Date(value) : value;
  return date.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

function SkeletonRow() {
  return (
    <div className="flex items-center justify-between gap-3 px-4 py-3">
      <div className="space-y-1.5 flex-1">
        <div className="h-4 w-28 rounded bg-muted animate-pulse" />
        <div className="h-3 w-44 rounded bg-muted animate-pulse" />
      </div>
      <div className="h-4 w-16 rounded bg-muted animate-pulse" />
    </div>
  );
}

export default function CustomerPaymentsPage() {
  const { session } = useSession();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [payments, setPayments] = useState<PaymentTransaction[]>([]);
  const [payingBookingId, setPayingBookingId] = useState<string | null>(null);
  const [downloadingReceiptBookingId, setDownloadingReceiptBookingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setError(null);
    setLoading(true);
    try {
      const [bookingsRes, paymentsRes] = await Promise.all([
        fetch("/api/bookings", { credentials: "include" }),
        fetch("/api/payments?limit=100", { credentials: "include" }),
      ]);

      if (!bookingsRes.ok) {
        throw new Error("Could not load bookings for payments.");
      }
      if (!paymentsRes.ok) {
        throw new Error("Could not load payment transactions.");
      }

      const bookingsData = (await bookingsRes.json()) as { bookings?: Booking[] };
      const paymentsData = (await paymentsRes.json()) as { payments?: PaymentTransaction[] };
      setBookings(bookingsData.bookings ?? []);
      setPayments(paymentsData.payments ?? []);
    } catch (fetchError) {
      setError(fetchError instanceof Error ? fetchError.message : "Failed to load payments.");
      setBookings([]);
      setPayments([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchData();
  }, []);

  const completed = bookings.filter((b) => b.status === "completed");

  const capturedByBookingId = new Map(
    payments
      .filter((payment) => payment.status === "captured")
      .map((payment) => [payment.bookingId, payment]),
  );

  const latestCapturedByBookingId = new Map<string, PaymentTransaction>();
  for (const payment of [...payments].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())) {
    if (payment.status !== "captured" || latestCapturedByBookingId.has(payment.bookingId)) {
      continue;
    }

    latestCapturedByBookingId.set(payment.bookingId, payment);
  }

  const latestByBookingId = new Map<string, PaymentTransaction>();
  for (const payment of [...payments].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())) {
    if (!latestByBookingId.has(payment.bookingId)) {
      latestByBookingId.set(payment.bookingId, payment);
    }
  }

  const dueBookings = completed.filter((booking) => !capturedByBookingId.has(booking.id));
  const pending = bookings.filter((b) => b.status === "accepted" || b.status === "in_progress");

  const totalPaid = payments
    .filter((payment) => payment.status === "captured")
    .reduce((sum, payment) => sum + payment.amount, 0);
  const totalPending = pending.reduce((sum, b) => sum + (b.quotedAmount ?? 0), 0);
  const capturedPayments = [...latestCapturedByBookingId.values()];

  const startPayment = async (booking: Booking) => {
    try {
      setError(null);
      setPayingBookingId(booking.id);

      const createRes = await fetch("/api/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ bookingId: booking.id, method: "upi" }),
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
        bookingId: booking.id,
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

      await fetchData();
    } catch (paymentError) {
      setError(paymentError instanceof Error ? paymentError.message : "Payment failed.");
    } finally {
      setPayingBookingId(null);
    }
  };

  const downloadReceipt = async (bookingId: string) => {
    try {
      setError(null);
      setDownloadingReceiptBookingId(bookingId);

      const response = await fetch(`/api/bookings/${bookingId}/receipt`, {
        credentials: "include",
      });

      if (!response.ok) {
        const payload = (await response.json().catch(() => ({}))) as { message?: string };
        throw new Error(payload.message ?? "Failed to download receipt.");
      }

      const file = await response.blob();
      const url = URL.createObjectURL(file);
      const link = document.createElement("a");
      const contentDisposition = response.headers.get("content-disposition") ?? "";
      const fileNameMatch = /filename="?([^";]+)"?/i.exec(contentDisposition);

      link.href = url;
      link.download = fileNameMatch?.[1] ?? `receipt-${bookingId}.pdf`;
      link.click();
      URL.revokeObjectURL(url);
    } catch (receiptError) {
      setError(receiptError instanceof Error ? receiptError.message : "Receipt download failed.");
    } finally {
      setDownloadingReceiptBookingId(null);
    }
  };

  return (
    <main className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Payments</h1>
      <div className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold">Receipt Downloads</h2>
            <p className="text-sm text-muted-foreground">Captured payments are available as PDF receipts.</p>
          </div>
          <span className="rounded-full border border-border px-3 py-1 text-xs text-muted-foreground">
            {capturedPayments.length} ready
          </span>
        </div>

        {loading ? (
          <div className="surface-card divide-y divide-border/50">
            {[1, 2].map((i) => (
              <SkeletonRow key={i} />
            ))}
          </div>
        ) : capturedPayments.length === 0 ? (
          <div className="surface-card p-6 text-center">
            <p className="text-muted-foreground text-sm">No receipts are ready yet.</p>
          </div>
        ) : (
          <div className="surface-card divide-y divide-border/50">
            {capturedPayments.map((payment) => {
              const booking = bookings.find((item) => item.id === payment.bookingId);

              return (
                <div key={payment.id} className="flex items-center justify-between gap-3 px-4 py-3">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium">
                      {booking ? (categoryLabels[booking.categoryId] ?? booking.categoryId) : `Booking ${payment.bookingId.slice(0, 8)}`}
                    </p>
                    {booking && (
                      <p className="text-xs text-muted-foreground truncate">
                        {booking.addressLine}, {booking.city}
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground">PDF receipt is ready for download.</p>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-sm font-semibold">₹{payment.amount.toLocaleString("en-IN")}</span>
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={downloadingReceiptBookingId === payment.bookingId}
                      onClick={() => void downloadReceipt(payment.bookingId)}
                    >
                      {downloadingReceiptBookingId === payment.bookingId ? (
                        <>
                          <Loader2 className="size-3.5 animate-spin mr-1" /> Downloading
                        </>
                      ) : (
                        <>
                          <Download className="size-3.5 mr-1" /> Download PDF
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

        <p className="text-sm text-muted-foreground">View transaction status and receipts.</p>
      </div>

      {error && (
        <div className="rounded-lg border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive flex items-center gap-2">
          <AlertCircle className="size-4" />
          {error}
        </div>
      )}

      {/* Summary cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="surface-card reveal-up delay-1 p-5 space-y-1">
          <p className="text-sm text-muted-foreground">Total Paid</p>
          {loading ? (
            <Loader2 className="size-5 animate-spin text-muted-foreground" />
          ) : (
            <p className="text-3xl font-semibold text-green-600">
              ₹{totalPaid.toLocaleString("en-IN")}
            </p>
          )}
        </div>
        <div className="surface-card reveal-up delay-2 p-5 space-y-1">
          <p className="text-sm text-muted-foreground">Pending</p>
          {loading ? (
            <Loader2 className="size-5 animate-spin text-muted-foreground" />
          ) : (
            <p className="text-3xl font-semibold text-amber-600">
              ₹{totalPending.toLocaleString("en-IN")}
            </p>
          )}
        </div>
        <div className="surface-card reveal-up delay-3 p-5 space-y-1">
          <p className="text-sm text-muted-foreground">Transactions</p>
          {loading ? (
            <Loader2 className="size-5 animate-spin text-muted-foreground" />
          ) : (
            <p className="text-3xl font-semibold">{payments.length}</p>
          )}
        </div>
      </div>

      <div className="space-y-3">
        <h2 className="text-lg font-semibold">Due Payments</h2>
        {loading ? (
          <div className="surface-card divide-y divide-border/50">
            {[1, 2].map((i) => (
              <SkeletonRow key={i} />
            ))}
          </div>
        ) : dueBookings.length === 0 ? (
          <div className="surface-card p-6 text-center">
            <p className="text-muted-foreground text-sm">No due payments. You are all caught up.</p>
          </div>
        ) : (
          <div className="surface-card divide-y divide-border/50">
            {dueBookings.map((booking) => {
              const latestAttempt = latestByBookingId.get(booking.id);
              const amount = booking.finalAmount ?? booking.quotedAmount;

              return (
                <div key={booking.id} className="flex items-center justify-between gap-3 px-4 py-3">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium">
                      {categoryLabels[booking.categoryId] ?? booking.categoryId}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {booking.addressLine}, {booking.city}
                    </p>
                    {latestAttempt?.status === "failed" && latestAttempt.failureReason && (
                      <p className="text-xs text-destructive mt-1">Last attempt failed: {latestAttempt.failureReason}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-sm font-semibold">₹{amount.toLocaleString("en-IN")}</span>
                    <Button
                      size="sm"
                      disabled={payingBookingId === booking.id}
                      onClick={() => void startPayment(booking)}
                    >
                      {payingBookingId === booking.id ? (
                        <>
                          <Loader2 className="size-3.5 animate-spin mr-1" /> Processing
                        </>
                      ) : (
                        "Pay now"
                      )}
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Transaction list */}
      <div className="space-y-3">
        <h2 className="text-lg font-semibold">Transaction History</h2>

        {loading ? (
          <div className="surface-card divide-y divide-border/50">
            {[1, 2, 3].map((i) => (
              <SkeletonRow key={i} />
            ))}
          </div>
        ) : payments.length === 0 ? (
          <div className="surface-card p-10 text-center">
            <p className="text-muted-foreground text-sm">No payment transactions yet.</p>
          </div>
        ) : (
          <div className="surface-card divide-y divide-border/50">
            {[...payments]
              .sort(
                (a, b) =>
                  new Date(b.createdAt).getTime() -
                  new Date(a.createdAt).getTime(),
              )
              .map((payment) => {
                const booking = bookings.find((item) => item.id === payment.bookingId);
                const isPaid = payment.status === "captured";

                return (
                <div
                  key={payment.id}
                  className="flex items-center justify-between gap-3 px-4 py-3"
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium">
                      {booking ? (categoryLabels[booking.categoryId] ?? booking.categoryId) : `Booking ${payment.bookingId.slice(0, 8)}`}
                    </p>
                    {booking && (
                      <p className="text-xs text-muted-foreground truncate">
                        {booking.addressLine}, {booking.city}
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground">
                      {formatDate(payment.createdAt)}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-sm font-semibold">₹{payment.amount.toLocaleString("en-IN")}</span>
                    <Badge className={cn(
                      "gap-1",
                      isPaid
                        ? "bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-400"
                        : payment.status === "failed"
                          ? "bg-rose-100 text-rose-800 border-rose-200 dark:bg-rose-900/30 dark:text-rose-300"
                          : "bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300",
                    )}>
                      {isPaid ? <CheckCircle2 className="size-3" /> : null}
                      {isPaid ? "Paid" : payment.status.replaceAll("_", " ")}
                    </Badge>
                  </div>
                </div>
              )})}
          </div>
        )}
      </div>
    </main>
  );
}
