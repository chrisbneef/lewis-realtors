// /llms-full.txt - fuller content dump for AI answer engines.
import site from "../data/site.json";
import neighborhoods from "../data/neighborhoods.json";
import services from "../data/services.json";
import faq from "../data/faq.json";
import { SITE_URL } from "../lib/site-url.js";

export const prerender = true;

export async function GET() {
  const u = (p) => `${SITE_URL}${p}`;
  const hoods = [...neighborhoods].sort((a, b) => a.order - b.order);
  const L = [];

  L.push(`# ${site.brand}: ${site.city}, ${site.state} Real Estate`);
  L.push("");
  L.push(
    `${site.brand} is a hyper-local real estate office serving ${site.city}, ${site.state} (ZIP ${site.zip}, ${site.county}). The strategy treats each neighborhood as its own deep resource: every one of the ${hoods.length} ${site.city} neighborhoods gets a free, monthly market report covering median sale price, price per square foot, days on market, list-to-sale ratio, active inventory, months of supply, the year-over-year trend, and recent sold comps.`
  );
  L.push("");
  L.push(`Phone: ${site.contact.phone}. Hours: ${site.contact.hoursText}. School district: ${site.district}.`);
  L.push("");

  L.push(`## About ${site.agent.name}`);
  L.push(`${site.agent.name}, ${site.agent.role}. ${site.agent.designations.join(". ")}.`);
  L.push("");
  for (const para of site.agent.bio) L.push(para + "\n");

  L.push("## Services");
  for (const s of services) {
    L.push(`### ${s.name}`);
    L.push(`${s.summary} Best for: ${s.for}. ${u(`/services#${s.slug}`)}`);
    L.push("");
  }

  L.push(`## ${site.city} neighborhoods`);
  for (const h of hoods) {
    L.push(`### ${h.name}`);
    L.push(`${h.tagline} Character: ${h.character}. Price range: ${h.range}. Best service fit: ${h.serviceFit}. ${u(`/neighborhoods/${h.slug}`)}`);
    if (h.complete) {
      if (h.schools) {
        L.push(`School feeders: ${h.schools.elementary} to ${h.schools.middle} to ${h.schools.high}.`);
      }
      if (Array.isArray(h.narrative)) {
        L.push("");
        for (const para of h.narrative) L.push(para);
      }
      if (Array.isArray(h.rightFor)) {
        L.push("");
        L.push(`Right for: ${h.rightFor.join("; ")}.`);
      }
    } else {
      L.push("Full market report publishing soon.");
    }
    L.push("");
  }

  L.push("## Frequently asked questions");
  for (const item of faq) {
    L.push(`### ${item.q}`);
    L.push(item.a);
    L.push("");
  }

  L.push("## Compliance");
  L.push(site.compliance.license);
  L.push("");
  L.push(site.compliance.idx);

  return new Response(L.join("\n") + "\n", {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
