import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy | DOZO",
  description: "How DOZO collects, uses, and protects your information.",
};

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-background text-foreground px-6 py-16">
      <div className="max-w-3xl mx-auto space-y-6">
        <h1 className="text-4xl font-black tracking-tight">Privacy Policy</h1>
        <p className="text-muted-foreground font-medium leading-relaxed">
          This page outlines how we handle customer and helper data. It is a placeholder so users can access privacy information instead of hitting dead links while final legal copy is being prepared.
        </p>
      </div>
    </main>
  );
}
