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

export default function Home() {
  return (
    <div className="min-h-screen pb-16">
      <header className="mx-auto w-full max-w-6xl px-4 pt-5 sm:px-6 lg:px-8">
        <div className="surface-card reveal-up flex items-center justify-between px-4 py-3 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="flex size-9 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-sm">
              <Building2 />
            </div>
            <div>
              <p className="text-sm font-semibold">Zapier Services</p>
              <p className="text-xs text-muted-foreground">Precision marketplace for local service ops</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link href="/dashboard" className={buttonVariants({ variant: "ghost", size: "sm" })}>
              Dashboard
            </Link>
            <Link href="/auth/signin" className={buttonVariants({ variant: "ghost", size: "sm" })}>
              Sign in
            </Link>
            <Link href="/auth/signup" className={buttonVariants({ size: "sm" })}>
              Get started
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-6xl flex-col gap-12 px-4 pt-8 sm:px-6 lg:px-8 lg:pt-12">
        <section className="hero-ambient grid items-start gap-6 lg:grid-cols-[1.08fr_0.92fr]">
          <div className="reveal-up flex flex-col gap-5">
            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary">Live dispatch board</Badge>
              <Badge variant="secondary">Verified professionals</Badge>
              <Badge variant="secondary">OTP-secured completion</Badge>
            </div>

            <h1 className="max-w-2xl text-balance text-4xl leading-[1.04] font-semibold sm:text-5xl lg:text-6xl">
              One platform for every home and business service request.
            </h1>

            <p className="max-w-2xl text-base text-muted-foreground sm:text-lg">
              Stop juggling calls, chats, and uncertain arrivals. Post a requirement, compare trusted professionals,
              schedule in seconds, and track completion from one crisp workflow.
            </p>

            <div className="surface-card reveal-up delay-1 flex flex-col gap-3 p-3 sm:flex-row sm:items-center">
              <Input placeholder="Try: Deep clean 2BHK this Saturday" className="h-11 bg-background/70" />
              <Button className="shrink-0" size="lg">
                Find my service team
                <ArrowRight data-icon="inline-end" />
              </Button>
            </div>

            <div className="reveal-up delay-2 flex flex-wrap gap-3">
              <Link href="/auth/signup" className={buttonVariants({ variant: "outline", size: "lg" })}>
                Book now
                <CalendarCheck2 data-icon="inline-end" />
              </Link>
              <Link href="/helper" className={buttonVariants({ variant: "ghost", size: "lg" })}>
                Become a provider
                <Users data-icon="inline-end" />
              </Link>
            </div>

            <p className="reveal-up delay-3 text-xs text-muted-foreground">
              Trusted by households, co-working hubs, and local stores in 40+ cities.
            </p>
          </div>

          <Card className="surface-card-strong reveal-up delay-3 border-none p-1">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl">
                <Clock3 className="text-primary" />
                Live service command board
              </CardTitle>
              <CardDescription>Track dispatches in real time while keeping approvals and payments secure.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-3 pb-4">
              {dispatchQueue.map((item) => (
                <div key={item.service} className="gradient-outline rounded-2xl p-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold">{item.service}</p>
                      <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                        <MapPin className="size-3.5 text-primary" />
                        {item.location}
                      </p>
                    </div>
                    <Badge variant="secondary">{item.status}</Badge>
                  </div>
                  <p className="mt-2 text-xs text-muted-foreground">{item.time}</p>
                </div>
              ))}

              <div className="rounded-2xl border border-border/70 bg-secondary/45 p-3">
                <p className="flex items-center gap-2 text-sm font-medium">
                  <ShieldCheck className="text-primary" />
                  OTP verification, protected payments, and post-service quality checks
                </p>
              </div>
            </CardContent>
          </Card>
        </section>

        <section className="reveal-up delay-2 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {trustStats.map((stat) => (
            <Card key={stat.label} className="surface-card border-none">
              <CardContent className="flex flex-col gap-1 p-4 sm:p-5">
                <p className="text-[0.7rem] font-semibold tracking-[0.12em] text-muted-foreground uppercase">{stat.label}</p>
                <p className="text-2xl font-semibold sm:text-3xl">{stat.value}</p>
              </CardContent>
            </Card>
          ))}
        </section>

        <section className="flex flex-col gap-4">
          <div className="reveal-up flex items-end justify-between gap-4">
            <div>
              <p className="text-xs font-semibold tracking-[0.14em] text-primary uppercase">High-demand services</p>
              <h2 className="mt-1 max-w-3xl text-3xl font-semibold sm:text-4xl">
                Everything you need to run your day without service chaos
              </h2>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {serviceCategories.map((service, index) => {
              const Icon = service.icon;
              return (
                <Card
                  key={service.title}
                  className="surface-card reveal-up border-none transition-transform duration-300 hover:-translate-y-1"
                  style={{ animationDelay: `${index * 70}ms` }}
                >
                  <CardContent className="flex flex-col gap-3 p-5">
                    <div className="flex size-11 items-center justify-center rounded-2xl bg-secondary text-secondary-foreground">
                      <Icon />
                    </div>
                    <h3 className="text-xl font-semibold">{service.title}</h3>
                    <p className="text-sm text-muted-foreground">{service.description}</p>
                    <p className="mt-1 flex items-center gap-1 text-xs font-medium text-muted-foreground">
                      <BadgeCheck className="size-3.5 text-primary" />
                      {service.pulse}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </section>

        <section className="grid gap-4 lg:grid-cols-2">
          <Card className="surface-card reveal-up delay-3 border-none px-1">
            <CardHeader>
              <p className="text-xs font-semibold tracking-[0.14em] text-primary uppercase">How it works</p>
              <CardTitle className="text-3xl">From request to completion in three clear steps</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-4 pb-5">
              {processSteps.map((step, index) => (
                <div key={step.title} className="flex flex-col gap-3">
                  <div className="flex items-start gap-3">
                    <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-secondary text-sm font-semibold text-secondary-foreground">
                      {index + 1}
                    </div>
                    <div className="pt-0.5">
                      <p className="font-semibold">{step.title}</p>
                      <p className="mt-1 text-sm text-muted-foreground">{step.description}</p>
                    </div>
                  </div>
                  {index < processSteps.length - 1 ? <Separator /> : null}
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="surface-card reveal-up delay-4 border-none px-1">
            <CardHeader>
              <p className="text-xs font-semibold tracking-[0.14em] text-primary uppercase">Customer voice</p>
              <CardTitle className="text-3xl">Teams and households are switching to one reliable flow</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-3 pb-5">
              {customerVoices.map((voice) => (
                <div key={voice.name} className="rounded-2xl border border-border/70 bg-background/70 p-4">
                  <p className="text-sm leading-relaxed">&ldquo;{voice.quote}&rdquo;</p>
                  <p className="mt-3 text-xs font-medium text-muted-foreground">
                    {voice.name} - {voice.role}
                  </p>
                </div>
              ))}
            </CardContent>
          </Card>
        </section>

        <section className="reveal-up delay-4 surface-card-strong border-none px-5 py-6 sm:px-8">
          <div className="grid items-center gap-6 lg:grid-cols-[1.1fr_0.9fr]">
            <div>
              <p className="text-xs font-semibold tracking-[0.14em] text-primary uppercase">For individuals and organizations</p>
              <h2 className="mt-2 text-3xl font-semibold">Build your service engine once, run it daily with confidence</h2>
              <p className="mt-3 max-w-2xl text-sm text-muted-foreground sm:text-base">
                Independent professionals can start receiving quality leads quickly, while teams can manage members,
                approvals, recurring jobs, and service history from one account.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:justify-end lg:flex-col">
              <Link href="/auth/signup" className={buttonVariants({ size: "lg" })}>
                Start selling services
                <ArrowRight data-icon="inline-end" />
              </Link>
              <Link href="/organizations" className={buttonVariants({ size: "lg", variant: "outline" })}>
                Explore organization tools
              </Link>
            </div>
          </div>
        </section>
      </main>

      <footer className="mx-auto mt-12 w-full max-w-6xl px-4 text-center text-xs text-muted-foreground sm:px-6 lg:px-8">
        Built for dependable local service operations, from first request to final completion.
      </footer>
    </div>
  );
}
