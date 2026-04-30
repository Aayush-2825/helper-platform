import type { Metadata } from "next";
import Link from "next/link";
import { FileText } from "lucide-react";
import { buttonVariants } from "@repo/ui/components/ui/button-variants";

export const metadata: Metadata = {
  title: "Blog — Coming Soon | DOZO",
  description: "DOZO blog is coming soon with service stories, product updates, and customer guides.",
};

export default function BlogPage() {
  return (
    <main className="min-h-screen bg-background text-foreground px-6 py-28">
      <div className="max-w-3xl mx-auto text-center space-y-6">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 border border-blue-100 text-blue-700 text-sm font-bold">
          <FileText className="size-3.5" />
          Blog
        </div>
        <h1 className="text-5xl lg:text-6xl font-black tracking-tight leading-tight">
          Blog is <span className="text-blue-600">coming soon.</span>
        </h1>
        <p className="text-lg text-muted-foreground font-medium leading-relaxed max-w-2xl mx-auto">
          We are curating guides, helper stories, and updates from the DOZO team. Please check back shortly.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link href="/help" className={buttonVariants({ size: "lg" }) + " px-8"}>
            Get Product Updates
          </Link>
          <Link href="/" className={buttonVariants({ variant: "outline", size: "lg" }) + " px-8"}>
            Back to Home
          </Link>
        </div>
      </div>
    </main>
  );
}
