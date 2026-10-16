"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import dynamic from "next/dynamic";

const MyMap = dynamic(
  () => import("@features/shared/components/mapping/map-component").then((mod) => mod.MyMap),
  {
    ssr: false,
    loading: () => (
      <div className="h-105 w-full rounded-2xl bg-muted/40 animate-pulse flex items-center justify-center text-sm text-muted-foreground">
        Loading interactive map...
      </div>
    ),
  },
);
import { useSession } from "@/lib/auth/session";
import { SERVICE_TO_BOOKING_CATEGORY } from "@/config/services";

function MapContainer() {
  const { session } = useSession();
  const searchParams = useSearchParams();
  
  const serviceSlug = searchParams.get("service") ?? "";
  const selectedService = SERVICE_TO_BOOKING_CATEGORY[serviceSlug];
  const isInvalidSlug = Boolean(serviceSlug && !selectedService);

  return (
    <div className="space-y-4">
      {isInvalidSlug && (
        <div className="rounded-md bg-amber-500/10 p-3 text-xs text-amber-600 dark:text-amber-400">
          Service &quot;{serviceSlug}&quot; was not recognized. Showing all available categories.
        </div>
      )}

      <MyMap
        userId={session?.user?.id}
        initialCategoryId={selectedService?.categoryId}
        initialSubcategoryId={selectedService?.subcategoryId}
      />
    </div>
  );
}

export default function CustomerBookPage() {
  return (
    <div className="max-w-6xl mx-auto pb-16 px-4 sm:px-6 lg:px-8">
      <div className="py-6 sm:py-8">
        <h1 className="text-2xl font-bold tracking-tight">Book a Helper</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Choose location, confirm details, and start live helper search.
        </p>
      </div>

      <Suspense fallback={null}>
        <MapContainer />
      </Suspense>
    </div>
  );
}