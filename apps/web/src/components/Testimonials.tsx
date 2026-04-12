"use client";

import { Star, Quote } from "lucide-react";

const REVIEWS = [
  {
    name: "Anjali Mehta",
    city: "Mumbai",
    service: "Home Cleaning",
    rating: 5,
    review: "I was skeptical at first but DOZO completely blew me away. Priya arrived in 8 minutes, was incredibly professional, and my apartment looked spotless. Booking again this weekend!",
    avatar: "https://randomuser.me/api/portraits/women/44.jpg",
    verified: true,
    date: "Apr 2026",
  },
  {
    name: "Rohan Sharma",
    city: "Delhi NCR",
    service: "Electrician",
    rating: 5,
    review: "My inverter stopped working at midnight. I booked DOZO on a whim and Suresh arrived within 10 minutes. Fixed it in 20 mins. This level of service shouldn't exist in India — but it does!",
    avatar: "https://randomuser.me/api/portraits/men/32.jpg",
    verified: true,
    date: "Mar 2026",
  },
  {
    name: "Kavitha Nair",
    city: "Bengaluru",
    service: "Personal Chef",
    rating: 5,
    review: "Booked a personal chef for my parents' anniversary dinner. The food was restaurant-quality and the chef was so well-mannered. My parents couldn't believe we ordered this online!",
    avatar: "https://randomuser.me/api/portraits/women/65.jpg",
    verified: true,
    date: "Apr 2026",
  },
  {
    name: "Arjun Reddy",
    city: "Hyderabad",
    service: "AC Service",
    rating: 5,
    review: "Used DOZO for AC servicing before summer. The technician was certified, explained everything he was doing, and the AC is running perfectly. Way better than calling the local guy.",
    avatar: "https://randomuser.me/api/portraits/men/68.jpg",
    verified: true,
    date: "Mar 2026",
  },
  {
    name: "Pooja Singh",
    city: "Pune",
    service: "Deep Cleaning",
    rating: 5,
    review: "Moved into a new apartment and needed a thorough clean before unpacking. The team was punctual, used professional equipment, and the place was absolutely transformed. Highly recommend!",
    avatar: "https://randomuser.me/api/portraits/women/72.jpg",
    verified: true,
    date: "Feb 2026",
  },
  {
    name: "Vikram Patel",
    city: "Ahmedabad",
    service: "Driver",
    rating: 5,
    review: "Needed a driver for a full day wedding event. Rajan from DOZO was perfectly dressed, knew the city like the back of his hand, and was incredibly courteous. Will use again for sure.",
    avatar: "https://randomuser.me/api/portraits/men/91.jpg",
    verified: true,
    date: "Apr 2026",
  },
];

export function Testimonials() {
  return (
    <section className="py-28 px-6 border-t border-border bg-background overflow-hidden">
      <div className="max-w-7xl mx-auto space-y-14">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-3 max-w-xl">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-50 border border-amber-100 text-amber-700 text-sm font-bold">
              <Star className="size-3.5 fill-amber-500 text-amber-500" />
              4.9 Average across 2M+ reviews
            </div>
            <h2 className="text-4xl lg:text-5xl font-black tracking-tight leading-tight">
              Loved by millions<br />across India.
            </h2>
          </div>
          <div className="flex items-center gap-1">
            {[1,2,3,4,5].map((s) => (
              <Star key={s} className="size-7 fill-amber-400 text-amber-400" />
            ))}
            <span className="ml-3 font-black text-2xl">4.9</span>
          </div>
        </div>

        {/* Reviews Scrolling Row 1 */}
        <div className="relative">
          <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none" />
          <div className="flex gap-5 overflow-x-auto pb-2 scrollbar-hide" style={{ scrollbarWidth: "none" }}>
            {REVIEWS.map((r, i) => (
              <div key={i} className="shrink-0 w-[340px] bg-background border border-border rounded-[16px] p-6 space-y-4 hover:shadow-md hover:-translate-y-0.5 transition-all">
                {/* Stars */}
                <div className="flex items-center gap-1">
                  {Array.from({ length: r.rating }).map((_, si) => (
                    <Star key={si} className="size-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>

                {/* Quote */}
                <div className="relative">
                  <Quote className="size-5 text-muted-foreground/20 absolute -top-1 -left-1" />
                  <p className="text-sm font-medium text-muted-foreground leading-relaxed pl-3 line-clamp-4">
                    {r.review}
                  </p>
                </div>

                {/* Author */}
                <div className="flex items-center gap-3 pt-3 border-t border-border/60">
                  <img src={r.avatar} alt={r.name} className="size-10 rounded-full object-cover border border-border" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-bold text-sm text-foreground truncate">{r.name}</p>
                      {r.verified && (
                        <span className="shrink-0 text-[10px] font-black text-emerald-600 bg-emerald-50 border border-emerald-100 px-1.5 py-0.5 rounded-full">✓ Verified</span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground font-medium">{r.city} · {r.service}</p>
                  </div>
                  <span className="text-[10px] text-muted-foreground/60 font-medium shrink-0">{r.date}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
