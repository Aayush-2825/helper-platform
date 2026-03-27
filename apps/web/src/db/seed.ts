import { db } from './index';
import { serviceCategory, serviceSubcategory } from './schema';

async function seed() {
  // Categories
  const categories = [
    { id: 'driver', slug: 'driver', name: 'Driver', description: 'Driving and transportation services' },
    { id: 'electrician', slug: 'electrician', name: 'Electrician', description: 'Electrical repair and installation' },
    { id: 'plumber', slug: 'plumber', name: 'Plumber', description: 'Plumbing services' },
    { id: 'cleaner', slug: 'cleaner', name: 'Cleaner', description: 'Cleaning services' },
    { id: 'chef', slug: 'chef', name: 'Chef', description: 'Cooking and chef services' },
    { id: 'delivery_helper', slug: 'delivery-helper', name: 'Delivery Helper', description: 'Delivery and logistics support' },
    { id: 'caretaker', slug: 'caretaker', name: 'Caretaker', description: 'Caretaking and elderly support' },
    { id: 'security_guard', slug: 'security-guard', name: 'Security Guard', description: 'Security and guard services' },
    { id: 'other', slug: 'other', name: 'Other', description: 'Other services' },
  ];

  for (const cat of categories) {
    await db.insert(serviceCategory).values(cat).onConflictDoNothing();
  }

  // Subcategories (example, expand as needed)
  const subcategories = [
    { id: 'car_driver', categoryId: 'driver', slug: 'car-driver', name: 'Car Driver', description: 'Driving cars' },
    { id: 'bike_driver', categoryId: 'driver', slug: 'bike-driver', name: 'Bike Driver', description: 'Driving bikes' },
    { id: 'home_cleaning', categoryId: 'cleaner', slug: 'home-cleaning', name: 'Home Cleaning', description: 'Cleaning homes' },
    { id: 'office_cleaning', categoryId: 'cleaner', slug: 'office-cleaning', name: 'Office Cleaning', description: 'Cleaning offices' },
    { id: 'cook', categoryId: 'chef', slug: 'cook', name: 'Cook', description: 'Cooking meals' },
    { id: 'security_night', categoryId: 'security_guard', slug: 'night-guard', name: 'Night Guard', description: 'Night security guard' },
    // Add more as needed
  ];

  for (const sub of subcategories) {
    await db.insert(serviceSubcategory).values(sub).onConflictDoNothing();
  }

  console.log('Seeding complete');
  process.exit(0);
}

seed().catch((e) => {
  console.error(e);
  process.exit(1);
});
