// JSON-LD builders for Lewis Realtors. Keep these factual; do not invent data.
import site from "../data/site.json";

const ORIGIN = "https://www.lewisrealtors.com";

export function realEstateAgent() {
  return {
    "@context": "https://schema.org",
    "@type": "RealEstateAgent",
    "@id": `${ORIGIN}/#agent`,
    name: site.brand,
    image: `${ORIGIN}${site.agent.headshot}`,
    telephone: site.contact.phone,
    areaServed: {
      "@type": "City",
      name: `${site.city}, ${site.state}`,
    },
    address: {
      "@type": "PostalAddress",
      addressLocality: site.city,
      addressRegion: "OR",
      postalCode: site.zip,
      addressCountry: "US",
    },
    employee: {
      "@type": "Person",
      name: site.agent.name,
      jobTitle: site.agent.role,
    },
    url: ORIGIN,
  };
}

export function placeSchema(hood) {
  return {
    "@context": "https://schema.org",
    "@type": "Place",
    name: `${hood.name}, ${site.city}, ${site.state}`,
    description: hood.tagline,
    address: {
      "@type": "PostalAddress",
      addressLocality: site.city,
      addressRegion: "OR",
      postalCode: site.zip,
      addressCountry: "US",
    },
    ...(hood.map?.center
      ? {
          geo: {
            "@type": "GeoCoordinates",
            latitude: hood.map.center[0],
            longitude: hood.map.center[1],
          },
        }
      : {}),
  };
}

export function faqSchema(items) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: { "@type": "Answer", text: item.a },
    })),
  };
}

export function breadcrumb(trail) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: trail.map((t, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: t.name,
      item: `${ORIGIN}${t.path}`,
    })),
  };
}
