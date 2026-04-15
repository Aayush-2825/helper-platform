import type { Metadata } from "next";
import Link from "next/link";
import { Newspaper } from "lucide-react";
import { buttonVariants } from "@/components/ui/button-variants";

export const metadata: Metadata = {
  title: "Press — Coming Soon | DOZO",
  description: "DOZO press resources and announcements are coming soon.",
};

export default function PressPage() {
  return (
    <main className="min-h-screen bg-background text-foreground px-6 py-28">
      <div className="max-w-3xl mx-auto text-center space-y-6">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 border border-blue-100 text-blue-700 text-sm font-bold">
          <Newspaper className="size-3.5" />
          Press
        </div>
        <h1 className="text-5xl lg:text-6xl font-black tracking-tight leading-tight">
          Press page is <span className="text-blue-600">coming soon.</span>
        </h1>
        <p className="text-lg text-muted-foreground font-medium leading-relaxed max-w-2xl mx-auto">
          Media kit, announcements, and press contact details will be published here shortly.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link href="mailto:press@dozo.in" className={buttonVariants({ size: "lg" }) + " px-8"}>
            Contact Press Team
          </Link>
          <Link href="/" className={buttonVariants({ variant: "outline", size: "lg" }) + " px-8"}>
            Back to Home
          </Link>
        </div>
      </div>
    </main>
  );
}
