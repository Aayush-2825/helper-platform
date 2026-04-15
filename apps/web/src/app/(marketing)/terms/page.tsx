import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service | DOZO",
  description: "Terms governing use of the DOZO platform and services.",
};

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-background text-foreground px-6 py-16">
      <div className="max-w-3xl mx-auto space-y-6">
        <h1 className="text-4xl font-black tracking-tight">Terms of Service</h1>
        <p className="text-muted-foreground font-medium leading-relaxed">
          These terms describe your rights and responsibilities when using DOZO&apos;s web and mobile services. This placeholder page replaces dead-end links and should be updated with legal-approved terms.
        </p>
      </div>
    </main>
  );
}
