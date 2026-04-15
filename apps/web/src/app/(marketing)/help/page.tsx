import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Help Center | DOZO",
  description: "Get support for bookings, account access, payments, and app launch updates.",
};

export default function HelpPage() {
  return (
    <main className="min-h-screen bg-background text-foreground px-6 py-16">
      <div className="max-w-3xl mx-auto space-y-8">
        <h1 className="text-4xl font-black tracking-tight">Help Center</h1>
        <p className="text-muted-foreground font-medium leading-relaxed">
          Need assistance with a booking, account issue, payout, or city availability? Reach out to our team and we will help you quickly.
        </p>

        <section className="space-y-3">
          <h2 className="text-2xl font-black tracking-tight">Contact Support</h2>
          <p className="text-muted-foreground font-medium">Email: support@dozo.in</p>
          <p className="text-muted-foreground font-medium">For careers: careers@dozo.in</p>
        </section>

        <section id="app-download" className="scroll-mt-24 space-y-3 border border-border rounded-xl p-5 bg-muted/20">
          <h2 className="text-2xl font-black tracking-tight">App Download Updates</h2>
          <p className="text-muted-foreground font-medium">
            Our native iOS and Android apps are rolling out soon. Request launch updates by emailing support@dozo.in with subject &quot;App launch updates&quot;.
          </p>
        </section>

        <div className="flex gap-4 text-sm font-bold">
          <Link href="/terms" className="hover:text-primary transition-colors">Terms of Service</Link>
          <Link href="/privacy" className="hover:text-primary transition-colors">Privacy Policy</Link>
          <Link href="/sitemap" className="hover:text-primary transition-colors">Sitemap</Link>
        </div>
      </div>
    </main>
  );
}
