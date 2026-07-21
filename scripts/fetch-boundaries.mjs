#!/usr/bin/env node
/**
 * One-time (rarely re-run) fetch of official neighborhood boundaries into
 * src/data/neighborhood-boundaries.json.
 *
 * Source: Oregon Metro RLIS open data, "Neighborhood Organizations Boundaries"
 * (ArcGIS MapServer layer 5). Free, public, no key. 11 of our neighborhoods are
 * official West Linn neighborhood associations; Stafford uses the Clackamas
 * County "Stafford-Tualatin Valley" boundary (Hamlet is merged into Stafford).
 *
 * Coordinates are stored as GeoJSON [lng, lat] (WGS84). The rest of the repo
 * uses [lat, lng]; this file is the one deliberate exception. Convert at the
 * two consumers: src/lib/geo.js (matching) and src/scripts/map.js (display).
 *
 * Usage: node scripts/fetch-boundaries.mjs
 */

import { writeFileSync, renameSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const OUT = resolve(ROOT, "src/data/neighborhood-boundaries.json");

const LAYER =
  "https://gis.oregonmetro.gov/arcgis/rest/services/OpenData/BoundaryDataWebMerc/MapServer/5/query";

// Official boundary NAME (from the Metro layer) -> our neighborhood slug.
// Hamlet is intentionally absent: it is merged into stafford.
const NAME_TO_SLUG = {
  "BOLTON": "bolton",
  "WILLAMETTE": "willamette",
  "ROBINWOOD": "robinwood",
  "SUNSET": "sunset",
  "ROSEMONT SUMMIT": "rosemont-summit",
  "MARYLHURST": "marylhurst",
  "HIDDEN SPRINGS": "hidden-springs",
  "PARKER CREST": "parker-crest",
  "SKYLINE RIDGE": "skyline-ridge",
  "SAVANNA OAKS": "savanna-oaks",
  "BARRINGTON HEIGHTS/HIDDEN CREEK ESTATES/TANNER CREEK (BHT)": "bht-enclaves",
  "STAFFORD-TUALATIN VALLEY": "stafford",
};

// Each entry: [where clause, boundarySource]
const QUERIES = [
  ["JURISDICTION='West Linn'", "official"],
  ["NAME='STAFFORD-TUALATIN VALLEY' AND JURISDICTION='Clackamas County'", "official"],
];

async function queryGeoJSON(where, { simplify } = {}) {
  const params = new URLSearchParams({
    where,
    outFields: "NAME",
    returnGeometry: "true",
    outSR: "4326",
    f: "geojson",
  });
  if (simplify) params.set("maxAllowableOffset", "0.0003"); // ~30m, for display
  const res = await fetch(`${LAYER}?${params}`);
  if (!res.ok) throw new Error(`ArcGIS HTTP ${res.status} for where=${where}`);
  const d = await res.json();
  if (!d.features) throw new Error(`No features for where=${where}`);
  return d.features;
}

function ringsOf(geometry) {
  // Normalize Polygon and MultiPolygon to an array of polygons (each = array of rings).
  if (geometry.type === "Polygon") return [geometry.coordinates];
  if (geometry.type === "MultiPolygon") return geometry.coordinates;
  throw new Error(`Unexpected geometry type ${geometry.type}`);
}

function bboxOf(polygons) {
  let minLng = Infinity, minLat = Infinity, maxLng = -Infinity, maxLat = -Infinity;
  for (const rings of polygons) for (const [lng, lat] of rings[0]) {
    if (lng < minLng) minLng = lng;
    if (lat < minLat) minLat = lat;
    if (lng > maxLng) maxLng = lng;
    if (lat > maxLat) maxLat = lat;
  }
  return [minLng, minLat, maxLng, maxLat];
}

function centroidOf(bbox) {
  return [(bbox[0] + bbox[2]) / 2, (bbox[1] + bbox[3]) / 2]; // [lng, lat]
}

async function main() {
  const full = new Map();
  const simp = new Map();

  for (const [where] of QUERIES) {
    for (const f of await queryGeoJSON(where)) full.set(f.properties.NAME, f.geometry);
    for (const f of await queryGeoJSON(where, { simplify: true })) simp.set(f.properties.NAME, f.geometry);
  }

  const neighborhoods = {};
  const missing = [];
  for (const [NAME, slug] of Object.entries(NAME_TO_SLUG)) {
    const g = full.get(NAME);
    if (!g) { missing.push(NAME); continue; }
    const polygons = ringsOf(g);
    const bbox = bboxOf(polygons);
    neighborhoods[slug] = {
      name: NAME,
      boundarySource: "official",
      bbox,
      centroid: centroidOf(bbox),
      polygons,                                    // full precision, for matching
      display: ringsOf(simp.get(NAME) || g),       // simplified, for maps
    };
  }

  if (missing.length) throw new Error(`Boundaries not found for: ${missing.join("; ")}`);

  const payload = {
    generatedAt: new Date().toISOString(),
    source: "Oregon Metro RLIS - Neighborhood Organizations Boundaries (MapServer layer 5)",
    crs: "WGS84",
    coordinateOrder: "[lng, lat] (GeoJSON); convert for Leaflet which wants [lat, lng]",
    count: Object.keys(neighborhoods).length,
    neighborhoods,
  };

  const tmp = `${OUT}.tmp`;
  writeFileSync(tmp, JSON.stringify(payload, null, 2) + "\n");
  renameSync(tmp, OUT);

  const kb = (JSON.stringify(payload).length / 1024).toFixed(1);
  console.log(`Wrote ${payload.count} boundaries (${kb} KB) -> ${OUT}`);
  for (const [slug, n] of Object.entries(neighborhoods)) {
    const v = n.polygons.reduce((s, p) => s + p[0].length, 0);
    console.log(`  ${slug.padEnd(18)} ${String(v).padStart(4)} vtx  bbox lng[${n.bbox[0].toFixed(3)}, ${n.bbox[2].toFixed(3)}]`);
  }
}

main().catch((err) => { console.error(`FAILED: ${err.message}`); process.exit(1); });
