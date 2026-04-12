"use client";

import Link from "next/link";
import { ArrowRight, IndianRupee, Clock, TrendingUp, Star, ShieldCheck } from "lucide-react";

const HELPER_BENEFITS = [
  { icon: IndianRupee, title: "Earn ₹25,000–₹60,000/mo", desc: "Top helpers on DOZO earn more than most desk jobs. You set your hours, we bring the work to you." },
  { icon: Clock, title: "Work on Your Schedule", desc: "Full-time or part-time — take jobs when you want. No fixed shifts, no bosses, complete freedom." },
  { icon: TrendingUp, title: "Grow Your Career", desc: "Access free skill training, certifications, and a rating system that rewards quality with more bookings." },
  { icon: Star, title: "Build Your Reputation", desc: "Your 5-star profile is your brand. Great ratings lead to premium customers and higher earnings." },
];

export function BecomeHelper() {
  return (
    <section className="py-28 px-6 border-t border-border bg-background">
      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left — Text */}
          <div className="space-y-8">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-50 border border-orange-100 text-orange-600 text-sm font-bold">
                <ShieldCheck className="size-3.5" />
                For Skilled Professionals
              </div>
              <h2 className="text-4xl lg:text-5xl font-black tracking-tight leading-tight">
                Turn your skills into<br />
                <span className="text-orange-500">steady income.</span>
              </h2>
              <p className="text-muted-foreground font-medium text-lg leading-relaxed max-w-md">
                Join 10,000+ verified helpers already earning on DOZO. Whether you're an electrician, chef, driver, or cleaner — there's work waiting for you.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              {HELPER_BENEFITS.map((b) => (
                <div key={b.title} className="bg-muted/40 border border-border rounded-[14px] p-5 space-y-3 hover:border-orange-200 hover:bg-orange-50/30 transition-all">
                  <div className="size-10 rounded-[10px] bg-orange-50 border border-orange-100 flex items-center justify-center">
                    <b.icon className="size-5 text-orange-500" strokeWidth={2.5} />
                  </div>
                  <div>
                    <p className="font-bold text-sm text-foreground">{b.title}</p>
                    <p className="text-xs text-muted-foreground font-medium mt-1 leading-relaxed">{b.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <Link
              href="/helper"
              className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-bold px-8 py-4 rounded-[12px] transition-all shadow-lg shadow-orange-500/20 text-base"
            >
              Apply as a Helper <ArrowRight className="size-5" />
            </Link>
          </div>

          {/* Right — Social proof */}
          <div className="space-y-4">
            {[
              { name: "Rajesh Kumar", skill: "Electrician", city: "Delhi NCR", earning: "₹48,000/mo", avatar: "https://randomuser.me/api/portraits/men/34.jpg", quote: "I used to earn ₹15,000 a month fixing wiring jobs around the neighborhood. Now with DOZO, I earn ₹48,000 and choose which jobs I take. Best decision I ever made." },
              { name: "Sunita Devi", skill: "Deep Cleaning", city: "Delhi NCR", earning: "₹32,000/mo", avatar: "https://randomuser.me/api/portraits/women/52.jpg", quote: "DOZO gave me financial independence. I work 5 hours a day and earn more than my husband. The customers are respectful and the pay comes on time — always." },
              { name: "Manish Patel", skill: "Personal Driver", city: "Delhi NCR", earning: "₹41,000/mo", avatar: "https://randomuser.me/api/portraits/men/77.jpg", quote: "I was driving an auto before. Now I drive luxury cars for premium customers through DOZO and earn 3x my previous income with zero downtime between rides." },
            ].map((h) => (
              <div key={h.name} className="bg-muted/30 border border-border rounded-[16px] p-5 space-y-4 hover:shadow-sm transition-all">
                <div className="flex items-center gap-3">
                  <img src={h.avatar} alt={h.name} className="size-12 rounded-full object-cover border-2 border-border" />
                  <div className="flex-1">
                    <p className="font-bold text-foreground">{h.name}</p>
                    <p className="text-sm text-muted-foreground font-medium">{h.skill} · {h.city}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-black text-orange-500 text-sm">{h.earning}</p>
                    <p className="text-[10px] text-muted-foreground font-medium">Monthly earnings</p>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground font-medium leading-relaxed italic">
                  &ldquo;{h.quote}&rdquo;
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
