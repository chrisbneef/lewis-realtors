// JSON-LD builders for Lewis Realtors. Keep these factual; do not invent data.
import site from "../data/site.json";
import { SITE_URL } from "./site-url.js";

const ORIGIN = SITE_URL;
const AGENT_ID = `${ORIGIN}/#agent`;
const SITE_ID = `${ORIGIN}/#website`;

// Real social/authority profiles only (placeholders are filtered out).
const sameAs = (site.contact.social || [])
  .map((s) => s.href)
  .filter((h) => h && h !== "#" && h.startsWith("http"));

function openingHours() {
  return (site.contact.hoursSpec || []).map((s) => ({
    "@type": "OpeningHoursSpecification",
    dayOfWeek: s.days,
    opens: s.opens,
    closes: s.closes,
  }));
}

// The agent/organization node, referenced by @id from the other schemas.
function agentNode() {
  const node = {
    "@type": "RealEstateAgent",
    "@id": AGENT_ID,
    name: site.brand,
    image: `${ORIGIN}${site.agent.headshot}`,
    logo: `${ORIGIN}/assets/lewis-logo.png`,
    telephone: site.contact.phone,
    priceRange: "$$$",
    url: ORIGIN,
    areaServed: { "@type": "City", name: `${site.city}, ${site.state}` },
    address: {
      "@type": "PostalAddress",
      addressLocality: site.city,
      addressRegion: "OR",
      postalCode: site.zip,
      addressCountry: "US",
    },
    founder: {
      "@type": "Person",
      name: site.agent.name,
      jobTitle: site.agent.role,
      knowsAbout: [
        "West Linn real estate",
        "home valuation",
        "neighborhood market analysis",
      ],
    },
    knowsAbout: [
      `${site.city}, ${site.state} real estate`,
      "neighborhood market reports",
      "home buying and selling",
      "home valuation",
    ],
    openingHoursSpecification: openingHours(),
  };
  if (sameAs.length) node.sameAs = sameAs;
  return node;
}

export function realEstateAgent() {
  return { "@context": "https://schema.org", ...agentNode() };
}

export function webSite() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": SITE_ID,
    url: ORIGIN,
    name: site.brand,
    description: `Hyper-local ${site.city}, ${site.state} real estate and monthly neighborhood market reports.`,
    inLanguage: "en-US",
    publisher: { "@id": AGENT_ID },
  };
}

// Per-page node carrying freshness (dateModified) and an author byline.
export function webPage({ path = "/", name, dateModified }) {
  const url = `${ORIGIN}${path}`;
  return {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "@id": `${url}#webpage`,
    url,
    name,
    isPartOf: { "@id": SITE_ID },
    about: { "@id": AGENT_ID },
    inLanguage: "en-US",
    ...(dateModified ? { dateModified, datePublished: dateModified } : {}),
    author: {
      "@type": "Person",
      name: site.agent.name,
      jobTitle: site.agent.role,
      url: `${ORIGIN}/about`,
    },
    publisher: { "@id": AGENT_ID },
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
