"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, ArrowRight, ArrowLeft, Sparkles, PlugZap, Wrench, Car, Utensils, Package, Heart, Shield, MapPin, CalendarDays } from "lucide-react";
import { cn } from "@/lib/utils";
import { useWebSocket } from "@/hooks/useWebsocket";
import { wsSend } from "@/lib/realtime/wsManager";

const CATEGORY_OPTIONS = [
  { value: "cleaner", label: "Cleaning", icon: Sparkles },
  { value: "electrician", label: "Electrician", icon: PlugZap },
  { value: "plumber", label: "Plumbing", icon: Wrench },
  { value: "driver", label: "Driver", icon: Car },
  { value: "chef", label: "Chef", icon: Utensils },
  { value: "delivery_helper", label: "Delivery", icon: Package },
  { value: "caretaker", label: "Babysitter", icon: Heart },
  { value: "security_guard", label: "Security Guard", icon: Shield },
];

interface BookingFormProps {
  latitude: number;
  longitude: number;
  userId?: string;
  defaultCategory?: string;
  defaultAddressLine?: string;
  defaultArea?: string;
  defaultCity?: string;
  defaultState?: string;
  defaultPostalCode?: string;
  formRef?: React.RefObject<HTMLDivElement | null>;
  onHelpersFound?: (helpers: LiveHelper[]) => void;
  onHelpersSearching?: (isSearching: boolean) => void;
  onSuccess?: (bookingId: string) => void;
}

type LiveHelper = {
  id: string;
  userId: string;
  name: string;
  category: string;
  rating: string | number | null;
  completedJobs: number;
  availability: "online" | "offline" | "busy";
  serviceCity: string | null;
  distanceKm: number | null;
  latitude?: number | null;
  longitude?: number | null;
};

export type { LiveHelper };

export function BookingForm({ latitude, longitude, userId, defaultCategory, defaultAddressLine, defaultArea, defaultCity, defaultState, defaultPostalCode, formRef, onHelpersFound, onHelpersSearching, onSuccess }: BookingFormProps) {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [categoryID, setCategoryID] = useState(defaultCategory ?? "");

  useEffect(() => {
    if (defaultCategory) setCategoryID(defaultCategory);
  }, [defaultCategory]);

  const [addressLine, setAddressLine] = useState(defaultAddressLine ?? "");
  const [area, setArea] = useState(defaultArea ?? "");
  const [city, setCity] = useState(defaultCity ?? "");
  const [state, setState] = useState(defaultState ?? "");
  const [postalCode, setPostalCode] = useState(defaultPostalCode ?? "");
  
  useEffect(() => {
    if (defaultAddressLine !== undefined) setAddressLine(defaultAddressLine);
    if (defaultArea !== undefined) setArea(defaultArea);
    if (defaultCity !== undefined) setCity(defaultCity);
    if (defaultState !== undefined) setState(defaultState);
    if (defaultPostalCode !== undefined) setPostalCode(defaultPostalCode);
  }, [defaultAddressLine, defaultArea, defaultCity, defaultState, defaultPostalCode]);

  const [quotedAmount, setQuotedAmount] = useState("");
  const [notes, setNotes] = useState("");
  const [scheduledFor, setScheduledFor] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [preferredContactMethod, setPreferredContactMethod] = useState<"call" | "sms" | "whatsapp" | "in_app">("call");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSearchingHelpers, setIsSearchingHelpers] = useState(false);
  const [liveHelpers, setLiveHelpers] = useState<LiveHelper[]>([]);
  const [searchMessage, setSearchMessage] = useState("");
  const [submittingBooking, setSubmittingBooking] = useState(false);
  const searchRequestIdRef = useRef(0);
  const parsedQuotedAmount = Number(quotedAmount || 0);
  const platformFee = parsedQuotedAmount > 0 ? Math.round(parsedQuotedAmount * 0.08) : 0;
  const estimatedTax = parsedQuotedAmount > 0 ? Math.round(parsedQuotedAmount * 0.02) : 0;
  const estimatedTotal = parsedQuotedAmount + platformFee + estimatedTax;

  useWebSocket(userId || "unknown", (msg) => {
    if (msg.type !== "event") return;

    if (msg.event === "helper_search_results") {
      const payload = msg.data as {
        requestId?: string;
        helpers?: LiveHelper[];
        message?: string;
      } | undefined;

      if (!payload) return;

      setLiveHelpers(Array.isArray(payload.helpers) ? payload.helpers : []);
      onHelpersFound?.(Array.isArray(payload.helpers) ? payload.helpers : []);
      setSearchMessage(typeof payload.message === "string" ? payload.message : "");
      setIsSearchingHelpers(false);
      onHelpersSearching?.(false);
      return;
    }

    if (msg.event === "helper_search_error") {
      const payload = msg.data as { message?: string } | undefined;
      setSearchMessage(payload?.message || "Unable to search for helpers right now.");
      setIsSearchingHelpers(false);
      onHelpersSearching?.(false);
    }
  });

  function handleNextToStep2() {
    if (!categoryID) {
      setErrors({ categoryID: "Please select a service." });
      return;
    }
    setErrors({});
    setStep(2);
  }

  function handleNextToStep3() {
    const errs: Record<string, string> = {};
    if (!addressLine.trim()) errs.addressLine = "Required";
    if (!area.trim()) errs.area = "Required";
    if (!city.trim()) errs.city = "Required";
    if (!state.trim()) errs.state = "Required";
    if (!postalCode.trim()) {
      errs.postalCode = "Required";
    } else if (!/^\d{6}$/.test(postalCode.trim())) {
      errs.postalCode = "Enter a valid 6-digit PIN code";
    }
    const parsedAmount = Number(quotedAmount);
    if (!quotedAmount || isNaN(parsedAmount) || !Number.isInteger(parsedAmount) || parsedAmount <= 0) {
      errs.quotedAmount = "Enter a positive whole amount";
    }
    if (customerPhone && !/^\+?[0-9]{10,15}$/.test(customerPhone)) {
      errs.customerPhone = "Enter a valid phone number";
    }
    
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    
    setErrors({});
    setStep(3);
    setIsSearchingHelpers(true);
    onHelpersSearching?.(true);
    setLiveHelpers([]);
    onHelpersFound?.([]);
    setSearchMessage("");
  }

  async function handleBookHelper() {
    setSubmittingBooking(true);
    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          categoryID,
          addressLine,
          area,
          city,
          state,
          postalCode,
          quotedAmount: Number(quotedAmount),
          latitude,
          longitude,
          notes,
          scheduledFor,
          customerPhone: customerPhone || undefined,
          preferredContactMethod,
        }),
      });
      if (res.status === 201) {
        const data = await res.json();
        onSuccess?.(data.booking.id);
        return;
      }

      const body = await res.json().catch(() => ({}));
      const message = typeof body?.message === "string" ? body.message : "Failed to create booking.";
      setErrors((prev) => ({ ...prev, submit: message }));
    } catch {} 
    finally {
      setSubmittingBooking(false);
    }
  }

  function setSchedulePreset(preset: "asap" | "2h" | "tomorrow") {
    const now = new Date();
    if (preset === "asap") {
      setScheduledFor("");
      return;
    }

    const next = new Date(now);
    if (preset === "2h") {
      next.setHours(next.getHours() + 2);
    }
    if (preset === "tomorrow") {
      next.setDate(next.getDate() + 1);
      next.setHours(10, 0, 0, 0);
    }
    const local = new Date(next.getTime() - next.getTimezoneOffset() * 60000)
      .toISOString()
      .slice(0, 16);
    setScheduledFor(local);
  }

  useEffect(() => {
    if (step !== 3 || !userId) return;

    const requestId = `helper_search_${Date.now()}_${searchRequestIdRef.current++}`;
    setIsSearchingHelpers(true);
    setLiveHelpers([]);
    setSearchMessage("");

    wsSend({
      type: "helper_search",
      requestId,
      categoryID,
      latitude,
      longitude,
      city,
      radiusKm: 10,
    });
  }, [step, userId, categoryID, latitude, longitude, city]);

  return (
    <div ref={formRef} className="max-w-xl mx-auto py-8">
      <div className="premium-card p-6 sm:p-8 space-y-8 animate-fade-up">
        
        {/* Tracker */}
        <div className="flex items-center gap-2 mb-2">
           {[1, 2, 3].map((s) => (
             <div key={s} className="flex-1 h-1.5 rounded-full overflow-hidden bg-muted">
               <div className={cn("h-full transition-all duration-500", step >= s ? "bg-primary" : "bg-transparent")} />
             </div>
           ))}
        </div>

        <div className="space-y-1">
          <h2 className="text-3xl font-black tracking-tight font-heading">
            {step === 1 && "What do you need?"}
            {step === 2 && "Task Details"}
            {step === 3 && "Available Professionals"}
          </h2>
          <p className="text-muted-foreground font-medium text-sm">
            {step === 1 && "Select exactly the service you require right now."}
            {step === 2 && "Provide location and budget to find exact matches."}
            {step === 3 && (isSearchingHelpers ? "Searching live helpers..." : "Helpers will receive your booking request and the first eligible acceptance will be assigned.")}
          </p>
        </div>

        {/* STEP 1 */}
        {step === 1 && (
          <div className="space-y-6 fade-up">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {CATEGORY_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => { setCategoryID(opt.value); setErrors({}); }}
                  className={cn(
                    "flex flex-col items-center justify-center gap-3 p-4 rounded-2xl border-2 transition-all duration-200 outline-none",
                    categoryID === opt.value 
                      ? "border-primary bg-primary/5 shadow-sm"
                      : "border-border bg-card hover:border-border/80 hover:bg-muted/30"
                  )}
                >
                  <opt.icon className={cn("size-6", categoryID === opt.value ? "text-primary" : "text-muted-foreground")} />
                  <span className={cn("text-xs font-bold", categoryID === opt.value ? "text-primary" : "text-foreground")}>{opt.label}</span>
                </button>
              ))}
            </div>
            {errors.categoryID && <p className="text-sm text-red-500 font-bold">{errors.categoryID}</p>}
            {errors.submit && <p className="text-sm text-red-500 font-bold">{errors.submit}</p>}
            <Button onClick={handleNextToStep2} className="w-full bg-primary text-white h-14 rounded-2xl text-lg font-black shadow-lg hover:shadow-xl transition-all mt-4">
              Continue <ArrowRight className="ml-2 size-5" />
            </Button>
          </div>
        )}

        {/* STEP 2 */}
        {step === 2 && (
          <div className="space-y-5 fade-up">
            <div className="space-y-4">
              <div className="relative">
                <MapPin className="absolute left-4 top-4 size-5 text-muted-foreground" />
                <input
                  type="text"
                  value={addressLine}
                  onChange={(e) => setAddressLine(e.target.value)}
                  placeholder="Apartment, Studio, or Floor"
                  className={cn("w-full h-14 pl-12 pr-4 bg-muted/30 border rounded-2xl text-base font-medium outline-none transition-all", errors.addressLine ? "border-red-500 focus:border-red-500" : "border-border premium-input-ring")}
                />
              </div>

              <input
                type="text"
                value={area}
                onChange={(e) => setArea(e.target.value)}
                placeholder="Area / Locality"
                className={cn("w-full h-14 px-4 bg-muted/30 border rounded-2xl text-base font-medium outline-none transition-all", errors.area ? "border-red-500" : "border-border premium-input-ring")}
              />

              <div className="grid grid-cols-2 gap-4">
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="City"
                  className={cn("w-full h-14 px-4 bg-muted/30 border rounded-2xl text-base font-medium outline-none transition-all", errors.city ? "border-red-500" : "border-border premium-input-ring")}
                />
                <div className="relative">
                  <span className="absolute left-4 top-4 font-bold text-muted-foreground">₹</span>
                  <input
                    type="number"
                    value={quotedAmount}
                    onChange={(e) => setQuotedAmount(e.target.value)}
                    placeholder="Budget"
                    className={cn("w-full h-14 pl-9 pr-4 bg-muted/30 border rounded-2xl text-base font-medium outline-none transition-all", errors.quotedAmount ? "border-red-500" : "border-border premium-input-ring")}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <input
                  type="text"
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  placeholder="State"
                  className={cn("w-full h-14 px-4 bg-muted/30 border rounded-2xl text-base font-medium outline-none transition-all", errors.state ? "border-red-500" : "border-border premium-input-ring")}
                />
                <input
                  type="text"
                  value={postalCode}
                  onChange={(e) => setPostalCode(e.target.value.replace(/[^0-9]/g, "").slice(0, 6))}
                  placeholder="PIN Code"
                  className={cn("w-full h-14 px-4 bg-muted/30 border rounded-2xl text-base font-medium outline-none transition-all", errors.postalCode ? "border-red-500" : "border-border premium-input-ring")}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <input
                  type="tel"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  placeholder="Contact phone (optional)"
                  className={cn("w-full h-14 px-4 bg-muted/30 border rounded-2xl text-base font-medium outline-none transition-all", errors.customerPhone ? "border-red-500" : "border-border premium-input-ring")}
                />

                <select
                  value={preferredContactMethod}
                  onChange={(e) => setPreferredContactMethod(e.target.value as "call" | "sms" | "whatsapp" | "in_app")}
                  className="w-full h-14 px-4 bg-muted/30 border border-border rounded-2xl text-base font-medium outline-none premium-input-ring transition-all"
                >
                  <option value="call">Preferred contact: Call</option>
                  <option value="sms">Preferred contact: SMS</option>
                  <option value="whatsapp">Preferred contact: WhatsApp</option>
                  <option value="in_app">Preferred contact: In-App</option>
                </select>
              </div>

              <div className="relative">
                <CalendarDays className="absolute left-4 top-4 size-5 text-muted-foreground" />
                <input
                  type="datetime-local"
                  value={scheduledFor}
                  onChange={(e) => setScheduledFor(e.target.value)}
                  className="w-full h-14 pl-12 pr-4 bg-muted/30 border border-border rounded-2xl text-base font-medium outline-none premium-input-ring transition-all"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <Button type="button" variant="outline" className="rounded-xl" onClick={() => setSchedulePreset("asap")}>ASAP</Button>
                <Button type="button" variant="outline" className="rounded-xl" onClick={() => setSchedulePreset("2h")}>In 2 Hours</Button>
                <Button type="button" variant="outline" className="rounded-xl" onClick={() => setSchedulePreset("tomorrow")}>Tomorrow</Button>
              </div>

              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Describe the task briefly (optional but recommended)"
                className="w-full min-h-24 px-4 py-3 bg-muted/30 border border-border rounded-2xl text-sm font-medium outline-none premium-input-ring transition-all resize-y"
                maxLength={500}
              />
              <p className="text-xs text-muted-foreground text-right">{notes.length}/500</p>

              {(errors.addressLine || errors.area || errors.city || errors.state || errors.postalCode || errors.quotedAmount || errors.customerPhone) && (
                <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
                  {errors.addressLine || errors.area || errors.city || errors.state || errors.postalCode || errors.quotedAmount || errors.customerPhone}
                </div>
              )}

              {parsedQuotedAmount > 0 && (
                <div className="rounded-2xl border border-primary/20 bg-primary/5 p-4 space-y-2">
                  <p className="text-xs font-bold uppercase tracking-wide text-primary">Estimated Price Breakdown</p>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Service Budget</span>
                    <span className="font-semibold">Rs. {parsedQuotedAmount}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Platform Fee</span>
                    <span className="font-semibold">Rs. {platformFee}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Taxes</span>
                    <span className="font-semibold">Rs. {estimatedTax}</span>
                  </div>
                  <div className="border-t pt-2 flex items-center justify-between">
                    <span className="font-bold">Estimated Total</span>
                    <span className="font-black text-lg text-primary">Rs. {estimatedTotal}</span>
                  </div>
                </div>
              )}
            </div>

            <div className="flex gap-3 pt-4">
              <Button onClick={() => setStep(1)} variant="outline" className="h-14 px-6 rounded-2xl border-border font-bold shadow-sm">
                <ArrowLeft className="size-5" />
              </Button>
              <Button onClick={handleNextToStep3} className="flex-1 bg-accent hover:bg-accent/90 text-white h-14 rounded-2xl text-lg font-black shadow-lg hover:shadow-xl transition-all">
                Find Professionals
              </Button>
            </div>
          </div>
        )}

        {/* STEP 3 */}
        {step === 3 && (
          <div className="space-y-6 fade-up min-h-75">
            {isSearchingHelpers ? (
              <div className="flex flex-col items-center justify-center py-12 space-y-4">
                 <div className="relative flex items-center justify-center">
                   <div className="size-20 rounded-full border-4 border-muted border-t-primary animate-spin" />
                   <Sparkles className="size-5 text-primary absolute animate-pulse" />
                 </div>
                 <p className="font-bold animate-pulse text-muted-foreground">Connecting to live helper network...</p>
              </div>
            ) : (
              <div className="space-y-4">
                {searchMessage && (
                  <div className="rounded-2xl border border-border bg-muted/30 px-4 py-3 text-sm font-medium text-muted-foreground">
                    {searchMessage}
                  </div>
                )}

                <div className="rounded-2xl border border-border bg-card p-5 space-y-3 shadow-sm">
                  {liveHelpers.length > 0 ? (
                    <>
                      <p className="text-sm text-muted-foreground">Live availability check</p>
                      <p className="text-2xl font-black text-foreground">
                        {liveHelpers.length} helper{liveHelpers.length > 1 ? "s" : ""} online
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Your request will be sent to eligible helpers now. The first helper who accepts gets assigned.
                      </p>
                    </>
                  ) : (
                    <>
                      <p className="text-sm text-muted-foreground">Live availability check</p>
                      <p className="text-2xl font-black text-foreground">No helper online yet</p>
                      <p className="text-sm text-muted-foreground">
                        You can still place the request. Helpers coming online in your city can receive it before expiry.
                      </p>
                    </>
                  )}
                </div>

                {liveHelpers.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Top Nearby Professionals</p>
                    {liveHelpers.slice(0, 3).map((helper) => (
                      <div key={helper.id} className="rounded-xl border bg-card p-3 flex items-center justify-between">
                        <div>
                          <p className="font-semibold text-sm">{helper.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {helper.category.replace(/_/g, " ")} • {helper.completedJobs} jobs
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-muted-foreground">Rating</p>
                          <p className="font-bold">{Number(helper.rating || 0).toFixed(1)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <div className="grid gap-3 pt-2">
                  <Button onClick={handleBookHelper} disabled={submittingBooking} className="w-full bg-primary text-white h-14 rounded-2xl text-lg font-black shadow-lg hover:shadow-xl transition-all">
                    {submittingBooking ? <Loader2 className="size-5 animate-spin" /> : "Create booking"}
                  </Button>
                  <Button variant="ghost" onClick={() => setStep(2)} className="w-full text-muted-foreground font-bold hover:bg-muted/50 rounded-xl py-6">
                    Edit Details
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
