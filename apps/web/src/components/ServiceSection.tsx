"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Sparkles, Zap, Droplets, Wind, Wrench, Hammer, Bug, Paintbrush, Shirt, ShieldCheck,
  Car, Package, Utensils, Baby, Shield, CarFront, Dog, Dumbbell, PartyPopper, Truck, Heart, UserCheck, ArrowRight, Search, MapPin, X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type ServiceItem = {
  id: string;
  title: string;
  subtitle?: string;
  icon: React.ElementType;
  image?: string;
  badge?: string;
  tags?: string[];
};

const HOUSEHOLD_SERVICES: ServiceItem[] = [
  { id: "cleaning", title: "Cleaning", subtitle: "Standard & deep clean", icon: Sparkles, image: "/images/services/dozo_home_cleaning_pro_1775929072455.png", badge: "Most Booked", tags: ["clean", "home", "maid", "sweep", "mop"] },
  { id: "deep-cleaning", title: "Deep Cleaning", subtitle: "Total home refresh", icon: Sparkles, image: "/images/services/dozo_deep_cleaning_1775909251685.png", tags: ["deep", "thorough", "clean", "sanitize"] },
  { id: "electrician", title: "Electrician", subtitle: "Wiring & repairs", icon: Zap, image: "/images/services/dozo_electrician_1775909272231.png", tags: ["electric", "wiring", "light", "switch", "fan", "socket"] },
  { id: "plumbing", title: "Plumbing", subtitle: "Leaks & pipes", icon: Droplets, image: "/images/services/dozo_plumbing_1775909290047.png", tags: ["pipe", "leak", "tap", "water", "drain", "toilet"] },
  { id: "ac-repair", title: "AC Repair & Service", subtitle: "Cooling & maintenance", icon: Wind, image: "/images/services/dozo_ac_repair_1775909305869.png", badge: "Popular", tags: ["ac", "air conditioner", "cool", "split", "service"] },
  { id: "appliance", title: "Appliance Repair", subtitle: "Fridge, Washing Machine", icon: Wrench, image: "/images/services/dozo_appliance_repair_1775909319632.png", tags: ["fridge", "washing machine", "microwave", "appliance", "repair"] },
  { id: "carpenter", title: "Carpenter", subtitle: "Furniture & woodwork", icon: Hammer, image: "/images/services/dozo_carpenter_1775909335642.png", tags: ["wood", "furniture", "door", "cabinet", "carpenter"] },
  { id: "pest-control", title: "Pest Control", subtitle: "Termite & bugs", icon: Bug, image: "/images/services/dozo_pest_control_1775909352597.png", tags: ["pest", "termite", "cockroach", "rat", "lizard", "insect"] },
  { id: "painting", title: "Painting", subtitle: "Interior & exterior", icon: Paintbrush, image: "/images/services/dozo_painting_pro_1775910033100.png", tags: ["paint", "wall", "colour", "color", "interior", "exterior"] },
  { id: "laundry", title: "Laundry / Ironing", subtitle: "Wash, fold & iron", icon: Shirt, image: "/images/services/dozo_laundry_1775909385731.png", tags: ["laundry", "iron", "wash", "clothes", "fold", "dry"] },
  { id: "sanitization", title: "Home Sanitization", subtitle: "Complete disinfection", icon: ShieldCheck, image: "/images/services/dozo_sanitization_1775909412453.png", tags: ["sanitize", "disinfect", "germ", "virus", "spray"] },
];

const ALLROUNDER_SERVICES: ServiceItem[] = [
  { id: "driver", title: "Driver", subtitle: "On-demand city driving", icon: Car, image: "/images/services/dozo_ar_driver_1775910008342.png", badge: "Most Booked", tags: ["driver", "car", "drive", "taxi", "chauffeur"] },
  { id: "delivery", title: "Delivery Helper", subtitle: "Instant drop & pickup", icon: Package, image: "/images/services/dozo_ar_delivery_helper_1775910328727.png", badge: "Popular", tags: ["delivery", "parcel", "package", "courier", "pickup", "drop"] },
  { id: "chef", title: "Personal Chef", subtitle: "Daily or party meals", icon: Utensils, image: "https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=800&q=80", tags: ["chef", "cook", "food", "meal", "cooking", "kitchen"] },
  { id: "babysitter", title: "Babysitter & Caretaker", subtitle: "Trusted child care", icon: Baby, image: "https://images.unsplash.com/photo-1502086223501-7ea6ecd79368?w=800&q=80", tags: ["baby", "child", "kids", "nanny", "caretaker", "babysitter"] },
  { id: "security", title: "Security Guard", subtitle: "Events & bodyguard", icon: Shield, image: "https://images.unsplash.com/photo-1588666309990-d68f08e3d4a6?w=800&q=80", tags: ["security", "guard", "bodyguard", "event", "protection"] },
  { id: "car-washer", title: "Car Washer", subtitle: "Deep cleaning", icon: CarFront, image: "https://images.unsplash.com/photo-1601362840469-51e4d8d58785?w=800&q=80", tags: ["car", "wash", "clean", "vehicle", "auto"] },
  { id: "pet-groomer", title: "Pet Groomer", subtitle: "Bath & styling", icon: Dog, image: "https://images.unsplash.com/photo-1516734212-0fe9ae19fc8e?w=800&q=80", tags: ["pet", "dog", "cat", "grooming", "bath", "animal"] },
  { id: "fitness", title: "Fitness Trainer", subtitle: "Yoga & gym at home", icon: Dumbbell, image: "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=800&q=80", tags: ["fitness", "gym", "yoga", "trainer", "workout", "exercise"] },
  { id: "event-helper", title: "Event Helper", subtitle: "Setup & serving", icon: PartyPopper, image: "https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=800&q=80", tags: ["event", "party", "setup", "decoration", "serving", "wedding"] },
  { id: "moving", title: "Moving Helper", subtitle: "Packing & shifting", icon: Truck, image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80", tags: ["move", "shift", "pack", "relocate", "transport", "boxes"] },
  { id: "elderly", title: "Elderly Care Assistant", subtitle: "Compassionate care", icon: Heart, image: "https://images.unsplash.com/photo-1576765608535-5f04d1e3f289?w=800&q=80", badge: "Highly Rated", tags: ["elderly", "senior", "old", "care", "assistant", "aged"] },
  { id: "assistant", title: "Personal Assistant", subtitle: "Errands & admin", icon: UserCheck, image: "https://images.unsplash.com/photo-1573164713988-8665fc963095?w=800&q=80", tags: ["assistant", "errand", "admin", "task", "office", "helper"] },
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
        <div className="flex flex-col gap-4 max-w-2xl">
          <h2 className="text-3xl lg:text-4xl font-black tracking-tight text-foreground">
            Services We Offer
          </h2>
          <p className="text-lg text-muted-foreground font-medium">
            From home care to everyday help — DOZO has you covered in 10 minutes.
          </p>
        </div>

        {/* Search Bar */}
        <div className="relative max-w-2xl">
          <div className="flex items-center gap-3 bg-background border border-border rounded-[14px] px-4 py-3.5 shadow-sm focus-within:ring-2 focus-within:ring-primary/30 focus-within:border-primary/50 transition-all duration-200">
            <label htmlFor="service-search" className="sr-only">Search for services</label>
            <Search className="size-5 text-muted-foreground shrink-0" strokeWidth={2} />
            <Input
              id="service-search"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search for a service — e.g. plumber, chef, driver..."
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
          <div className="inline-flex bg-muted p-1.5 rounded-[12px] shadow-sm w-full md:w-auto">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setActiveTab("household")}
              className={`flex-1 md:flex-none px-6 py-3 rounded-lg text-sm font-bold transition-all duration-300 ${
                activeTab === "household"
                  ? "bg-background shadow-sm text-foreground ring-1 ring-border"
                  : "text-muted-foreground hover:text-foreground hover:bg-black/5 dark:hover:bg-white/5"
              }`}
            >
              Home Services
            </Button>
            <Button
              type="button"
              variant="ghost"
              onClick={() => setActiveTab("allrounder")}
              className={`flex-1 md:flex-none px-6 py-3 rounded-lg text-sm font-bold transition-all duration-300 ${
                activeTab === "allrounder"
                  ? "bg-background shadow-sm text-foreground ring-1 ring-border"
                  : "text-muted-foreground hover:text-foreground hover:bg-black/5 dark:hover:bg-white/5"
              }`}
            >
              All-Rounder Services
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
            <div className="size-20 rounded-full bg-primary/5 border border-primary/20 flex items-center justify-center">
              <MapPin className="size-8 text-primary/60" strokeWidth={1.5} />
            </div>
            <div className="space-y-2 max-w-sm">
              <h3 className="text-xl font-black text-foreground">Coming Soon to Your Location!</h3>
              <p className="text-muted-foreground text-sm font-medium leading-relaxed">
                We don&apos;t offer <span className="font-bold text-foreground">&ldquo;{searchQuery}&rdquo;</span> just yet, but we&apos;re expanding fast. We&apos;ll be launching this service at your location very soon — stay tuned! 🚀
              </p>
            </div>
            <Button
              type="button"
              onClick={() => setSearchQuery("")}
              className="px-5 py-2.5 rounded-[10px] text-sm font-bold bg-primary text-primary-foreground hover:opacity-90"
            >
              Browse Available Services
            </Button>
          </div>
        ) : (
          /* Services Grid */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
            {displayServices.map((srv) => (
              <Link
                key={srv.id}
                href={`/customer/book?service=${srv.id}`}
                className="group bg-background rounded-xl border border-border flex flex-col transition-all duration-300 hover:shadow-xl hover:-translate-y-1 hover:border-primary/50 overflow-hidden relative h-full"
              >
                {srv.image ? (
                  <div className="relative w-full h-45 bg-muted shrink-0 overflow-hidden">
                    <Image src={srv.image} alt={srv.title} fill sizes="(min-width: 1280px) 25vw, (min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw" className="object-cover transition-transform duration-500 group-hover:scale-105" />
                    <div className="absolute inset-0 bg-linear-to-t from-black/60 via-black/10 to-transparent" />
                    {srv.badge && (
                      <span className="absolute top-3 right-3 px-3 py-1 text-[11px] font-black tracking-wide uppercase rounded-full bg-white/90 text-zinc-900 shadow-sm">
                        {srv.badge}
                      </span>
                    )}
                    <div className="absolute top-3 left-3 size-10 rounded-[10px] bg-white/20 backdrop-blur-md flex items-center justify-center text-white border border-white/20">
                      <srv.icon className="size-5" strokeWidth={2.5} />
                    </div>
                  </div>
                ) : (
                  <div className="p-5 pb-0 flex items-start justify-between">
                    <div className="size-12 rounded-[12px] border border-border bg-muted/50 group-hover:bg-primary/5 flex items-center justify-center text-foreground group-hover:text-primary transition-colors">
                      <srv.icon className="size-5.5" strokeWidth={2} />
                    </div>
                    {srv.badge && (
                      <span className="px-3 py-1 text-[11px] font-black tracking-wide uppercase rounded-full bg-accent/10 text-accent border border-accent/20">
                        {srv.badge}
                      </span>
                    )}
                  </div>
                )}

                <div className="p-5 flex flex-col justify-between flex-1">
                  <div className="space-y-1">
                    <h3 className="font-bold text-lg text-foreground group-hover:text-primary transition-colors">
                      {srv.title}
                    </h3>
                    {srv.subtitle && (
                      <p className="text-sm text-muted-foreground font-medium line-clamp-1">
                        {srv.subtitle}
                      </p>
                    )}
                  </div>

                  <div className="mt-6 pt-4 border-t border-border/60 flex items-center justify-between">
                    <div className="flex items-center gap-1.5 bg-accent/10 text-accent px-2.5 py-1 rounded-md text-[12px] font-bold">
                      Book Now
                    </div>
                    <div className="size-8 rounded-full bg-muted/50 border border-border flex items-center justify-center group-hover:bg-accent group-hover:text-white group-hover:border-accent transition-all duration-300">
                      <ArrowRight className="size-4" strokeWidth={2.5} />
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
