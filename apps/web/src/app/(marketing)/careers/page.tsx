import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Briefcase } from "lucide-react";
import { buttonVariants } from "@repo/ui/components/ui/button-variants";

export const metadata: Metadata = {
  title: "Careers — Coming Soon | DOZO",
  description: "DOZO careers page is coming soon. Reach out to careers@dozo.in for opportunities.",
};

export default function CareersPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <nav className="fixed inset-x-0 top-0 z-50 h-16 border-b border-border bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex h-full max-w-7xl items-center justify-between px-6">
          <Link href="/">
            <Image src="/dozo-logo.svg" alt="DOZO" className="h-8 w-auto" width={128} height={32} />
          </Link>
          <Link href="/" className="text-sm font-bold text-muted-foreground transition-colors hover:text-foreground">
            Back to Home
          </Link>
        </div>
      </nav>

      <main className="pt-16">
        <section className="px-6 py-24 sm:py-28">
          <div className="mx-auto grid max-w-5xl gap-6 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
            <div className="space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 rounded-full border border-orange-200 bg-orange-50 px-4 py-2 text-sm font-bold text-orange-700 shadow-sm shadow-orange-100/60">
                <Briefcase className="size-3.5" />
                Careers
              </div>
              <div className="space-y-4">
                <h1 className="text-4xl font-black tracking-tight sm:text-5xl lg:text-6xl lg:leading-tight">
                  Hiring tools are still being built, but the team is already taking shape.
                </h1>
                <p className="mx-auto max-w-2xl text-lg leading-relaxed text-muted-foreground lg:mx-0">
                  We are preparing a better hiring experience for future openings. If you want to be considered first,
                  send your profile to careers@dozo.in and we will keep it on file.
                </p>
              </div>
              <div className="flex flex-col justify-center gap-3 sm:flex-row lg:justify-start">
                <Link href="mailto:careers@dozo.in" className={buttonVariants({ size: "lg" }) + " px-8"}>
                  Email Careers Team
                </Link>
                <Link href="/about" className={buttonVariants({ variant: "outline", size: "lg" }) + " px-8"}>
                  Learn about DOZO
                </Link>
              </div>
            </div>

            <aside className="surface-card-strong rounded-4xl border-none p-6 shadow-2xl shadow-primary/5 sm:p-8">
              <div className="space-y-4">
                <p className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">What to expect</p>
                <div className="space-y-3 text-sm leading-relaxed text-muted-foreground">
                  <p>Open roles will appear here first once the careers portal is live.</p>
                  <p>For now, the fastest route is a short email with your CV and preferred role.</p>
                </div>
              </div>
            </aside>
          </div>
        </section>
      </main>
    </div>
  );
}
