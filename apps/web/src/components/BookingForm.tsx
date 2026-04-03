"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, ArrowRight, ArrowLeft, Sparkles, PlugZap, Wrench, Car, Utensils, Package, Heart, ShieldCheck, MapPin, CalendarDays, Star, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

const CATEGORY_OPTIONS = [
  { value: "cleaner", label: "Cleaning", icon: Sparkles },
  { value: "electrician", label: "Electrician", icon: PlugZap },
  { value: "plumber", label: "Plumbing", icon: Wrench },
  { value: "driver", label: "Driver", icon: Car },
  { value: "chef", label: "Chef", icon: Utensils },
  { value: "delivery_helper", label: "Delivery", icon: Package },
  { value: "caretaker", label: "Babysitter", icon: Heart },
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

export function BookingForm({ latitude, longitude, defaultCategory, defaultAddressLine, defaultCity, formRef, onSuccess }: BookingFormProps) {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [categoryID, setCategoryID] = useState(defaultCategory ?? "");

  useEffect(() => {
    if (defaultCategory) setCategoryID(defaultCategory);
  }, [defaultCategory]);

  const [addressLine, setAddressLine] = useState(defaultAddressLine ?? "");
  const [city, setCity] = useState(defaultCity ?? "");
  
  useEffect(() => {
    if (defaultAddressLine !== undefined) setAddressLine(defaultAddressLine);
    if (defaultCity !== undefined) setCity(defaultCity);
  }, [defaultAddressLine, defaultCity]);

  const [quotedAmount, setQuotedAmount] = useState("");
  const [notes, setNotes] = useState("");
  const [scheduledFor, setScheduledFor] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSearchingHelpers, setIsSearchingHelpers] = useState(false);
  const [submittingHelperId, setSubmittingHelperId] = useState<string | null>(null);

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
    if (!city.trim()) errs.city = "Required";
    if (!quotedAmount || isNaN(Number(quotedAmount))) errs.quotedAmount = "Required";
    
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    
    setErrors({});
    setStep(3);
    setIsSearchingHelpers(true);
    setTimeout(() => setIsSearchingHelpers(false), 2000);
  }

  async function handleBookHelper(helperId: string) {
    setSubmittingHelperId(helperId);
    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ categoryID, addressLine, city, quotedAmount: Number(quotedAmount), latitude, longitude, notes, scheduledFor }),
      });
      if (res.status === 201) {
        const data = await res.json();
        onSuccess?.(data.booking.id);
      }
    } catch {} 
    finally {
      setSubmittingHelperId(null);
    }
  }

  const simulatedHelpers = [
    { id: "h1", name: "Ravi Kumar", rating: 4.9, jobs: 142, price: Number(quotedAmount) || 500, eta: "8 min" },
    { id: "h2", name: "Amit Singh", rating: 4.8, jobs: 89, price: (Number(quotedAmount) || 500) - 50, eta: "12 min" },
    { id: "h3", name: "Suresh P.", rating: 4.7, jobs: 210, price: (Number(quotedAmount) || 500), eta: "15 min" },
  ];

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
            {step === 3 && (isSearchingHelpers ? "Scanning verified pros..." : "Select your preferred professional to book.")}
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

              <div className="relative">
                <CalendarDays className="absolute left-4 top-4 size-5 text-muted-foreground" />
                <input
                  type="datetime-local"
                  value={scheduledFor}
                  onChange={(e) => setScheduledFor(e.target.value)}
                  className="w-full h-14 pl-12 pr-4 bg-muted/30 border border-border rounded-2xl text-base font-medium outline-none premium-input-ring transition-all"
                />
              </div>
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
          <div className="space-y-6 fade-up min-h-[300px]">
            {isSearchingHelpers ? (
              <div className="flex flex-col items-center justify-center py-12 space-y-4">
                 <div className="relative flex items-center justify-center">
                   <div className="size-20 rounded-full border-4 border-muted border-t-primary animate-spin" />
                   <Sparkles className="size-5 text-primary absolute animate-pulse" />
                 </div>
                 <p className="font-bold animate-pulse text-muted-foreground">Contacting local experts...</p>
              </div>
            ) : (
              <div className="space-y-4">
                {simulatedHelpers.map((helper) => (
                  <div key={helper.id} className="p-4 rounded-2xl border border-border bg-card hover:border-primary/30 transition-all flex flex-col sm:flex-row gap-4 sm:items-center justify-between shadow-sm hover:shadow-md">
                     
                     <div className="flex items-center gap-4">
                        <div className="relative">
                          <img src={`https://i.pravatar.cc/100?u=${helper.id}`} alt={helper.name} className="size-14 rounded-full object-cover border border-border" />
                          <div className="absolute -bottom-1 -right-1 bg-success text-white p-0.5 rounded-full ring-2 ring-card shadow-sm">
                             <ShieldCheck className="size-3.5" />
                          </div>
                        </div>
                        <div>
                          <h4 className="font-bold text-lg leading-tight">{helper.name}</h4>
                          <div className="flex items-center gap-3 text-xs font-bold text-muted-foreground mt-1">
                             <div className="flex items-center gap-1 text-amber-500 bg-amber-500/10 px-1.5 py-0.5 rounded-md">
                                <Star className="size-3 fill-amber-500" /> {helper.rating}
                             </div>
                             <div className="flex items-center gap-1">
                                <CheckCircle2 className="size-3" /> {helper.jobs} jobs
                             </div>
                          </div>
                        </div>
                     </div>

                     <div className="flex items-center justify-between sm:flex-col sm:items-end gap-2">
                        <div className="text-right">
                          <div className="text-xl font-black font-heading tracking-tight">₹{helper.price}</div>
                          <div className="text-[10px] uppercase font-bold text-success flex items-center justify-end gap-1">
                             <Car className="size-3" /> {helper.eta} away
                          </div>
                        </div>
                        <Button 
                          onClick={() => handleBookHelper(helper.id)}
                          disabled={submittingHelperId !== null}
                          className="bg-primary hover:bg-primary/90 text-white font-bold rounded-xl px-6 shadow-md transition-all active:scale-95 disabled:opacity-50"
                        >
                          {submittingHelperId === helper.id ? <Loader2 className="size-4 animate-spin" /> : "Hire Pro"}
                        </Button>
                     </div>
                  </div>
                ))}

                <Button variant="ghost" onClick={() => setStep(2)} className="w-full text-muted-foreground font-bold hover:bg-muted/50 rounded-xl py-6">
                  Edit Details
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
