import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Clock, Zap } from "lucide-react";

export const metadata: Metadata = {
  title: "Blog — DOZO Insights",
  description: "Stories, tips, and insights from the DOZO team on home services, helper success, and building India's fastest marketplace.",
};

const FEATURED = {
  slug: "why-dozo-is-fastest-service-marketplace",
  category: "Company",
  title: "Why DOZO Delivers Helpers in 10 Minutes — Not 10 Days",
  excerpt: "The technology and operational playbook behind our promise of instant service matching. A deep dive into how we built the fastest helper network in India.",
  author: { name: "Arjun Mehta", role: "Co-Founder & CEO", avatar: "https://i.pravatar.cc/150?u=arjun_dozo" },
  readTime: "8 min read",
  date: "Apr 8, 2026",
  image: "https://images.unsplash.com/photo-1487528278747-ba99ed528ebc?w=1200&q=80",
};

const POSTS = [
  {
    slug: "background-verification-helpers",
    category: "Trust & Safety",
    title: "How We Verify Every Helper Before They Touch Your Door",
    excerpt: "A step-by-step breakdown of DOZO's 7-layer background verification process for all helpers.",
    author: { name: "Sneha Iyer", avatar: "https://i.pravatar.cc/150?u=sneha_dozo" },
    readTime: "5 min read",
    date: "Apr 5, 2026",
    image: "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=800&q=80",
  },
  {
    slug: "helper-success-rajesh",
    category: "Helper Stories",
    title: "From ₹8,000/mo to ₹40,000/mo: Rajesh's Story on DOZO",
    excerpt: "How joining DOZO transformed the lives of skilled workers across India through better earnings and opportunities.",
    author: { name: "Priya Nair", avatar: "https://i.pravatar.cc/150?u=priya_dozo" },
    readTime: "6 min read",
    date: "Apr 1, 2026",
    image: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=800&q=80",
  },
  {
    slug: "home-cleaning-tips-monsoon",
    category: "Home Tips",
    title: "10 Home Cleaning Tips to Prep Your House for Monsoon Season",
    excerpt: "Professional cleaning advice from DOZO's top-rated helpers to keep your home healthy during the rains.",
    author: { name: "Rahul Gupta", avatar: "https://i.pravatar.cc/150?u=rahul_dozo" },
    readTime: "4 min read",
    date: "Mar 28, 2026",
    image: "https://images.unsplash.com/photo-1527515637462-cff94eecc1ac?w=800&q=80",
  },
  {
    slug: "expanding-to-50-cities",
    category: "Company",
    title: "DOZO Is Now Live in 50 Cities — Here's What's Next",
    excerpt: "Our journey from one city to fifty, and an exclusive peek at the markets we're expanding to in Q3 2026.",
    author: { name: "Arjun Mehta", avatar: "https://i.pravatar.cc/150?u=arjun_dozo" },
    readTime: "7 min read",
    date: "Mar 20, 2026",
    image: "https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=800&q=80",
  },
  {
    slug: "ac-service-summer-guide",
    category: "Home Tips",
    title: "AC Service Before Summer: The Definitive Checklist",
    excerpt: "Everything you need to do before summer hits to ensure your AC runs efficiently all season long.",
    author: { name: "Sneha Iyer", avatar: "https://i.pravatar.cc/150?u=sneha_dozo" },
    readTime: "5 min read",
    date: "Mar 15, 2026",
    image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80",
  },
];

const CATEGORIES = ["All", "Company", "Trust & Safety", "Helper Stories", "Home Tips", "Product"];
const CAT_COLORS: Record<string, string> = {
  "Company": "bg-blue-50 text-blue-600 border-blue-100",
  "Trust & Safety": "bg-emerald-50 text-emerald-600 border-emerald-100",
  "Helper Stories": "bg-orange-50 text-orange-600 border-orange-100",
  "Home Tips": "bg-violet-50 text-violet-600 border-violet-100",
  "Product": "bg-rose-50 text-rose-600 border-rose-100",
};

export default function BlogPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <nav className="fixed top-0 inset-x-0 z-50 border-b border-border bg-background/80 backdrop-blur-xl h-16">
        <div className="max-w-7xl mx-auto px-6 h-full flex items-center justify-between">
          <Link href="/"><img src="/dozo-logo.svg" alt="DOZO" className="h-8 w-auto" /></Link>
          <Link href="/" className="text-sm font-bold text-muted-foreground hover:text-foreground transition-colors">← Back to Home</Link>
        </div>
      </nav>

      <main className="pt-16">
        {/* Header */}
        <section className="py-20 px-6 border-b border-border bg-muted/20">
          <div className="max-w-7xl mx-auto space-y-5">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-50 border border-orange-100 text-orange-600 text-sm font-bold">
              <Zap className="size-3.5 fill-orange-500" />
              DOZO Insights
            </div>
            <h1 className="text-5xl font-black tracking-tight">Stories, tips & dispatches<br />from the DOZO team.</h1>
            <p className="text-lg text-muted-foreground font-medium max-w-xl">
              Real insights from building India's fastest service marketplace — for customers, helpers, and curious minds.
            </p>
          </div>
        </section>

        <div className="max-w-7xl mx-auto px-6 py-16 space-y-16">
          {/* Category Tabs */}
          <div className="flex gap-2 flex-wrap">
            {CATEGORIES.map((cat) => (
              <button key={cat} className={`px-4 py-2 rounded-full text-sm font-bold border transition-all ${cat === "All" ? "bg-foreground text-background border-foreground" : "border-border text-muted-foreground hover:border-foreground/30 hover:text-foreground"}`}>
                {cat}
              </button>
            ))}
          </div>

          {/* Featured Post */}
          <Link href={`/blog/${FEATURED.slug}`} className="group block">
            <div className="grid lg:grid-cols-2 gap-10 bg-background border border-border rounded-[20px] overflow-hidden hover:shadow-xl hover:border-foreground/20 transition-all">
              <div className="aspect-[4/3] overflow-hidden">
                <img src={FEATURED.image} alt={FEATURED.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              </div>
              <div className="p-8 lg:py-12 flex flex-col justify-center space-y-5">
                <div className="flex items-center gap-3">
                  <span className={`px-3 py-1 text-[11px] font-black uppercase tracking-wide rounded-full border ${CAT_COLORS[FEATURED.category]}`}>{FEATURED.category}</span>
                  <span className="text-xs text-muted-foreground font-medium bg-muted/50 px-2.5 py-1 rounded-full border border-border">Featured</span>
                </div>
                <h2 className="text-3xl font-black leading-tight group-hover:text-primary transition-colors">{FEATURED.title}</h2>
                <p className="text-muted-foreground font-medium leading-relaxed">{FEATURED.excerpt}</p>
                <div className="flex items-center gap-4 pt-2">
                  <img src={FEATURED.author.avatar} alt={FEATURED.author.name} className="size-9 rounded-full border border-border" />
                  <div>
                    <p className="text-sm font-bold">{FEATURED.author.name}</p>
                    <p className="text-xs text-muted-foreground font-medium">{FEATURED.author.role}</p>
                  </div>
                  <div className="ml-auto flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
                    <Clock className="size-3.5" /> {FEATURED.readTime}
                  </div>
                </div>
                <div className="flex items-center gap-2 text-sm font-bold text-primary group-hover:gap-4 transition-all pt-2">
                  Read Article <ArrowRight className="size-4" />
                </div>
              </div>
            </div>
          </Link>

          {/* Post Grid */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {POSTS.map((post) => (
              <Link href={`/blog/${post.slug}`} key={post.slug} className="group bg-background border border-border rounded-[16px] overflow-hidden hover:shadow-xl hover:border-foreground/20 transition-all flex flex-col">
                <div className="aspect-[16/9] overflow-hidden">
                  <img src={post.image} alt={post.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                </div>
                <div className="p-6 flex flex-col flex-1 space-y-3">
                  <span className={`self-start px-2.5 py-0.5 text-[11px] font-black uppercase tracking-wide rounded-full border ${CAT_COLORS[post.category] ?? "bg-muted text-muted-foreground border-border"}`}>{post.category}</span>
                  <h3 className="font-bold text-[17px] leading-snug group-hover:text-primary transition-colors flex-1">{post.title}</h3>
                  <p className="text-sm text-muted-foreground font-medium leading-relaxed line-clamp-2">{post.excerpt}</p>
                  <div className="flex items-center gap-3 pt-3 border-t border-border/60">
                    <img src={post.author.avatar} alt={post.author.name} className="size-7 rounded-full border border-border" />
                    <span className="text-xs font-bold text-muted-foreground flex-1">{post.author.name}</span>
                    <span className="flex items-center gap-1 text-xs text-muted-foreground font-medium"><Clock className="size-3" />{post.readTime}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
