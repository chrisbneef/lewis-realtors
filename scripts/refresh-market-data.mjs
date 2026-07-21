#!/usr/bin/env node
/**
 * Refresh West Linn market data from the RentCast API into src/data/market.json.
 *
 * SCOPE NOTE (important): Oregon is a non-disclosure state, so closed sale prices
 * are not in public records and RentCast cannot supply them at any plan tier.
 * Everything here is LISTING-side: asking prices, days on market, and active
 * inventory. Never label these figures as sold/sale prices.
 *
 * Usage:
 *   RENTCAST_API_KEY=xxx node scripts/refresh-market-data.mjs [--dry-run]
 *
 * Guardrails: hard call cap, PII field whitelist, sample-size suppression,
 * month-over-month anomaly warning, and atomic write (nothing is written on error).
 */

import { writeFileSync, readFileSync, existsSync, renameSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { assignNeighborhood } from "../src/lib/geo.js";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const OUT = resolve(ROOT, "src/data/market.json");
const HISTORY = resolve(ROOT, "src/data/market-history.json");
const HOODS = resolve(ROOT, "src/data/neighborhoods.json");
const BOUNDS = resolve(ROOT, "src/data/neighborhood-boundaries.json");

const API = "https://api.rentcast.io/v1";
const ZIP = "97068";
const CITY = "West Linn";
const STATE = "OR";

/** Never exceed this many API calls in one run. The free plan allows 50/month. */
const MAX_CALLS = 12;
/** Page size + hard page cap for the city-wide listing pull. */
const PAGE = 500;
const MAX_PAGES = 5;
/** Only these property types count toward medians. Manufactured/mobile homes,
 *  condos, townhouses, and apartments are excluded so a neighborhood's figure
 *  reflects its houses, not a pocket of low-priced manufactured units. */
const INCLUDE_TYPES = new Set(["Single Family", "Multi-Family"]);
/** Minimum active listings before we publish a median for a neighborhood. */
const MIN_FOR_MEDIAN = 5;
/** Warn (don't block) if the city median swings more than this month over month. */
const ANOMALY_PCT = 0.4;
/** Per-listing fields we keep. latitude/longitude are needed for polygon
 *  assignment (property data, not PII). listingAgent/listingOffice - personal
 *  contact data - are deliberately NOT here and are dropped on ingest. */
const LISTING_FIELDS = [
  "formattedAddress", "price", "bedrooms", "bathrooms",
  "squareFootage", "propertyType", "daysOnMarket", "listedDate",
  "latitude", "longitude",
];

const DRY = process.argv.includes("--dry-run");
const KEY = process.env.RENTCAST_API_KEY;
if (!KEY) {
  console.error("ERROR: RENTCAST_API_KEY is not set.");
  process.exit(1);
}

let calls = 0;
const warnings = [];

async function get(path, params) {
  if (calls >= MAX_CALLS) {
    throw new Error(`Call cap reached (${MAX_CALLS}); aborting before overspending quota.`);
  }
  const url = new URL(API + path);
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, String(v));
  calls++;
  const res = await fetch(url, { headers: { "X-Api-Key": KEY, Accept: "application/json" } });
  if (!res.ok) {
    throw new Error(`${path} -> HTTP ${res.status} ${res.statusText} (${await res.text()})`);
  }
  return res.json();
}

const nums = (a) => a.filter((n) => typeof n === "number" && Number.isFinite(n) && n > 0);
const avg = (a) => { const n = nums(a); return n.length ? Math.round(n.reduce((x, y) => x + y, 0) / n.length) : null; };

function median(values) {
  const a = nums(values).sort((x, y) => x - y);
  if (!a.length) return null;
  const m = Math.floor(a.length / 2);
  return a.length % 2 ? a[m] : Math.round((a[m - 1] + a[m]) / 2);
}

/** Linear-interpolated percentile (p in 0..1) over positive numbers. */
function percentile(values, p) {
  const a = nums(values).sort((x, y) => x - y);
  if (!a.length) return null;
  const idx = (a.length - 1) * p;
  const lo = Math.floor(idx), hi = Math.ceil(idx);
  return Math.round(a[lo] + (a[hi] - a[lo]) * (idx - lo));
}

function round(n, dp = 0) {
  if (typeof n !== "number" || !Number.isFinite(n)) return null;
  const f = 10 ** dp;
  return Math.round(n * f) / f;
}

/** Month key "2026-07" -> "Jul 26" for compact chart labels. */
function monthLabel(key) {
  const [y, m] = key.split("-");
  const names = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  return `${names[Number(m) - 1]} ${y.slice(2)}`;
}

/** 12-month asking-price trend + freshness from RentCast's ZIP aggregate.
 *  The trend line is all-property-types context (labeled as such on the page);
 *  the headline figures below are recomputed from the filtered houses. */
async function fetchCityTrend() {
  const d = await get("/markets", { zipCode: ZIP, dataType: "Sale" });
  const s = d.saleData || {};
  const hist = s.history || {};
  const trend = Object.keys(hist)
    .sort()
    .slice(-12)
    .map((k) => ({ label: monthLabel(k), month: k, medianAskingPrice: hist[k]?.medianPrice ?? null }))
    .filter((p) => p.medianAskingPrice !== null);
  return { trend, lastUpdated: s.lastUpdatedDate ?? null };
}

/** City headline stats computed from the same filtered (SF + multi-family)
 *  listings as the neighborhoods, so every median on the site is consistent. */
function computeCity(listings) {
  const prices = listings.map((r) => r.price);
  const ppsf = listings.filter((r) => r.price && r.squareFootage).map((r) => r.price / r.squareFootage);
  const dom = listings.map((r) => r.daysOnMarket);
  return {
    medianAskingPrice: median(prices),
    averageAskingPrice: avg(prices),
    medianPricePerSqft: round(median(ppsf), 2),
    medianDaysOnMarket: median(dom),
    averageDaysOnMarket: avg(dom),
    totalListings: listings.length,
  };
}

/**
 * Pull every active West Linn sale listing (one paged city query), strip to the
 * whitelist, and keep only rows with coordinates. Stafford-area homes carry
 * "West Linn" addresses, so this single query covers all 12 neighborhoods.
 */
async function fetchListings() {
  const all = [];
  for (let page = 0; page < MAX_PAGES; page++) {
    const rows = await get("/listings/sale", {
      city: CITY, state: STATE, status: "Active", limit: PAGE, offset: page * PAGE,
    });
    const batch = Array.isArray(rows) ? rows : [];
    all.push(...batch);
    if (batch.length < PAGE) break;                 // last page
    if (page === MAX_PAGES - 1) {
      warnings.push(`Hit the ${MAX_PAGES}-page cap; some listings may be uncounted.`);
    }
  }
  // Whitelist immediately - agent/office PII never lives past this line.
  const clean = all
    .map((r) => Object.fromEntries(LISTING_FIELDS.map((f) => [f, r[f] ?? null])))
    .filter((r) => typeof r.latitude === "number" && typeof r.longitude === "number");

  // Keep only single-family + multi-family; report what was dropped.
  const kept = clean.filter((r) => INCLUDE_TYPES.has(r.propertyType));
  const dropped = clean.length - kept.length;
  if (dropped > 0) {
    const byType = {};
    for (const r of clean) if (!INCLUDE_TYPES.has(r.propertyType)) {
      byType[r.propertyType || "Unknown"] = (byType[r.propertyType || "Unknown"] || 0) + 1;
    }
    const summary = Object.entries(byType).map(([t, n]) => `${n} ${t}`).join(", ");
    warnings.push(`Excluded ${dropped} non-house listing(s) by type: ${summary}.`);
  }
  return kept;
}

/** Bucket listings into neighborhoods by point-in-polygon, then compute stats. */
function computeNeighborhoods(listings, boundaries) {
  const entries = Object.entries(boundaries.neighborhoods).map(([slug, n]) => ({
    slug, bbox: n.bbox, polygons: n.polygons,
  }));
  const buckets = Object.fromEntries(entries.map((e) => [e.slug, []]));
  let unassigned = 0;

  for (const r of listings) {
    const slug = assignNeighborhood([r.longitude, r.latitude], entries);
    if (slug) buckets[slug].push(r);
    else unassigned++;
  }
  if (unassigned) {
    warnings.push(`${unassigned} West Linn listing(s) fell outside all 12 boundaries (city bucket only).`);
  }

  const out = {};
  for (const { slug } of entries) {
    const list = buckets[slug];
    const prices = list.map((r) => r.price);
    const ppsf = list.filter((r) => r.price && r.squareFootage).map((r) => r.price / r.squareFootage);
    const enough = list.length >= MIN_FOR_MEDIAN;
    const sorted = nums(prices).sort((a, b) => a - b);

    if (!enough && list.length > 0) {
      warnings.push(`${slug}: only ${list.length} active listing(s); medians suppressed.`);
    }

    out[slug] = {
      activeListings: list.length,
      sufficient: enough,
      boundarySource: "official",
      // Backed by an authoritative government boundary, so numbers publish
      // automatically once enough listings exist - no per-neighborhood sign-off.
      publishable: enough,
      medianAskingPrice: enough ? median(prices) : null,
      medianPricePerSqft: enough ? round(median(ppsf), 2) : null,
      medianDaysOnMarket: enough ? median(list.map((r) => r.daysOnMarket)) : null,
      // Robust interquartile band (p25-p75); raw min/max is too noisy to show
      // when one neighborhood spans a condo and an estate.
      priceRange: enough ? { low: percentile(prices, 0.25), high: percentile(prices, 0.75) } : null,
      // Asking prices only (no address/PII), sorted - lets the page redraw
      // distributions without spending API quota.
      prices: sorted,
      // A few real examples, newest first. Public MLS listing data, no agent details.
      samples: list
        .filter((r) => r.price && r.formattedAddress)
        .sort((a, b) => new Date(b.listedDate || 0) - new Date(a.listedDate || 0))
        .slice(0, 3)
        .map(({ latitude, longitude, ...rest }) => rest), // coords not needed on the page
    };
  }
  return out;
}

function anomalyCheck(city) {
  if (!existsSync(OUT)) return;
  try {
    const prev = JSON.parse(readFileSync(OUT, "utf8"));
    const before = prev?.cityData?.medianAskingPrice;
    const after = city.medianAskingPrice;
    if (before && after) {
      const delta = Math.abs(after - before) / before;
      if (delta > ANOMALY_PCT) {
        warnings.push(
          `CITY MEDIAN MOVED ${(delta * 100).toFixed(1)}% ` +
          `($${before.toLocaleString()} -> $${after.toLocaleString()}). Review before publishing.`
        );
      }
    }
  } catch {
    warnings.push("Could not read previous market.json for the anomaly check.");
  }
}

async function main() {
  const hoods = JSON.parse(readFileSync(HOODS, "utf8"));
  const boundaries = JSON.parse(readFileSync(BOUNDS, "utf8"));

  // Every neighborhood in the site must have an official boundary to be assignable.
  const bslugs = new Set(Object.keys(boundaries.neighborhoods));
  const noBoundary = hoods.filter((h) => !bslugs.has(h.slug)).map((h) => h.slug);
  if (noBoundary.length) {
    warnings.push(`No boundary for: ${noBoundary.join(", ")} (run scripts/fetch-boundaries.mjs).`);
  }

  console.log(`Fetching West Linn market data${DRY ? " [DRY RUN]" : ""}...`);
  const { trend, lastUpdated } = await fetchCityTrend();

  const listings = await fetchListings();
  console.log(`  ${listings.length} single-family/multi-family listings with coordinates`);

  const city = { ...computeCity(listings), trend, lastUpdated };
  console.log(
    `  city: median asking $${city.medianAskingPrice?.toLocaleString()}, ` +
    `${city.totalListings} houses, ${city.averageDaysOnMarket} avg DOM, ${trend.length} months history`
  );

  const neighborhoods = computeNeighborhoods(listings, boundaries);
  for (const h of hoods) {
    const n = neighborhoods[h.slug];
    if (!n) continue;
    console.log(
      `  ${h.name.padEnd(34)} ${String(n.activeListings).padStart(3)} active` +
      (n.publishable ? `  median $${n.medianAskingPrice?.toLocaleString()}` : `  (suppressed)`)
    );
  }

  anomalyCheck(city);

  const payload = {
    generatedAt: new Date().toISOString(),
    source: "RentCast",
    sourceNote:
      "Active single-family and multi-family listing data for West Linn, Oregon, sourced from " +
      "RentCast, assigned to neighborhoods by official boundary (Oregon Metro / Clackamas County). " +
      "Condos, townhouses, and manufactured homes are excluded. Listing records originate from " +
      "RMLS. Oregon is a non-disclosure state, so closed sale prices are not available in public " +
      "records; all figures here are asking prices and listing activity.",
    zipCode: ZIP,
    city: CITY,
    state: STATE,
    propertyTypes: [...INCLUDE_TYPES],
    minListingsForMedian: MIN_FOR_MEDIAN,
    listingsAssigned: listings.length,
    callsUsed: calls,
    cityData: city,
    neighborhoods,
  };

  if (warnings.length) {
    console.log("\nWARNINGS:");
    for (const w of warnings) console.log(`  ! ${w}`);
  }
  console.log(`\nAPI calls used: ${calls}/${MAX_CALLS} (free plan allows 50/month)`);

  if (DRY) {
    console.log("\nDRY RUN - nothing written. Payload preview:");
    console.log(JSON.stringify({ ...payload, neighborhoods: "...omitted..." }, null, 2));
    return;
  }

  // Atomic write so a crash mid-write can't leave truncated JSON in the repo.
  const tmp = `${OUT}.tmp`;
  writeFileSync(tmp, JSON.stringify(payload, null, 2) + "\n");
  renameSync(tmp, OUT);
  console.log(`\nWrote ${OUT}`);

  appendHistory(payload);
}

/**
 * Append this month's snapshot to market-history.json so a real per-neighborhood
 * price trend accumulates over time. Keyed by YYYY-MM and idempotent (re-running
 * in the same month overwrites, never duplicates). Once enough months exist, the
 * neighborhood pages switch their chart from the city trend to their own history.
 */
function appendHistory(payload) {
  const month = payload.generatedAt.slice(0, 7); // YYYY-MM
  const hist = existsSync(HISTORY)
    ? JSON.parse(readFileSync(HISTORY, "utf8"))
    : { note: "Monthly snapshots of median asking price (single-family + multi-family). Built up over time to chart real per-neighborhood trends.", months: {} };

  const neighborhoods = {};
  for (const [slug, n] of Object.entries(payload.neighborhoods)) {
    if (n.publishable && n.medianAskingPrice) neighborhoods[slug] = n.medianAskingPrice;
  }
  hist.months[month] = {
    generatedAt: payload.generatedAt,
    city: payload.cityData.medianAskingPrice,
    neighborhoods,
  };

  const tmp = `${HISTORY}.tmp`;
  writeFileSync(tmp, JSON.stringify(hist, null, 2) + "\n");
  renameSync(tmp, HISTORY);
  console.log(`Updated ${HISTORY} (${Object.keys(hist.months).length} month(s) recorded)`);
}

main().catch((err) => {
  console.error(`\nFAILED: ${err.message}`);
  console.error(`API calls used before failure: ${calls}. Existing market.json left untouched.`);
  process.exit(1);
});
