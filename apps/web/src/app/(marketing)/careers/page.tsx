import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Briefcase, MapPin, Clock, Zap, Users, TrendingUp, Heart } from "lucide-react";

export const metadata: Metadata = {
  title: "Careers at DOZO — Join the Team",
  description: "Help us build India's fastest service marketplace. Join DOZO and work on problems that matter.",
};

const PERKS = [
  { icon: TrendingUp, title: "Hyper Growth", desc: "We're 3x-ing every year. Your impact will be felt across millions of users." },
  { icon: Heart, title: "Mission-Driven", desc: "Every line of code you write, every campaign you run helps real people live better." },
  { icon: Users, title: "World-Class Team", desc: "Work alongside ex-Uber, Google, Airbnb, and Urban Company talent." },
  { icon: Zap, title: "Move Fast", desc: "No bureaucracy. Ship fast, learn faster. Your ideas become product in days." },
];

const JOBS = [
  { id: 1, title: "Senior Backend Engineer", dept: "Engineering", location: "Bengaluru / Remote", type: "Full-time", level: "Senior" },
  { id: 2, title: "Product Designer (Mobile)", dept: "Design", location: "Mumbai / Hybrid", type: "Full-time", level: "Mid-Senior" },
  { id: 3, title: "City Operations Manager", dept: "Operations", location: "Delhi, NCR", type: "Full-time", level: "Manager" },
  { id: 4, title: "Growth Marketing Lead", dept: "Marketing", location: "Bengaluru", type: "Full-time", level: "Lead" },
  { id: 5, title: "iOS Developer", dept: "Engineering", location: "Remote", type: "Full-time", level: "Mid" },
  { id: 6, title: "Data Analyst", dept: "Analytics", location: "Bengaluru / Remote", type: "Full-time", level: "Mid" },
  { id: 7, title: "Account Manager — Helpers", dept: "Operations", location: "Hyderabad", type: "Full-time", level: "Mid" },
  { id: 8, title: "Frontend Engineer (React)", dept: "Engineering", location: "Remote", type: "Full-time", level: "Senior" },
];

const DEPT_COLORS: Record<string, string> = {
  Engineering: "bg-blue-50 text-blue-600 border-blue-100",
  Design: "bg-violet-50 text-violet-600 border-violet-100",
  Operations: "bg-orange-50 text-orange-600 border-orange-100",
  Marketing: "bg-rose-50 text-rose-600 border-rose-100",
  Analytics: "bg-emerald-50 text-emerald-600 border-emerald-100",
};

export default function CareersPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <nav className="fixed top-0 inset-x-0 z-50 border-b border-border bg-background/80 backdrop-blur-xl h-16">
        <div className="max-w-7xl mx-auto px-6 h-full flex items-center justify-between">
          <Link href="/"><img src="/dozo-logo.svg" alt="DOZO" className="h-8 w-auto" /></Link>
          <Link href="/" className="text-sm font-bold text-muted-foreground hover:text-foreground transition-colors">← Back to Home</Link>
        </div>
      </nav>

      <main className="pt-16">
        {/* Hero */}
        <section className="py-24 px-6 border-b border-border bg-muted/20">
          <div className="max-w-4xl mx-auto text-center space-y-6">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-50 border border-orange-100 text-orange-600 text-sm font-bold">
              <Briefcase className="size-3.5" />
              We're Hiring
            </div>
            <h1 className="text-5xl lg:text-6xl font-black tracking-tight leading-tight">
              Build the future of{" "}
              <span className="text-orange-500">home services</span>{" "}
              in India.
            </h1>
            <p className="text-xl text-muted-foreground font-medium leading-relaxed max-w-2xl mx-auto">
              Join a team of builders, operators, and visionaries solving one of India's biggest infrastructure gaps. Real problems. Real impact. Real speed.
            </p>
            <a href="#open-roles" className="inline-flex items-center gap-2 bg-foreground text-background font-bold px-8 py-4 rounded-[12px] hover:bg-foreground/90 transition text-base">
              View Open Roles <ArrowRight className="size-5" />
            </a>
          </div>
        </section>

        {/* Perks */}
        <section className="py-24 px-6 border-b border-border">
          <div className="max-w-7xl mx-auto space-y-12">
            <div className="max-w-xl space-y-3">
              <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest">Why DOZO</p>
              <h2 className="text-4xl font-black tracking-tight">Why builders love working here.</h2>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {PERKS.map((p) => (
                <div key={p.title} className="bg-background rounded-[16px] border border-border p-6 space-y-4 hover:shadow-md transition">
                  <div className="size-12 rounded-[12px] bg-orange-50 border border-orange-100 flex items-center justify-center">
                    <p.icon className="size-5 text-orange-500" strokeWidth={2.5} />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg mb-1.5">{p.title}</h3>
                    <p className="text-sm text-muted-foreground font-medium leading-relaxed">{p.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Benefits Banner */}
        <section className="py-16 px-6 border-b border-border bg-foreground text-background">
          <div className="max-w-7xl mx-auto grid sm:grid-cols-3 gap-8 text-center">
            {[
              ["Competitive ESOPs", "Own a piece of DOZO's growth"],
              ["₹30L–₹80L CTC", "Market-leading compensation"],
              ["Full Remote Option", "Work where you do your best thinking"],
            ].map(([title, sub]) => (
              <div key={title}>
                <p className="font-black text-xl mb-1">{title}</p>
                <p className="text-background/60 font-medium text-sm">{sub}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Open Roles */}
        <section id="open-roles" className="py-24 px-6">
          <div className="max-w-7xl mx-auto space-y-10">
            <div className="max-w-xl space-y-3">
              <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest">Open Positions</p>
              <h2 className="text-4xl font-black tracking-tight">Find your role at DOZO.</h2>
            </div>
            <div className="space-y-3">
              {JOBS.map((job) => (
                <div key={job.id} className="bg-background border border-border rounded-[14px] px-6 py-5 flex flex-col sm:flex-row sm:items-center gap-4 hover:shadow-md hover:border-foreground/20 transition-all group">
                  <div className="flex-1 space-y-2">
                    <div className="flex flex-wrap items-center gap-3">
                      <h3 className="font-bold text-[17px] group-hover:text-primary transition-colors">{job.title}</h3>
                      <span className={`px-2.5 py-0.5 text-[11px] font-black uppercase tracking-wide rounded-full border ${DEPT_COLORS[job.dept] ?? "bg-muted text-muted-foreground border-border"}`}>{job.dept}</span>
                    </div>
                    <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground font-medium">
                      <span className="flex items-center gap-1.5"><MapPin className="size-3.5" />{job.location}</span>
                      <span className="flex items-center gap-1.5"><Clock className="size-3.5" />{job.type}</span>
                      <span className="flex items-center gap-1.5"><Briefcase className="size-3.5" />{job.level}</span>
                    </div>
                  </div>
                  <Link href={`mailto:careers@dozo.in?subject=Application for ${job.title}`} className="shrink-0 inline-flex items-center gap-2 border border-border text-sm font-bold px-5 py-2.5 rounded-[10px] hover:bg-foreground hover:text-background hover:border-foreground transition-all">
                    Apply Now <ArrowRight className="size-4" />
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-20 px-6 border-t border-border bg-muted/20">
          <div className="max-w-2xl mx-auto text-center space-y-5">
            <h2 className="text-3xl font-black tracking-tight">Don't see your role?</h2>
            <p className="text-muted-foreground font-medium">We're always looking for exceptional people. Send us your story.</p>
            <Link href="mailto:careers@dozo.in" className="inline-flex items-center gap-2 bg-foreground text-background font-bold px-8 py-4 rounded-[12px] hover:bg-foreground/90 transition">
              Reach Out <ArrowRight className="size-5" />
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}
