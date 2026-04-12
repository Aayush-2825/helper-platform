"use client";

import Link from "next/link";
import {
  MapPin, Star, ShieldCheck, Menu, CheckCircle2, Lock, ArrowRight,
  Zap, Users, Clock, Phone, BadgeCheck, Award, TrendingUp, X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ServiceSection } from "@/components/ServiceSection";
import { HowItWorks } from "@/components/HowItWorks";
import { ActivityTicker } from "@/components/ActivityTicker";
import { Testimonials } from "@/components/Testimonials";
import { AppDownload } from "@/components/AppDownload";
import { CityCoverage } from "@/components/CityCoverage";
import { FAQ } from "@/components/FAQ";
import { BecomeHelper } from "@/components/BecomeHelper";
import { useState, useEffect } from "react";

const LIVE_HELPERS = [
  { name: "Priya Sharma",  skill: "Home Cleaning",  rating: "4.9", jobs: "486", eta: "3 mins", avatar: "https://randomuser.me/api/portraits/women/44.jpg" },
  { name: "Suresh Mehta",  skill: "Electrician",    rating: "4.9", jobs: "312", eta: "4 mins", avatar: "https://randomuser.me/api/portraits/men/32.jpg"   },
  { name: "Amit Verma",    skill: "Plumber",        rating: "4.8", jobs: "254", eta: "6 mins", avatar: "https://randomuser.me/api/portraits/men/68.jpg"   },
  { name: "Deepa Nair",    skill: "Deep Cleaning",  rating: "4.9", jobs: "318", eta: "5 mins", avatar: "https://randomuser.me/api/portraits/women/65.jpg" },
  { name: "Rajan Patel",   skill: "AC Repair",      rating: "4.8", jobs: "201", eta: "8 mins", avatar: "https://randomuser.me/api/portraits/men/91.jpg"   },
];

const TRUST_FEATURES = [
  {
    icon: BadgeCheck,
    title: "7-Layer Verified Helpers",
    desc: "Every helper undergoes government ID check, criminal background screening, skill assessment, and in-person interview before joining.",
    color: "text-blue-600 bg-blue-50 border-blue-100",
  },
  {
    icon: ShieldCheck,
    title: "₹5 Lakh Service Guarantee",
    desc: "Not satisfied? We'll refund your money or send a replacement helper — no questions asked. Every job is fully insured.",
    color: "text-emerald-600 bg-emerald-50 border-emerald-100",
  },
  {
    icon: Clock,
    title: "10-Minute Arrival Promise",
    desc: "Our platform guarantees a helper arrives within 10 minutes of booking. If we miss, you get your next booking free.",
    color: "text-orange-500 bg-orange-50 border-orange-100",
  },
  {
    icon: Award,
    title: "4.9★ Rated Platform",
    desc: "Across 2M+ completed jobs, DOZO maintains a 4.9 star average rating — the highest in the industry.",
    color: "text-violet-600 bg-violet-50 border-violet-100",
  },
  {
    icon: Lock,
    title: "Secure Payments",
    desc: "Pay only after the job is done. No upfront payments. All transactions are encrypted and PCI-DSS compliant.",
    color: "text-rose-500 bg-rose-50 border-rose-100",
  },
  {
    icon: Phone,
    title: "24/7 Customer Support",
    desc: "Our dedicated support team is available around the clock via chat, call, and email — whenever you need help.",
    color: "text-teal-600 bg-teal-50 border-teal-100",
  },
];

const HERO_STATS = [
  { icon: Users, value: "10,000+", label: "Verified Helpers" },
  { icon: TrendingUp, value: "2M+", label: "Jobs Completed" },
  { icon: Star, value: "4.9★", label: "Average Rating" },
  { icon: MapPin, value: "50+", label: "Cities Active" },
];

export default function DozoLandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [helperIdx, setHelperIdx] = useState(0);
  const [helperVisible, setHelperVisible] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      // Fade out
      setHelperVisible(false);
      setTimeout(() => {
        setHelperIdx((prev) => (prev + 1) % LIVE_HELPERS.length);
        setHelperVisible(true);
      }, 400);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const helper = LIVE_HELPERS[helperIdx];

  return (
    <div className="min-h-screen bg-background text-foreground font-sans overflow-x-hidden selection:bg-primary/20">

      {/* 1. NAVBAR */}
      <nav className="fixed top-0 inset-x-0 z-50 border-b border-border bg-background/80 backdrop-blur-xl h-[66px]">
        <div className="max-w-7xl mx-auto px-6 h-full flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <img
              src="/dozo-logo.svg"
              alt="DOZO"
              className="h-9 w-auto"
              onError={(e) => {
                const img = e.target as HTMLImageElement;
                img.style.display = "none";
                const span = img.nextSibling as HTMLElement;
                if (span) span.style.display = "block";
              }}
            />
            <span className="font-black text-2xl tracking-tight hidden">Dozo</span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8 font-semibold text-[14px] text-muted-foreground">
            <Link href="#services" className="hover:text-foreground transition-colors">Services</Link>
            <Link href="#how-it-works" className="hover:text-foreground transition-colors">How it Works</Link>
            <Link href="#trust" className="hover:text-foreground transition-colors">Trust & Safety</Link>
            <Link href="/about" className="hover:text-foreground transition-colors">About</Link>
          </div>

          <div className="flex items-center gap-3">

            <Link href="/helper" className="hidden lg:block font-bold text-sm text-muted-foreground hover:text-primary transition-colors mr-1">Become a Helper</Link>
            <Link href="/auth/signin" className="hidden sm:block font-bold text-sm hover:text-primary transition">Log in</Link>
            <Button className="bg-foreground text-background hover:bg-foreground/90 font-bold px-5 py-2.5 rounded-[8px] transition-all text-sm h-auto">
              Sign Up Free
            </Button>
            <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              {mobileMenuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-border bg-background px-6 py-4 space-y-3">
            {[
              ["#services", "Services"],
              ["#how-it-works", "How it Works"],
              ["#trust", "Trust & Safety"],
              ["/about", "About DOZO"],
              ["/helper", "Become a Helper"],
            ].map(([href, label]) => (
              <Link key={href} href={href} onClick={() => setMobileMenuOpen(false)} className="block py-2 font-semibold text-muted-foreground hover:text-foreground transition-colors">
                {label}
              </Link>
            ))}
          </div>
        )}
      </nav>

      <main>
        {/* 2. HERO SECTION */}
        <section className="pt-36 pb-20 lg:pt-48 lg:pb-32 px-6">
          <div className="max-w-7xl mx-auto grid lg:grid-cols-[1.1fr_0.9fr] gap-16 items-center">
            <div className="space-y-8">
              {/* Pill */}
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-50 border border-orange-100 text-orange-600 text-sm font-bold">
                <Zap className="size-3.5 fill-orange-500" />
                Help in 10 Minutes · Across 50+ Cities
              </div>

              <h1 className="text-5xl lg:text-[5.5rem] font-black tracking-tighter leading-[1.05] text-balance">
                Book Trusted Helpers in{" "}
                <span className="text-orange-500">10 Minutes.</span>
              </h1>

              <p className="text-lg lg:text-xl text-muted-foreground font-medium max-w-xl leading-relaxed">
                Fast, verified help for every task — cleaning, plumbing, driving, and 20+ more services. Zero friction, maximum reliability.
              </p>

              {/* Search / CTA */}
              <div className="bg-card p-2 rounded-[14px] border border-border shadow-sm flex flex-col sm:flex-row gap-2 max-w-xl">
                <div className="relative flex-1 flex items-center">
                  <MapPin className="size-5 text-muted-foreground absolute left-4 shrink-0" />
                  <input
                    type="text"
                    placeholder="Enter your address or locality..."
                    className="w-full bg-transparent pl-11 pr-4 outline-none text-base font-medium placeholder:text-muted-foreground h-12"
                  />
                </div>
                <Link href="/customer/book" className="w-full sm:w-auto">
                  <Button className="h-12 w-full px-8 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-[10px] text-base shadow-md shadow-orange-500/20 transition-all">
                    Book Now
                  </Button>
                </Link>
              </div>

              {/* Trust pills */}
              <div className="flex flex-wrap items-center gap-4 text-sm font-semibold text-muted-foreground">
                <div className="flex items-center gap-2"><Lock className="size-4" /> Secure Payments</div>
                <div className="flex items-center gap-2"><ShieldCheck className="size-4 text-emerald-500" /> Verified Helpers</div>
                <div className="flex items-center gap-2"><Star className="size-4 fill-amber-400 text-amber-400" /> 4.9/5 Avg Rating</div>
              </div>
            </div>

            {/* Hero Visual */}
            <div className="hidden lg:block relative">
              <div className="relative w-full aspect-[4/3] rounded-[24px] overflow-hidden border border-border shadow-2xl">
                <img src="/images/services/dozo_home_cleaning_pro_1775929072455.png" alt="DOZO professional cleaner" className="object-cover w-full h-full" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
                {/* Dynamic Cycling Helper Card */}
                <div
                  className="absolute bottom-5 left-5 right-5 bg-white/10 backdrop-blur-xl border border-white/20 rounded-[14px] p-4 shadow-xl transition-all duration-400"
                  style={{ opacity: helperVisible ? 1 : 0, transform: helperVisible ? "translateY(0px)" : "translateY(6px)", transition: "opacity 0.4s ease, transform 0.4s ease" }}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className="size-2.5 rounded-full bg-emerald-400 animate-pulse" />
                      <span className="text-white/80 text-xs font-bold uppercase tracking-wider">Helper Matched</span>
                    </div>
                    <span className="text-white text-xs font-black bg-white/10 px-2.5 py-1 rounded-full border border-white/20">ETA {helper.eta}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="relative shrink-0">
                      <img src={helper.avatar} alt={helper.name} className="size-11 rounded-full object-cover border-2 border-white/40" />
                      <div className="absolute -bottom-0.5 -right-0.5 size-4 bg-emerald-400 rounded-full border-2 border-white/30" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-bold text-sm truncate">{helper.name}</p>
                      <p className="text-white/60 text-xs font-medium">{helper.skill} · ⭐ {helper.rating} · {helper.jobs} jobs</p>
                    </div>
                    <div className="flex items-center gap-1.5 bg-white text-zinc-900 font-bold text-xs px-3 py-2 rounded-[8px] shrink-0">
                      <CheckCircle2 className="size-3.5 text-emerald-600" />
                      Confirmed
                    </div>
                  </div>
                  {/* Helper dots indicator */}
                  <div className="flex items-center justify-center gap-1.5 mt-3">
                    {LIVE_HELPERS.map((_, i) => (
                      <div key={i} className={`rounded-full transition-all duration-300 ${i === helperIdx ? "w-4 h-1.5 bg-white" : "w-1.5 h-1.5 bg-white/30"}`} />
                    ))}
                  </div>
                </div>
              </div>
              {/* Floating stat chips */}
              <div className="absolute -top-4 -right-4 bg-background border border-border rounded-[12px] px-4 py-3 shadow-lg flex items-center gap-2.5">
                <Star className="size-4 fill-amber-400 text-amber-400" />
                <div><p className="text-[11px] text-muted-foreground font-medium">Avg Rating</p><p className="font-black text-sm">4.9 / 5.0</p></div>
              </div>
              <div className="absolute -bottom-4 -left-4 bg-background border border-border rounded-[12px] px-4 py-3 shadow-lg flex items-center gap-2.5">
                <ShieldCheck className="size-4 text-emerald-500" />
                <div><p className="text-[11px] text-muted-foreground font-medium">Helpers Verified</p><p className="font-black text-sm">10,000+</p></div>
              </div>
            </div>
          </div>
        </section>

        {/* STATS BAR */}
        <section className="border-y border-border bg-muted/30 py-8 px-6">
          <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6">
            {HERO_STATS.map((s) => (
              <div key={s.label} className="flex items-center gap-4">
                <div className="size-10 rounded-[10px] bg-orange-50 border border-orange-100 flex items-center justify-center shrink-0">
                  <s.icon className="size-5 text-orange-500" strokeWidth={2} />
                </div>
                <div>
                  <p className="font-black text-xl leading-none">{s.value}</p>
                  <p className="text-xs text-muted-foreground font-semibold mt-1">{s.label}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* LIVE ACTIVITY TICKER */}
        <ActivityTicker />

        {/* 3. SERVICE SECTION */}
        <ServiceSection />

        {/* 4. HOW IT WORKS */}
        <HowItWorks />

        {/* TESTIMONIALS */}
        <Testimonials />

        {/* BECOME A HELPER */}
        <BecomeHelper />

        {/* CITY COVERAGE */}
        <CityCoverage />

        {/* FAQ */}
        <FAQ />

        {/* APP DOWNLOAD */}
        <AppDownload />

        {/* 5. TRUST & SAFETY */}
        <section id="trust" className="py-28 px-6 border-t border-border bg-muted/20">
          <div className="max-w-7xl mx-auto space-y-16">
            {/* Header */}
            <div className="text-center space-y-4 max-w-2xl mx-auto">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-700 text-sm font-bold">
                <ShieldCheck className="size-3.5" />
                Trust & Safety
              </div>
              <h2 className="text-4xl lg:text-5xl font-black tracking-tight">
                Your safety is our<br />non-negotiable.
              </h2>
              <p className="text-lg text-muted-foreground font-medium leading-relaxed">
                We've built every layer of DOZO with safety first — from helper onboarding to payment processing.
              </p>
            </div>

            {/* Features Grid */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {TRUST_FEATURES.map((f) => (
                <div key={f.title} className="bg-background rounded-[16px] border border-border p-7 space-y-5 hover:shadow-md hover:-translate-y-0.5 transition-all">
                  <div className={`size-12 rounded-[12px] border flex items-center justify-center ${f.color}`}>
                    <f.icon className="size-5" strokeWidth={2.5} />
                  </div>
                  <div>
                    <h3 className="font-bold text-[17px] mb-2">{f.title}</h3>
                    <p className="text-sm text-muted-foreground font-medium leading-relaxed">{f.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Bottom CTA */}
            <div className="bg-foreground text-background rounded-[20px] p-10 flex flex-col md:flex-row items-center justify-between gap-6">
              <div>
                <h3 className="text-2xl font-black mb-2">Ready to experience DOZO?</h3>
                <p className="text-background/60 font-medium">Join 2M+ customers who trust DOZO for their everyday needs.</p>
              </div>
              <Link href="/customer/book" className="shrink-0 inline-flex items-center gap-2 bg-background text-foreground font-bold px-8 py-4 rounded-[12px] hover:bg-background/90 transition text-base whitespace-nowrap">
                Book Now <ArrowRight className="size-5" />
              </Link>
            </div>
          </div>
        </section>

        {/* 6. FOOTER */}
        <footer className="bg-background border-t border-border pt-16 pb-8 px-6">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-16">
              <div className="col-span-2 space-y-4 pr-8">
                <img src="/dozo-logo.svg" alt="DOZO" className="h-9 w-auto" />
                <p className="text-muted-foreground font-medium text-sm leading-relaxed">
                  Help in 10 Minutes. India's most trusted on-demand service marketplace — connecting skilled helpers with people who need them.
                </p>
                <div className="flex items-center gap-3 text-xs font-semibold text-muted-foreground">
                  <span className="flex items-center gap-1.5"><ShieldCheck className="size-3.5 text-emerald-500" />ISO 27001</span>
                  <span>·</span>
                  <span className="flex items-center gap-1.5"><Lock className="size-3.5" />PCI-DSS</span>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-black text-sm uppercase tracking-wide">Company</h4>
                <div className="flex flex-col gap-3 text-muted-foreground font-medium text-sm">
                  <Link href="/about" className="hover:text-foreground transition-colors">About DOZO</Link>
                  <Link href="/careers" className="hover:text-foreground transition-colors flex items-center gap-1.5">
                    Careers <span className="px-1.5 py-0.5 text-[10px] font-black bg-orange-100 text-orange-600 rounded-full">Hiring</span>
                  </Link>
                  <Link href="/blog" className="hover:text-foreground transition-colors">Blog</Link>
                  <Link href="/about#press" className="hover:text-foreground transition-colors">Press</Link>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-black text-sm uppercase tracking-wide">Services</h4>
                <div className="flex flex-col gap-3 text-muted-foreground font-medium text-sm">
                  <Link href="#services" className="hover:text-foreground transition-colors">Home Services</Link>
                  <Link href="#services" className="hover:text-foreground transition-colors">All-Rounder Help</Link>
                  <Link href="/helper" className="hover:text-foreground transition-colors">Become a Helper</Link>
                  <Link href="#how-it-works" className="hover:text-foreground transition-colors">How it Works</Link>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-black text-sm uppercase tracking-wide">Support</h4>
                <div className="flex flex-col gap-3 text-muted-foreground font-medium text-sm">
                  <Link href="#" className="hover:text-foreground transition-colors">Help Center</Link>
                  <Link href="#trust" className="hover:text-foreground transition-colors">Trust & Safety</Link>
                  <Link href="#" className="hover:text-foreground transition-colors">Terms of Service</Link>
                  <Link href="#" className="hover:text-foreground transition-colors">Privacy Policy</Link>
                </div>
              </div>
            </div>

            <div className="border-t border-border pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground font-medium">
              <p>© {new Date().getFullYear()} DOZO Technologies Pvt. Ltd. · All rights reserved.</p>
              <div className="flex gap-6">
                <span>English (IN)</span>
                <span>₹ INR</span>
                <Link href="#" className="hover:text-foreground transition-colors">Sitemap</Link>
              </div>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}
