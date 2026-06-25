# Build Plan: Hyper-Local West Linn Real Estate Website

A standalone playbook for a new project. It adapts a proven hyper-local mortgage marketing framework to a real estate agent's business. Start a fresh repo and build against this document. No dependency on any existing codebase.

---

## 1\. The Core Idea

The strategy rests on one principle: **the neighborhood is the atomic content unit.** Instead of one thin "we sell homes in the Portland area" page, you build a deep page for every neighborhood, each loaded with hyper-local data (schools, price ranges, market stats, character), each mapped to the right service, and each running the same single conversion action. Search engines reward the local authority; buyers and sellers convert on the local data. You are not selling a generic service, you are demonstrating block-by-block expertise.

For v1 the entire site focuses on **West Linn, Oregon** (one market, gone deep). Expansion to other cities later just repeats the same template per city.

---

## 2\. What Changes vs. a Mortgage Version of This Strategy

This framework was originally proven on a mortgage site. Only two things change for real estate: the **product axis** and the **conversion action**. Everything else (neighborhood-first structure, schools data, schema markup, static-site build, lead capture) transfers directly.

| Original (mortgage) | This site (real estate) |
| :---- | :---- |
| Atomic unit: neighborhood | Same: neighborhood |
| Product axis: loan programs (FHA, VA, Jumbo, etc.) | Service lines: buyer rep, seller/listing, luxury, first-time buyer, investor/ADU, relocation |
| Conversion: "Get Pre-Approved" | Conversion: **"Get the {Neighborhood} Market Report"** (gated email capture). Secondary: "What's my home worth?" valuation |
| Differentiator: "50+ lenders / wholesale" | Differentiator: hyper-local track record, sold comps, off-market network, staging/marketing reach, negotiation results |
| Data: median value \+ loan limits | Data: median sale price, $/sqft, days-on-market, list-to-sale ratio, inventory, months of supply, YoY trend, sold comps |
| Narrative ends in "financing implications" | Narrative ends in **"who this neighborhood is right for"** |
| Financing is the product | Financing is a **referral link out** to a mortgage partner |
| Schema: FinancialService | Schema: **RealEstateAgent**, Place, Residence, FAQPage, BreadcrumbList |

**Important constraint inherited from the brand style:** knowledgeable, neighborly, not salesy tone. **Never use em-dashes anywhere in site copy.** Never invent market numbers; use only the agent's real MLS data.

---

## 3\. The Conversion Engine: Neighborhood Market Reports

This is the heart of the site and the one piece to design carefully.

1. **The asset:** a per-neighborhood, monthly-refreshed stat sheet. Median sale price, price per square foot, days on market, list-to-sale ratio, active inventory, months of supply, year-over- year price change, and 3 recent sold comps, plus a short plain-English narrative.  
2. **The gate:** each neighborhood page shows a teaser (one headline stat and a simple chart). The full report is delivered by email after a short name \+ email form.  
3. **The plumbing:** a single lead-capture endpoint receives the form, validates a CAPTCHA, pushes a phone notification to the agent, and triggers the report email. Payload tags which neighborhood was requested so the agent knows intent.  
4. **Refresh cadence:** reports are updated by hand each month from the agent's MLS pulls and committed to the repo. No live data feed is required for v1.

A secondary conversion ("What's my home worth?" valuation request) reuses the same endpoint with a different tag, capturing seller leads who want a personalized estimate.

---

## 4\. West Linn Neighborhoods to Build (the page list)

One deep page per neighborhood. Starting price ranges and character below are a research seed; the agent confirms with live MLS data.

| Neighborhood | Typical range (seed) | Character | Likely service fit |
| :---- | :---- | :---- | :---- |
| Bolton | $550K-$850K | Historic, Craftsman, river access | First-time buyer, fixer |
| Willamette | $575K-$900K | Historic heart, walkable downtown | First-time buyer, lifestyle |
| Robinwood | $600K-$950K | Highway corridor, ADU potential | Investor / ADU |
| Sunset | $650K-$1.1M | Waterfront, family-oriented | Move-up buyer |
| Rosemont Summit | $750K-$1.2M | School-centric, established | Family / relocation |
| Marylhurst | $700K-$1.2M | Former campus, custom builds | New construction / custom |
| Hidden Springs | $800K-$1.3M | Newer family development | Move-up buyer |
| Parker Crest | $850K-$1.5M | Ridge-line views, executive homes | Luxury / seller |
| Skyline Ridge | $950K-$2M+ | Mt. Hood views, newer luxury | Luxury / seller |
| Savanna Oaks | $1M-$2.5M+ | Premier luxury, panoramic views | Luxury / seller |
| BHT (Barrington / Hidden Creek / Tanner Creek) | confirm | Newer planned enclaves | Move-up / luxury |

West Linn facts to embed: ZIP 97068, Clackamas County, West Linn-Wilsonville School District. School feeders matter to buyers, so document them per neighborhood (example pattern: Bolton Primary to Rosemont Ridge Middle to West Linn High).

---

## 5\. Site Structure (pages)

Because it is a single city, the structure is flat and deep.

- **Home / West Linn hub** — market overview, grid of 11 neighborhood cards, service overview, schools section, agent bio and differentiation, market-report CTA, FAQ.  
- **Neighborhood pages (\~11)** — the core. Map, narrative ("who it's right for"), property types, price range, school feeders, live-ish market stats block, recent sold comps, recommended service, and the gated market-report form.  
- **Service pages** — buyer representation, seller/listing, luxury, first-time buyer, investor/ADU, relocation. Each links back to the neighborhoods it fits.  
- **Market reports hub** — index of every neighborhood report; the conversion centerpiece.  
- **Home valuation page** — "What's my home worth?" seller lead form.  
- **Financing referral page** — short page handing buyers to a mortgage partner (cross-referral).  
- **Standard pages** — About / agent bio, Contact, Blog, FAQ.

---

## 6\. Recommended Tech (greenfield)

Match the proven approach: maximum speed, minimum moving parts.

- **Static HTML \+ plain CSS \+ vanilla JS.** No framework, no build step. Pages are hand-authored and committed to git. This keeps the site fast, cheap, fully crawlable, and trivial to scale per city.  
- **CSS:** one tokens/reset file plus one component stylesheet. Dark-mode-capable theme, sticky header, mobile menu, FAQ accordion, scroll-reveal. (Build a small shared `app.js` for these.)  
- **Maps:** Leaflet with hand-drawn neighborhood boundary polygons.  
- **Serverless API (a couple of small functions):** one `capture-lead` endpoint for the market-report and valuation forms (validates CAPTCHA, sends the agent a push notification, triggers the report email). Python or Node, whichever the host prefers.  
- **Hosting:** GitHub repo connected to Vercel (or similar) for auto-deploy on push. New domain for the standalone brand.  
- **Anti-spam \+ notify:** a CAPTCHA provider (e.g. Cloudflare Turnstile) and a push service (e.g. ntfy.sh) to alert the agent on every lead.  
- **SEO:** per-page JSON-LD (RealEstateAgent, Place, FAQPage, BreadcrumbList), a hand-maintained sitemap.xml, and robots.txt.  
- **Analytics:** GA4 plus Meta Pixel, installed site-wide.

Repo skeleton:

```
/                 index.html and all top-level pages
/neighborhoods/   one html per neighborhood (or flat *-west-linn.html)
/reports/         per-neighborhood market report assets
/services/        service pages
/api/             capture-lead function
/js/              app.js, maps + boundary data, schools data
/assets/          logo, headshot, hero images, favicons
base.css style.css app.js
sitemap.xml robots.txt vercel.json package.json
STYLE.md          tone + the no-em-dashes rule + brand facts
```

---

## 7\. Research Checklist (the "how to research it" part)

Per neighborhood, gather and document:

- **Market stats** (the report data): median sale price, $/sqft, days on market, list-to-sale ratio, active inventory, months of supply, YoY price change.  
  - *Authoritative source:* the agent's RMLS/MLS pulls.  
  - *Cross-checks:* Clackamas County public records, Redfin/Zillow market pages.  
- **Recent sold comps:** 3 representative recent sales (agent-supplied).  
- **Narrative, character, price range:** write per the table above; confirm against current listings.  
- **School feeders:** elementary to middle to high path for each neighborhood (West Linn-Wilsonville district site).  
- **Boundaries:** draw map polygons per neighborhood for the Leaflet maps.

---

## 8\. Inputs Needed From the Agent / Office Before Launch

- Brand identity: agent/office name, brokerage, Oregon real estate license number, logo, headshot, phone, email, and the domain to use.  
- The first MLS/RMLS data pull for all 11 neighborhoods (seeds every market report).  
- Email-delivery provider choice and credentials for sending the gated reports.  
- The mortgage partner's referral link for the financing page.

---

## 9\. Build Order (suggested)

1. Scaffold the repo, theme, and shared `app.js`; set up Vercel auto-deploy on a new domain.  
2. Build the home/hub page and one neighborhood page as the template, fully styled with schema.  
3. Stand up the `capture-lead` endpoint \+ CAPTCHA \+ agent push notification; wire the gated form.  
4. Clone the neighborhood template across the remaining 10 neighborhoods, filling real data.  
5. Add the service pages, market-reports hub, valuation page, and financing referral page.  
6. Add About, Contact, FAQ, Blog shells.  
7. Generate the first month of market reports from the agent's MLS data.

---

## 10\. Verification Before Launch

- Run the site locally; confirm the home page, all 11 neighborhood pages, service pages, and the reports hub render correctly with the theme (dark mode, sticky header, FAQ accordion).  
- Submit the gated market-report form: confirm the endpoint fires, CAPTCHA validates, the agent gets a push notification, and the report email is triggered.  
- Validate JSON-LD on a neighborhood page with Google's Rich Results test (RealEstateAgent \+ Place \+ FAQPage \+ BreadcrumbList).  
- Search the whole build for em-dashes and remove them; confirm no leftover mortgage/loan copy.  
- Confirm the financing referral CTA links to the mortgage partner correctly.

