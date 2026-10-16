"use client";

import Link from "next/link";
import Image from "next/image";
import {
  MapPin, Star, ShieldCheck, Menu, CheckCircle2, Lock, ArrowRight,
  Zap, Users, Clock, Phone, BadgeCheck, Award, TrendingUp, X
} from "lucide-react";
import { Button } from "@repo/ui/components/ui/button";
import { Input } from "@repo/ui/components/ui/input";
import { ServiceSection } from "@features/landing/components/ServiceSection";
import { HowItWorks } from "@features/landing/components/HowItWorks";
import { ActivityTicker } from "@features/landing/components/ActivityTicker";
import { Testimonials } from "@features/landing/components/Testimonials";
import { AppDownload } from "@features/landing/components/AppDownload";
import { CityCoverage } from "@features/landing/components/CityCoverage";
import { FAQ } from "@features/landing/components/FAQ";
import { BecomeHelper } from "@features/landing/components/BecomeHelper";
import { useState, useEffect, type ChangeEvent } from "react";

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
  { icon: MapPin, value: "Delhi NCR", label: "Currently Live" },
];

export default function DozoLandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [helperIdx, setHelperIdx] = useState(0);
  const [helperVisible, setHelperVisible] = useState(true);
  const [address, setAddress] = useState("");

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
  const bookingHref = address.trim()
    ? `/customer/book?address=${encodeURIComponent(address.trim())}`
    : "/customer/book";

  return (
    <div className="min-h-screen bg-background text-foreground font-sans overflow-x-hidden selection:bg-primary/20">

      {/* 1. NAVBAR */}
      <nav className="fixed top-0 inset-x-0 z-50 border-b border-border bg-background/80 backdrop-blur-xl h-16.5">
        <div className="max-w-7xl mx-auto px-6 h-full flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <Image
              src="/dozo-logo.svg"
              alt="DOZO"
              className="h-9 w-auto"
              width={144}
              height={36}
              priority
            />
            {/* <span className="font-black text-2xl tracking-tight">Dozo</span> */}
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
            <Link href="/auth/signup">
              <Button className="bg-foreground text-background hover:bg-foreground/90 font-bold px-5 py-2.5 rounded-lg transition-all text-sm h-auto">
                Sign Up Free
              </Button>
            </Link>
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
              aria-expanded={mobileMenuOpen}
              aria-controls="mobile-nav-menu"
            >
              {mobileMenuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div id="mobile-nav-menu" className="md:hidden border-t border-border bg-background px-6 py-4 space-y-3">
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
        <section className="pt-36 pb-20 lg:pt-48 lg:pb-32 px-6 relative overflow-hidden">
          {/* Gradient background effects */}
          <div className="absolute inset-0 -z-10">
            <div className="absolute top-0 right-1/4 w-96 h-96 bg-orange-500/5 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
          </div>

          <div className="max-w-7xl mx-auto grid lg:grid-cols-[1.1fr_0.9fr] gap-16 items-center">
            <div className="space-y-8 reveal-up">
              {/* Pill */}
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-50 border border-orange-100 text-orange-600 text-sm font-bold hover:shadow-md hover:shadow-orange-500/10 transition-all cursor-default">
                <Zap className="size-3.5 fill-orange-500" />
                Help in 10 Minutes · Live in Delhi NCR
              </div>

              <h1 className="text-5xl lg:text-[5.5rem] font-black tracking-tighter leading-[1.05] text-balance">
                Book Trusted Helpers in{" "}
                <span className="text-gradient-accent">10 Minutes.</span>
              </h1>

              <p className="text-lg lg:text-xl text-muted-foreground font-medium max-w-xl leading-relaxed">
                Connect with verified professionals for home cleaning, plumbing, electrical work, and more. Pay only after the job is done.
              </p>

              {/* Address Input + CTA */}
              <div className="flex flex-col sm:flex-row gap-3 max-w-xl">
                <Input
                  type="text"
                  placeholder="Enter your address"
                  value={address}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => setAddress(e.target.value)}
                  className="flex-1 h-12 rounded-xl border-border/60 bg-background/80 text-[15px] font-medium placeholder:text-muted-foreground/50 focus-visible:ring-2 focus-visible:ring-primary/30"
                />
                <Link href={bookingHref}>
                  <Button className="w-full sm:w-auto h-12 rounded-xl bg-foreground text-background hover:bg-foreground/90 font-bold px-6 text-[15px] transition-all">
                    Book Now
                  </Button>
                </Link>
              </div>

              {/* Trust Indicators */}
              <div className="flex flex-wrap gap-6 pt-4">
                {HERO_STATS.map((stat) => (
                  <div key={stat.label} className="flex items-center gap-2">
                    <stat.icon className="size-5 text-primary" />
                    <div>
                      <p className="font-bold text-sm text-foreground">{stat.value}</p>
                      <p className="text-xs text-muted-foreground">{stat.label}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Hero Image/Visual */}
            <div className="hidden lg:block relative reveal-up delay-1">
              <div className="relative w-full aspect-4/3 rounded-3xl overflow-hidden border border-border shadow-2xl hover:shadow-2xl transition-all duration-300">
                <Image
                  src="/images/services/dozo_home_cleaning_pro_1775929072455.png"
                  alt="DOZO professional cleaner"
                  fill
                  className="object-cover"
                  priority
                />
              </div>

              {/* Floating Helper Card */}
              <div className="absolute -bottom-6 -left-8 bg-card border border-border rounded-2xl shadow-xl p-4 flex items-center gap-3 max-w-xs reveal-up delay-2">
                <div className="relative shrink-0">
                  <Image
                    src={helper.avatar}
                    alt={helper.name}
                    width={48}
                    height={48}
                    className="rounded-full object-cover"
                  />
                  <div className="absolute -bottom-1 -right-1 size-5 bg-success rounded-full border-2 border-background flex items-center justify-center">
                    <CheckCircle2 className="size-3 text-white" />
                  </div>
                </div>
                <div>
                  <h3 className="font-bold text-[15px]">{helper.name}</h3>
                  <p className="text-sm text-muted-foreground">{helper.skill}</p>
                  <div className="flex items-center gap-1 mt-1">
                    <Star className="size-3 fill-orange-500 text-orange-500" />
                    <span className="text-xs font-semibold">{helper.rating}</span>
                    <span className="text-xs text-muted-foreground">· {helper.jobs} jobs</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 3. TRUST FEATURES */}
        <section id="trust" className="py-20 px-6 bg-muted/30">
          <div className="max-w-7xl mx-auto">
            <div className="text-center space-y-4 mb-16 reveal-up">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-50 border border-orange-100 text-orange-600 text-sm font-bold">
                <ShieldCheck className="size-3.5" />
                Trust & Safety
              </div>
              <h2 className="text-4xl lg:text-5xl font-black tracking-tight">
                Your safety is our<br />non-negotiable.
              </h2>
              <p className="text-lg text-muted-foreground font-medium leading-relaxed">
                We&apos;ve built every layer of DOZO with safety first — from helper onboarding to payment processing.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {TRUST_FEATURES.map((f, i) => (
                <div key={i} className={`rounded-2xl border p-6 space-y-4 reveal-up delay-${i + 1} ${f.color}`}>
                  <div className="size-12 rounded-xl bg-background flex items-center justify-center">
                    <f.icon className="size-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-[17px] mb-2">{f.title}</h3>
                    <p className="text-sm text-muted-foreground font-medium leading-relaxed">{f.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* CTA */}
            <div className="mt-16 bg-foreground text-background rounded-2xl p-10 flex flex-col md:flex-row items-center justify-between gap-6 reveal-up">
              <div>
                <h3 className="text-2xl font-black mb-2">Ready to experience DOZO?</h3>
                <p className="text-background/60 font-medium">Join 2M+ customers who trust DOZO for their everyday needs.</p>
              </div>
              <Link href="/auth/signup">
                <Button size="lg" className="bg-background text-foreground hover:bg-background/90 font-bold rounded-xl">
                  Get Started Free
                  <ArrowRight className="ml-2 size-4" />
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* 4. SERVICES SECTION */}
        <ServiceSection />

        {/* 5. HOW IT WORKS */}
        <HowItWorks />

        {/* 6. ACTIVITY TICKER */}
        <ActivityTicker />

        {/* 7. TESTIMONIALS */}
        <Testimonials />

        {/* 8. APP DOWNLOAD */}
        <AppDownload />

        {/* 9. CITY COVERAGE */}
        <CityCoverage />

        {/* 10. FAQ */}
        <FAQ />

        {/* 11. BECOME A HELPER CTA */}
        <BecomeHelper />
      </main>

      {/* FOOTER */}
      <footer className="bg-muted/30 border-t border-border px-6 py-16">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-16">
            <div className="col-span-2 space-y-4 pr-8">
              <Image
                src="/dozo-logo.svg"
                alt="DOZO"
                width={144}
                height={36}
                className="h-9 w-auto"
              />
              <p className="text-sm text-muted-foreground font-medium leading-relaxed">
                DOZO connects you with trusted local helpers for everyday tasks. Book instant or scheduled services with verified professionals across Delhi NCR.
              </p>
            </div>

            <div className="space-y-4">
              <h4 className="font-black text-sm uppercase tracking-wide">Company</h4>
              <div className="flex flex-col gap-3 text-muted-foreground font-medium text-sm">
                <Link href="/about" className="hover:text-foreground transition-colors">About DOZO</Link>
                <Link href="/careers" className="hover:text-foreground transition-colors">Careers</Link>
                <Link href="/press" className="hover:text-foreground transition-colors">Press</Link>
                <Link href="/blog" className="hover:text-foreground transition-colors">Blog</Link>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-black text-sm uppercase tracking-wide">Services</h4>
              <div className="flex flex-col gap-3 text-muted-foreground font-medium text-sm">
                <Link href="#services" className="hover:text-foreground transition-colors">Home Services</Link>
                <Link href="/helper" className="hover:text-foreground transition-colors">Become a Helper</Link>
                <Link href="/customer/book" className="hover:text-foreground transition-colors">Book a Service</Link>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-black text-sm uppercase tracking-wide">Support</h4>
              <div className="flex flex-col gap-3 text-muted-foreground font-medium text-sm">
                <Link href="/help" className="hover:text-foreground transition-colors">Help Center</Link>
                <Link href="/privacy" className="hover:text-foreground transition-colors">Privacy Policy</Link>
                <Link href="/terms" className="hover:text-foreground transition-colors">Terms of Service</Link>
              </div>
            </div>
          </div>

          <div className="border-t border-border pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-muted-foreground font-medium">
              © 2026 DOZO. All rights reserved.
            </p>
            <div className="flex items-center gap-4">
              <Link href="/privacy" className="text-sm text-muted-foreground font-medium hover:text-foreground transition-colors">
                Privacy
              </Link>
              <Link href="/terms" className="text-sm text-muted-foreground font-medium hover:text-foreground transition-colors">
                Terms
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
