"use client";

import { useState } from "react";
import { MyMap } from "@/components/map-component";
import { useSession } from "@/lib/auth/session";
import { Button } from "@/components/ui/button";
import { ChevronLeft, Star, Clock, CheckCircle2, Search, ArrowRight, MapPin } from "lucide-react";
import { useRouter } from "next/navigation";

const SERVICES = [
  { id: "cleaner", name: "Cleaning", icon: "✨", price: "from ₹299" },
  { id: "electrician", name: "Electrician", icon: "⚡", price: "from ₹149" },
  { id: "plumber", name: "Plumber", icon: "🔧", price: "from ₹199" },
  { id: "driver", name: "Driver", icon: "🚗", price: "from ₹499" },
  { id: "delivery", name: "Delivery", icon: "📦", price: "from ₹99" },
  { id: "handyman", name: "Handyman", icon: "🔨", price: "from ₹349" },
];

export default function CustomerBookPage() {
  const { session } = useSession();
  const router = useRouter();
  
  const [step, setStep] = useState(1);
  const [selectedService, setSelectedService] = useState<string | null>(null);
  const [isSearching, setIsSearching] = useState(false);

  const handleNext = () => setStep(prev => prev + 1);
  const handleBack = () => setStep(prev => prev - 1);

  const simulateSearch = () => {
    setIsSearching(true);
    setStep(3);
    setTimeout(() => {
      setIsSearching(false);
    }, 2000);
  };

  return (
    <div className="max-w-3xl mx-auto pb-20">
      
      {/* HEADER SECTION */}
      <div className="sticky top-0 z-30 bg-background border-b border-border px-4 py-4 mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {step > 1 && (
            <Button variant="ghost" size="icon" onClick={handleBack} className="rounded-full size-8 hover:bg-muted">
              <ChevronLeft className="size-5" />
            </Button>
          )}
          <div>
            <h1 className="text-xl font-bold tracking-tight">
              {step === 1 && "What do you need help with?"}
              {step === 2 && "Confirm Location"}
              {step === 3 && (isSearching ? "Finding nearby helpers..." : "Available Helpers")}
            </h1>
          </div>
        </div>
        <div className="flex items-center gap-1">
          {[1,2,3].map(s => (
             <div key={s} className={`h-1.5 rounded-full transition-colors duration-300 ${s === step ? 'bg-foreground w-8' : s < step ? 'bg-muted w-4' : 'bg-muted w-4'}`} />
          ))}
        </div>
      </div>

      <div className="px-4 fade-up">
        {/* STEP 1: SELECT SERVICE */}
        {step === 1 && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
              {SERVICES.map(srv => (
                <button
                  key={srv.id}
                  onClick={() => setSelectedService(srv.id)}
                  className={`relative p-5 rounded-[12px] border text-left transition-colors duration-200 outline-none
                    ${selectedService === srv.id 
                      ? 'border-foreground bg-muted/50' 
                      : 'border-border bg-card hover:border-foreground/30 hover:bg-muted/30'
                    }`}
                >
                  {selectedService === srv.id && (
                    <div className="absolute top-3 right-3 text-foreground">
                      <CheckCircle2 className="size-5" />
                    </div>
                  )}
                  <div className="text-3xl mb-3">{srv.icon}</div>
                  <h3 className="font-bold text-[15px]">{srv.name}</h3>
                  <p className="text-sm text-muted-foreground font-medium mt-0.5">{srv.price}</p>
                </button>
              ))}
            </div>
            
            <div className="pt-8 flex justify-end">
              <Button 
                onClick={handleNext} 
                disabled={!selectedService}
                className="bg-foreground text-background hover:bg-foreground/90 h-12 px-8 rounded-[8px] text-[15px] font-bold transition-all w-full md:w-auto"
              >
                Continue <ArrowRight className="ml-2 size-4" />
              </Button>
            </div>
          </div>
        )}

        {/* STEP 2: LOCATION */}
        {step === 2 && (
          <div className="space-y-6 fade-up">
            <div className="border border-border p-4 rounded-[12px] bg-card flex gap-4 items-center">
               <div className="size-10 rounded-full bg-muted flex items-center justify-center shrink-0">
                 <MapPin className="size-5 text-foreground" />
               </div>
               <div>
                 <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Service Address</p>
                 <p className="font-bold text-[15px] mt-0.5">Current Location (GPS)</p>
               </div>
            </div>
            
            <div className="h-[400px] rounded-[16px] overflow-hidden border border-border relative">
              <MyMap userId={session?.user.id} />
            </div>
            
            <Button 
               onClick={simulateSearch} 
               className="bg-foreground text-background hover:bg-foreground/90 h-12 px-8 rounded-[8px] text-[15px] font-bold transition-all w-full"
            >
               Confirm & Find Helper
            </Button>
          </div>
        )}

        {/* STEP 3: MATCHING & RESULTS */}
        {step === 3 && (
          <div className="fade-up space-y-4">
            {isSearching ? (
              <div className="flex flex-col items-center justify-center py-20 space-y-6">
                <Search className="size-10 text-muted-foreground animate-pulse" />
                <div className="text-center space-y-2">
                  <h2 className="text-xl font-bold">Searching...</h2>
                  <p className="text-muted-foreground text-sm">Matching you with top-rated professionals.</p>
                </div>
                
                {/* Flat Skeleton Cards */}
                <div className="w-full space-y-4 mt-8">
                  {[1,2].map(i => (
                    <div key={i} className="bg-card rounded-[12px] p-5 flex gap-4 border border-border">
                      <div className="size-14 rounded-full bg-muted animate-pulse" />
                      <div className="flex-1 space-y-2 py-2">
                        <div className="h-4 bg-muted rounded w-1/3 animate-pulse" />
                        <div className="h-3 bg-muted rounded w-1/4 animate-pulse" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-4 fade-up">
                 <div className="bg-success/10 text-success-foreground p-4 rounded-[12px] flex items-center gap-3 border border-success/20">
                   <CheckCircle2 className="size-5 text-success" />
                   <p className="font-bold text-success text-sm">Found verified helpers nearby</p>
                 </div>

                 {[
                   { name: "Rahul Sharma", rating: "4.9", jobs: "124", dist: "1.2 km away", eta: "8 mins", price: "₹299/hr" },
                   { name: "Anita K", rating: "4.8", jobs: "89", dist: "2.1 km away", eta: "12 mins", price: "₹349/hr" },
                   { name: "Suresh P.", rating: "4.7", jobs: "205", dist: "3.5 km away", eta: "18 mins", price: "₹249/hr" }
                 ].map((h, i) => (
                   <div key={i} className="bg-card border border-border rounded-[12px] p-5 flex flex-col md:flex-row gap-5 items-start md:items-center justify-between transition-colors hover:border-foreground/30">
                     <div className="flex items-center gap-4">
                       <img src={`https://i.pravatar.cc/150?u=${i+10}`} alt={h.name} className="size-14 rounded-full bg-muted object-cover" />
                       <div>
                         <h3 className="font-bold text-[16px]">{h.name}</h3>
                         <div className="flex items-center gap-3 text-xs font-semibold text-muted-foreground mt-1">
                           <span className="flex items-center gap-0.5"><Star className="size-3.5 fill-foreground text-foreground"/> {h.rating}</span>
                           <span>•</span>
                           <span>{h.jobs} jobs</span>
                         </div>
                         <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1.5 font-medium">
                           <Clock className="size-3" /> Arrives in {h.eta}
                         </div>
                       </div>
                     </div>
                     <div className="flex md:flex-col items-center md:items-end justify-between w-full md:w-auto gap-4">
                        <span className="font-bold text-lg">{h.price}</span>
                        <Button 
                          onClick={() => router.push('/customer')} 
                          className="bg-accent text-white hover:bg-accent/90 outline-none border-none font-bold rounded-[8px] h-10 px-6 transition-all"
                        >
                          Book Now
                        </Button>
                     </div>
                   </div>
                 ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
