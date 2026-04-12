import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Zap, Users, Globe, Heart, Shield, Target, TrendingUp } from "lucide-react";

export const metadata: Metadata = {
  title: "About DOZO — Help in 10 Minutes",
  description: "Learn about DOZO's mission to connect every Indian household with trusted, skilled helpers in under 10 minutes.",
};

const VALUES = [
  { icon: Zap, title: "Speed First", desc: "We believe your time is precious. Every system we build is obsessed with cutting wait times to zero.", color: "text-orange-500 bg-orange-50 border-orange-100" },
  { icon: Shield, title: "Trust by Default", desc: "Every helper on DOZO is background-checked, trained, and insured before they ever reach your door.", color: "text-blue-600 bg-blue-50 border-blue-100" },
  { icon: Heart, title: "Community First", desc: "We empower local skilled workers with fair pay, growth opportunities, and a platform to thrive.", color: "text-rose-500 bg-rose-50 border-rose-100" },
  { icon: Globe, title: "Built for India", desc: "From metro to tier-2 cities, DOZO is designed specifically for the Indian urban lifestyle and needs.", color: "text-emerald-600 bg-emerald-50 border-emerald-100" },
];

const STATS = [
  { value: "10,000+", label: "Verified Helpers" },
  { value: "50+", label: "Cities Active" },
  { value: "2M+", label: "Jobs Completed" },
  { value: "4.9★", label: "Average Rating" },
];

const TEAM = [
  { name: "Arjun Mehta", role: "Co-Founder & CEO", avatar: "https://i.pravatar.cc/150?u=arjun_dozo", bio: "Ex-Uber India. 10 years building consumer tech products." },
  { name: "Priya Nair", role: "Co-Founder & CTO", avatar: "https://i.pravatar.cc/150?u=priya_dozo", bio: "Ex-Google. Built platforms that serve 100M+ users." },
  { name: "Rahul Gupta", role: "VP Operations", avatar: "https://i.pravatar.cc/150?u=rahul_dozo", bio: "Scaled Urban Company to 25 cities. Supply chain expert." },
  { name: "Sneha Iyer", role: "Head of Design", avatar: "https://i.pravatar.cc/150?u=sneha_dozo", bio: "Former Airbnb designer. Crafts human-centered experiences." },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Nav */}
      <nav className="fixed top-0 inset-x-0 z-50 border-b border-border bg-background/80 backdrop-blur-xl h-16">
        <div className="max-w-7xl mx-auto px-6 h-full flex items-center justify-between">
          <Link href="/">
            <img src="/dozo-logo.svg" alt="DOZO" className="h-8 w-auto" onError={(e) => { (e.target as HTMLImageElement).style.display='none'; }} />
            <span className="font-black text-xl tracking-tight" style={{display:'none'}}>Dozo</span>
          </Link>
          <Link href="/" className="text-sm font-bold text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1.5">
            ← Back to Home
          </Link>
        </div>
      </nav>

      <main className="pt-16">
        {/* Hero */}
        <section className="py-24 px-6 border-b border-border bg-muted/20">
          <div className="max-w-4xl mx-auto text-center space-y-6">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-50 border border-orange-100 text-orange-600 text-sm font-bold">
              <Zap className="size-3.5 fill-orange-500" />
              Our Story
            </div>
            <h1 className="text-5xl lg:text-6xl font-black tracking-tight leading-tight">
              We're making help{" "}
              <span className="text-orange-500">instant</span>{" "}
              for every Indian.
            </h1>
            <p className="text-xl text-muted-foreground font-medium leading-relaxed max-w-2xl mx-auto">
              DOZO was born from a simple frustration — why does it take days to find a reliable electrician, plumber, or chef? We built the infrastructure to make skilled help arrive in 10 minutes or less.
            </p>
          </div>
        </section>

        {/* Stats */}
        <section className="py-16 px-6 border-b border-border">
          <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
            {STATS.map((s) => (
              <div key={s.label} className="text-center space-y-2">
                <p className="text-4xl font-black text-foreground">{s.value}</p>
                <p className="text-sm font-bold text-muted-foreground uppercase tracking-wide">{s.label}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Mission */}
        <section className="py-24 px-6 border-b border-border">
          <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-6">
              <div className="flex items-center gap-2 text-sm font-bold text-muted-foreground uppercase tracking-widest">
                <Target className="size-4" /> Our Mission
              </div>
              <h2 className="text-4xl font-black tracking-tight leading-tight">
                Building India's most trusted service marketplace.
              </h2>
              <p className="text-lg text-muted-foreground font-medium leading-relaxed">
                We connect skilled workers with people who need them — instantly, reliably, and fairly. Our platform creates economic opportunity for helpers while giving customers peace of mind that the job will be done right.
              </p>
              <p className="text-lg text-muted-foreground font-medium leading-relaxed">
                We've served over 2 million jobs across 50+ cities and we're just getting started.
              </p>
              <Link href="/customer/book" className="inline-flex items-center gap-2 bg-foreground text-background font-bold px-6 py-3 rounded-[10px] hover:bg-foreground/90 transition">
                Book a Service <ArrowRight className="size-4" />
              </Link>
            </div>
            <div className="relative aspect-square max-w-lg mx-auto">
              <img src="https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=800&q=80" alt="DOZO team" className="w-full h-full object-cover rounded-[24px] border border-border shadow-xl" />
              <div className="absolute -bottom-5 -right-5 bg-background border border-border rounded-[16px] p-5 shadow-lg">
                <div className="flex items-center gap-3">
                  <TrendingUp className="size-6 text-orange-500" />
                  <div>
                    <p className="font-black text-sm">Growing Fast</p>
                    <p className="text-xs text-muted-foreground font-medium">3x YoY Revenue Growth</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Values */}
        <section className="py-24 px-6 border-b border-border bg-muted/20">
          <div className="max-w-7xl mx-auto space-y-12">
            <div className="max-w-xl space-y-3">
              <div className="flex items-center gap-2 text-sm font-bold text-muted-foreground uppercase tracking-widest">
                <Heart className="size-4" /> Our Values
              </div>
              <h2 className="text-4xl font-black tracking-tight">What drives every decision we make.</h2>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {VALUES.map((v) => (
                <div key={v.title} className="bg-background rounded-[16px] border border-border p-6 space-y-4 hover:shadow-md transition-shadow">
                  <div className={`size-12 rounded-[12px] border flex items-center justify-center ${v.color}`}>
                    <v.icon className="size-5" strokeWidth={2.5} />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg mb-1.5">{v.title}</h3>
                    <p className="text-sm text-muted-foreground font-medium leading-relaxed">{v.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Team */}
        <section className="py-24 px-6 border-b border-border">
          <div className="max-w-7xl mx-auto space-y-12">
            <div className="max-w-xl space-y-3">
              <div className="flex items-center gap-2 text-sm font-bold text-muted-foreground uppercase tracking-widest">
                <Users className="size-4" /> Leadership Team
              </div>
              <h2 className="text-4xl font-black tracking-tight">Built by people who've done it before.</h2>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {TEAM.map((t) => (
                <div key={t.name} className="bg-background rounded-[16px] border border-border p-6 space-y-4 hover:shadow-md transition-shadow">
                  <img src={t.avatar} alt={t.name} className="size-16 rounded-full object-cover border-2 border-border" />
                  <div>
                    <p className="font-bold text-foreground">{t.name}</p>
                    <p className="text-sm font-bold text-orange-500 mb-2">{t.role}</p>
                    <p className="text-sm text-muted-foreground font-medium leading-relaxed">{t.bio}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-24 px-6">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <h2 className="text-4xl font-black tracking-tight">Ready to experience DOZO?</h2>
            <p className="text-lg text-muted-foreground font-medium">Join 2 million+ customers who trust DOZO for their everyday needs.</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/customer/book" className="inline-flex items-center justify-center gap-2 bg-foreground text-background font-bold px-8 py-4 rounded-[12px] hover:bg-foreground/90 transition text-base">
                Book a Service <ArrowRight className="size-5" />
              </Link>
              <Link href="/careers" className="inline-flex items-center justify-center gap-2 border border-border text-foreground font-bold px-8 py-4 rounded-[12px] hover:bg-muted/50 transition text-base">
                Join Our Team
              </Link>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
