// /llms.txt - concise manifest for AI answer engines (llmstxt.org format).
// Generated from site data so it stays in sync as neighborhoods are added.
import site from "../data/site.json";
import neighborhoods from "../data/neighborhoods.json";
import services from "../data/services.json";
import { SITE_URL } from "../lib/site-url.js";
import { hoodMarket, money } from "../lib/market.js";

export const prerender = true;

export async function GET() {
  const u = (p) => `${SITE_URL}${p}`;
  const hoods = [...neighborhoods].sort((a, b) => a.order - b.order);
  const L = [];

  L.push(`# ${site.brand}`);
  L.push("");
  L.push(
    `> Hyper-local real estate for ${site.city}, ${site.state} (ZIP ${site.zip}, ${site.county}), led by Principal Broker ${site.agent.name}. ${site.brand} publishes a free monthly market report for each of the ${hoods.length} ${site.city} neighborhoods and represents buyers, sellers, first-time buyers, investors, and relocating families.`
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
  L.push("");

  L.push(`## ${site.city} neighborhoods`);
  for (const h of hoods) {
    const m = hoodMarket(h.slug);
    const price = m?.publishable ? `median asking ${money(m.medianAskingPrice)}` : `part of the West Linn market`;
    L.push(`- [${h.name}](${u(`/neighborhoods/${h.slug}`)}): ${h.character}; ${price}; fits ${h.serviceFit.toLowerCase()}.`);
  }
  L.push("");

  L.push("## Notes");
  L.push(`- School district: ${site.district}.`);
  L.push("- Site market figures are asking prices from active listings, refreshed monthly from RentCast; listing records originate from RMLS.");
  L.push("- Oregon is a non-disclosure state, so closed sale prices are not public record. Melissa provides sold figures from RMLS on request.");
  L.push("- Content is neighborly and factual; market numbers are never invented.");

  return new Response(L.join("\n") + "\n", {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
