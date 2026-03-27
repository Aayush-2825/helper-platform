"use client";

import { useState } from "react";
import { 
  Search, 
  Filter, 
  MoreHorizontal, 
  Star, 
  Briefcase, 
  CheckCircle2, 
  Clock, 
  AlertTriangle,
  FileBadge,
  MapPin,
  TrendingUp
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const mockHelpers = [
  { id: "H1", name: "David Miller", email: "david@helper.com", rating: 4.9, jobs: 142, status: "Active", level: "Pro", zone: "Brooklyn, NY" },
  { id: "H2", name: "Elena Petrova", email: "elena@helper.com", rating: 4.8, jobs: 89, status: "Pending", level: "Elite", zone: "Manhattan, NY" },
  { id: "H3", name: "John Doe", email: "john@helper.com", rating: 3.2, jobs: 12, status: "Suspended", level: "Standard", zone: "Queens, NY" },
  { id: "H4", name: "Raja Kumar", email: "raja@helper.com", rating: 4.7, jobs: 56, status: "Active", level: "Standard", zone: "Newark, NJ" },
];

export default function AdminHelpersPage() {
  const [search, setSearch] = useState("");

  return (
    <div className="space-y-10">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 px-1 reveal-up">
        <div className="space-y-2">
           <h2 className="text-4xl font-heading font-black tracking-tight"><span className="text-orange-500">Helper</span> Network</h2>
           <p className="text-muted-foreground font-medium">Evaluate profiles, verify credentials, and manage logistical coverage.</p>
        </div>
        <div className="flex gap-3">
           <Button variant="outline" size="lg" className="rounded-2xl font-black border-2 h-14 px-8">
              Export Fleet
           </Button>
           <Button size="lg" className="rounded-2xl font-black shadow-xl shadow-orange-500/20 bg-orange-500 text-white h-14 px-8">
              Manual Verification
           </Button>
        </div>
      </div>

      <Card className="surface-card-strong border-none reveal-up delay-1 overflow-visible">
        <CardContent className="p-8 space-y-8">
          {/* Controls */}
          <div className="flex flex-col sm:flex-row gap-4 items-center">
             <div className="relative flex-1 w-full group">
                <Input 
                  placeholder="Search helpers by name, zone, or service..." 
                  className="h-14 pl-14 pr-6 rounded-2xl border-2 border-border/50 bg-background/50 backdrop-blur-xl font-medium shadow-inner transition-all focus-visible:border-orange-500 group-hover:border-orange-500/50" 
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
                <Search className="absolute left-5 top-1/2 -translate-y-1/2 size-5 text-muted-foreground group-focus-within:text-orange-500 transition-colors" />
             </div>
             <Button variant="outline" className="h-14 px-6 rounded-2xl border-2 font-black gap-2">
                <Filter className="size-5" /> All Zones
             </Button>
          </div>

          {/* Table */}
          <div className="overflow-x-auto rounded-2xl border border-border/40">
            <table className="w-full text-left border-collapse">
              <thead className="bg-muted/30">
                <tr>
                  <th className="p-5 text-xs font-black uppercase tracking-widest text-muted-foreground">Provider</th>
                  <th className="p-5 text-xs font-black uppercase tracking-widest text-muted-foreground">Performance</th>
                  <th className="p-5 text-xs font-black uppercase tracking-widest text-muted-foreground">Status</th>
                  <th className="p-5 text-xs font-black uppercase tracking-widest text-muted-foreground">Coverage</th>
                  <th className="p-5 text-xs font-black uppercase tracking-widest text-muted-foreground text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {mockHelpers.map((helper) => (
                  <tr key={helper.id} className="group hover:bg-orange-500/5 transition-colors">
                    <td className="p-5">
                      <div className="flex items-center gap-4">
                         <div className="size-10 rounded-xl bg-orange-500/10 flex items-center justify-center font-black text-orange-600 transition-all group-hover:scale-110 group-hover:rotate-3 shadow-inner">
                            {helper.name.charAt(0)}
                         </div>
                         <div className="space-y-0.5">
                            <p className="font-bold text-sm tracking-tight">{helper.name}</p>
                            <div className="flex gap-1.5">
                               <Badge className="h-4 px-1.5 rounded-sm text-[8px] font-black uppercase tracking-widest bg-orange-500/10 text-orange-600 border-none">
                                  {helper.level}
                               </Badge>
                               <span className="text-[10px] font-mono text-muted-foreground opacity-60">LP-{helper.id.padStart(4, "0")}</span>
                            </div>
                         </div>
                      </div>
                    </td>
                    <td className="p-5">
                       <div className="space-y-1.5">
                          <div className="flex items-center gap-1.5 text-xs font-bold">
                             <Star className="size-3 text-orange-500 fill-orange-500" /> {helper.rating}
                             <span className="text-muted-foreground font-medium opacity-60">Avg Rating</span>
                          </div>
                          <div className="flex items-center gap-1.5 text-xs font-bold">
                             <TrendingUp className="size-3 text-orange-500" /> {helper.jobs}
                             <span className="text-muted-foreground font-medium opacity-60">Total Dispatches</span>
                          </div>
                       </div>
                    </td>
                    <td className="p-5">
                       <Badge className={cn(
                          "rounded-full font-black text-[10px] uppercase tracking-wider h-6 px-3 border-none",
                          helper.status === "Active" ? "bg-green-500/10 text-green-600" : 
                          helper.status === "Suspended" ? "bg-destructive/10 text-destructive" :
                          "bg-amber-500/10 text-amber-600"
                       )}>
                          {helper.status === "Active" ? <CheckCircle2 className="size-3 mr-1" /> : 
                           helper.status === "Suspended" ? <AlertTriangle className="size-3 mr-1" /> : <Clock className="size-3 mr-1" />}
                          {helper.status}
                       </Badge>
                    </td>
                    <td className="p-5">
                       <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                          <MapPin className="size-3 text-orange-500" /> {helper.zone}
                       </div>
                    </td>
                    <td className="p-5 text-right">
                       <DropdownMenu>
                         <DropdownMenuTrigger render={(props) => (
                            <Button {...props} variant="ghost" size="icon" className="rounded-xl size-9 hover:bg-orange-500/5 hover:text-orange-600">
                               <MoreHorizontal className="size-5" />
                            </Button>
                         )} />
                         <DropdownMenuContent align="end" className="rounded-2xl border-border/40 shadow-2xl backdrop-blur-3xl border-none">
                            <DropdownMenuItem className="p-3 gap-2 font-bold cursor-pointer hover:bg-orange-500/5 rounded-xl transition-colors">Verify KYC</DropdownMenuItem>
                            <DropdownMenuItem className="p-3 gap-2 font-bold cursor-pointer hover:bg-orange-500/5 rounded-xl transition-colors">Assign Service</DropdownMenuItem>
                            <DropdownMenuItem className="p-3 gap-2 font-bold cursor-pointer text-destructive hover:bg-destructive/5 rounded-xl transition-colors">Block Access</DropdownMenuItem>
                         </DropdownMenuContent>
                       </DropdownMenu>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

import { cn } from "@/lib/utils";
