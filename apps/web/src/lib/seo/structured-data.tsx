import Script from "next/script";

interface OrganizationSchema {
  name: string;
  url: string;
  logo?: string;
  description?: string;
  sameAs?: string[];
}

interface WebSiteSchema {
  name: string;
  url: string;
  description?: string;
}

interface ServiceSchema {
  name: string;
  description?: string;
  provider?: string;
  areaServed?: string;
}

export function OrganizationJsonLd({ data }: { data: OrganizationSchema }) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: data.name,
    url: data.url,
    logo: data.logo,
    description: data.description,
    sameAs: data.sameAs,
  };

  return (
    <Script
      id="organization-schema"
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

export function WebSiteJsonLd({ data }: { data: WebSiteSchema }) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: data.name,
    url: data.url,
    description: data.description,
  };

  return (
    <Script
      id="website-schema"
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

export function ServiceJsonLd({ data }: { data: ServiceSchema }) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: data.name,
    description: data.description,
    provider: {
      "@type": "Organization",
      name: data.provider,
    },
    areaServed: {
      "@type": "Place",
      name: data.areaServed,
    },
  };

  return (
    <Script
      id="service-schema"
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

// DOZO-specific structured data
export function DozoStructuredData() {
  const organizationData: OrganizationSchema = {
    name: "DOZO",
    url: "https://dozo.work",
    logo: "https://dozo.work/dozo-logo.svg",
    description: "DOZO is an on-demand local services platform connecting customers with trusted local helpers for everyday tasks and services in Delhi NCR.",
    // Add verified social profiles when available
    // sameAs: [
    //   "https://twitter.com/dozo",
    //   "https://facebook.com/dozo",
    //   "https://linkedin.com/company/dozo",
    //   "https://instagram.com/dozo",
    // ],
  };

  const websiteData: WebSiteSchema = {
    name: "DOZO",
    url: "https://dozo.work",
    description: "Connect with trusted local helpers for home cleaning, plumbing, electrical work, and more. Book instant or scheduled services with verified professionals.",
  };

  return (
    <>
      <OrganizationJsonLd data={organizationData} />
      <WebSiteJsonLd data={websiteData} />
    </>
  );
}
