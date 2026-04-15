"use client";

import { FormEvent, useState } from "react";
import { MapPin, CheckCircle2, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const CITIES = [
  { name: "Delhi NCR", helpers: "1,800+", status: "active", badge: "Currently Serving" },
  { name: "Mumbai", helpers: "Available Soon", status: "soon", badge: "" },
  { name: "Bengaluru", helpers: "Available Soon", status: "soon", badge: "" },
  { name: "Hyderabad", helpers: "Available Soon", status: "soon", badge: "" },
  { name: "Pune", helpers: "Available Soon", status: "soon", badge: "" },
  { name: "Chennai", helpers: "Available Soon", status: "soon", badge: "" },
  { name: "Ahmedabad", helpers: "Available Soon", status: "soon", badge: "" },
  { name: "Jaipur", helpers: "Available Soon", status: "soon", badge: "" },
  { name: "Kolkata", helpers: "Available Soon", status: "soon", badge: "" },
  { name: "Surat", helpers: "Available Soon", status: "soon", badge: "" },
  { name: "Lucknow", helpers: "Available Soon", status: "soon", badge: "" },
  { name: "Indore", helpers: "Available Soon", status: "soon", badge: "" },
];

export function CityCoverage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");

  const handleNotify = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const trimmed = email.trim();

    if (!trimmed || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      setError("Please enter a valid email address.");
      return;
    }

    setError("");
    const subject = encodeURIComponent("DOZO city launch notifications");
    const body = encodeURIComponent(`Please notify me when DOZO launches in my city.\n\nEmail: ${trimmed}`);
    window.location.href = `mailto:support@dozo.in?subject=${subject}&body=${body}`;
  };

  return (
    <section className="py-24 px-6 border-t border-border bg-muted/20">
      <div className="max-w-7xl mx-auto space-y-12">
        {/* Header */}
        <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-6">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-700 text-sm font-bold">
              <CheckCircle2 className="size-3.5" />
              Currently Live in Delhi NCR
            </div>
            <h2 className="text-4xl font-black tracking-tight">
              Starting in Delhi NCR.<br />
              <span className="text-muted-foreground font-bold text-3xl">Expanding to every city soon.</span>
            </h2>
            <p className="text-muted-foreground font-medium max-w-lg">
              We&apos;re building the most reliable service network in India - one city at a time. Your city is next.
            </p>
          </div>
          <div className="flex items-center gap-2 text-sm font-bold text-muted-foreground bg-background border border-border px-4 py-2.5 rounded-[10px] shrink-0">
            <Clock className="size-4 text-orange-500" />
            New cities launching every month
          </div>
        </div>

        {/* City Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {CITIES.map((city) => (
            <div
              key={city.name}
              className={`rounded-[12px] p-4 flex flex-col gap-2 border transition-all relative overflow-hidden ${
                city.status === "active"
                  ? "bg-emerald-50 border-emerald-200 shadow-sm hover:shadow-md"
                  : "bg-background border-border opacity-70 hover:opacity-90"
              }`}
            >
              {city.status === "active" && (
                <div className="absolute top-0 right-0 w-16 h-16 bg-emerald-500/10 rounded-bl-[40px]" />
              )}
              <div className={`size-8 rounded-lg flex items-center justify-center border ${
                city.status === "active"
                  ? "bg-emerald-100 border-emerald-200"
                  : "bg-muted/50 border-border"
              }`}>
                <MapPin className={`size-4 ${city.status === "active" ? "text-emerald-600" : "text-muted-foreground"}`} strokeWidth={2.5} />
              </div>
              <div>
                <p className={`font-bold text-sm ${city.status === "active" ? "text-emerald-800" : "text-foreground"}`}>
                  {city.name}
                </p>
                {city.status === "active" ? (
                  <div className="flex items-center gap-1.5 mt-1">
                    <div className="size-1.5 bg-emerald-500 rounded-full animate-pulse" />
                    <p className="text-xs text-emerald-700 font-bold">{city.helpers} helpers</p>
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground font-medium mt-1">Coming Soon</p>
                )}
              </div>
              {city.badge && (
                <span className="self-start text-[9px] font-black uppercase tracking-wide px-2 py-0.5 rounded-full bg-emerald-600 text-white">
                  {city.badge}
                </span>
              )}
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="bg-background border border-border rounded-xl p-6 flex flex-col sm:flex-row items-center gap-5 justify-between">
          <div>
            <p className="font-black text-lg">Want DOZO in your city?</p>
            <p className="text-muted-foreground font-medium text-sm mt-1">Leave your details and we&apos;ll notify you the moment we launch near you.</p>
          </div>
          <form onSubmit={handleNotify} className="w-full sm:w-auto shrink-0">
            <label htmlFor="city-notify-email" className="sr-only">Your email for launch updates</label>
            <div className="flex gap-2 w-full sm:w-auto">
              <Input
                id="city-notify-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                className="flex-1 sm:w-56 px-4 py-2.5 rounded-[10px] border border-border bg-muted/30 text-sm font-medium h-auto"
                aria-invalid={Boolean(error)}
                aria-describedby={error ? "city-notify-error" : undefined}
              />
              <Button type="submit" className="px-5 py-2.5 bg-foreground text-background font-bold text-sm rounded-[10px] hover:bg-foreground/90 shrink-0">
                Notify Me
              </Button>
            </div>
            {error && <p id="city-notify-error" className="mt-2 text-xs text-rose-600 font-medium">{error}</p>}
          </form>
        </div>
      </div>
    </section>
  );
}
