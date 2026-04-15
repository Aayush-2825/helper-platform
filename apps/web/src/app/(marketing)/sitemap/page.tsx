import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Sitemap | DOZO",
  description: "Browse key DOZO marketing pages.",
};

const LINKS = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/press", label: "Press" },
  { href: "/careers", label: "Careers" },
  { href: "/blog", label: "Blog" },
  { href: "/help", label: "Help Center" },
  { href: "/terms", label: "Terms of Service" },
  { href: "/privacy", label: "Privacy Policy" },
];

export default function SitemapPage() {
  return (
    <main className="min-h-screen bg-background text-foreground px-6 py-16">
      <div className="max-w-3xl mx-auto space-y-8">
        <h1 className="text-4xl font-black tracking-tight">Sitemap</h1>
        <ul className="space-y-3">
          {LINKS.map((item) => (
            <li key={item.href}>
              <Link href={item.href} className="font-bold text-foreground hover:text-primary transition-colors">
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </main>
  );
}
