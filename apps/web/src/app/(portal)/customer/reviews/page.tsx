"use client";

import { useEffect, useState } from "react";
import { Loader2, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Booking } from "@/components/BookingCard";

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

type SubmittedReview = {
  rating: number;
  comment: string;
};

function StarRating({
  value,
  onChange,
  readonly,
}: {
  value: number;
  onChange?: (v: number) => void;
  readonly?: boolean;
}) {
  const [hovered, setHovered] = useState(0);
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={readonly}
          onClick={() => onChange?.(star)}
          onMouseEnter={() => !readonly && setHovered(star)}
          onMouseLeave={() => !readonly && setHovered(0)}
          className="focus:outline-none disabled:cursor-default"
          aria-label={`${star} star`}
        >
          <Star
            className={`size-5 transition-colors ${
              star <= (hovered || value)
                ? "fill-amber-400 text-amber-400"
                : "fill-muted text-muted-foreground"
            }`}
          />
        </button>
      ))}
    </div>
  );
}

function ReviewCard({
  booking,
  submitted,
  onSubmit,
}: {
  booking: Booking;
  submitted?: SubmittedReview;
  onSubmit: (bookingId: string, rating: number, comment: string) => void;
}) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit() {
    if (rating === 0) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ bookingId: booking.id, rating, comment }),
      });
      if (res.ok) {
        setSuccess(true);
        onSubmit(booking.id, rating, comment);
      } else {
        const body = await res.json().catch(() => ({})) as { message?: string };
        setError(body.message ?? "Failed to submit review.");
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="surface-card p-5 space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-medium">{categoryLabels[booking.categoryId] ?? booking.categoryId}</p>
          <p className="text-xs text-muted-foreground">
            {booking.addressLine}, {booking.city}
          </p>
          <p className="text-xs text-muted-foreground">
            Completed {formatDate(booking.completedAt ?? booking.requestedAt)}
          </p>
        </div>
        <span className="text-sm font-semibold shrink-0">
          ₹{booking.quotedAmount.toLocaleString("en-IN")}
        </span>
      </div>

      {submitted ? (
        <div className="space-y-1.5">
          <StarRating value={submitted.rating} readonly />
          {submitted.comment && (
            <p className="text-sm text-muted-foreground italic">"{submitted.comment}"</p>
          )}
          <p className="text-xs text-green-600 font-medium">Review submitted</p>
        </div>
      ) : success ? (
        <p className="text-sm text-green-600 font-medium">Thanks for your feedback!</p>
      ) : (
        <div className="space-y-3">
          <div className="space-y-1">
            <p className="text-sm font-medium">Rate this job</p>
            <StarRating value={rating} onChange={setRating} />
          </div>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Share your experience (optional)…"
            rows={2}
            className="w-full border rounded-md px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring resize-none"
          />
          <Button
            size="sm"
            disabled={rating === 0 || submitting}
            onClick={handleSubmit}
          >
            {submitting ? (
              <>
                <Loader2 className="mr-2 size-3.5 animate-spin" />
                Submitting…
              </>
            ) : (
              "Submit Review"
            )}
          </Button>
          {error && <p className="text-sm text-destructive mt-2">{error}</p>}
        </div>
      )}
    </div>
  );
}

export default function CustomerReviewsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [reviews, setReviews] = useState<Record<string, SubmittedReview>>({});

  useEffect(() => {
    fetch("/api/bookings", { credentials: "include" })
      .then((res) => res.json() as Promise<{ bookings?: Booking[] }>)
      .then((data) => setBookings(data.bookings ?? []))
      .catch(() => setBookings([]))
      .finally(() => setLoading(false));
  }, []);

  const completed = [...bookings]
    .filter((b) => b.status === "completed")
    .sort(
      (a, b) =>
        new Date(b.completedAt ?? b.requestedAt).getTime() -
        new Date(a.completedAt ?? a.requestedAt).getTime(),
    );

  function handleReviewSubmit(bookingId: string, rating: number, comment: string) {
    setReviews((prev) => ({ ...prev, [bookingId]: { rating, comment } }));
  }

  return (
    <main className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Ratings &amp; Reviews</h1>
        <p className="text-sm text-muted-foreground">Review completed jobs and submit feedback.</p>
      </div>

      {loading ? (
        <div className="flex items-center gap-2 text-muted-foreground text-sm">
          <Loader2 className="size-4 animate-spin" />
          Loading…
        </div>
      ) : completed.length === 0 ? (
        <div className="surface-card p-10 text-center">
          <p className="text-muted-foreground text-sm">
            No completed bookings to review yet.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {completed.map((booking) => (
            <ReviewCard
              key={booking.id}
              booking={booking}
              submitted={reviews[booking.id]}
              onSubmit={handleReviewSubmit}
            />
          ))}
        </div>
      )}
    </main>
  );
}
