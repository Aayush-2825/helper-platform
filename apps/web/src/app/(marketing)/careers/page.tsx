import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Briefcase } from "lucide-react";
import { buttonVariants } from "@/components/ui/button-variants";

export const metadata: Metadata = {
  title: "Careers — Coming Soon | DOZO",
  description: "DOZO careers page is coming soon. Reach out to careers@dozo.in for opportunities.",
};

export default function CareersPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <nav className="fixed top-0 inset-x-0 z-50 border-b border-border bg-background/80 backdrop-blur-xl h-16">
        <div className="max-w-7xl mx-auto px-6 h-full flex items-center justify-between">
          <Link href="/"><Image src="/dozo-logo.svg" alt="DOZO" className="h-8 w-auto" width={128} height={32} /></Link>
          <Link href="/" className="text-sm font-bold text-muted-foreground hover:text-foreground transition-colors">← Back to Home</Link>
        </div>
      </nav>

      <main className="pt-16">
        <section className="py-28 px-6">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-50 border border-orange-100 text-orange-600 text-sm font-bold">
              <Briefcase className="size-3.5" />
              Careers
            </div>
            <h1 className="text-5xl lg:text-6xl font-black tracking-tight leading-tight">
              Careers page is <span className="text-orange-500">coming soon.</span>
            </h1>
            <p className="text-lg text-muted-foreground font-medium leading-relaxed max-w-2xl mx-auto">
              We are preparing a better hiring experience. For immediate opportunities, send your profile to careers@dozo.in.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link href="mailto:careers@dozo.in" className={buttonVariants({ size: "lg" }) + " px-8"}>
                Email Careers Team
              </Link>
              <Link href="/" className={buttonVariants({ variant: "outline", size: "lg" }) + " px-8"}>
                Back to Home
              </Link>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
