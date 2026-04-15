"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { ArrowRight, Clock, Zap } from "lucide-react";
import { CATEGORIES, CAT_COLORS, FEATURED, POSTS } from "./data";
import { Button } from "@/components/ui/button";

export function BlogClientPage() {
  const [activeCategory, setActiveCategory] = useState("All");

  const filteredPosts = useMemo(() => {
    if (activeCategory === "All") {
      return POSTS;
    }
    return POSTS.filter((post) => post.category === activeCategory);
  }, [activeCategory]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <nav className="fixed top-0 inset-x-0 z-50 border-b border-border bg-background/80 backdrop-blur-xl h-16">
        <div className="max-w-7xl mx-auto px-6 h-full flex items-center justify-between">
          <Link href="/"><Image src="/dozo-logo.svg" alt="DOZO" className="h-8 w-auto" width={128} height={32} /></Link>
          <Link href="/" className="text-sm font-bold text-muted-foreground hover:text-foreground transition-colors">← Back to Home</Link>
        </div>
      </nav>

      <main className="pt-16">
        <section className="py-20 px-6 border-b border-border bg-muted/20">
          <div className="max-w-7xl mx-auto space-y-5">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-50 border border-orange-100 text-orange-600 text-sm font-bold">
              <Zap className="size-3.5 fill-orange-500" />
              DOZO Insights
            </div>
            <h1 className="text-5xl font-black tracking-tight">Stories, tips & dispatches<br />from the DOZO team.</h1>
            <p className="text-lg text-muted-foreground font-medium max-w-xl">
              Real insights from building India&apos;s fastest service marketplace - for customers, helpers, and curious minds.
            </p>
          </div>
        </section>

        <div className="max-w-7xl mx-auto px-6 py-16 space-y-16">
          <div className="flex gap-2 flex-wrap">
            {CATEGORIES.map((cat) => (
              <Button
                key={cat}
                type="button"
                variant={activeCategory === cat ? "default" : "outline"}
                onClick={() => setActiveCategory(cat)}
                aria-pressed={activeCategory === cat}
                className={`px-4 py-2 rounded-full text-sm font-bold border transition-all ${
                  activeCategory === cat
                    ? "bg-foreground text-background border-foreground"
                    : "border-border text-muted-foreground hover:border-foreground/30 hover:text-foreground"
                }`}
              >
                {cat}
              </Button>
            ))}
          </div>

          <Link href={`/blog/${FEATURED.slug}`} className="group block">
            <div className="grid lg:grid-cols-2 gap-10 bg-background border border-border rounded-2xl overflow-hidden hover:shadow-xl hover:border-foreground/20 transition-all">
              <div className="relative aspect-4/3 overflow-hidden">
                <Image src={FEATURED.image} alt={FEATURED.title} fill sizes="(min-width: 1024px) 50vw, 100vw" className="object-cover group-hover:scale-105 transition-transform duration-500" />
              </div>
              <div className="p-8 lg:py-12 flex flex-col justify-center space-y-5">
                <div className="flex items-center gap-3">
                  <span className={`px-3 py-1 text-[11px] font-black uppercase tracking-wide rounded-full border ${CAT_COLORS[FEATURED.category]}`}>{FEATURED.category}</span>
                  <span className="text-xs text-muted-foreground font-medium bg-muted/50 px-2.5 py-1 rounded-full border border-border">Featured</span>
                </div>
                <h2 className="text-3xl font-black leading-tight group-hover:text-primary transition-colors">{FEATURED.title}</h2>
                <p className="text-muted-foreground font-medium leading-relaxed">{FEATURED.excerpt}</p>
                <div className="flex items-center gap-4 pt-2">
                  <Image src={FEATURED.author.avatar} alt={FEATURED.author.name} width={36} height={36} className="size-9 rounded-full border border-border" />
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

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPosts.map((post) => (
              <Link href={`/blog/${post.slug}`} key={post.slug} className="group bg-background border border-border rounded-xl overflow-hidden hover:shadow-xl hover:border-foreground/20 transition-all flex flex-col">
                <div className="relative aspect-video overflow-hidden">
                  <Image src={post.image} alt={post.title} fill sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw" className="object-cover group-hover:scale-105 transition-transform duration-500" />
                </div>
                <div className="p-6 flex flex-col flex-1 space-y-3">
                  <span className={`self-start px-2.5 py-0.5 text-[11px] font-black uppercase tracking-wide rounded-full border ${CAT_COLORS[post.category] ?? "bg-muted text-muted-foreground border-border"}`}>{post.category}</span>
                  <h3 className="font-bold text-[17px] leading-snug group-hover:text-primary transition-colors flex-1">{post.title}</h3>
                  <p className="text-sm text-muted-foreground font-medium leading-relaxed line-clamp-2">{post.excerpt}</p>
                  <div className="flex items-center gap-3 pt-3 border-t border-border/60">
                    <Image src={post.author.avatar} alt={post.author.name} width={28} height={28} className="size-7 rounded-full border border-border" />
                    <span className="text-xs font-bold text-muted-foreground flex-1">{post.author.name}</span>
                    <span className="flex items-center gap-1 text-xs text-muted-foreground font-medium"><Clock className="size-3" />{post.readTime}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {filteredPosts.length === 0 && (
            <p className="text-sm text-muted-foreground font-medium">No posts available in this category yet.</p>
          )}
        </div>
      </main>
    </div>
  );
}
