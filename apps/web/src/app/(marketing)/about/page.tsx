import type { Metadata } from "next";
import Link from "next/link";
import { Info } from "lucide-react";
import { buttonVariants } from "@/components/ui/button-variants";

export const metadata: Metadata = {
  title: "About — Coming Soon | DOZO",
  description: "DOZO About page is coming soon.",
};

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-background text-foreground px-6 py-28">
      <div className="max-w-3xl mx-auto text-center space-y-6">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-50 border border-orange-100 text-orange-600 text-sm font-bold">
          <Info className="size-3.5" />
          About
        </div>
        <h1 className="text-5xl lg:text-6xl font-black tracking-tight leading-tight">
          About page is <span className="text-orange-500">coming soon.</span>
        </h1>
        <p className="text-lg text-muted-foreground font-medium leading-relaxed max-w-2xl mx-auto">
          We are preparing an updated company story and team profile. Please check back soon.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link href="/press" className={buttonVariants({ size: "lg" }) + " px-8"}>
            Visit Press Page
          </Link>
          <Link href="/" className={buttonVariants({ variant: "outline", size: "lg" }) + " px-8"}>
            Back to Home
          </Link>
        </div>
      </div>
    </main>
  );
}
