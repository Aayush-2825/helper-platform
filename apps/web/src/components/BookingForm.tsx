"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, ArrowRight } from "lucide-react";

const CATEGORY_OPTIONS = [
  { value: "driver", label: "Driver" },
  { value: "electrician", label: "Electrician" },
  { value: "plumber", label: "Plumber" },
  { value: "cleaner", label: "Cleaner" },
  { value: "chef", label: "Chef" },
  { value: "delivery_helper", label: "Delivery Helper" },
  { value: "caretaker", label: "Caretaker" },
  { value: "security_guard", label: "Security Guard" },
  { value: "other", label: "Other" },
];

interface BookingFormProps {
  latitude: number;
  longitude: number;
  defaultCategory?: string;
  defaultAddressLine?: string;
  defaultCity?: string;
  formRef?: React.RefObject<HTMLDivElement | null>;
  onSuccess?: (bookingId: string) => void;
}

interface FormErrors {
  categoryID?: string;
  addressLine?: string;
  city?: string;
  quotedAmount?: string;
}

export function BookingForm({ latitude, longitude, defaultCategory, defaultAddressLine, defaultCity, formRef, onSuccess }: BookingFormProps) {
  const [categoryID, setCategoryID] = useState(defaultCategory ?? "");

  useEffect(() => {
    if (defaultCategory) setCategoryID(defaultCategory);
  }, [defaultCategory]);
  const [addressLine, setAddressLine] = useState(defaultAddressLine ?? "");
  const [city, setCity] = useState(defaultCity ?? "");

  // Sync address/city when parent geocodes a new location
  useEffect(() => {
    if (defaultAddressLine !== undefined) setAddressLine(defaultAddressLine);
  }, [defaultAddressLine]);
  useEffect(() => {
    if (defaultCity !== undefined) setCity(defaultCity);
  }, [defaultCity]);
  const [quotedAmount, setQuotedAmount] = useState("");
  const [notes, setNotes] = useState("");
  const [scheduledFor, setScheduledFor] = useState("");
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);

  function validate(): FormErrors {
    const errs: FormErrors = {};
    if (!categoryID) errs.categoryID = "Category is required.";
    if (!addressLine.trim()) errs.addressLine = "Address line is required.";
    if (!city.trim()) errs.city = "City is required.";
    const amount = Number(quotedAmount);
    if (!quotedAmount || isNaN(amount) || !Number.isInteger(amount) || amount <= 0) {
      errs.quotedAmount = "Quoted amount must be a positive integer.";
    }
    return errs;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSuccessMessage(null);
    setApiError(null);

    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    setErrors({});

    setSubmitting(true);
    try {
      const body: Record<string, unknown> = {
        categoryID,
        addressLine,
        city,
        quotedAmount: Number(quotedAmount),
        latitude,
        longitude,
      };
      if (notes.trim()) body.notes = notes.trim();
      if (scheduledFor) body.scheduledFor = new Date(scheduledFor).toISOString();

      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(body),
      });

      if (res.status === 201) {
        const data = await res.json();
        setSuccessMessage("Booking created successfully!");
        setCategoryID("");
        setAddressLine("");
        setCity("");
        setQuotedAmount("");
        setNotes("");
        setScheduledFor("");
        onSuccess?.(data.booking.id);
      } else {
        const data = await res.json().catch(() => ({}));
        setApiError(data?.message ?? "Something went wrong. Please try again.");
      }
    } catch {
      setApiError("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div ref={formRef} className="pb-20">
      <div className="surface-card-strong border-none">
        <div className="p-6 sm:p-8 space-y-8">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-heading font-bold">Booking Details</h2>
            <div className="bg-primary/10 text-primary px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
              Step 1 of 2
            </div>
          </div>

          <form onSubmit={handleSubmit} noValidate className="space-y-6">
            {/* Category & Service Info */}
            <div className="grid gap-6 sm:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-bold text-foreground/80 ml-1" htmlFor="categoryID">
                  Service Category <span className="text-destructive">*</span>
                </label>
                <select
                  id="categoryID"
                  value={categoryID}
                  onChange={(e) => setCategoryID(e.target.value)}
                  className="h-12 w-full rounded-2xl border border-border/50 bg-card/40 px-4 py-2 text-sm font-medium focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all appearance-none"
                >
                  <option value="">Select a service</option>
                  {CATEGORY_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
                {errors.categoryID && (
                  <p className="text-xs text-destructive font-semibold ml-1">{errors.categoryID}</p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-foreground/80 ml-1" htmlFor="quotedAmount">
                  Your Budget (₹) <span className="text-destructive">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-muted-foreground">₹</span>
                  <input
                    id="quotedAmount"
                    type="number"
                    value={quotedAmount}
                    onChange={(e) => setQuotedAmount(e.target.value)}
                    placeholder="500"
                    className="h-12 w-full rounded-2xl border border-border/50 bg-card/40 pl-8 pr-4 py-2 text-sm font-medium focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all"
                  />
                </div>
                {errors.quotedAmount && (
                  <p className="text-xs text-destructive font-semibold ml-1">{errors.quotedAmount}</p>
                )}
              </div>
            </div>

            {/* Address Info */}
            <div className="space-y-4 pt-4 border-t border-border/30">
              <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-widest">Service Location</h3>
              <div className="grid gap-6 sm:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-foreground/80 ml-1" htmlFor="addressLine">
                    Street Address
                  </label>
                  <input
                    id="addressLine"
                    type="text"
                    value={addressLine}
                    onChange={(e) => setAddressLine(e.target.value)}
                    className="h-12 w-full rounded-2xl border border-border/50 bg-card/40 px-4 py-2 text-sm font-medium focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-foreground/80 ml-1" htmlFor="city">
                    City
                  </label>
                  <input
                    id="city"
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="h-12 w-full rounded-2xl border border-border/50 bg-card/40 px-4 py-2 text-sm font-medium focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all"
                  />
                </div>
              </div>
              <p className="text-[10px] text-muted-foreground bg-muted/30 px-3 py-1.5 rounded-lg inline-block">
                📍 Coordinates: {latitude.toFixed(6)}, {longitude.toFixed(6)}
              </p>
            </div>

            {/* Additional Info */}
            <div className="grid gap-6 sm:grid-cols-2 pt-4 border-t border-border/30">
               <div className="space-y-2">
                <label className="text-sm font-bold text-foreground/80 ml-1" htmlFor="scheduledFor">
                  Schedule (Optional)
                </label>
                <input
                  id="scheduledFor"
                  type="datetime-local"
                  value={scheduledFor}
                  onChange={(e) => setScheduledFor(e.target.value)}
                  className="h-12 w-full rounded-2xl border border-border/50 bg-card/40 px-4 py-2 text-sm font-medium focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-foreground/80 ml-1" htmlFor="notes">
                  Instructions
                </label>
                <textarea
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Tell us more about the task..."
                  rows={1}
                  className="h-12 w-full rounded-2xl border border-border/50 bg-card/40 px-4 py-3 text-sm font-medium focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all resize-none"
                />
              </div>
            </div>

            {/* Submit Section */}
            <div className="pt-6">
              {apiError && (
                <div className="mb-4 bg-destructive/10 text-destructive p-4 rounded-2xl text-sm font-semibold flex items-center gap-3">
                  <div className="size-2 rounded-full bg-destructive animate-pulse" />
                  {apiError}
                </div>
              )}
              {successMessage && (
                <div className="mb-4 bg-green-500/10 text-green-600 p-4 rounded-2xl text-sm font-semibold flex items-center gap-3">
                   <div className="size-2 rounded-full bg-green-500 animate-pulse" />
                  {successMessage}
                </div>
              )}

              <Button
                type="submit"
                disabled={submitting}
                className="w-full h-16 rounded-[1.5rem] text-lg font-bold shadow-2xl shadow-primary/30 transition-all hover:scale-[1.02] active:scale-95 group"
              >
                {submitting ? (
                  <Loader2 className="mr-2 size-6 animate-spin" />
                ) : (
                  <>
                    Confirm Booking
                    <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
