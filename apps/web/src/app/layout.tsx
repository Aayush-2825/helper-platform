import type { Metadata } from "next";
import { Suspense } from "react";
import { Fraunces, Geist_Mono, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SessionProvider } from "@/lib/auth/session";

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta",
  subsets: ["latin"],
});

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Zapier Services",
  description: "Book trusted home and business services from verified local providers.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${plusJakartaSans.variable} ${fraunces.variable} ${geistMono.variable}`}>
        <Suspense fallback={null}>
          <SessionProvider>
            <TooltipProvider>
              {children}
              <Toaster />
            </TooltipProvider>
          </SessionProvider>
        </Suspense>
      </body>
    </html>
  );
}

