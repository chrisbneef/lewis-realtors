// /llms.txt - concise manifest for AI answer engines (llmstxt.org format).
// Generated from site data so it stays in sync as neighborhoods are added.
import site from "../data/site.json";
import neighborhoods from "../data/neighborhoods.json";
import services from "../data/services.json";
import { SITE_URL } from "../lib/site-url.js";
import { hoodMarket, money, moneyFull, latestSold, rmlsSold } from "../lib/market.js";
import { getCollection } from "astro:content";

export const prerender = true;

export async function GET() {
  const u = (p) => `${SITE_URL}${p}`;
  const hoods = [...neighborhoods].sort((a, b) => a.order - b.order);
  const posts = (await getCollection("blog", ({ data }) => !data.draft))
    .sort((a, b) => new Date(b.data.publishDate).getTime() - new Date(a.data.publishDate).getTime());
  const L = [];

  L.push(`# ${site.brand}`);
  L.push("");
  L.push(
    `> Hyper-local real estate for ${site.city}, ${site.state} (ZIP ${site.zip}, ${site.county}), led by ${site.agent.name}, ${site.agent.designations[0]} and a West Linn resident. ${site.brand} publishes a free monthly market report for each of the ${hoods.length} ${site.city} neighborhoods and represents buyers, sellers, first-time homebuyers, investors, and buyers relocating to the area.`
  );
  L.push("");
  L.push(
    `${site.agent.name} has 23 years of experience, more than $128 million in homes sold since 2016, and has served 1,000+ buyers and sellers. Motto: "${site.motto}." Phone: ${site.contact.phone}. Hours: ${site.contact.hoursText}`
  );
  L.push("");

  L.push("## Key pages");
  L.push(`- [Home](${u("/")}): ${site.city} market overview, neighborhood reports, and services.`);
  L.push(`- [Market reports](${u("/market-reports")}): index of every ${site.city} neighborhood market report.`);
  L.push(`- [Home value](${u("/home-value")}): request a personalized seller valuation from real sold comps.`);
  L.push(`- [Services](${u("/services")}): ${services.map((s) => s.name.toLowerCase()).join(", ")}.`);
  L.push(`- [About ${site.agent.name}](${u("/about")}): agent bio, credentials, and approach.`);
  L.push(`- [Contact](${u("/contact")}): phone, message, hours, and service area.`);
  L.push(`- [Financing partner](${u("/financing")}): mortgage referral so buyers shop pre-approved.`);
  L.push(`- [FAQ](${u("/faq")}): how the reports and the buying or selling process work.`);
  L.push(`- [Journal](${u("/blog")}): weekly ${site.city} articles, alternating real estate and lifestyle.`);
  L.push("");

  if (posts.length) {
    L.push("## Latest articles");
    for (const p of posts.slice(0, 12)) {
      const date = new Date(p.data.publishDate).toISOString().slice(0, 10);
      L.push(`- [${p.data.title}](${u(`/blog/${p.id}`)}) (${date}): ${p.data.description}`);
    }
    L.push("");
  }

  L.push(`## ${site.city} neighborhoods`);
  for (const h of hoods) {
    const m = hoodMarket(h.slug);
    const price = m?.publishable ? `median asking ${money(m.medianAskingPrice)}` : `part of the West Linn market`;
    L.push(`- [${h.name}](${u(`/neighborhoods/${h.slug}`)}): ${h.character}; ${price}; fits ${h.serviceFit.toLowerCase()}.`);
  }
  L.push("");

  const sold = latestSold();
  if (sold) {
    L.push(`## ${site.city} sold data (${sold.label}, RMLS)`);
    L.push(
      `- Median sold price: ${moneyFull(sold.sold.medianPrice)}. Average sold price: ${moneyFull(sold.sold.averagePrice)}. ${sold.sold.units} detached homes sold, ranging ${moneyFull(sold.sold.minPrice)} to ${moneyFull(sold.sold.maxPrice)}.`
    );
    L.push(
      `- Median days on market: ${sold.daysOnMarket.median} (average ${sold.daysOnMarket.average}). Active listings: ${sold.activeUnits}. Pending: ${sold.pendingUnits}. Months of inventory: ${sold.monthsOfInventory.toFixed(1)}.`
    );
    L.push(`- ${rmlsSold.criteria.note} ${rmlsSold.attribution}`);
    L.push("");
  }

  L.push("## Notes");
  L.push(`- School district: ${site.district}.`);
  L.push("- Per-neighborhood figures on this site are ASKING prices from active listings, refreshed monthly from RentCast; listing records originate from RMLS.");
  L.push("- City-wide SOLD figures are closed sale data pulled monthly from RMLS by Melissa Shaw. Oregon is a non-disclosure state, so closed prices are not public record and come from RMLS rather than county records.");
  L.push("- Never conflate the two: asking prices are not sale prices.");
  L.push("- Content is neighborly and factual; market numbers are never invented.");

  return new Response(L.join("\n") + "\n", {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
