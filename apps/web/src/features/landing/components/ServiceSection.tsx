"use client";

import { useState, useMemo } from "react";
import type { ChangeEvent } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Sparkles, Zap, Droplets, Wind, Wrench, Hammer, Bug, Paintbrush, Shirt, ShieldCheck,
  Car, Package, Utensils, Baby, Shield, CarFront, Dog, Dumbbell, PartyPopper, Truck, Heart, UserCheck, ArrowRight, Search, MapPin, X
} from "lucide-react";
import { Button } from "@repo/ui/components/ui/button";
import { Input } from "@repo/ui/components/ui/input";

type ServiceItem = {
  id: string;
  title: string;
  subtitle?: string;
  icon: React.ElementType;
  image?: string;
  badge?: string;
  tags?: string[];
  startingPrice: string;
  rating: string;
  reviews: string;
  gradient: string;
};

const HOUSEHOLD_SERVICES: ServiceItem[] = [
  {
    id: "cleaning",
    title: "Cleaning",
    subtitle: "Standard & deep clean",
    icon: Sparkles,
    image: "/images/services/dozo_home_cleaning_pro_1775929072455.png",
    badge: "Most Popular",
    tags: ["clean", "home", "maid", "sweep", "mop"],
    startingPrice: "₹199",
    rating: "4.8",
    reviews: "4.2k",
    gradient: "from-amber-500/15 via-orange-500/5 to-transparent",
  },
  {
    id: "deep-cleaning",
    title: "Deep Cleaning",
    subtitle: "Total home refresh",
    icon: Sparkles,
    image: "/images/services/dozo_deep_cleaning_1775909251685.png",
    badge: "Most Popular",
    tags: ["deep", "thorough", "clean", "sanitize"],
    startingPrice: "₹499",
    rating: "4.9",
    reviews: "2.1k",
    gradient: "from-blue-500/15 via-indigo-500/5 to-transparent",
  },
  {
    id: "electrician",
    title: "Electrician",
    subtitle: "Wiring & repairs",
    icon: Zap,
    image: "/images/services/dozo_electrician_1775909272231.png",
    badge: "Trending",
    tags: ["electric", "wiring", "light", "switch", "fan", "socket"],
    startingPrice: "₹149",
    rating: "4.9",
    reviews: "3.8k",
    gradient: "from-yellow-500/15 via-amber-500/5 to-transparent",
  },
  {
    id: "plumbing",
    title: "Plumbing",
    subtitle: "Leaks & pipes",
    icon: Droplets,
    image: "/images/services/dozo_plumbing_1775909290047.png",
    tags: ["pipe", "leak", "tap", "water", "drain", "toilet"],
    startingPrice: "₹149",
    rating: "4.8",
    reviews: "2.9k",
    gradient: "from-cyan-500/15 via-blue-500/5 to-transparent",
  },
  {
    id: "ac-repair",
    title: "AC Repair & Service",
    subtitle: "Cooling & maintenance",
    icon: Wind,
    image: "/images/services/dozo_ac_repair_1775909305869.png",
    tags: ["ac", "air conditioner", "cool", "split", "service"],
    startingPrice: "₹299",
    rating: "4.9",
    reviews: "1.7k",
    gradient: "from-sky-500/15 via-cyan-500/5 to-transparent",
  },
  {
    id: "appliance",
    title: "Appliance Repair",
    subtitle: "Fridge, Washing Machine",
    icon: Wrench,
    image: "/images/services/dozo_appliance_repair_1775909319632.png",
    tags: ["fridge", "washing machine", "microwave", "appliance", "repair"],
    startingPrice: "₹249",
    rating: "4.8",
    reviews: "1.4k",
    gradient: "from-violet-500/15 via-purple-500/5 to-transparent",
  },
  {
    id: "carpenter",
    title: "Carpenter",
    subtitle: "Furniture & woodwork",
    icon: Hammer,
    image: "/images/services/dozo_carpenter_1775909335642.png",
    tags: ["wood", "furniture", "door", "cabinet", "carpenter"],
    startingPrice: "₹199",
    rating: "4.7",
    reviews: "920",
    gradient: "from-amber-600/15 via-yellow-600/5 to-transparent",
  },
  {
    id: "pest-control",
    title: "Pest Control",
    subtitle: "Termite & bugs",
    icon: Bug,
    image: "/images/services/dozo_pest_control_1775909352597.png",
    tags: ["pest", "termite", "cockroach", "rat", "lizard", "insect"],
    startingPrice: "₹699",
    rating: "4.9",
    reviews: "1.1k",
    gradient: "from-emerald-500/15 via-green-500/5 to-transparent",
  },
  {
    id: "painting",
    title: "Painting",
    subtitle: "Interior & exterior",
    icon: Paintbrush,
    image: "/images/services/dozo_painting_pro_1775910033100.png",
    tags: ["paint", "wall", "colour", "color", "interior", "exterior"],
    startingPrice: "₹999",
    rating: "4.8",
    reviews: "640",
    gradient: "from-rose-500/15 via-pink-500/5 to-transparent",
  },
  {
    id: "laundry",
    title: "Laundry / Ironing",
    subtitle: "Wash, fold & iron",
    icon: Shirt,
    image: "/images/services/dozo_laundry_1775909385731.png",
    tags: ["laundry", "iron", "wash", "clothes", "fold", "dry"],
    startingPrice: "₹149",
    rating: "4.8",
    reviews: "1.8k",
    gradient: "from-indigo-500/15 via-blue-500/5 to-transparent",
  },
  {
    id: "sanitization",
    title: "Home Sanitization",
    subtitle: "Complete disinfection",
    icon: ShieldCheck,
    image: "/images/services/dozo_sanitization_1775909412453.png",
    tags: ["sanitize", "disinfect", "germ", "virus", "spray"],
    startingPrice: "₹399",
    rating: "4.9",
    reviews: "850",
    gradient: "from-teal-500/15 via-cyan-500/5 to-transparent",
  },
];

const ALLROUNDER_SERVICES: ServiceItem[] = [
  {
    id: "driver",
    title: "Driver",
    subtitle: "On-demand city driving",
    icon: Car,
    image: "/images/services/dozo_ar_driver_1775910008342.png",
    badge: "Most Popular",
    tags: ["driver", "car", "drive", "taxi", "chauffeur"],
    startingPrice: "₹299",
    rating: "4.9",
    reviews: "5.4k",
    gradient: "from-emerald-500/15 via-teal-500/5 to-transparent",
  },
  {
    id: "delivery",
    title: "Delivery Helper",
    subtitle: "Instant drop & pickup",
    icon: Package,
    image: "/images/services/dozo_ar_delivery_helper_1775910328727.png",
    badge: "Most Popular",
    tags: ["delivery", "parcel", "package", "courier", "pickup", "drop"],
    startingPrice: "₹99",
    rating: "4.8",
    reviews: "6.2k",
    gradient: "from-purple-500/15 via-indigo-500/5 to-transparent",
  },
  {
    id: "chef",
    title: "Personal Chef",
    subtitle: "Daily or party meals",
    icon: Utensils,
    image: "https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=800&q=80",
    badge: "Top Rated",
    tags: ["chef", "cook", "food", "meal", "cooking", "kitchen"],
    startingPrice: "₹349",
    rating: "4.9",
    reviews: "2.3k",
    gradient: "from-orange-500/15 via-amber-500/5 to-transparent",
  },
  {
    id: "babysitter",
    title: "Babysitter & Caretaker",
    subtitle: "Trusted child care",
    icon: Baby,
    image: "https://images.unsplash.com/photo-1502086223501-7ea6ecd79368?w=800&q=80",
    tags: ["baby", "child", "kids", "nanny", "caretaker", "babysitter"],
    startingPrice: "₹249",
    rating: "4.9",
    reviews: "1.6k",
    gradient: "from-pink-500/15 via-rose-500/5 to-transparent",
  },
  {
    id: "security",
    title: "Security Guard",
    subtitle: "Events & protection",
    icon: Shield,
    image: "https://images.unsplash.com/photo-1588666309990-d68f08e3d4a6?w=800&q=80",
    tags: ["security", "guard", "bodyguard", "event", "protection"],
    startingPrice: "₹399",
    rating: "4.8",
    reviews: "780",
    gradient: "from-slate-500/15 via-zinc-500/5 to-transparent",
  },
  {
    id: "car-washer",
    title: "Car Washer",
    subtitle: "Deep foam & polish",
    icon: CarFront,
    image: "https://images.unsplash.com/photo-1601362840469-51e4d8d58785?w=800&q=80",
    tags: ["car", "wash", "clean", "vehicle", "auto"],
    startingPrice: "₹199",
    rating: "4.7",
    reviews: "1.9k",
    gradient: "from-blue-500/15 via-sky-500/5 to-transparent",
  },
  {
    id: "pet-groomer",
    title: "Pet Groomer",
    subtitle: "Bath & styling",
    icon: Dog,
    image: "https://images.unsplash.com/photo-1516734212-0fe9ae19fc8e?w=800&q=80",
    tags: ["pet", "dog", "cat", "grooming", "bath", "animal"],
    startingPrice: "₹499",
    rating: "4.9",
    reviews: "890",
    gradient: "from-amber-500/15 via-yellow-500/5 to-transparent",
  },
  {
    id: "fitness",
    title: "Fitness Trainer",
    subtitle: "Yoga & workout at home",
    icon: Dumbbell,
    image: "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=800&q=80",
    tags: ["fitness", "gym", "yoga", "trainer", "workout", "exercise"],
    startingPrice: "₹399",
    rating: "4.9",
    reviews: "1.2k",
    gradient: "from-lime-500/15 via-emerald-500/5 to-transparent",
  },
  {
    id: "event-helper",
    title: "Event Helper",
    subtitle: "Setup & serving",
    icon: PartyPopper,
    image: "https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=800&q=80",
    tags: ["event", "party", "setup", "decoration", "serving", "wedding"],
    startingPrice: "₹299",
    rating: "4.8",
    reviews: "950",
    gradient: "from-fuchsia-500/15 via-purple-500/5 to-transparent",
  },
  {
    id: "moving",
    title: "Moving Helper",
    subtitle: "Packing & shifting",
    icon: Truck,
    image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80",
    tags: ["move", "shift", "pack", "relocate", "transport", "boxes"],
    startingPrice: "₹499",
    rating: "4.8",
    reviews: "1.1k",
    gradient: "from-orange-500/15 via-amber-500/5 to-transparent",
  },
  {
    id: "elderly",
    title: "Elderly Care Assistant",
    subtitle: "Compassionate care",
    icon: Heart,
    image: "https://images.unsplash.com/photo-1576765608535-5f04d1e3f289?w=800&q=80",
    tags: ["elderly", "senior", "old", "care", "assistant", "aged"],
    startingPrice: "₹349",
    rating: "4.9",
    reviews: "1.4k",
    gradient: "from-red-500/15 via-rose-500/5 to-transparent",
  },
  {
    id: "assistant",
    title: "Personal Assistant",
    subtitle: "Errands & admin",
    icon: UserCheck,
    image: "https://images.unsplash.com/photo-1573164713988-8665fc963095?w=800&q=80",
    tags: ["assistant", "errand", "admin", "task", "office", "helper"],
    startingPrice: "₹249",
    rating: "4.8",
    reviews: "820",
    gradient: "from-blue-500/15 via-indigo-500/5 to-transparent",
  },
];

const ALL_SERVICES = [...HOUSEHOLD_SERVICES, ...ALLROUNDER_SERVICES];

export function ServiceSection() {
  const [activeTab, setActiveTab] = useState<"household" | "allrounder">("household");
  const [searchQuery, setSearchQuery] = useState("");

  const isSearching = searchQuery.trim().length > 0;

  const searchResults = useMemo(() => {
    if (!isSearching) return [];
    const q = searchQuery.toLowerCase().trim();
    return ALL_SERVICES.filter((srv) =>
      srv.title.toLowerCase().includes(q) ||
      srv.subtitle?.toLowerCase().includes(q) ||
      srv.tags?.some((t) => t.includes(q))
    );
  }, [searchQuery, isSearching]);

  const currentServices = activeTab === "household" ? HOUSEHOLD_SERVICES : ALLROUNDER_SERVICES;
  const displayServices = isSearching ? searchResults : currentServices;
  const noResults = isSearching && searchResults.length === 0;

  return (
    <section id="services" className="scroll-mt-24 py-24 px-6 border-t border-border bg-muted/20">
      <div className="max-w-7xl mx-auto space-y-10">

        {/* Section Header */}
        <div className="flex flex-col gap-3 max-w-2xl">
          <div className="inline-flex items-center gap-2 rounded-full bg-orange-500/10 px-3.5 py-1 text-xs font-black uppercase tracking-wider text-orange-600 dark:text-orange-400 w-fit">
            Instant Doorstep Pros
          </div>
          <h2 className="text-3xl lg:text-4xl font-black tracking-tight text-foreground">
            Services We Offer
          </h2>
          <p className="text-base sm:text-lg text-muted-foreground font-medium">
            From home deep cleaning to on-demand drivers — verified DOZO pros at your door in 10 minutes.
          </p>
        </div>

        {/* Search Bar */}
        <div className="relative max-w-2xl">
          <div className="flex items-center gap-3 bg-background border border-border/80 rounded-2xl px-4 py-3.5 shadow-sm focus-within:ring-2 focus-within:ring-orange-500/30 focus-within:border-orange-500/50 transition-all duration-200">
            <label htmlFor="service-search" className="sr-only">Search for services</label>
            <Search className="size-5 text-muted-foreground shrink-0" strokeWidth={2} />
            <Input
              id="service-search"
              type="text"
              value={searchQuery}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
              placeholder="Search for a service — e.g. cleaner, plumber, chef, driver..."
              className="flex-1 bg-transparent border-0 shadow-none text-sm font-medium text-foreground placeholder:text-muted-foreground outline-none h-auto px-0 py-0 rounded-none focus-visible:ring-0"
            />
            {searchQuery && (
              <Button
                type="button"
                variant="ghost"
                size="icon-xs"
                onClick={() => setSearchQuery("")}
                aria-label="Clear service search"
                className="size-6 rounded-full bg-muted hover:bg-muted-foreground/20 text-muted-foreground"
              >
                <X className="size-3.5" strokeWidth={2.5} />
              </Button>
            )}
          </div>
        </div>

        {/* Tab Toggle — only shown when not searching */}
        {!isSearching && (
          <div className="inline-flex bg-muted/80 p-1.5 rounded-2xl shadow-xs w-full sm:w-auto">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setActiveTab("household")}
              className={`flex-1 sm:flex-none px-6 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all duration-300 ${
                activeTab === "household"
                  ? "bg-background shadow-xs text-foreground ring-1 ring-border/80"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              🏠 Home Services
            </Button>
            <Button
              type="button"
              variant="ghost"
              onClick={() => setActiveTab("allrounder")}
              className={`flex-1 sm:flex-none px-6 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all duration-300 ${
                activeTab === "allrounder"
                  ? "bg-background shadow-xs text-foreground ring-1 ring-border/80"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              ⚡ All-Rounder Services
            </Button>
          </div>
        )}

        {/* Search Label */}
        {isSearching && !noResults && (
          <p className="text-sm text-muted-foreground font-medium -mt-2">
            Showing <span className="font-bold text-foreground">{searchResults.length}</span> result{searchResults.length !== 1 ? "s" : ""} for &ldquo;<span className="font-bold text-foreground">{searchQuery}</span>&rdquo;
          </p>
        )}

        {/* No Results — Coming Soon State */}
        {noResults ? (
          <div className="flex flex-col items-center justify-center py-20 gap-6 text-center">
            <div className="size-20 rounded-3xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center">
              <MapPin className="size-8 text-orange-500" strokeWidth={1.5} />
            </div>
            <div className="space-y-2 max-w-sm">
              <h3 className="text-xl font-black text-foreground">Coming Soon to Your Location!</h3>
              <p className="text-muted-foreground text-sm font-medium leading-relaxed">
                We don&apos;t offer <span className="font-bold text-foreground">&ldquo;{searchQuery}&rdquo;</span> just yet, but we&apos;re expanding fast across major cities. Stay tuned! 🚀
              </p>
            </div>
            <Button
              type="button"
              onClick={() => setSearchQuery("")}
              className="px-6 py-2.5 rounded-xl text-sm font-bold bg-orange-500 text-white hover:bg-orange-600 shadow-md shadow-orange-500/20"
            >
              Browse Available Services
            </Button>
          </div>
        ) : (
          /* Services: Horizontal scroll on mobile with snap, Grid on desktop */
          <div className="flex sm:grid gap-4 sm:gap-6 overflow-x-auto pb-4 pt-1 sm:overflow-visible scrollbar-none snap-x snap-mandatory sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {displayServices.map((srv) => (
              <Link
                key={srv.id}
                href={`/customer/book?service=${srv.id}`}
                className="group snap-start shrink-0 w-[275px] sm:w-auto bg-card rounded-2xl border border-border/80 flex flex-col transition-all duration-300 hover:shadow-xl hover:-translate-y-1 hover:border-orange-500/40 active:scale-[0.98] overflow-hidden relative h-full"
              >
                {srv.image ? (
                  <div className="relative w-full h-44 bg-muted shrink-0 overflow-hidden">
                    <Image
                      src={srv.image}
                      alt={srv.title}
                      fill
                      sizes="(min-width: 1280px) 25vw, (min-width: 1024px) 33vw, (min-width: 640px) 50vw, 275px"
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                    
                    {/* Badge */}
                    {srv.badge && (
                      <span className="absolute top-3 right-3 px-2.5 py-0.5 text-[11px] font-black tracking-wide uppercase rounded-full bg-orange-500 text-white shadow-md shadow-orange-500/30">
                        {srv.badge}
                      </span>
                    )}

                    {/* Category Icon Badge */}
                    <div className="absolute top-3 left-3 size-9 rounded-xl bg-background/80 backdrop-blur-md flex items-center justify-center text-foreground border border-border/60 shadow-xs">
                      <srv.icon className="size-4.5" strokeWidth={2.2} />
                    </div>

                    {/* Rating teaser on bottom of image */}
                    <div className="absolute bottom-2.5 left-3 flex items-center gap-1 text-xs font-bold text-white drop-shadow-sm">
                      <span className="text-amber-400">★</span> {srv.rating}{" "}
                      <span className="text-white/80 font-normal">({srv.reviews})</span>
                    </div>
                  </div>
                ) : (
                  <div className={`p-5 pb-0 flex items-start justify-between bg-gradient-to-b ${srv.gradient}`}>
                    <div className="size-12 rounded-xl border border-border/80 bg-background/80 flex items-center justify-center text-foreground group-hover:text-orange-500 transition-colors shadow-xs">
                      <srv.icon className="size-6" strokeWidth={2} />
                    </div>
                    {srv.badge && (
                      <span className="px-2.5 py-0.5 text-[11px] font-black tracking-wide uppercase rounded-full bg-orange-500/15 text-orange-600 dark:text-orange-400 border border-orange-500/20">
                        {srv.badge}
                      </span>
                    )}
                  </div>
                )}

                <div className="p-5 flex flex-col justify-between flex-1 space-y-4">
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <h3 className="font-black text-base text-foreground group-hover:text-orange-600 transition-colors">
                        {srv.title}
                      </h3>
                      {!srv.image && (
                        <span className="text-xs font-bold text-muted-foreground flex items-center gap-0.5">
                          <span className="text-amber-500">★</span> {srv.rating}
                        </span>
                      )}
                    </div>
                    {srv.subtitle && (
                      <p className="text-xs text-muted-foreground font-medium line-clamp-1">
                        {srv.subtitle}
                      </p>
                    )}
                  </div>

                  <div className="pt-3 border-t border-border/60 flex items-center justify-between">
                    <div>
                      <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Starts at</p>
                      <p className="text-base font-black text-foreground">{srv.startingPrice}</p>
                    </div>

                    <div className="flex items-center gap-1 text-xs font-bold text-orange-600 dark:text-orange-400 group-hover:translate-x-0.5 transition-transform">
                      Book Now <ArrowRight className="size-3.5" />
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

      </div>
    </section>
  );
}
