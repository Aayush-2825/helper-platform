import type { Metadata } from "next";
import { Suspense } from "react";
import "./globals.css";
import { Toaster } from "@repo/ui/components/ui/sonner";
import { TooltipProvider } from "@repo/ui/components/ui/tooltip";
import { QueryProvider } from "@features/shared/components/providers/query-provider";

import { SessionProvider } from "@/lib/auth/session";
import { DozoStructuredData } from "@/lib/seo/structured-data";

export const metadata: Metadata = {
  metadataBase: new URL("https://dozo.work"),
  title: {
    default: "DOZO — Trusted Local Services & Helpers Near You",
    template: "%s | DOZO",
  },
  description: "Connect with trusted local helpers for home cleaning, plumbing, electrical work, and more. Book instant or scheduled services with verified professionals. Live in Delhi NCR.",
  keywords: ["local services", "home services", "trusted helpers", "plumbing", "electrician", "home cleaning", "Delhi NCR"],
  authors: [{ name: "DOZO" }],
  creator: "DOZO",
  publisher: "DOZO",
  alternates: {
    canonical: "/",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    siteName: "DOZO",
    locale: "en_IN",
    title: "DOZO — Trusted Local Services & Helpers Near You",
    description: "Connect with trusted local helpers for home cleaning, plumbing, electrical work, and more. Book instant or scheduled services with verified professionals.",
    url: "https://dozo.work",
    images: [
      {
        url: "/og-image-placeholder.svg",
        width: 1200,
        height: 630,
        alt: "DOZO - Trusted Local Services Platform",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "DOZO — Trusted Local Services & Helpers Near You",
    description: "Connect with trusted local helpers for home cleaning, plumbing, electrical work, and more. Book instant or scheduled services with verified professionals.",
    images: ["/og-image.jpg"],
  },
  verification: {
    // Add your verification tokens here when available
    // google: "your-google-verification-token",
    // yandex: "your-yandex-verification-token",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <DozoStructuredData />
        <Suspense fallback={null}>
          <QueryProvider>
            <SessionProvider>
              <TooltipProvider>
                {children}
                <Toaster />
              </TooltipProvider>
            </SessionProvider>
          </QueryProvider>
        </Suspense>
      </body>
    </html>
  );
}

