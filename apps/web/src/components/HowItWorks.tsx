"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Search, Cpu, CheckCircle2, ArrowRight, Zap, ShieldCheck, Star, MapPin, Clock
} from "lucide-react";
import { Button } from "@/components/ui/button";

const STEPS = [
  {
    number: "01",
    icon: Search,
    title: "Search Your Service",
    description: "Tell us what you need. Browse 23+ categories or search for any task — from plumbing to personal chef.",
    color: "from-blue-500 to-indigo-600",
    lightColor: "bg-blue-50 text-blue-600 border-blue-100",
    accentColor: "text-blue-600",
  },
  {
    number: "02",
    icon: Cpu,
    title: "Instantly Matched",
    description: "Our smart algorithm finds the best verified DOZO helper near you in seconds based on skill, rating, and proximity.",
    color: "from-violet-500 to-purple-600",
    lightColor: "bg-violet-50 text-violet-600 border-violet-100",
    accentColor: "text-violet-600",
  },
  {
    number: "03",
    icon: CheckCircle2,
    title: "Helper Arrives & Job Done",
    description: "Track your helper in real-time. They arrive within 10 minutes. Pay securely in-app after the job is complete.",
    color: "from-emerald-500 to-teal-600",
    lightColor: "bg-emerald-50 text-emerald-600 border-emerald-100",
    accentColor: "text-emerald-600",
  },
];

const HELPERS = [
  { name: "Rajesh Kumar", skill: "Electrician", eta: "4 mins", rating: "4.9", jobs: "312", avatar: "https://i.pravatar.cc/150?u=rajesh" },
  { name: "Priya Sharma", skill: "Deep Cleaning", eta: "7 mins", rating: "4.8", jobs: "198", avatar: "https://i.pravatar.cc/150?u=priya" },
  { name: "Amit Verma", skill: "Plumber", eta: "6 mins", rating: "4.9", jobs: "254", avatar: "https://i.pravatar.cc/150?u=amit" },
];

export function HowItWorks() {
  const [activeStep, setActiveStep] = useState(0);
  const [helperIndex, setHelperIndex] = useState(0);
  const [isMatching, setIsMatching] = useState(false);
  const [isMatched, setIsMatched] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Auto-cycle steps
  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % STEPS.length);
    }, 3000);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, []);

  // Matching animation
  useEffect(() => {
    const start = setTimeout(() => {
      setIsMatched(false);
      setIsMatching(true);
    }, 0);
    const t = setTimeout(() => {
      setIsMatching(false);
      setIsMatched(true);
      setHelperIndex((prev) => (prev + 1) % HELPERS.length);
    }, 1500);
    return () => {
      clearTimeout(start);
      clearTimeout(t);
    };
  }, [activeStep]);

  const helper = HELPERS[helperIndex];

  return (
    <section id="how-it-works" className="scroll-mt-24 py-28 px-6 border-y border-border bg-background overflow-hidden">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="text-center mb-20 space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/5 border border-primary/10 text-primary text-sm font-bold mb-4">
            <Zap className="size-3.5 fill-primary" />
            Simple. Fast. Reliable.
          </div>
          <h2 className="text-4xl lg:text-5xl font-black tracking-tight text-foreground">
            How DOZO Works
          </h2>
          <p className="text-lg text-muted-foreground font-medium max-w-xl mx-auto">
            From request to resolution in under 10 minutes — every time.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-16 items-center">

          {/* LEFT — Steps */}
          <div className="space-y-4">
            {STEPS.map((s, i) => {
              const Icon = s.icon;
              const isActive = activeStep === i;
              return (
                <Button
                  key={i}
                  type="button"
                  variant="ghost"
                  onClick={() => {
                    setActiveStep(i);
                    if (intervalRef.current) clearInterval(intervalRef.current);
                  }}
                  className={`h-auto w-full whitespace-normal justify-start items-start rounded-xl border p-6 transition-all duration-500 cursor-pointer group hover:scale-100 active:scale-100 ${
                    isActive
                      ? "border-primary/30 bg-primary/3 shadow-md"
                      : "border-border bg-background hover:border-border/80 hover:shadow-sm"
                  }`}
                >
                  <div className="flex items-start gap-5">
                    {/* Icon */}
                    <div className={`shrink-0 size-12 rounded-[12px] border flex items-center justify-center transition-all duration-300 ${
                      isActive ? s.lightColor : "bg-muted/50 text-muted-foreground border-border"
                    }`}>
                      <Icon className="size-5" strokeWidth={2.5} />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-1.5">
                        <span className={`text-xs font-black tracking-widest uppercase transition-colors ${
                          isActive ? s.accentColor : "text-muted-foreground/50"
                        }`}>{s.number}</span>
                        <h3 className="font-bold text-[17px] text-foreground">{s.title}</h3>
                      </div>
                      <p className={`text-sm font-medium leading-relaxed transition-all duration-300 ${
                        isActive ? "text-muted-foreground max-h-32 opacity-100" : "text-transparent max-h-0 opacity-0 overflow-hidden"
                      }`}>
                        {s.description}
                      </p>
                    </div>

                    <ArrowRight className={`size-5 shrink-0 mt-1 transition-all duration-300 ${
                      isActive ? `${s.accentColor} translate-x-0 opacity-100` : "text-muted-foreground/30 -translate-x-1 opacity-0"
                    }`} />
                  </div>

                  {/* Progress Bar */}
                  {isActive && (
                    <div className="mt-5 h-1 bg-muted rounded-full overflow-hidden">
                      <div
                        key={activeStep}
                        className={`h-full rounded-full bg-linear-to-r ${s.color} animate-progress`}
                        style={{ animation: "progress 3s linear forwards" }}
                      />
                    </div>
                  )}
                </Button>
              );
            })}
          </div>

          {/* RIGHT — Animated Live Card */}
          <div className="relative flex flex-col items-center justify-center">

            {/* Background Glow */}
            <div className="absolute inset-0 bg-linear-to-br from-primary/5 via-transparent to-violet-500/5 rounded-4xl blur-2xl" />

            <div className="relative w-full max-w-sm mx-auto space-y-4">

              {/* Status Card — Request */}
              <div className="bg-background border border-border rounded-xl p-5 shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                  <div className="size-8 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center">
                    <Search className="size-4 text-blue-600" strokeWidth={2.5} />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground font-bold uppercase tracking-wide">Service Request</p>
                    <p className="font-bold text-sm text-foreground">Electrician needed</p>
                  </div>
                  <div className="ml-auto flex items-center gap-1.5 text-[11px] font-bold text-muted-foreground">
                    <MapPin className="size-3.5" />
                    2.1 km
                  </div>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground font-medium bg-muted/50 rounded-lg px-3 py-2">
                  <Clock className="size-3.5 shrink-0" />
                  Submitted just now · Matching in progress...
                </div>
              </div>

              {/* Matching Animation Card */}
              <div className={`bg-background border rounded-xl p-5 shadow-sm transition-all duration-500 ${
                isMatched ? "border-emerald-200 bg-emerald-50/30" : "border-border"
              }`}>
                <div className="flex items-center gap-3 mb-5">
                  <div className={`size-8 rounded-lg flex items-center justify-center transition-all duration-500 ${
                    isMatched ? "bg-emerald-50 border border-emerald-100" : "bg-violet-50 border border-violet-100"
                  }`}>
                    {isMatched
                      ? <CheckCircle2 className="size-4 text-emerald-600" strokeWidth={2.5} />
                      : <Cpu className="size-4 text-violet-600 animate-pulse" strokeWidth={2.5} />
                    }
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground font-bold uppercase tracking-wide">
                      {isMatching ? "Finding best match..." : isMatched ? "Helper Matched!" : "Searching..."}
                    </p>
                    {isMatched && <p className="font-bold text-sm text-emerald-700">Confirmed & En Route</p>}
                  </div>
                </div>

                {/* Matching dots */}
                {isMatching && (
                  <div className="flex items-center justify-center gap-2 py-4">
                    {[0, 1, 2, 3, 4].map((i) => (
                      <div
                        key={i}
                        className="size-2.5 rounded-full bg-violet-400"
                        style={{ animation: `bounce 0.8s ease-in-out ${i * 0.12}s infinite alternate` }}
                      />
                    ))}
                  </div>
                )}

                {/* Matched Helper Profile */}
                {isMatched && (
                  <div className="flex items-center gap-4">
                    <div className="relative shrink-0">
                      <Image
                        src={helper.avatar}
                        alt={helper.name}
                        width={56}
                        height={56}
                        className="size-14 rounded-full object-cover border-2 border-emerald-200"
                      />
                      <div className="absolute -bottom-1 -right-1 size-5 bg-emerald-500 rounded-full flex items-center justify-center border-2 border-white">
                        <CheckCircle2 className="size-3 text-white" strokeWidth={3} />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-foreground text-[15px]">{helper.name}</p>
                      <p className="text-sm text-muted-foreground font-medium">{helper.skill}</p>
                      <div className="flex items-center gap-3 mt-1.5">
                        <div className="flex items-center gap-1 text-xs font-bold text-amber-500">
                          <Star className="size-3 fill-amber-400" />
                          {helper.rating}
                        </div>
                        <div className="flex items-center gap-1 text-xs font-bold text-muted-foreground">
                          <ShieldCheck className="size-3 text-emerald-500" />
                          Verified
                        </div>
                        <div className="flex items-center gap-1 text-xs font-bold text-muted-foreground">
                          <Clock className="size-3" />
                          ETA {helper.eta}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* CTA */}
              {isMatched && (
                <div className="bg-foreground text-background rounded-[12px] p-4 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-black">Ready to book?</p>
                    <p className="text-xs opacity-60 font-medium mt-0.5">{helper.jobs}+ jobs completed</p>
                  </div>
                  <Link
                    href="/customer/book"
                    className="flex items-center gap-2 bg-background text-foreground text-xs font-bold px-4 py-2 rounded-lg hover:bg-background/90 transition"
                  >
                    Book Now <ArrowRight className="size-3.5" />
                  </Link>
                </div>
              )}

              {/* Trust Pills */}
              <div className="flex items-center justify-center gap-3 pt-2 flex-wrap">
                {["Background Verified", "Insured", "5-Star Rated"].map((t) => (
                  <div key={t} className="flex items-center gap-1.5 text-[11px] font-bold text-muted-foreground bg-muted/60 border border-border px-3 py-1.5 rounded-full">
                    <ShieldCheck className="size-3 text-emerald-500" />
                    {t}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes progress {
          from { width: 0% }
          to { width: 100% }
        }
        @keyframes bounce {
          from { transform: translateY(0); opacity: 0.4; }
          to { transform: translateY(-8px); opacity: 1; }
        }
      `}</style>
    </section>
  );
}
