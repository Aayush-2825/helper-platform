"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, ArrowRight, ArrowLeft, Sparkles, PlugZap, Wrench, Car, Utensils, Package, Heart, Shield, MapPin } from "lucide-react";
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

const SUBCATEGORY_OPTIONS_BY_CATEGORY: Record<string, Array<{ value: string; label: string }>> = {
  driver: [
    { value: "car_driver", label: "Car Driver" },
    { value: "bike_driver", label: "Bike Driver" },
  ],
  cleaner: [
    { value: "home_cleaning", label: "Home Cleaning" },
    { value: "office_cleaning", label: "Office Cleaning" },
  ],
  chef: [{ value: "cook", label: "Cook" }],
  security_guard: [{ value: "security_night", label: "Night Guard" }],
};

interface BookingFormProps {
  latitude: number;
  longitude: number;
  userId?: string;
  defaultCategory?: string;
  defaultAddressLine?: string;
  defaultSubcategory?: string;
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

export function BookingForm({ latitude, longitude, userId, defaultCategory, defaultSubcategory, defaultAddressLine, defaultArea, defaultCity, defaultState, defaultPostalCode, formRef, onHelpersFound, onHelpersSearching, onSuccess }: BookingFormProps) {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [categoryID, setCategoryID] = useState(defaultCategory ?? "");
  const [subcategoryID, setSubcategoryID] = useState(defaultSubcategory ?? "");
  const [serviceTiming, setServiceTiming] = useState<"now" | "scheduled">("now");
  const [scheduledFor, setScheduledFor] = useState("");

  useEffect(() => {
    if (defaultCategory) setCategoryID(defaultCategory);
  }, [defaultCategory]);

  useEffect(() => {
    if (defaultSubcategory !== undefined) setSubcategoryID(defaultSubcategory);
  }, [defaultSubcategory]);

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
  const [bookingCoords, setBookingCoords] = useState({ latitude, longitude });
  const [isResolvingCoords, setIsResolvingCoords] = useState(false);
  const [coordsStatus, setCoordsStatus] = useState<"idle" | "resolved" | "fallback">("idle");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSearchingHelpers, setIsSearchingHelpers] = useState(false);
  const [liveHelpers, setLiveHelpers] = useState<LiveHelper[]>([]);
  const [searchMessage, setSearchMessage] = useState("");
  const [submittingBooking, setSubmittingBooking] = useState(false);
  const searchRequestIdRef = useRef(0);
  const activeSearchRequestIdRef = useRef<string | null>(null);
  const geocodeCacheRef = useRef<Map<string, { latitude: number; longitude: number }>>(new Map());
  const parsedQuotedAmount = Number(quotedAmount || 0);
  const platformFee = parsedQuotedAmount > 0 ? Math.round(parsedQuotedAmount * 0.08) : 0;
  const estimatedTax = parsedQuotedAmount > 0 ? Math.round(parsedQuotedAmount * 0.02) : 0;
  const estimatedTotal = parsedQuotedAmount + platformFee + estimatedTax;
  const subcategoryOptions = useMemo(() => SUBCATEGORY_OPTIONS_BY_CATEGORY[categoryID] ?? [], [categoryID]);

  useEffect(() => {
    setBookingCoords({ latitude, longitude });
  }, [latitude, longitude]);

  function buildAddressQuery() {
    return [addressLine, area, city, state, postalCode, "India"]
      .map((value) => value.trim())
      .filter(Boolean)
      .join(", ");
  }

  async function resolveCoordinatesFromAddress() {
    const query = buildAddressQuery();
    if (!query) {
      return bookingCoords;
    }

    const cached = geocodeCacheRef.current.get(query);
    if (cached) {
      setBookingCoords(cached);
      setCoordsStatus("resolved");
      return cached;
    }

    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&addressdetails=1&limit=1&countrycodes=in`;

    try {
      setIsResolvingCoords(true);
      const res = await fetch(url, { headers: { "Accept-Language": "en" } });
      const data = (await res.json()) as Array<{ lat?: string; lon?: string }>;
      const first = data[0];
      const resolvedLatitude = first?.lat != null ? Number(first.lat) : Number.NaN;
      const resolvedLongitude = first?.lon != null ? Number(first.lon) : Number.NaN;

      if (Number.isFinite(resolvedLatitude) && Number.isFinite(resolvedLongitude)) {
        const nextCoords = { latitude: resolvedLatitude, longitude: resolvedLongitude };
        geocodeCacheRef.current.set(query, nextCoords);
        setBookingCoords(nextCoords);
        setCoordsStatus("resolved");
        return nextCoords;
      }
    } catch {
      // Fall back to current marker coordinates if geocoding fails.
    } finally {
      setIsResolvingCoords(false);
    }

    setCoordsStatus("fallback");

    return bookingCoords;
  }

  useEffect(() => {
    if (step !== 2) return;
    setCoordsStatus("idle");
  }, [step, addressLine, area, city, state, postalCode]);

  useEffect(() => {
    if (subcategoryOptions.length === 0) {
      if (subcategoryID) setSubcategoryID("");
      return;
    }

    if (!subcategoryOptions.some((option) => option.value === subcategoryID)) {
      setSubcategoryID(subcategoryOptions[0].value);
    }
  }, [subcategoryID, subcategoryOptions]);

  useWebSocket(userId || "unknown", (msg) => {
    if (msg.type !== "event") return;

    if (msg.event === "helper_search_results") {
      const payload = msg.data as {
        requestId?: string;
        helpers?: LiveHelper[];
        message?: string;
      } | undefined;

      if (!payload) return;
      if (payload.requestId && payload.requestId !== activeSearchRequestIdRef.current) return;

      setLiveHelpers(Array.isArray(payload.helpers) ? payload.helpers : []);
      onHelpersFound?.(Array.isArray(payload.helpers) ? payload.helpers : []);
      setSearchMessage(typeof payload.message === "string" ? payload.message : "");
      setIsSearchingHelpers(false);
      onHelpersSearching?.(false);
      return;
    }

    if (msg.event === "helper_search_error") {
      const payload = msg.data as { requestId?: string; message?: string } | undefined;
      if (payload?.requestId && payload.requestId !== activeSearchRequestIdRef.current) return;
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

  async function handleNextToStep3() {
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

    if (serviceTiming === "scheduled") {
      if (!scheduledFor.trim()) {
        errs.scheduledFor = "Choose a date and time";
      } else {
        const scheduledDate = new Date(scheduledFor);
        if (Number.isNaN(scheduledDate.getTime())) {
          errs.scheduledFor = "Choose a valid date and time";
        } else if (scheduledDate.getTime() < Date.now() + 15 * 60 * 1000) {
          errs.scheduledFor = "Scheduled time must be at least 15 minutes from now";
        }
      }
    }

    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    
    setErrors({});
    await resolveCoordinatesFromAddress();
    setStep(3);
    setLiveHelpers([]);
    onHelpersFound?.([]);

    if (serviceTiming === "scheduled") {
      setIsSearchingHelpers(false);
      onHelpersSearching?.(false);
      setSearchMessage("Scheduled booking will be matched using helper availability slots.");
      return;
    }

    setIsSearchingHelpers(true);
    onHelpersSearching?.(true);
    setSearchMessage("Searching nearby helpers...");
  }

  async function handleBookHelper() {
    setSubmittingBooking(true);
    try {
      const resolvedCoords = await resolveCoordinatesFromAddress();

      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          categoryID,
          subcategoryID: subcategoryID || undefined,
          addressLine,
          area,
          city,
          state,
          postalCode,
          quotedAmount: Number(quotedAmount),
          latitude: resolvedCoords.latitude,
          longitude: resolvedCoords.longitude,
          scheduledFor:
            serviceTiming === "scheduled" && scheduledFor.trim().length > 0
              ? new Date(scheduledFor).toISOString()
              : undefined,
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

  useEffect(() => {
    if (step !== 3) return;

    if (serviceTiming === "scheduled") {
      setIsSearchingHelpers(false);
      onHelpersSearching?.(false);
      return;
    }

    if (!userId) {
      setIsSearchingHelpers(false);
      setSearchMessage("Sign in required to search helpers.");
      return;
    }

    const requestId = `helper_search_${Date.now()}_${searchRequestIdRef.current++}`;
    activeSearchRequestIdRef.current = requestId;
    setIsSearchingHelpers(true);
    setLiveHelpers([]);
    setSearchMessage("Searching nearby helpers...");

    wsSend({
      type: "helper_search",
      requestId,
      categoryID,
      latitude: bookingCoords.latitude,
      longitude: bookingCoords.longitude,
      city,
      radiusKm: 10,
    });
  }, [step, userId, categoryID, bookingCoords.latitude, bookingCoords.longitude, city, serviceTiming, onHelpersSearching]);

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
            {step === 3 && (
              isSearchingHelpers
                ? "Searching live helpers..."
                : serviceTiming === "scheduled"
                  ? "Scheduled booking will be assigned to helpers available in that time window."
                  : "Helpers will receive your booking request and the first eligible acceptance will be assigned."
            )}
          </p>
        </div>

        {/* STEP 1 */}
        {step === 1 && (
          <div className="space-y-6 fade-up">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {CATEGORY_OPTIONS.map((opt) => (
                <button
                  type="button"
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

            {categoryID && subcategoryOptions.length > 0 && (
              <div className="space-y-2">
                <label htmlFor="booking-subcategory" className="text-sm font-semibold text-foreground">
                  Sub service
                </label>
                <select
                  id="booking-subcategory"
                  value={subcategoryID}
                  onChange={(e) => setSubcategoryID(e.target.value)}
                  className="w-full h-14 px-4 bg-muted/30 border border-border rounded-2xl text-base font-medium outline-none premium-input-ring transition-all"
                >
                  {subcategoryOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-muted-foreground">Optional sub service from the booking schema.</p>
              </div>
            )}

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
              <div className="space-y-1">
                <label htmlFor="booking-address-line" className="text-sm font-semibold text-foreground">Address line</label>
              <div className="relative">
                <MapPin className="absolute left-4 top-4 size-5 text-muted-foreground" />
                <input
                  id="booking-address-line"
                  type="text"
                  value={addressLine}
                  onChange={(e) => setAddressLine(e.target.value)}
                  placeholder="Apartment, Studio, or Floor"
                  className={cn("w-full h-14 pl-12 pr-4 bg-muted/30 border rounded-2xl text-base font-medium outline-none transition-all", errors.addressLine ? "border-red-500 focus:border-red-500" : "border-border premium-input-ring")}
                />
              </div>
              </div>

              <div className="space-y-1">
                <label htmlFor="booking-area" className="text-sm font-semibold text-foreground">Area / locality</label>
                <input
                  id="booking-area"
                  type="text"
                  value={area}
                  onChange={(e) => setArea(e.target.value)}
                  placeholder="Area / Locality"
                  className={cn("w-full h-14 px-4 bg-muted/30 border rounded-2xl text-base font-medium outline-none transition-all", errors.area ? "border-red-500" : "border-border premium-input-ring")}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label htmlFor="booking-city" className="text-sm font-semibold text-foreground">City</label>
                  <input
                    id="booking-city"
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="City"
                    className={cn("w-full h-14 px-4 bg-muted/30 border rounded-2xl text-base font-medium outline-none transition-all", errors.city ? "border-red-500" : "border-border premium-input-ring")}
                  />
                </div>
                <div className="relative">
                  <label htmlFor="booking-budget" className="sr-only">Budget in rupees</label>
                  <span className="absolute left-4 top-4 font-bold text-muted-foreground">₹</span>
                  <input
                    id="booking-budget"
                    type="number"
                    value={quotedAmount}
                    onChange={(e) => setQuotedAmount(e.target.value)}
                    placeholder="Budget"
                    className={cn("w-full h-14 pl-9 pr-4 bg-muted/30 border rounded-2xl text-base font-medium outline-none transition-all", errors.quotedAmount ? "border-red-500" : "border-border premium-input-ring")}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-sm font-semibold text-foreground">Service timing</p>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setServiceTiming("now")}
                    className={cn(
                      "h-12 rounded-2xl border text-sm font-semibold transition-all",
                      serviceTiming === "now"
                        ? "border-primary bg-primary/5 text-primary"
                        : "border-border bg-muted/30 text-foreground"
                    )}
                  >
                    Need now
                  </button>
                  <button
                    type="button"
                    onClick={() => setServiceTiming("scheduled")}
                    className={cn(
                      "h-12 rounded-2xl border text-sm font-semibold transition-all",
                      serviceTiming === "scheduled"
                        ? "border-primary bg-primary/5 text-primary"
                        : "border-border bg-muted/30 text-foreground"
                    )}
                  >
                    Schedule
                  </button>
                </div>
              </div>

              {serviceTiming === "scheduled" && (
                <div className="space-y-1">
                  <label htmlFor="booking-scheduled-for" className="text-sm font-semibold text-foreground">
                    Scheduled date and time
                  </label>
                  <input
                    id="booking-scheduled-for"
                    type="datetime-local"
                    value={scheduledFor}
                    onChange={(e) => setScheduledFor(e.target.value)}
                    className={cn(
                      "w-full h-14 px-4 bg-muted/30 border rounded-2xl text-base font-medium outline-none transition-all",
                      errors.scheduledFor ? "border-red-500" : "border-border premium-input-ring"
                    )}
                  />
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label htmlFor="booking-state" className="text-sm font-semibold text-foreground">State</label>
                  <input
                    id="booking-state"
                    type="text"
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    placeholder="State"
                    className={cn("w-full h-14 px-4 bg-muted/30 border rounded-2xl text-base font-medium outline-none transition-all", errors.state ? "border-red-500" : "border-border premium-input-ring")}
                  />
                </div>
                <div className="space-y-1">
                  <label htmlFor="booking-postal-code" className="text-sm font-semibold text-foreground">PIN code</label>
                  <input
                    id="booking-postal-code"
                    type="text"
                    value={postalCode}
                    onChange={(e) => setPostalCode(e.target.value.replace(/[^0-9]/g, "").slice(0, 6))}
                    placeholder="PIN Code"
                    className={cn("w-full h-14 px-4 bg-muted/30 border rounded-2xl text-base font-medium outline-none transition-all", errors.postalCode ? "border-red-500" : "border-border premium-input-ring")}
                  />
                </div>
              </div>

              {coordsStatus === "resolved" && (
                <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs text-emerald-700">
                  Location pinned from entered address.
                </div>
              )}

              {coordsStatus === "fallback" && (
                <div className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-700">
                  Could not pin exact address, using map location coordinates.
                </div>
              )}

                {(errors.addressLine || errors.area || errors.city || errors.state || errors.postalCode || errors.quotedAmount || errors.scheduledFor) && (
                <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
                  {errors.addressLine || errors.area || errors.city || errors.state || errors.postalCode || errors.quotedAmount || errors.scheduledFor}
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
              <Button onClick={handleNextToStep3} disabled={isResolvingCoords} className="flex-1 bg-accent hover:bg-accent/90 text-white h-14 rounded-2xl text-lg font-black shadow-lg hover:shadow-xl transition-all disabled:opacity-70">
                {isResolvingCoords ? <Loader2 className="size-5 animate-spin" /> : "Confirm & Start Searching"}
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

                <div className="rounded-2xl border border-border bg-card p-5 space-y-2 shadow-sm">
                  <p className="text-sm text-muted-foreground">Live availability check</p>
                  <p className="text-2xl font-black text-foreground">
                    {liveHelpers.length > 0
                      ? `${liveHelpers.length} helper${liveHelpers.length > 1 ? "s" : ""} online`
                      : "No helper online yet"}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {liveHelpers.length > 0
                      ? "Confirm to send this booking request to eligible helpers."
                      : "No live helpers right now. You can still create the booking request."}
                  </p>
                </div>

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
