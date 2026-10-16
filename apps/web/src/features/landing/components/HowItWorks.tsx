"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  Search,
  Cpu,
  CheckCircle2,
  ArrowRight,
  Zap,
  ShieldCheck,
  Star,
  MapPin,
  Clock,
  Navigation,
  Phone,
  MessageSquare,
  Sparkles,
  CreditCard,
  Check,
  Bike,
} from "lucide-react";
import { Button } from "@repo/ui/components/ui/button";

const STEPS = [
  {
    number: "01",
    stepIndex: 1,
    icon: MapPin,
    title: "1. Enter Your Location",
    shortTitle: "Pin Location",
    description:
      "Pin your exact address or let GPS auto-detect. We instantly locate active, verified DOZO professionals within a 3 km radius.",
    badge: "Instant GPS Pin",
    color: "from-blue-500 to-indigo-600",
    lightColor: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
    accentColor: "text-blue-600 dark:text-blue-400",
    ringColor: "border-blue-500/30",
  },
  {
    number: "02",
    stepIndex: 2,
    icon: Search,
    title: "2. Choose Your Service",
    shortTitle: "Select Task",
    description:
      "Pick from 23+ home categories or describe your custom task. View transparent, upfront pricing with zero hidden fees before you book.",
    badge: "Upfront Pricing",
    color: "from-amber-500 to-orange-600",
    lightColor: "bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20",
    accentColor: "text-orange-600 dark:text-orange-400",
    ringColor: "border-orange-500/30",
  },
  {
    number: "03",
    stepIndex: 3,
    icon: Cpu,
    title: "3. Instant Smart Matching",
    shortTitle: "Smart Match",
    description:
      "Our AI dispatch engine pairs you with the highest-rated nearby professional in under 60 seconds based on skill, rating, and proximity.",
    badge: "< 60s Dispatch",
    color: "from-violet-500 to-purple-600",
    lightColor: "bg-violet-500/10 text-violet-600 dark:text-violet-400 border-violet-500/20",
    accentColor: "text-violet-600 dark:text-violet-400",
    ringColor: "border-violet-500/30",
  },
  {
    number: "04",
    stepIndex: 4,
    icon: CheckCircle2,
    title: "4. Job Done & Cashless Pay",
    shortTitle: "Done & Pay",
    description:
      "Track your helper's live arrival on the map. After the job is completed to your 100% satisfaction, pay effortlessly via UPI, card, or cash.",
    badge: "100% Guaranteed",
    color: "from-emerald-500 to-teal-600",
    lightColor: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
    accentColor: "text-emerald-600 dark:text-emerald-400",
    ringColor: "border-emerald-500/30",
  },
];

export function HowItWorks() {
  const [activeStep, setActiveStep] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Auto-cycle through the 4 steps every 4 seconds unless paused
  useEffect(() => {
    if (isPaused) return;

    intervalRef.current = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % STEPS.length);
    }, 4000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isPaused]);

  const handleStepClick = (idx: number) => {
    setActiveStep(idx);
    setIsPaused(true);
    if (intervalRef.current) clearInterval(intervalRef.current);
  };

  const currentStep = STEPS[activeStep]!;

  return (
    <section
      id="how-it-works"
      className="scroll-mt-24 py-24 px-4 sm:px-6 border-y border-border bg-background/50 relative overflow-hidden"
    >
      {/* Background ambient accents */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[350px] bg-orange-500/5 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-72 h-72 bg-blue-500/5 blur-[100px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto relative">
        {/* Section Header */}
        <div className="text-center mb-16 space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-600 dark:text-orange-400 text-xs font-black uppercase tracking-wider">
            <Zap className="size-3.5 fill-current" />
            Simple 4-Step Process
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-foreground">
            How DOZO Works
          </h2>
          <p className="text-base sm:text-lg text-muted-foreground font-medium max-w-2xl mx-auto">
            From emergency repair to daily home help, get a verified professional at your doorstep in under 10 minutes.
          </p>
        </div>

        {/* 2-Column: Timeline Steps on Left, Interactive Phone Mockup on Right */}
        <div className="grid lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          {/* LEFT: 4 Timeline Steps */}
          <div className="lg:col-span-7 space-y-4 relative">
            {/* Vertical connecting line */}
            <div className="hidden sm:block absolute left-8 top-10 bottom-10 w-0.5 bg-gradient-to-b from-blue-500 via-orange-500 to-emerald-500 opacity-20 -z-0" />

            {STEPS.map((step, idx) => {
              const Icon = step.icon;
              const isActive = activeStep === idx;
              const isPast = activeStep > idx;

              return (
                <div
                  key={step.number}
                  role="button"
                  tabIndex={0}
                  onClick={() => handleStepClick(idx)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      handleStepClick(idx);
                    }
                  }}
                  className={`w-full text-left rounded-2xl border p-5 sm:p-6 transition-all duration-300 cursor-pointer relative z-10 group outline-none focus-visible:ring-2 focus-visible:ring-orange-500 ${
                    isActive
                      ? "border-orange-500/40 bg-card shadow-lg shadow-orange-500/5 -translate-y-0.5"
                      : "border-border/80 bg-card/60 hover:border-border hover:bg-card hover:shadow-xs"
                  }`}
                >
                  <div className="flex items-start gap-4 sm:gap-5">
                    {/* Step Number & Icon Indicator */}
                    <div className="relative shrink-0">
                      <div
                        className={`size-12 sm:size-14 rounded-2xl border flex items-center justify-center font-black transition-all duration-300 ${
                          isActive
                            ? `${step.lightColor} ring-4 ${step.ringColor} shadow-sm scale-105`
                            : isPast
                              ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/30"
                              : "bg-muted/50 text-muted-foreground border-border"
                        }`}
                      >
                        {isPast ? (
                          <Check className="size-6 text-emerald-600 dark:text-emerald-400 stroke-[3]" />
                        ) : (
                          <Icon className="size-6" strokeWidth={2.2} />
                        )}
                      </div>

                      {/* Small number pill */}
                      <span
                        className={`absolute -top-1.5 -right-1.5 text-[10px] font-black px-1.5 py-0.2 rounded-full border shadow-xs ${
                          isActive
                            ? "bg-foreground text-background border-foreground"
                            : "bg-muted text-muted-foreground border-border"
                        }`}
                      >
                        {step.number}
                      </span>
                    </div>

                    {/* Step Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <div className="flex items-center gap-2">
                          <h3
                            className={`font-black text-base sm:text-lg transition-colors ${
                              isActive ? "text-foreground" : "text-muted-foreground group-hover:text-foreground"
                            }`}
                          >
                            {step.title}
                          </h3>
                        </div>
                        <span
                          className={`hidden sm:inline-flex text-[11px] font-bold px-2 py-0.5 rounded-full border shrink-0 ${
                            isActive
                              ? "bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20 font-black"
                              : "bg-muted/40 text-muted-foreground border-border/60"
                          }`}
                        >
                          {step.badge}
                        </span>
                      </div>

                      <p
                        className={`text-sm leading-relaxed transition-all duration-300 font-medium ${
                          isActive
                            ? "text-muted-foreground"
                            : "text-muted-foreground/70 group-hover:text-muted-foreground"
                        }`}
                      >
                        {step.description}
                      </p>

                      {/* Animated Progress bar on active item */}
                      {isActive && !isPaused && (
                        <div className="mt-4 h-1 w-full bg-muted rounded-full overflow-hidden">
                          <div
                            key={activeStep}
                            className={`h-full rounded-full bg-gradient-to-r ${step.color}`}
                            style={{
                              animation: "hiw-progress 4s linear forwards",
                            }}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* RIGHT: Interactive Phone Mockup Preview */}
          <div className="lg:col-span-5 flex justify-center">
            <div className="relative w-full max-w-[340px]">
              {/* Phone Outer Chassis */}
              <div className="relative bg-card rounded-[42px] border-4 border-foreground/15 dark:border-border/80 shadow-2xl overflow-hidden aspect-[9/18.5] flex flex-col">
                {/* Dynamic Island / Notch */}
                <div className="w-full pt-3 pb-2 flex justify-center items-center bg-card z-20 shrink-0">
                  <div className="w-24 h-5 bg-foreground/90 rounded-full flex items-center justify-between px-2.5">
                    <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[9px] font-bold text-background tracking-tighter">DOZO LIVE</span>
                  </div>
                </div>

                {/* Phone App Header */}
                <div className="px-5 py-2.5 border-b border-border/60 flex items-center justify-between bg-card shrink-0">
                  <div className="flex items-center gap-2">
                    <div className="size-6 rounded-lg bg-orange-500 text-white flex items-center justify-center font-black text-xs">
                      D
                    </div>
                    <div>
                      <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider leading-none">
                        Location
                      </p>
                      <p className="text-xs font-bold text-foreground leading-tight truncate max-w-[150px]">
                        HSR Layout, Bengaluru
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-[11px] font-black text-emerald-600 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                    <span className="size-1.5 rounded-full bg-emerald-500 animate-ping" />
                    Live
                  </div>
                </div>

                {/* Phone Screen Dynamic Body based on activeStep */}
                <div className="p-4 flex-1 flex flex-col justify-between overflow-hidden bg-background/50">
                  {/* STEP 0: LOCATION PINNING */}
                  {activeStep === 0 && (
                    <div className="space-y-3 flex-1 flex flex-col justify-between animate-in fade-in zoom-in-95 duration-300">
                      <div className="relative h-44 rounded-2xl bg-muted/60 border border-border/80 overflow-hidden flex items-center justify-center">
                        {/* Map Grid Pattern */}
                        <div
                          className="absolute inset-0 opacity-20"
                          style={{
                            backgroundImage:
                              "radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)",
                            backgroundSize: "16px 16px",
                          }}
                        />

                        {/* Radar Pulse */}
                        <div className="relative flex items-center justify-center">
                          <span className="absolute size-28 rounded-full bg-blue-500/15 animate-ping" />
                          <span className="absolute size-18 rounded-full bg-blue-500/25" />
                          <div className="size-10 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-lg shadow-blue-500/30 z-10">
                            <MapPin className="size-5" />
                          </div>
                        </div>

                        {/* Floating Marker Badge */}
                        <div className="absolute bottom-2.5 left-2.5 right-2.5 bg-card/90 backdrop-blur-md rounded-xl p-2 border border-border/80 text-[11px] flex items-center justify-between shadow-xs">
                          <div className="flex items-center gap-1.5 font-bold text-foreground">
                            <Navigation className="size-3.5 text-blue-500" />
                            <span>8 Helpers nearby</span>
                          </div>
                          <span className="text-emerald-600 font-bold bg-emerald-500/10 px-1.5 py-0.5 rounded text-[10px]">
                            &lt; 4m away
                          </span>
                        </div>
                      </div>

                      <div className="bg-card rounded-2xl border border-border/80 p-3.5 space-y-2 shadow-xs">
                        <p className="text-[10px] font-black text-muted-foreground uppercase tracking-wider">
                          Pickup Address
                        </p>
                        <p className="text-xs font-bold text-foreground leading-snug">
                          Flat 402, Lotus Orchid, 14th Main Rd, Sector 4, HSR Layout
                        </p>
                        <div className="pt-2 border-t border-border/60 flex items-center justify-between text-[11px] font-bold text-blue-600">
                          <span>Auto-detected via GPS</span>
                          <span className="text-emerald-600">✓ Accurate</span>
                        </div>
                      </div>

                      <div className="w-full py-2.5 rounded-xl bg-blue-600 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-blue-500/20">
                        Confirm Location <ArrowRight className="size-3.5" />
                      </div>
                    </div>
                  )}

                  {/* STEP 1: CHOOSE SERVICE */}
                  {activeStep === 1 && (
                    <div className="space-y-3 flex-1 flex flex-col justify-between animate-in fade-in zoom-in-95 duration-300">
                      <div className="space-y-2">
                        <div className="bg-card rounded-xl border border-border/80 px-3 py-2 flex items-center gap-2 text-xs text-muted-foreground shadow-xs">
                          <Search className="size-3.5 text-orange-500" />
                          <span className="font-medium">Search e.g. electrician, cleaner</span>
                        </div>
                        <p className="text-[10px] font-black text-muted-foreground uppercase tracking-wider px-1">
                          Popular Services
                        </p>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div className="p-2.5 rounded-xl border-2 border-orange-500 bg-orange-500/10 space-y-1 relative shadow-xs">
                          <span className="absolute top-1.5 right-1.5 text-[9px] font-black bg-orange-500 text-white px-1 rounded">
                            SELECTED
                          </span>
                          <span className="text-base">⚡</span>
                          <p className="text-xs font-black text-foreground">Electrical</p>
                          <p className="text-[10px] text-muted-foreground font-semibold">From ₹199</p>
                        </div>

                        <div className="p-2.5 rounded-xl border border-border/80 bg-card space-y-1 opacity-70">
                          <span className="text-base">🚿</span>
                          <p className="text-xs font-bold text-foreground">Plumbing</p>
                          <p className="text-[10px] text-muted-foreground">From ₹149</p>
                        </div>

                        <div className="p-2.5 rounded-xl border border-border/80 bg-card space-y-1 opacity-70">
                          <span className="text-base">🧹</span>
                          <p className="text-xs font-bold text-foreground">Cleaning</p>
                          <p className="text-[10px] text-muted-foreground">From ₹399</p>
                        </div>

                        <div className="p-2.5 rounded-xl border border-border/80 bg-card space-y-1 opacity-70">
                          <span className="text-base">🍳</span>
                          <p className="text-xs font-bold text-foreground">Cook & Chef</p>
                          <p className="text-[10px] text-muted-foreground">From ₹249</p>
                        </div>
                      </div>

                      <div className="bg-card rounded-2xl border border-border/80 p-3 space-y-1 shadow-xs">
                        <div className="flex justify-between items-center text-xs">
                          <span className="font-bold text-foreground">Switch & Fan Repair</span>
                          <span className="font-black text-foreground">₹199</span>
                        </div>
                        <p className="text-[10px] text-muted-foreground">Estimated duration: 25 mins</p>
                      </div>

                      <div className="w-full py-2.5 rounded-xl bg-orange-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-orange-500/20">
                        Continue to Match <ArrowRight className="size-3.5" />
                      </div>
                    </div>
                  )}

                  {/* STEP 2: INSTANT SMART MATCH */}
                  {activeStep === 2 && (
                    <div className="space-y-3 flex-1 flex flex-col justify-between animate-in fade-in zoom-in-95 duration-300">
                      <div className="bg-violet-500/10 border border-violet-500/20 rounded-2xl p-3 flex items-center gap-2.5">
                        <div className="size-8 rounded-xl bg-violet-600 text-white flex items-center justify-center">
                          <Cpu className="size-4 animate-spin" />
                        </div>
                        <div>
                          <p className="text-[10px] font-black text-violet-700 dark:text-violet-400 uppercase tracking-wider">
                            Helper Matched!
                          </p>
                          <p className="text-xs font-bold text-foreground">Arriving in ~4 mins</p>
                        </div>
                      </div>

                      {/* Helper Card Preview */}
                      <div className="bg-card rounded-2xl border border-border/80 p-3.5 space-y-3 shadow-xs">
                        <div className="flex items-center gap-3">
                          <div className="size-12 rounded-full bg-gradient-to-tr from-orange-500 to-amber-400 flex items-center justify-center font-black text-white text-sm shadow-xs shrink-0">
                            RK
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1">
                              <p className="text-xs font-black text-foreground truncate">Rajesh Kumar</p>
                              <ShieldCheck className="size-3.5 text-emerald-500 shrink-0" />
                            </div>
                            <p className="text-[11px] text-muted-foreground font-medium">Certified Electrician</p>
                            <div className="flex items-center gap-2 mt-0.5 text-[10px] font-bold">
                              <span className="text-amber-500 flex items-center gap-0.5">
                                ★ 4.9 <span className="text-muted-foreground font-normal">(312 jobs)</span>
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Status Pills */}
                        <div className="grid grid-cols-2 gap-2 text-center text-[10px]">
                          <div className="bg-muted/60 rounded-lg p-1.5 border border-border/60">
                            <p className="text-muted-foreground font-semibold">Distance</p>
                            <p className="font-black text-foreground">1.2 km away</p>
                          </div>
                          <div className="bg-muted/60 rounded-lg p-1.5 border border-border/60">
                            <p className="text-muted-foreground font-semibold">Vehicle</p>
                            <p className="font-black text-foreground">Activa KA-01</p>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <div className="flex-1 py-2 rounded-xl bg-muted/80 text-foreground font-bold text-xs flex items-center justify-center gap-1 border border-border">
                          <Phone className="size-3" /> Call Pro
                        </div>
                        <div className="flex-1 py-2 rounded-xl bg-muted/80 text-foreground font-bold text-xs flex items-center justify-center gap-1 border border-border">
                          <MessageSquare className="size-3" /> Chat
                        </div>
                      </div>

                      <div className="w-full py-2.5 rounded-xl bg-violet-600 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-violet-500/20">
                        <Bike className="size-3.5" /> Helper En Route
                      </div>
                    </div>
                  )}

                  {/* STEP 3: JOB DONE & PAY */}
                  {activeStep === 3 && (
                    <div className="space-y-3 flex-1 flex flex-col justify-between animate-in fade-in zoom-in-95 duration-300">
                      <div className="text-center py-2 space-y-1">
                        <div className="size-12 rounded-full bg-emerald-500/15 border-2 border-emerald-500 text-emerald-600 dark:text-emerald-400 mx-auto flex items-center justify-center shadow-xs">
                          <CheckCircle2 className="size-6 stroke-[2.5]" />
                        </div>
                        <p className="text-xs font-black text-foreground">Service Completed!</p>
                        <p className="text-[10px] text-muted-foreground">Work inspected & verified</p>
                      </div>

                      <div className="bg-card rounded-2xl border border-border/80 p-3 space-y-2 shadow-xs">
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-muted-foreground font-medium">Electrical Repair</span>
                          <span className="font-bold text-foreground">₹199</span>
                        </div>
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-muted-foreground font-medium">Platform & Insurance</span>
                          <span className="font-bold text-emerald-600">FREE</span>
                        </div>
                        <div className="pt-2 border-t border-border/60 flex justify-between items-center">
                          <span className="text-xs font-black text-foreground">Total Paid</span>
                          <span className="text-sm font-black text-foreground">₹199</span>
                        </div>
                      </div>

                      {/* Payment Method pill */}
                      <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-2.5 flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <CreditCard className="size-3.5 text-emerald-600" />
                          <span className="font-bold text-foreground">UPI Payment</span>
                        </div>
                        <span className="text-emerald-600 font-black text-[10px]">PAID ✓</span>
                      </div>

                      {/* Rating stars */}
                      <div className="flex items-center justify-center gap-1.5 py-1">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star key={s} className="size-4 fill-amber-400 text-amber-400" />
                        ))}
                      </div>

                      <div className="w-full py-2.5 rounded-xl bg-emerald-600 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-emerald-500/20">
                        100% Satisfied Guarantee
                      </div>
                    </div>
                  )}
                </div>

                {/* Home Indicator */}
                <div className="w-full pb-2 flex justify-center bg-card">
                  <div className="w-28 h-1 bg-muted-foreground/30 rounded-full" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* BOTTOM CTA: Book in 10 Minutes Live Demo Banner */}
        <div className="mt-16 sm:mt-20 rounded-3xl border border-orange-500/30 bg-gradient-to-r from-orange-500/10 via-background to-amber-500/10 p-8 sm:p-10 shadow-lg text-center space-y-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 -mt-6 -mr-6 size-36 bg-orange-500/10 rounded-full blur-2xl pointer-events-none" />

          <div className="max-w-2xl mx-auto space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-500/15 text-orange-600 dark:text-orange-400 text-xs font-black uppercase tracking-wider">
              <Sparkles className="size-3.5" />
              Live in Bengaluru
            </div>
            <h3 className="text-2xl sm:text-3xl font-black text-foreground">
              Experience DOZO’s 10-Minute Service
            </h3>
            <p className="text-sm sm:text-base text-muted-foreground font-medium">
              Join over 50,000 households who never wait hours for home repairs. Verified pros are standing by right now.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/customer/book"
              className="inline-flex items-center justify-center gap-2 w-full sm:w-auto px-8 py-4 rounded-2xl bg-orange-500 hover:bg-orange-600 text-white font-black text-base shadow-lg shadow-orange-500/30 transition-all hover:scale-102 active:scale-98"
            >
              Book in 10 Minutes <ArrowRight className="size-5" />
            </Link>
            <Link
              href="/services"
              className="inline-flex items-center justify-center w-full sm:w-auto px-6 py-4 rounded-2xl font-bold text-sm border border-border bg-background hover:bg-muted/50 text-foreground transition-all"
            >
              Explore 23+ Categories
            </Link>
          </div>

          {/* Trust points */}
          <div className="pt-4 border-t border-border/60 flex flex-wrap items-center justify-center gap-4 sm:gap-8 text-xs font-bold text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <Clock className="size-3.5 text-orange-500" />
              8.4 min avg arrival
            </span>
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="size-3.5 text-emerald-500" />
              100% Police Verified
            </span>
            <span className="flex items-center gap-1.5">
              <Zap className="size-3.5 text-blue-500" />
              Zero cancellation fee
            </span>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes hiw-progress {
          from { width: 0%; }
          to { width: 100%; }
        }
      `}</style>
    </section>
  );
}
