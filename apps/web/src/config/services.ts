export interface ServiceCategoryMapping {
  categoryId: string;
  subcategoryId?: string;
}

export const SERVICE_TO_BOOKING_CATEGORY: Record<string, ServiceCategoryMapping> = {
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
} as const;