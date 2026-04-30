"use client";

import { useRef } from "react";
import Image from "next/image";
import { CheckCircle2 } from "lucide-react";

const ACTIVITIES = [
  { name: "Priya S.", city: "Mumbai", service: "booked Home Cleaning", time: "2 mins ago", avatar: "https://randomuser.me/api/portraits/women/44.jpg" },
  { name: "Rahul M.", city: "Delhi", service: "booked an Electrician", time: "4 mins ago", avatar: "https://randomuser.me/api/portraits/men/32.jpg" },
  { name: "Anita K.", city: "Bengaluru", service: "booked AC Service", time: "6 mins ago", avatar: "https://randomuser.me/api/portraits/women/65.jpg" },
  { name: "Vikram P.", city: "Hyderabad", service: "booked a Driver", time: "7 mins ago", avatar: "https://randomuser.me/api/portraits/men/68.jpg" },
  { name: "Sneha R.", city: "Pune", service: "booked Deep Cleaning", time: "9 mins ago", avatar: "https://randomuser.me/api/portraits/women/72.jpg" },
  { name: "Arjun T.", city: "Chennai", service: "booked a Plumber", time: "11 mins ago", avatar: "https://randomuser.me/api/portraits/men/91.jpg" },
  { name: "Meera J.", city: "Ahmedabad", service: "booked a Personal Chef", time: "13 mins ago", avatar: "https://randomuser.me/api/portraits/women/55.jpg" },
  { name: "Karan S.", city: "Jaipur", service: "booked Pest Control", time: "15 mins ago", avatar: "https://randomuser.me/api/portraits/men/45.jpg" },
];

export function ActivityTicker() {
  const trackRef = useRef<HTMLDivElement>(null);

  return (
    <div className="border-y border-border bg-background py-3 overflow-hidden relative">
      {/* Fade masks */}
      <div className="absolute left-0 top-0 bottom-0 w-24 bg-linear-to-r from-background to-transparent z-10 pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-0 w-24 bg-linear-to-l from-background to-transparent z-10 pointer-events-none" />

      <div ref={trackRef} className="flex gap-6 animate-ticker" style={{ width: "max-content" }}>
        {[...ACTIVITIES, ...ACTIVITIES].map((a, i) => (
          <div key={i} className="flex items-center gap-2.5 bg-muted/60 border border-border rounded-full px-3 py-1.5 shrink-0">
            <Image src={a.avatar} alt={a.name} width={20} height={20} className="size-5 rounded-full object-cover" />
            <span className="text-xs font-bold text-foreground">{a.name}</span>
            <span className="text-xs font-medium text-muted-foreground">in {a.city}</span>
            <CheckCircle2 className="size-3.5 text-emerald-500 shrink-0" />
            <span className="text-xs font-medium text-muted-foreground">{a.service}</span>
            <span className="text-[10px] text-muted-foreground/60 font-medium">{a.time}</span>
          </div>
        ))}
      </div>

      <style>{`
        @keyframes ticker {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-ticker {
          animation: ticker 30s linear infinite;
        }
        .animate-ticker:hover {
          animation-play-state: paused;
        }
      `}</style>
    </div>
  );
}
