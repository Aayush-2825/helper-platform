export type BlogAuthor = {
  name: string;
  role?: string;
  avatar: string;
};

export type BlogPost = {
  slug: string;
  category: string;
  title: string;
  excerpt: string;
  author: BlogAuthor;
  readTime: string;
  date: string;
  image: string;
};

export const FEATURED: BlogPost = {
  slug: "why-dozo-is-fastest-service-marketplace",
  category: "Company",
  title: "Why DOZO Delivers Helpers in 10 Minutes - Not 10 Days",
  excerpt:
    "The technology and operational playbook behind our promise of instant service matching. A deep dive into how we built the fastest helper network in India.",
  author: {
    name: "Arjun Mehta",
    role: "Co-Founder & CEO",
    avatar: "https://i.pravatar.cc/150?u=arjun_dozo",
  },
  readTime: "8 min read",
  date: "Apr 8, 2026",
  image: "https://images.unsplash.com/photo-1487528278747-ba99ed528ebc?w=1200&q=80",
};

export const POSTS: BlogPost[] = [
  {
    slug: "background-verification-helpers",
    category: "Trust & Safety",
    title: "How We Verify Every Helper Before They Touch Your Door",
    excerpt: "A step-by-step breakdown of DOZO's 7-layer background verification process for all helpers.",
    author: { name: "Sneha Iyer", avatar: "https://i.pravatar.cc/150?u=sneha_dozo" },
    readTime: "5 min read",
    date: "Apr 5, 2026",
    image: "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=800&q=80",
  },
  {
    slug: "helper-success-rajesh",
    category: "Helper Stories",
    title: "From Rs8,000/mo to Rs40,000/mo: Rajesh's Story on DOZO",
    excerpt:
      "How joining DOZO transformed the lives of skilled workers across India through better earnings and opportunities.",
    author: { name: "Priya Nair", avatar: "https://i.pravatar.cc/150?u=priya_dozo" },
    readTime: "6 min read",
    date: "Apr 1, 2026",
    image: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=800&q=80",
  },
  {
    slug: "home-cleaning-tips-monsoon",
    category: "Home Tips",
    title: "10 Home Cleaning Tips to Prep Your House for Monsoon Season",
    excerpt:
      "Professional cleaning advice from DOZO's top-rated helpers to keep your home healthy during the rains.",
    author: { name: "Rahul Gupta", avatar: "https://i.pravatar.cc/150?u=rahul_dozo" },
    readTime: "4 min read",
    date: "Mar 28, 2026",
    image: "https://images.unsplash.com/photo-1527515637462-cff94eecc1ac?w=800&q=80",
  },
  {
    slug: "expanding-to-50-cities",
    category: "Company",
    title: "DOZO Is Now Live in 50 Cities - Here's What's Next",
    excerpt:
      "Our journey from one city to fifty, and an exclusive peek at the markets we're expanding to in Q3 2026.",
    author: { name: "Arjun Mehta", avatar: "https://i.pravatar.cc/150?u=arjun_dozo" },
    readTime: "7 min read",
    date: "Mar 20, 2026",
    image: "https://images.unsplash.com/photo-1477959858617-67f85cf4f1dfd?w=800&q=80",
  },
  {
    slug: "ac-service-summer-guide",
    category: "Home Tips",
    title: "AC Service Before Summer: The Definitive Checklist",
    excerpt:
      "Everything you need to do before summer hits to ensure your AC runs efficiently all season long.",
    author: { name: "Sneha Iyer", avatar: "https://i.pravatar.cc/150?u=sneha_dozo" },
    readTime: "5 min read",
    date: "Mar 15, 2026",
    image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80",
  },
];

export const ALL_POSTS: BlogPost[] = [FEATURED, ...POSTS];

export const CATEGORIES = ["All", "Company", "Trust & Safety", "Helper Stories", "Home Tips", "Product"];

export const CAT_COLORS: Record<string, string> = {
  Company: "bg-blue-50 text-blue-600 border-blue-100",
  "Trust & Safety": "bg-emerald-50 text-emerald-600 border-emerald-100",
  "Helper Stories": "bg-orange-50 text-orange-600 border-orange-100",
  "Home Tips": "bg-violet-50 text-violet-600 border-violet-100",
  Product: "bg-rose-50 text-rose-600 border-rose-100",
};
