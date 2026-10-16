import type { Metadata } from "next";

const siteName = "DOZO";
const siteUrl = "https://dozo.work";
const defaultTitle = "DOZO — Trusted Local Services & Helpers Near You";
const defaultDescription = "Connect with trusted local helpers for home cleaning, plumbing, electrical work, and more. Book instant or scheduled services with verified professionals. Live in Delhi NCR.";
const defaultOgImage = "/og-image-placeholder.svg";

interface SEOConfig {
  title?: string;
  description?: string;
  path?: string;
  noindex?: boolean;
  ogImage?: string;
  ogType?: "website" | "article";
}

export function generateMetadata(config: SEOConfig = {}): Metadata {
  const {
    title = defaultTitle,
    description = defaultDescription,
    path = "/",
    noindex = false,
    ogImage = defaultOgImage,
    ogType = "website",
  } = config;

  const url = `${siteUrl}${path}`;
  const fullTitle = title.includes(siteName) ? title : `${title} | ${siteName}`;

  return {
    title: fullTitle,
    description,
    alternates: {
      canonical: path,
    },
    openGraph: {
      type: ogType,
      siteName,
      title: fullTitle,
      description,
      url,
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description,
      images: [ogImage],
    },
    robots: {
      index: !noindex,
      follow: !noindex,
      googleBot: {
        index: !noindex,
        follow: !noindex,
      },
    },
  };
}

// Page-specific metadata generators
export const homeMetadata = generateMetadata({
  title: defaultTitle,
  description: defaultDescription,
  path: "/",
});

export const aboutMetadata = generateMetadata({
  title: "About DOZO — Making Local Services Easier",
  description: "Learn about DOZO's mission to connect customers with trusted local helpers. Our platform provides verified professionals for home services across Delhi NCR.",
  path: "/about",
});

export const becomeHelperMetadata = generateMetadata({
  title: "Become a Helper on DOZO — Earn Money Your Way",
  description: "Join DOZO as a verified helper and start earning. Flexible hours, instant payments, and access to thousands of customers. Sign up today!",
  path: "/helper",
});

export const servicesMetadata = generateMetadata({
  title: "Local Services & Helpers — DOZO",
  description: "Browse trusted local services including home cleaning, plumbing, electrical work, AC repair, and more. Verified professionals available in Delhi NCR.",
  path: "/services",
});

export const contactMetadata = generateMetadata({
  title: "Contact DOZO — Get Help & Support",
  description: "Need help? Contact DOZO customer support for assistance with bookings, payments, or any questions about our local services platform.",
  path: "/help",
});

export const careersMetadata = generateMetadata({
  title: "Careers at DOZO — Join Our Team",
  description: "Explore career opportunities at DOZO. We're building the future of local services and looking for talented people to join our team.",
  path: "/careers",
});

export const blogMetadata = generateMetadata({
  title: "DOZO Blog — Tips & Insights for Local Services",
  description: "Read the latest tips, guides, and insights about home services, local helpers, and making the most of the DOZO platform.",
  path: "/blog",
});

export const pressMetadata = generateMetadata({
  title: "DOZO Press — News & Media Coverage",
  description: "Official press room for DOZO. Access press releases, media kit, and company news about our local services platform.",
  path: "/press",
});

// Private page metadata (noindex)
export const authMetadata = generateMetadata({
  title: "Sign In — DOZO",
  description: "Sign in to your DOZO account to book services or manage your helper profile.",
  path: "/auth/signin",
  noindex: true,
});

export const dashboardMetadata = generateMetadata({
  title: "Dashboard — DOZO",
  description: "Access your DOZO dashboard to manage bookings, payments, and account settings.",
  path: "/dashboard",
  noindex: true,
});

export const adminMetadata = generateMetadata({
  title: "Admin Console — DOZO",
  description: "Administrative console for managing DOZO platform operations.",
  path: "/admin",
  noindex: true,
});
