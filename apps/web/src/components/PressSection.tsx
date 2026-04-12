"use client";

export function PressSection() {
  const PRESS = [
    { name: "TechCrunch", logo: "TC", color: "text-green-700 bg-green-50", quote: "\"The Uber of home services in India\"" },
    { name: "YourStory", logo: "YS", color: "text-orange-700 bg-orange-50", quote: "\"Disrupting the ₹100B home services market\"" },
    { name: "Economic Times", logo: "ET", color: "text-blue-700 bg-blue-50", quote: "\"Fastest growing startup of 2025\"" },
    { name: "Inc42", logo: "42", color: "text-violet-700 bg-violet-50", quote: "\"Top 10 Startups to Watch\"" },
    { name: "The Hindu", logo: "TH", color: "text-red-700 bg-red-50", quote: "\"Transforming the gig economy\"" },
    { name: "Forbes India", logo: "F", color: "text-zinc-700 bg-zinc-100", quote: "\"30 Under 30 — DOZO Founders\"" },
  ];

  return (
    <section className="py-16 px-6 border-t border-border bg-background">
      <div className="max-w-7xl mx-auto space-y-10">
        <p className="text-center text-xs font-black uppercase tracking-widest text-muted-foreground">
          As Featured In
        </p>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {PRESS.map((p) => (
            <div key={p.name} className="flex flex-col items-center gap-3 p-5 rounded-[14px] border border-border bg-background hover:shadow-sm hover:border-border/80 transition-all group cursor-pointer">
              <div className={`size-12 rounded-[10px] flex items-center justify-center font-black text-lg ${p.color} border border-current/10`}>
                {p.logo}
              </div>
              <p className="font-black text-sm text-foreground text-center">{p.name}</p>
              <p className="text-[10px] text-muted-foreground font-medium text-center leading-relaxed line-clamp-2">{p.quote}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
