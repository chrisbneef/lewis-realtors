// JSON-LD builders for Lewis Realtors. Keep these factual; do not invent data.
import site from "../data/site.json";
import boundaries from "../data/neighborhood-boundaries.json";
import { SITE_URL } from "./site-url.js";

const ORIGIN = SITE_URL;
const AGENT_ID = `${ORIGIN}/#agent`;
const SITE_ID = `${ORIGIN}/#website`;

// Real social/authority profiles only (placeholders are filtered out). The team
// hub site is included so search engines connect the two Lewis Realtors entities.
// Use its canonical host here, not the shorter vanity domain that redirects to it.
const sameAs = [
  ...(site.contact.social || []).map((s) => s.href),
  site.teamSite?.canonicalHref || site.teamSite?.href,
]
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
    // Centroid from the official boundary (stored [lng, lat]); every
    // neighborhood carries coordinates now, not just Bolton.
    ...(boundaries.neighborhoods[hood.slug]?.centroid
      ? {
          geo: {
            "@type": "GeoCoordinates",
            latitude: boundaries.neighborhoods[hood.slug].centroid[1],
            longitude: boundaries.neighborhoods[hood.slug].centroid[0],
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

// A single blog article. Author is the shared Melissa Person (E-E-A-T);
// publisher is the agent/org node. Dates come from post frontmatter.
export function blogPosting({ title, description, path, datePublished, dateModified, keywords, image }) {
  const url = `${ORIGIN}${path}`;
  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "@id": `${url}#article`,
    headline: title,
    description,
    url,
    mainEntityOfPage: { "@type": "WebPage", "@id": `${url}#webpage` },
    datePublished,
    dateModified: dateModified || datePublished,
    author: {
      "@type": "Person",
      name: site.agent.name,
      jobTitle: site.agent.role,
      url: `${ORIGIN}/about`,
    },
    publisher: { "@id": AGENT_ID },
    inLanguage: "en-US",
    ...(keywords && keywords.length ? { keywords: keywords.join(", ") } : {}),
    ...(image ? { image: `${ORIGIN}${image}` } : {}),
  };
}

// The /blog index as a Blog node listing its posts.
export function blogSchema(posts) {
  return {
    "@context": "https://schema.org",
    "@type": "Blog",
    "@id": `${ORIGIN}/blog#blog`,
    url: `${ORIGIN}/blog`,
    name: `${site.brand} Journal`,
    description: `West Linn, ${site.state} real estate and lifestyle notes from ${site.agent.name}.`,
    publisher: { "@id": AGENT_ID },
    blogPost: posts.map((p) => ({
      "@type": "BlogPosting",
      headline: p.title,
      url: `${ORIGIN}/blog/${p.slug}`,
      datePublished: p.datePublished,
    })),
  };
}
