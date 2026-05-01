import type { Metadata } from "next";
import { Suspense } from "react";
import "./globals.css";
import { Toaster } from "@repo/ui/components/ui/sonner";
import { TooltipProvider } from "@repo/ui/components/ui/tooltip";
import { QueryProvider } from "@features/shared/components/providers/query-provider";

import { SessionProvider } from "@/lib/auth/session";

export const metadata: Metadata = {
  title: "Helper Platform | Premium Quick Commerce Services",
  description: "Verified professionals for home and business services, delivered in under 60 seconds.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
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

