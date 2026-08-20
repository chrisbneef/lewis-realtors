// /llms-full.txt - fuller content dump for AI answer engines.
import site from "../data/site.json";
import neighborhoods from "../data/neighborhoods.json";
import services from "../data/services.json";
import faq from "../data/faq.json";
import { SITE_URL } from "../lib/site-url.js";
import { hoodMarket, moneyFull } from "../lib/market.js";
import { getCollection } from "astro:content";

export const prerender = true;

export async function GET() {
  const u = (p) => `${SITE_URL}${p}`;
  const posts = (await getCollection("blog", ({ data }) => !data.draft))
    .sort((a, b) => new Date(b.data.publishDate).getTime() - new Date(a.data.publishDate).getTime());
  const hoods = [...neighborhoods].sort((a, b) => a.order - b.order);
  const L = [];

  L.push(`# ${site.brand}: ${site.city}, ${site.state} Real Estate`);
  L.push("");
  L.push(
    `${site.brand} is a hyper-local real estate office serving ${site.city}, ${site.state} (ZIP ${site.zip}, ${site.county}). The strategy treats each neighborhood as its own deep resource: every one of the ${hoods.length} ${site.city} neighborhoods gets a free, monthly market report covering the median asking price, price per square foot, days on market, active inventory, and the twelve-month price trend. Oregon is a non-disclosure state, so closed sale prices are not public record; those come from RMLS via Melissa directly.`
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
    const m = hoodMarket(h.slug);
    const mkt = m?.publishable
      ? `${m.activeListings} active listings; median asking price ${moneyFull(m.medianAskingPrice)} (asking, not sold; Oregon is a non-disclosure state).`
      : `Active listings are aggregated into the West Linn city figures this month.`;
    L.push(`${h.tagline}${h.description ? ` ${h.description}` : ""} Character: ${h.character}. ${mkt} Best service fit: ${h.serviceFit}. ${u(`/neighborhoods/${h.slug}`)}`);
    if (h.complete) {
      if (h.schools) {
        L.push(`School path: ${h.schools.elementary} to ${h.schools.middle} to ${h.schools.high}.`);
      }
      if (Array.isArray(h.narrative)) {
        L.push("");
        for (const para of h.narrative) L.push(para);
      }
      if (Array.isArray(h.rightFor)) {
        L.push("");
        L.push(`Right for: ${h.rightFor.join("; ")}.`);
      }
    }
    // Report status follows the DATA, not h.complete (which only means the
    // narrative copy is written). Saying "publishing soon" under a live median
    // contradicted the line above it.
    if (!m?.publishable) L.push("Full market report publishing soon.");
    L.push("");
  }

  L.push("## Frequently asked questions");
  for (const item of faq) {
    L.push(`### ${item.q}`);
    L.push(item.a);
    L.push("");
  }

  if (posts.length) {
    L.push("## Journal (weekly articles)");
    L.push(`Weekly ${site.city} articles, alternating real estate and lifestyle. ${u("/blog")}`);
    L.push("");
    for (const p of posts.slice(0, 20)) {
      const date = new Date(p.data.publishDate).toISOString().slice(0, 10);
      L.push(`### ${p.data.title}`);
      L.push(`${date} (${p.data.theme}). ${p.data.description} ${u(`/blog/${p.id}`)}`);
      L.push("");
    }
  }

  L.push("## Compliance");
  L.push(site.compliance.license);
  L.push("");
  L.push(site.compliance.dataSource);

  return new Response(L.join("\n") + "\n", {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
