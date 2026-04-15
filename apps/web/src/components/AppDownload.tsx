"use client";

import Link from "next/link";
import Image from "next/image";
import { Smartphone } from "lucide-react";

export function AppDownload() {
  return (
    <section className="py-24 px-6 border-t border-border bg-foreground text-background overflow-hidden relative">
      {/* Background grid pattern */}
      <div className="absolute inset-0 opacity-[0.03]" style={{
        backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 0)`,
        backgroundSize: "40px 40px"
      }} />

      <div className="max-w-7xl mx-auto relative">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left */}
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/20 text-white/80 text-sm font-bold">
              <Smartphone className="size-3.5" />
              Available on iOS & Android
            </div>
            <h2 className="text-4xl lg:text-5xl font-black tracking-tight leading-tight text-white">
              DOZO in your pocket.<br />
              <span className="text-orange-400">Help in 10 minutes.</span>
            </h2>
            <p className="text-white/60 font-medium text-lg leading-relaxed max-w-md">
              Book services, track your helper in real-time, chat, and pay — all from one beautifully designed app.
            </p>

            {/* App Store Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/help#app-download" className="flex items-center gap-3 bg-white text-zinc-900 font-bold px-5 py-3.5 rounded-[12px] hover:bg-white/90 transition-all hover:shadow-lg hover:shadow-white/10" aria-label="Get iOS app launch updates">
                <svg viewBox="0 0 24 24" className="size-7 fill-zinc-900" xmlns="http://www.w3.org/2000/svg">
                  <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
                </svg>
                <div>
                  <p className="text-[10px] font-semibold text-zinc-600 leading-none mb-0.5">Download on the</p>
                  <p className="text-[16px] font-black leading-none">App Store</p>
                </div>
              </Link>

              <Link href="/help#app-download" className="flex items-center gap-3 bg-white text-zinc-900 font-bold px-5 py-3.5 rounded-[12px] hover:bg-white/90 transition-all hover:shadow-lg hover:shadow-white/10" aria-label="Get Android app launch updates">
                <svg viewBox="0 0 24 24" className="size-7" xmlns="http://www.w3.org/2000/svg">
                  <path d="M3.18 23.76c.3.17.65.19.97.07l.05-.03 10.85-6.26-2.36-2.37-9.51 8.59z" fill="#EA4335"/>
                  <path d="M20.6 10.27l-2.94-1.7-2.65 2.39 2.65 2.65 2.97-1.71c.85-.49.85-1.64-.03-2.13v.5z" fill="#FBBC04"/>
                  <path d="M3.18.24C2.86.4 2.64.75 2.64 1.18v21.64c0 .43.22.78.54.94l.06.03 12.12-12.13L3.18.24z" fill="#4285F4"/>
                  <path d="M14.05 12l-2.87-2.87L3.18.24l-.06.04 9.51 9.51L14.05 12z" fill="#34A853"/>
                </svg>
                <div>
                  <p className="text-[10px] font-semibold text-zinc-600 leading-none mb-0.5">Get it on</p>
                  <p className="text-[16px] font-black leading-none">Google Play</p>
                </div>
              </Link>
            </div>
          </div>

          {/* Right — Phone mockup */}
          <div className="flex justify-center lg:justify-end relative">
            <div className="relative w-65">
              {/* Phone frame */}
              <div className="w-full aspect-9/19 bg-white/10 border border-white/20 rounded-[40px] relative overflow-hidden shadow-2xl shadow-black/40 backdrop-blur">
                {/* Status bar */}
                <div className="flex items-center justify-between px-6 pt-5 pb-2">
                  <span className="text-white text-[10px] font-bold">9:41</span>
                  <div className="w-16 h-4 bg-black rounded-full" />
                  <div className="flex gap-1">
                    <div className="w-3 h-2 bg-white/60 rounded-sm" />
                    <div className="w-4 h-2 bg-white/80 rounded-sm" />
                  </div>
                </div>
                {/* App UI inside phone */}
                <div className="px-4 space-y-3">
                  <div className="bg-white/10 rounded-[12px] p-3">
                    <p className="text-white/50 text-[9px] font-bold uppercase tracking-wider mb-1">Tracking Helper</p>
                    <div className="flex items-center gap-2">
                      <Image src="https://randomuser.me/api/portraits/men/32.jpg" width={28} height={28} className="size-7 rounded-full border border-white/30" alt="helper" />
                      <div>
                        <p className="text-white text-[11px] font-bold">Suresh Mehta</p>
                        <p className="text-white/50 text-[9px]">Arriving in 4 mins</p>
                      </div>
                      <div className="ml-auto w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                    </div>
                  </div>
                  <div className="bg-orange-500 rounded-[12px] p-3 text-center">
                    <p className="text-white font-black text-[12px]">Book a Service</p>
                    <p className="text-white/70 text-[9px] mt-0.5">Helper in 10 mins</p>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {["Cleaning", "Electric", "Plumbing"].map((s) => (
                      <div key={s} className="bg-white/10 rounded-lg py-2 text-center">
                        <p className="text-white text-[9px] font-bold">{s}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              {/* Floating notification */}
              <div className="absolute -right-8 top-16 bg-white rounded-[12px] px-3 py-2.5 shadow-xl flex items-center gap-2 w-48">
                <div className="size-8 bg-emerald-100 rounded-full flex items-center justify-center shrink-0">
                  <span className="text-sm">✅</span>
                </div>
                <div>
                  <p className="text-xs font-black text-zinc-900 leading-none">Job Complete!</p>
                  <p className="text-[10px] text-zinc-500 font-medium mt-0.5">Rate your helper</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
