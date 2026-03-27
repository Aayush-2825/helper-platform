import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  BriefcaseBusiness,
  Building2,
  CalendarCheck2,
  Car,
  Clock3,
  MapPin,
  Paintbrush2,
  PlugZap,
  ShieldCheck,
  Sparkles,
  Users,
  Wrench,
  Bolt,
  Search,
  Zap,
  Star
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { buttonVariants } from "@/components/ui/button-variants";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";

const serviceCategories = [
  {
    title: "Home Care",
    description: "Recurring or one-time cleaning teams with quality and photo proof.",
    pulse: "Booked every 34 seconds",
    icon: Sparkles,
  },
  {
    title: "Electrical Repair",
    description: "Certified electricians for urgent breakdowns and preventive upgrades.",
    pulse: "24/7 emergency coverage",
    icon: PlugZap,
  },
  {
    title: "Painting",
    description: "Interior and exterior crews with fixed estimates and finish guarantees.",
    pulse: "Color consultancy included",
    icon: Paintbrush2,
  },
  {
    title: "Handyman",
    description: "Reliable maintenance pros for fittings, carpentry, leaks, and appliance setup.",
    pulse: "Same-day slots available",
    icon: Wrench,
  },
  {
    title: "Driver On Demand",
    description: "Professional drivers for commute support, airport trips, and full-day use.",
    pulse: "Identity-verified drivers",
    icon: Car,
  },
  {
    title: "Office Support",
    description: "Dedicated service teams for facilities, maintenance, and recurring office tasks.",
    pulse: "Built for growing teams",
    icon: BriefcaseBusiness,
  },
];

const trustStats = [
  { label: "Booked this month", value: "18.6K" },
  { label: "Verified professionals", value: "9,200+" },
  { label: "Median dispatch", value: "11 min" },
  { label: "5-star reviews", value: "96%" },
];

const dispatchQueue = [
  {
    service: "Deep cleaning",
    location: "Kharadi, Pune",
    time: "Crew assigned in 7 minutes",
    status: "In progress",
  },
  {
    service: "Office electrical check",
    location: "Indiranagar, Bengaluru",
    time: "Engineer arriving at 4:10 PM",
    status: "Scheduled",
  },
  {
    service: "Apartment repaint",
    location: "Andheri, Mumbai",
    time: "Inspection complete, quote shared",
    status: "Quoted",
  },
];

const processSteps = [
  {
    title: "Describe the task",
    description: "Share your requirement once. We convert it into a clear service brief automatically.",
  },
  {
    title: "Compare and confirm",
    description: "Review verified professionals, transparent pricing, and slots before confirming.",
  },
  {
    title: "Track live completion",
    description: "Get status updates, OTP-secured job closure, and digital invoice in one flow.",
  },
];

const customerVoices = [
  {
    quote:
      "We moved from random calls to a single dashboard. Response time dropped and service quality went up immediately.",
    name: "Neha S.",
    role: "Operations Lead, Co-working Hub",
  },
  {
    quote: "Booked a cleaner and electrician in one afternoon. Everything was verified, on time, and hassle-free.",
    name: "Rahul K.",
    role: "Homeowner",
  },
];

import { ThemeToggle } from "@/components/ThemeToggle";

export default function Home() {
  return (
    <div className="min-h-screen pb-20 overflow-x-hidden">
      {/* Premium Header */}
      <header className="fixed top-0 left-0 right-0 z-50 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between bg-background/60 backdrop-blur-2xl px-6 py-3 rounded-full border border-border/40 shadow-xl reveal-up">
          <div className="flex items-center gap-2">
            <div className="size-8 rounded-xl bg-primary flex items-center justify-center text-white shadow-lg">
              <Bolt className="size-5 fill-white" />
            </div>
            <span className="font-heading font-black text-xl tracking-tight">Helper</span>
          </div>

          <div className="hidden md:flex items-center gap-8 text-sm font-bold text-muted-foreground">
             <Link href="#services" className="hover:text-primary transition-colors">Services</Link>
             <Link href="#how-it-works" className="hover:text-primary transition-colors">How it Works</Link>
             <Link href="/helper" className="hover:text-primary transition-colors">For Helpers</Link>
          </div>

          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Link href="/auth/signin" className="hidden sm:block text-sm font-bold hover:text-primary transition-colors">
              Sign In
            </Link>
            <Link href="/auth/signup" className="bg-primary text-white px-5 py-2.5 rounded-full font-black text-sm shadow-xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all">
              Join Now
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 space-y-24 pb-32">
        {/* Refined Hero Section */}
        <section className="text-center relative pt-24 pb-12">
          {/* Subtler Background */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[600px] bg-[radial-gradient(circle_at_center,var(--color-primary)_0%,transparent_70%)] opacity-[0.03] -z-10" />
          
          <div className="space-y-10 reveal-up max-w-4xl mx-auto">
            <Badge 
              variant="outline" 
              className="bg-primary/5 text-primary border-primary/20 py-1.5 px-4 rounded-full font-bold text-[10px] uppercase tracking-widest animate-reveal-up"
            >
               Reliable Service Infrastructure
            </Badge>
            
            <h1 className="text-5xl md:text-7xl font-heading font-black tracking-tight leading-tight text-balance text-foreground">
              Marketplace Operations <br />
              <span className="text-primary font-extrabold italic">Simplified.</span>
            </h1>

            <p className="text-lg md:text-xl text-muted-foreground font-medium max-w-2xl mx-auto text-balance leading-relaxed">
              Precision-built marketplace platform for home and business services. Global dispatch, verified providers, and real-time tracking.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4 max-w-2xl mx-auto">
               <div className="w-full relative group">
                  <Input 
                    placeholder="Search over 40+ service categories..." 
                    className="h-14 pl-12 pr-6 rounded-2xl border border-border/60 bg-background/50 backdrop-blur-sm text-base font-medium transition-all focus-visible:ring-primary/10 focus-visible:border-primary group-hover:border-primary/30" 
                  />
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
               </div>
               <Button size="lg" className="h-14 px-10 rounded-2xl font-black text-base shadow-xl shadow-primary/10 hover:shadow-primary/20 transition-all bg-primary text-white shrink-0">
                  Join the Network
               </Button>
            </div>

            <div className="flex items-center justify-center gap-10 pt-12 border-t border-border/10 max-w-xl mx-auto opacity-50">
               {[ShieldCheck, Star, Zap].map((Icon, i) => (
                  <div key={i} className="flex items-center gap-2">
                     <Icon className="size-4 text-primary" />
                     <span className="text-[10px] font-black uppercase tracking-widest">{["Verified", "4.9 Multi-Zone", "Real-time"].at(i)}</span>
                  </div>
               ))}
            </div>
          </div>
        </section>

        {/* Structured Categories Section */}
        <section id="services" className="space-y-16 py-12">
          <div className="text-center space-y-3 reveal-up">
            <h2 className="text-3xl md:text-5xl font-heading font-black tracking-tight">Enterprise <span className="text-primary">Ecosystem</span></h2>
            <p className="text-muted-foreground font-medium max-w-xl mx-auto text-sm md:text-base leading-relaxed">
              Standardized dispatch board for managing fragmented service operations across multiple urban zones.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {serviceCategories.map((service, index) => {
              const Icon = service.icon;
              return (
                <Card 
                  key={service.title} 
                  className="bg-card/30 border border-border/50 hover:border-primary/20 transition-all duration-300 group cursor-pointer reveal-up rounded-2xl overflow-hidden shadow-sm hover:shadow-xl"
                  style={{ animationDelay: `${index * 40}ms` }}
                >
                  <CardContent className="p-8 space-y-6">
                    <div className="size-12 rounded-xl bg-primary/5 flex items-center justify-center text-primary transition-colors group-hover:bg-primary/10">
                      <Icon className="size-5" />
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-xl font-heading font-bold tracking-tight">{service.title}</h3>
                      <p className="text-muted-foreground text-xs font-medium leading-relaxed opacity-80">{service.description}</p>
                    </div>
                    <div className="pt-4 border-t border-border/30 flex items-center justify-between">
                       <span className="text-[10px] font-black uppercase tracking-[0.15em] text-primary/70">{service.pulse}</span>
                       <ArrowRight className="size-3 text-primary opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </section>

        {/* Professional Trust Section */}
        <section className="reveal-up py-12">
           <Card className="border border-border bg-foreground text-background dark:bg-card dark:text-foreground p-12 overflow-hidden relative rounded-3xl shadow-2xl hover:bg-foreground dark:hover:bg-card">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-12 text-center relative z-10">
                 {trustStats.map((stat) => (
                    <div key={stat.label} className="space-y-2">
                       <p className="text-4xl md:text-5xl font-black font-heading tracking-tighter">{stat.value}</p>
                       <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60 h-8 flex items-center justify-center">{stat.label}</p>
                    </div>
                 ))}
              </div>
           </Card>
        </section>
      </main>

      <footer className="max-w-7xl mx-auto px-6 py-16 border-t border-border/20 flex flex-col md:flex-row items-center justify-between gap-10 text-muted-foreground/60">
        <div className="flex items-center gap-2.5 opacity-80">
          <div className="size-6 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
            <Bolt className="size-3.5" />
          </div>
          <span className="font-heading font-black text-lg tracking-tight text-foreground/80">Helper</span>
        </div>
        <p className="text-[10px] font-bold uppercase tracking-widest">© 2026 Helper Platform. Industrial-grade service infrastructure.</p>
        <div className="flex gap-8 text-[10px] font-black uppercase tracking-[0.2em]">
           <Link href="#" className="hover:text-primary transition-colors">Legal</Link>
           <Link href="#" className="hover:text-primary transition-colors">Service Level</Link>
           <Link href="#" className="hover:text-primary transition-colors">Node API</Link>
        </div>
      </footer>
    </div>
  );
}
