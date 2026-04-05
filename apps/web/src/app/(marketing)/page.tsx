/* eslint-disable @next/next/no-img-element */

"use client";

import Link from "next/link";
import {
  MapPin,
  Star,
  ShieldCheck,
  Zap,
  ChevronRight,
  Menu,
  CheckCircle2
} from "lucide-react";
import { Button } from "@/components/ui/button";

const SERVICES = [
  { id: "cleaner", title: "Cleaning", desc: "Deep & standard cleaning", image: "https://images.unsplash.com/photo-1581578731548-c64695cc6952?q=80&w=800&auto=format&fit=crop" },
  { id: "electrician", title: "Electrician", desc: "Repairs & installations", image: "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?q=80&w=800&auto=format&fit=crop" },
  { id: "plumber", title: "Plumber", desc: "Leaks & fittings", image: "https://images.unsplash.com/photo-1585704032915-c3400ca199e7?q=80&w=800&auto=format&fit=crop" },
  { id: "driver", title: "Driver", desc: "Hourly & daily drivers", image: "https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?q=80&w=800&auto=format&fit=crop" },
  { id: "chef", title: "Chef", desc: "Home-cooked meals", image: "https://images.unsplash.com/photo-1577219491135-ce391730fb2c?q=80&w=800&auto=format&fit=crop" },
  { id: "caretaker", title: "Babysitter", desc: "Verified caretakers", image: "https://images.unsplash.com/photo-1516627145497-ae6968895b74?q=80&w=800&auto=format&fit=crop" },
];

const STEPS = [
  { step: "1", title: "Choose a Service", desc: "Select from over 20+ verified professional categories." },
  { step: "2", title: "Get Matched Instantly", desc: "Our algorithm finds the best-rated nearby helper in seconds." },
  { step: "3", title: "Job Done", desc: "Track arrival, OTP secured start, and automatic seamless payment." },
];

export default function DozoLandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground font-sans overflow-x-hidden selection:bg-primary/20">
      
      {/* 1. PREMIUM NAVBAR */}
      <nav className="fixed top-0 inset-x-0 z-50 glass-nav transition-all duration-300">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer">
            <div className="size-10 bg-primary rounded-xl flex items-center justify-center text-white shadow-lg">
              <Zap className="size-6 fill-white" />
            </div>
            <span className="text-2xl font-black tracking-tighter text-primary">DOZO</span>
          </div>
          
          <div className="hidden md:flex items-center gap-8 font-semibold text-sm text-foreground/80">
            <Link href="#services" className="hover:text-primary transition-colors">Services</Link>
            <Link href="#how-it-works" className="hover:text-primary transition-colors">How it Works</Link>
            <Link href="/helper" className="hover:text-primary transition-colors">Become a Helper</Link>
          </div>

          <div className="flex items-center gap-4">
            <Link href="/auth/signin" className="hidden sm:block font-bold text-sm hover:text-primary transition">Log in</Link>
            <Button className="bg-foreground text-background hover:bg-foreground/90 font-bold px-6 py-5 rounded-full shadow-lg">
              Sign Up
            </Button>
            <Button variant="ghost" size="icon" className="md:hidden">
              <Menu className="size-6" />
            </Button>
          </div>
        </div>
      </nav>

      <main>
        {/* 2. HERO SECTION */}
        <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 px-6 hero-gradient overflow-hidden">
          <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
            
            <div className="space-y-8 z-10 fade-up">
              <div className="inline-flex items-center gap-2 bg-success/10 text-success px-4 py-2 rounded-full font-bold text-sm">
                <ShieldCheck className="size-4" />
                <span>100% Background Verified Providers</span>
              </div>
              
              <h1 className="text-5xl lg:text-7xl font-black tracking-tight leading-[1.1] text-balance">
                Book Trusted Helpers in <span className="text-primary relative inline-block">10 Minutes.
                  <svg className="absolute w-full h-3 -bottom-1 left-0 text-accent" viewBox="0 0 100 10" preserveAspectRatio="none"><path d="M0 5 Q 50 15 100 5" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round"/></svg>
                </span>
              </h1>
              
              <p className="text-lg lg:text-xl text-muted-foreground font-medium max-w-lg leading-relaxed text-balance">
                Fast, verified help for every task — anytime, anywhere. From deep cleaning to expert plumbing, DOZO guarantees quality.
              </p>

              <div className="bg-card p-3 rounded-3xl shadow-2xl border border-border/50 flex flex-col sm:flex-row gap-3 premium-input-ring max-w-xl">
                <div className="relative flex-1 flex items-center pl-4">
                  <MapPin className="size-5 text-muted-foreground absolute left-4" />
                  <input 
                    type="text" 
                    placeholder="Enter your delivery location..." 
                    className="w-full bg-transparent pl-8 outline-none text-base font-medium placeholder:text-muted-foreground/70 h-14"
                  />
                </div>
                <Link href="/customer/book" className="w-full sm:w-auto">
                  <Button className="w-full sm:w-auto bg-accent hover:bg-accent/90 text-white font-black text-lg h-14 px-8 rounded-2xl shadow-lg shadow-accent/20">
                    Find Helpers
                  </Button>
                </Link>
              </div>

              <div className="flex items-center gap-6 pt-4 text-sm font-bold text-muted-foreground">
                <div className="flex -space-x-3">
                  <img src="https://i.pravatar.cc/100?u=1" className="size-10 rounded-full border-2 border-background z-30" alt="user" />
                  <img src="https://i.pravatar.cc/100?u=2" className="size-10 rounded-full border-2 border-background z-20" alt="user" />
                  <img src="https://i.pravatar.cc/100?u=3" className="size-10 rounded-full border-2 border-background z-10" alt="user" />
                </div>
                <div>
                  <div className="flex items-center text-amber-500 gap-1">
                    <Star className="size-4 fill-amber-500" />
                    <span className="text-foreground tracking-tight">4.9/5 Average Rating</span>
                  </div>
                  <span className="font-medium text-xs">Based on 50,000+ bookings</span>
                </div>
              </div>
            </div>

            {/* Hero Visuals */}
            <div className="relative hidden lg:block h-[600px] w-full fade-up delay-2">
              <div className="absolute inset-0 bg-primary/5 rounded-[3rem] transform rotate-3 scale-105" />
              <img 
                src="https://images.unsplash.com/photo-1581578731548-c64695cc6952?q=80&w=1200&auto=format&fit=crop" 
                alt="DOZO Service Professional" 
                className="absolute inset-0 w-full h-full object-cover rounded-[3rem] shadow-2xl z-10"
              />
              
              {/* Floating Badge 1 */}
              <div className="absolute top-12 -left-12 bg-card p-4 rounded-2xl shadow-2xl z-20 animate-float border border-border/50 flex items-center gap-4">
                <div className="size-12 rounded-full bg-success/10 flex items-center justify-center">
                  <CheckCircle2 className="size-6 text-success" />
                </div>
                <div>
                  <p className="font-bold text-sm">Job Completed</p>
                  <p className="text-xs text-muted-foreground font-medium">Just now in Indiranagar</p>
                </div>
              </div>

              {/* Floating Badge 2 */}
              <div className="absolute bottom-20 -right-8 bg-card p-4 rounded-2xl shadow-2xl z-20 animate-float border border-border/50 flex items-center gap-4" style={{ animationDelay: '2s' }}>
                <img src="https://i.pravatar.cc/100?u=4" className="size-12 rounded-full" alt="Helper" />
                <div>
                  <p className="font-bold text-sm">Ravi Kumar</p>
                  <div className="flex items-center text-xs font-bold text-muted-foreground">
                    <Star className="size-3 fill-amber-500 text-amber-500 mr-1" /> 4.9 (Driver)
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 3. POPULAR SERVICES GRID */}
        <section id="services" className="py-24 px-6 bg-muted/30">
          <div className="max-w-7xl mx-auto space-y-12 fade-up">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
              <div className="space-y-4">
                <h2 className="text-4xl font-black tracking-tight">Popular Services</h2>
                <p className="text-muted-foreground text-lg font-medium max-w-xl">
                  Whatever you need, we have a verified professional ready to help instantly.
                </p>
              </div>
              <Button variant="link" className="text-primary font-bold text-lg p-0 hover:no-underline flex items-center group">
                See all services <ChevronRight className="ml-1 size-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {SERVICES.map((srv) => (
                <Link key={srv.id} href={`/customer/book?category=${srv.id}`} className="group block">
                  <div className="premium-card overflow-hidden">
                    <div className="h-56 overflow-hidden relative">
                      <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors z-10" />
                      <img 
                        src={srv.image} 
                        alt={srv.title} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                      />
                      <div className="absolute top-4 left-4 z-20 bg-background/90 backdrop-blur px-3 py-1 rounded-full text-xs font-bold shadow-sm">
                        ⭐ 4.8+ Rated
                      </div>
                    </div>
                    <div className="p-6">
                      <h3 className="text-2xl font-black mb-2">{srv.title}</h3>
                      <p className="text-muted-foreground font-medium mb-4">{srv.desc}</p>
                      <div className="flex items-center justify-between text-sm font-bold">
                        <span className="text-primary">Book Now</span>
                        <div className="size-8 rounded-full bg-muted flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-colors">
                          <ChevronRight className="size-4" />
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* 4. HOW DOZO WORKS */}
        <section id="how-it-works" className="py-24 px-6 relative overflow-hidden">
          <div className="max-w-7xl mx-auto space-y-16">
            <div className="text-center space-y-4 fade-up">
              <h2 className="text-4xl font-black tracking-tight">How DOZO Works</h2>
              <p className="text-muted-foreground text-lg font-medium">Get your task sorted in 3 magical steps.</p>
            </div>

            <div className="grid md:grid-cols-3 gap-12 relative fade-up delay-2">
              {/* Desktop connecting line */}
              <div className="hidden md:block absolute top-[4.5rem] left-1/6 right-1/6 h-0.5 bg-gradient-to-r from-transparent via-border to-transparent -z-10" />

              {STEPS.map((step) => (
                <div key={step.step} className="flex flex-col items-center text-center space-y-6">
                  <div className="size-20 rounded-[2rem] bg-card border border-border shadow-xl flex items-center justify-center text-3xl font-black text-primary relative">
                    {step.step}
                    <div className="absolute -inset-2 bg-primary/5 rounded-[2.2rem] -z-10" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-2xl font-bold">{step.title}</h3>
                    <p className="text-muted-foreground font-medium max-w-sm mx-auto">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 5. TRUST & SAFETY */}
        <section className="py-24 px-6 bg-primary text-primary-foreground">
          <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-16 items-center">
            <div className="space-y-8 fade-up">
              <h2 className="text-4xl lg:text-5xl font-black tracking-tight leading-tight">
                Your Safety is our <br/> Highest Priority.
              </h2>
              <ul className="space-y-6">
                {[
                  "100% Background and Identity Checked",
                  "Verified Skill Assessments",
                  "Real-time GPS Tracking during Jobs",
                  "24/7 Dedicated Customer Support"
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-4">
                    <div className="size-8 rounded-full bg-success/20 flex items-center justify-center">
                      <ShieldCheck className="size-4 text-success-foreground" />
                    </div>
                    <span className="font-bold text-lg">{item}</span>
                  </li>
                ))}
              </ul>
              <Button className="bg-white text-primary hover:bg-neutral-100 font-black text-lg h-14 px-8 rounded-2xl">
                Learn about Safety
              </Button>
            </div>
            
            <div className="relative h-[500px] w-full fade-up delay-2 hidden md:block">
               <img 
                 src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=800&auto=format&fit=crop" 
                 alt="Trust and Safety" 
                 className="absolute inset-0 w-full h-full object-cover rounded-[3rem] shadow-2xl"
               />
            </div>
          </div>
        </section>

      </main>

      {/* 6. UBER-STYLE FOOTER */}
      <footer className="bg-foreground text-background py-16 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-12">
          <div className="col-span-2 md:col-span-1 space-y-6">
            <div className="flex items-center gap-2">
              <Zap className="size-6 fill-white" />
              <span className="text-2xl font-black tracking-tighter">DOZO</span>
            </div>
            <p className="text-sm text-neutral-400 font-medium max-w-xs">
              Help in 10 Minutes. The most reliable on-demand service marketplace.
            </p>
          </div>
          
          <div className="space-y-4">
            <h4 className="font-bold text-lg">Company</h4>
            <div className="flex flex-col gap-3 text-sm text-neutral-400 font-medium">
              <Link href="#" className="hover:text-white transition-colors">About Us</Link>
              <Link href="#" className="hover:text-white transition-colors">Careers</Link>
              <Link href="#" className="hover:text-white transition-colors">Blog</Link>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="font-bold text-lg">Services</h4>
            <div className="flex flex-col gap-3 text-sm text-neutral-400 font-medium">
              <Link href="#" className="hover:text-white transition-colors">Cleaning</Link>
              <Link href="#" className="hover:text-white transition-colors">Handyman</Link>
              <Link href="#" className="hover:text-white transition-colors">Drivers</Link>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="font-bold text-lg">Support</h4>
            <div className="flex flex-col gap-3 text-sm text-neutral-400 font-medium">
              <Link href="#" className="hover:text-white transition-colors">Help Center</Link>
              <Link href="#" className="hover:text-white transition-colors">Trust & Safety</Link>
              <Link href="#" className="hover:text-white transition-colors">Contact Us</Link>
            </div>
          </div>
        </div>
        
        <div className="max-w-7xl mx-auto mt-16 pt-8 border-t border-neutral-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-medium text-neutral-500">
          <p>© 2026 DOZO Technologies Inc.</p>
          <div className="flex gap-6">
            <Link href="#" className="hover:text-white transition-colors">Privacy</Link>
            <Link href="#" className="hover:text-white transition-colors">Terms</Link>
            <Link href="#" className="hover:text-white transition-colors">Accessibility</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
