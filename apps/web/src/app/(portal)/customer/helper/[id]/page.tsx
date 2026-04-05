/* eslint-disable @next/next/no-img-element */

"use client";

import Link from "next/link";
import { ArrowLeft, Star, ShieldCheck, Clock, CheckCircle2, BriefcaseBusiness } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

export default function HelperProfilePage({ params }: { params: { id: string } }) {
  // Simulated helper data based on the DOZO specification
  const helper = {
    id: params.id,
    name: "Ravi Kumar",
    photoUrl: "https://i.pravatar.cc/300?u=ravi",
    category: "Electrician",
    experience: "5+ years",
    skills: ["Circuit Repair", "Appliance Installation", "Wiring"],
    rating: 4.9,
    reviewCount: 124,
    verified: true,
    completedJobs: 342,
    pricing: "₹450 / hour",
    about: "Certified electrician with over 5 years of experience handling residential and commercial wiring issues. Fast, reliable, and always arrives on time.",
    reviews: [
      { id: 1, author: "Sneha M.", rating: 5, date: "2 days ago", text: "Ravi was very professional and fixed our main switchboard in 15 minutes. Highly recommended!" },
      { id: 2, author: "Ashish T.", rating: 5, date: "1 week ago", text: "On time and knew exactly what the issue was. Cleaned up after the work was done." },
    ]
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8 pb-32">
       {/* Header Navigation */}
       <div className="flex items-center gap-4">
         <Link href="/customer/book" className="p-2 rounded-full hover:bg-muted transition-colors">
            <ArrowLeft className="size-5 text-muted-foreground" />
         </Link>
         <h1 className="text-xl font-heading font-bold">Provider Profile</h1>
       </div>

       {/* Profile Card */}
       <div className="surface-card-strong border border-border/50 rounded-3xl p-6 sm:p-8 animate-reveal-up overflow-hidden relative">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -z-10 -translate-y-1/2 translate-x-1/2" />
          
          <div className="flex flex-col sm:flex-row gap-8 items-start">
             {/* Photo & Basics */}
             <div className="flex flex-col items-center gap-4 w-full sm:w-auto">
                <div className="relative">
                   <img src={helper.photoUrl} alt={helper.name} className="size-32 rounded-full object-cover border-4 border-background shadow-xl" />
                   {helper.verified && (
                      <div className="absolute bottom-1 right-1 bg-green-500 text-white p-1.5 rounded-full ring-4 ring-background shadow-sm">
                         <ShieldCheck className="size-5" />
                      </div>
                   )}
                </div>
                <div className="text-center">
                   <h2 className="text-2xl font-black font-heading">{helper.name}</h2>
                   <p className="text-primary font-bold uppercase tracking-widest text-[10px] mt-1">{helper.category}</p>
                </div>
             </div>

             {/* Details Grid */}
             <div className="flex-1 space-y-6 w-full">
                <div className="grid grid-cols-2 gap-4">
                   <div className="bg-muted/40 rounded-2xl p-4 border border-border/50">
                      <div className="flex items-center gap-2 text-muted-foreground mb-1">
                         <Star className="size-4 fill-amber-500 text-amber-500" />
                         <span className="text-xs font-bold uppercase tracking-wider">Rating</span>
                      </div>
                      <p className="text-xl font-black">{helper.rating} <span className="text-sm text-muted-foreground font-medium">({helper.reviewCount})</span></p>
                   </div>
                   <div className="bg-muted/40 rounded-2xl p-4 border border-border/50">
                      <div className="flex items-center gap-2 text-muted-foreground mb-1">
                         <CheckCircle2 className="size-4 text-green-500" />
                         <span className="text-xs font-bold uppercase tracking-wider">Jobs</span>
                      </div>
                      <p className="text-xl font-black">{helper.completedJobs}</p>
                   </div>
                   <div className="bg-muted/40 rounded-2xl p-4 border border-border/50">
                      <div className="flex items-center gap-2 text-muted-foreground mb-1">
                         <Clock className="size-4 text-accent" />
                         <span className="text-xs font-bold uppercase tracking-wider">Experience</span>
                      </div>
                      <p className="text-xl font-black">{helper.experience}</p>
                   </div>
                   <div className="bg-muted/40 rounded-2xl p-4 border border-border/50">
                      <div className="flex items-center gap-2 text-muted-foreground mb-1">
                         <BriefcaseBusiness className="size-4 text-primary" />
                         <span className="text-xs font-bold uppercase tracking-wider">Pricing</span>
                      </div>
                      <p className="text-xl font-black">{helper.pricing}</p>
                   </div>
                </div>

                <div className="space-y-2">
                   <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground">About</h3>
                   <p className="text-sm font-medium leading-relaxed">{helper.about}</p>
                </div>

                <div className="space-y-3">
                   <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Top Skills</h3>
                   <div className="flex flex-wrap gap-2">
                      {helper.skills.map((skill) => (
                         <Badge key={skill} variant="secondary" className="bg-primary/10 text-primary hover:bg-primary/20 hover:text-primary border-none rounded-lg px-3 py-1.5 font-bold">
                            {skill}
                         </Badge>
                      ))}
                   </div>
                </div>
             </div>
          </div>
       </div>

       {/* Reviews Section */}
       <div className="space-y-4 animate-reveal-up" style={{ animationDelay: "0.1s" }}>
          <h3 className="text-xl font-heading font-black px-2">Recent Reviews</h3>
          <div className="grid gap-4">
             {helper.reviews.map((r) => (
                <Card key={r.id} className="surface-card border-none shadow-sm p-2">
                   <CardContent className="p-4 space-y-3">
                      <div className="flex items-center justify-between">
                         <p className="font-bold text-sm">{r.author}</p>
                         <p className="text-xs text-muted-foreground font-medium">{r.date}</p>
                      </div>
                      <div className="flex items-center gap-0.5">
                         {[...Array(5)].map((_, i) => (
                            <Star key={i} className={`size-3.5 ${i < r.rating ? "fill-amber-500 text-amber-500" : "fill-muted text-muted"}`} />
                         ))}
                      </div>
                      <p className="text-sm text-foreground/80 leading-relaxed font-medium">&ldquo;{r.text}&rdquo;</p>
                   </CardContent>
                </Card>
             ))}
          </div>
       </div>

       {/* Sticky CTA */}
       <div className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-background via-background to-transparent z-50">
          <div className="max-w-3xl mx-auto flex gap-4">
            <Link href={`/customer/book?helperId=${helper.id}`} className="w-full">
              <Button size="lg" className="w-full h-16 rounded-[1.5rem] text-lg font-black shadow-2xl shadow-primary/30 transition-all hover:scale-[1.02] active:scale-95 bg-primary text-white">
                 Book via DOZO
              </Button>
            </Link>
          </div>
       </div>

    </div>
  );
}
