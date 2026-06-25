# Lewis Realtors — Hyper-Local West Linn Real Estate

A static-first Astro site for Lewis Realtors (Melissa Shaw), built around one idea: the
neighborhood is the atomic content unit. Each West Linn neighborhood gets its own deep page and a
monthly market report, all driving a single conversion: "Get the {Neighborhood} market report."

This is the **v1 foundation**: the full design system, a complete home/hub page, and one finished,
data-driven neighborhood (**Bolton**). The other ten neighborhoods render from the same template in
a "report publishing soon" state until their data is filled in.

## Run it

```bash
npm install
npm run dev      # http://localhost:4321
npm run build    # static pages + one serverless function (capture-lead)
npm run preview
```

## Stack

- **Astro 5**, static output by default. Pages are prerendered (fast, fully crawlable). The one
  server route (`/api/capture-lead`) opts out with `export const prerender = false` and builds to a
  Vercel serverless function via `@astrojs/vercel`.
- Plain CSS with design tokens (`src/styles/tokens.css`, `global.css`). No CSS framework.
- Leaflet (CDN) for neighborhood boundary maps.
- `@astrojs/sitemap` for `sitemap-index.xml`; `robots.txt` in `public/`.
- Per-page JSON-LD: RealEstateAgent, Place, FAQPage, BreadcrumbList (`src/lib/schema.js`).

## Where things live

```
src/data/          site.json (brand facts, contact, IDX disclaimer), neighborhoods.json,
                   services.json, faq.json   <- edit content here
src/pages/         index.astro, neighborhoods/[slug].astro, services/, market-reports.astro,
                   home-value.astro, financing.astro, about/contact/faq, 404, api/capture-lead.js
src/components/    Header, Footer, Hero, BuySellRefer, StatBand, NeighborhoodCard, ServiceCard,
                   MeetMelissa, MarketReportForm, ValuationCTA, FaqAccordion, Testimonial, PageHero
src/styles/        tokens.css, global.css
src/scripts/       app.js (header, menu, accordion, reveal, theme), map.js (Leaflet)
public/assets/     lewis-logo.png, melissa-shaw.png
STYLE.md           tone, the no-em-dashes rule, brand facts
```

## Adding the next neighborhood

Fill its row in `src/data/neighborhoods.json` (narrative, school feeders, map boundary, stats,
sold comps) and set `complete: true`. The full template and report page generate automatically.

## Before launch (inputs still needed)

- Real RMLS data and three sold comps per neighborhood (replace every `tag-sample` placeholder).
- Oregon and Washington license numbers (`site.json` compliance).
- Hero and section photography (currently styled placeholders).
- Lead capture wiring: Cloudflare Turnstile keys, an ntfy.sh topic, and an email provider. See the
  three `TODO` sections in `src/pages/api/capture-lead.js`.
- The mortgage partner referral link (`src/pages/financing.astro`).
- The production domain (set `SITE` in `astro.config.mjs`).

## Content rules

See `STYLE.md`. In short: neighborly not salesy, never invent market numbers, and **no em-dashes**.
