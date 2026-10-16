import type { MetadataRoute } from "next";

// Static pages - these are always included
const staticPages: MetadataRoute.Sitemap = [
  {
    url: "https://dozo.work",
    lastModified: new Date(),
    changeFrequency: "daily",
    priority: 1,
  },
  {
    url: "https://dozo.work/about",
    lastModified: new Date(),
    changeFrequency: "monthly",
    priority: 0.8,
  },
  {
    url: "https://dozo.work/help",
    lastModified: new Date(),
    changeFrequency: "monthly",
    priority: 0.7,
  },
  {
    url: "https://dozo.work/careers",
    lastModified: new Date(),
    changeFrequency: "monthly",
    priority: 0.6,
  },
  {
    url: "https://dozo.work/press",
    lastModified: new Date(),
    changeFrequency: "monthly",
    priority: 0.5,
  },
  {
    url: "https://dozo.work/blog",
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: 0.7,
  },
];

// Dynamic function to generate sitemap
export default function sitemap(): MetadataRoute.Sitemap {
  // Start with static pages
  const sitemap: MetadataRoute.Sitemap = [...staticPages];

  // TODO: Add dynamic service pages when services are available
  // This would fetch from the database and generate URLs like:
  // https://dozo.work/services/home-cleaning
  // https://dozo.work/services/plumbing
  // etc.

  // Example implementation (commented out until services are ready):
  /*
  try {
    const services = await db.select().from(serviceCategory).where(eq(serviceCategory.isActive, true));
    
    const servicePages: MetadataRoute.Sitemap = services.map((service) => ({
      url: `https://dozo.work/services/${service.slug}`,
      lastModified: service.updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    }));
    
    sitemap.push(...servicePages);
  } catch (error) {
    console.error("Error generating service sitemap:", error);
  }
  */

  return sitemap;
}
