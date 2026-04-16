"use client";

import { MyMap } from "@/components/map-component";
import { useSession } from "@/lib/auth/session";
import { useSearchParams } from "next/navigation";

const SERVICE_TO_BOOKING_CATEGORY: Record<string, { categoryId: string; subcategoryId?: string }> = {
  cleaning: { categoryId: "cleaner", subcategoryId: "home_cleaning" },
  "deep-cleaning": { categoryId: "cleaner", subcategoryId: "home_cleaning" },
  electrician: { categoryId: "electrician" },
  plumbing: { categoryId: "plumber" },
  "ac-repair": { categoryId: "electrician" },
  appliance: { categoryId: "electrician" },
  carpenter: { categoryId: "other" },
  "pest-control": { categoryId: "other" },
  painting: { categoryId: "other" },
  laundry: { categoryId: "cleaner" },
  sanitization: { categoryId: "cleaner" },
  driver: { categoryId: "driver", subcategoryId: "car_driver" },
  delivery: { categoryId: "delivery_helper" },
  chef: { categoryId: "chef", subcategoryId: "cook" },
  babysitter: { categoryId: "caretaker" },
  security: { categoryId: "security_guard", subcategoryId: "security_night" },
  "car-washer": { categoryId: "cleaner" },
  "pet-groomer": { categoryId: "other" },
  fitness: { categoryId: "other" },
  "event-helper": { categoryId: "other" },
  moving: { categoryId: "other" },
  elderly: { categoryId: "caretaker" },
  assistant: { categoryId: "other" },
};

export default function CustomerBookPage() {
  const { session } = useSession();
  const searchParams = useSearchParams();
  const serviceSlug = searchParams.get("service") ?? "";
  const selectedService = SERVICE_TO_BOOKING_CATEGORY[serviceSlug] ?? undefined;

  return (
    <div className="max-w-6xl mx-auto pb-16 px-4 sm:px-6 lg:px-8">
      <div className="py-6 sm:py-8">
        <h1 className="text-2xl font-bold tracking-tight">Book a Helper</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Choose location, confirm details, and start live helper search.
        </p>
      </div>

      <MyMap
        userId={session?.user.id}
        initialCategoryId={selectedService?.categoryId}
        initialSubcategoryId={selectedService?.subcategoryId}
      />
    </div>
  );
}
