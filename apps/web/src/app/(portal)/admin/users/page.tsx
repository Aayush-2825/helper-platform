"use client";

import { useState } from "react";
import { 
  Search, 
  Filter, 
  MoreHorizontal, 
  Mail, 
  Phone, 
  ShieldCheck, 
  ShieldAlert, 
  ArrowUpDown,
  UserPlus
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

const mockUsers = [
  { id: "1", name: "Aayush Sharma", email: "aayush@example.com", phone: "+1 234 567 890", status: "Active", joinDate: "2026-03-20" },
  { id: "2", name: "Janani Iyer", email: "janani@example.com", phone: "+91 98765 43210", status: "Active", joinDate: "2026-03-22" },
  { id: "3", name: "Michael Chen", email: "michael@example.com", phone: "+86 138 0000 0000", status: "Suspended", joinDate: "2026-03-15" },
  { id: "4", name: "Sarah Miller", email: "sarah@example.com", phone: "+44 20 7946 0000", status: "Pending", joinDate: "2026-03-25" },
];

export default function AdminUsersPage() {
  const [search, setSearch] = useState("");

  return (
    <div className="space-y-10">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 px-1 reveal-up">
        <div className="space-y-2">
           <h2 className="text-4xl font-heading font-black tracking-tight"><span className="text-primary">User</span> Directory</h2>
           <p className="text-muted-foreground font-medium">Search, audit, and manage global customer accounts.</p>
        </div>
        <Button size="lg" className="rounded-2xl font-black shadow-xl shadow-primary/20 bg-primary text-white h-14 px-8">
           <UserPlus className="size-5 mr-2" /> Add New User
        </Button>
      </div>

      <Card className="surface-card-strong border-none reveal-up delay-1 overflow-visible">
        <CardContent className="p-8 space-y-8">
          {/* Controls */}
          <div className="flex flex-col sm:flex-row gap-4 items-center">
             <div className="relative flex-1 w-full group">
                <Input 
                  placeholder="Search users by name, email, or ID..." 
                  className="h-14 pl-14 pr-6 rounded-2xl border-2 border-border/50 bg-background/50 backdrop-blur-xl font-medium shadow-inner transition-all focus-visible:border-primary group-hover:border-primary/50" 
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
                <Search className="absolute left-5 top-1/2 -translate-y-1/2 size-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
             </div>
             <Button variant="outline" className="h-14 px-6 rounded-2xl border-2 font-black gap-2">
                <Filter className="size-5" /> Filters
             </Button>
          </div>

          {/* Table */}
          <div className="overflow-x-auto rounded-2xl border border-border/40">
            <table className="w-full text-left border-collapse">
              <thead className="bg-muted/30">
                <tr>
                  <th className="p-5 text-xs font-black uppercase tracking-widest text-muted-foreground">User</th>
                  <th className="p-5 text-xs font-black uppercase tracking-widest text-muted-foreground">Contact</th>
                  <th className="p-5 text-xs font-black uppercase tracking-widest text-muted-foreground">Status</th>
                  <th className="p-5 text-xs font-black uppercase tracking-widest text-muted-foreground flex items-center gap-1">
                     Join Date <ArrowUpDown className="size-3" />
                  </th>
                  <th className="p-5 text-xs font-black uppercase tracking-widest text-muted-foreground text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {mockUsers.map((user) => (
                  <tr key={user.id} className="group hover:bg-slate-500/5 transition-colors">
                    <td className="p-5">
                      <div className="flex items-center gap-4">
                         <div className="size-10 rounded-xl bg-primary/10 flex items-center justify-center font-black text-primary transition-all group-hover:scale-110 group-hover:rotate-3 shadow-inner">
                            {user.name.charAt(0)}
                         </div>
                         <div className="space-y-0.5">
                            <p className="font-bold text-sm">{user.name}</p>
                            <p className="text-[10px] font-mono text-muted-foreground opacity-60">ID-{user.id.padStart(4, "0")}</p>
                         </div>
                      </div>
                    </td>
                    <td className="p-5">
                       <div className="space-y-1">
                          <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                             <Mail className="size-3" /> {user.email}
                          </div>
                          <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                             <Phone className="size-3" /> {user.phone}
                          </div>
                       </div>
                    </td>
                    <td className="p-5">
                       <Badge className={cn(
                          "rounded-full font-black text-[10px] uppercase tracking-wider h-6 px-3 border-none",
                          user.status === "Active" ? "bg-green-500/10 text-green-600" : 
                          user.status === "Suspended" ? "bg-destructive/10 text-destructive" :
                          "bg-amber-500/10 text-amber-600"
                       )}>
                          {user.status === "Active" ? <ShieldCheck className="size-3 mr-1" /> : <ShieldAlert className="size-3 mr-1" />}
                          {user.status}
                       </Badge>
                    </td>
                    <td className="p-5">
                        <span className="text-xs font-medium text-muted-foreground">{user.joinDate}</span>
                    </td>
                    <td className="p-5 text-right">
                       <DropdownMenu>
                         <DropdownMenuTrigger render={(props) => (
                            <Button {...props} variant="ghost" size="icon" className="rounded-xl size-9 hover:bg-primary/5 hover:text-primary">
                               <MoreHorizontal className="size-5" />
                            </Button>
                         )} />
                         <DropdownMenuContent align="end" className="rounded-2xl border-border/40 shadow-2xl backdrop-blur-3xl animate-reveal-up border-none">
                            <DropdownMenuItem className="p-3 gap-2 font-bold cursor-pointer hover:bg-primary/5 rounded-xl transition-colors">View Details</DropdownMenuItem>
                            <DropdownMenuItem className="p-3 gap-2 font-bold cursor-pointer hover:bg-primary/5 rounded-xl transition-colors">Audit History</DropdownMenuItem>
                            <DropdownMenuItem className="p-3 gap-2 font-bold cursor-pointer text-destructive hover:bg-destructive/5 rounded-xl transition-colors">Suspend Account</DropdownMenuItem>
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
