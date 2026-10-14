#!/usr/bin/env node
/**
 * Tell IndexNow (Bing, Yandex, Seznam, Naver) that the site's URLs changed.
 * Run AFTER a deploy is live, so the key file and sitemap are reachable:
 *
 *   npm run indexnow            # submit every URL in the live sitemap
 *   npm run indexnow -- --dry   # list what would be sent
 *
 * The key lives in src/data/site.json (indexNowKey) and is served as
 * public/<key>.txt. It is public by design; it only proves we own the host.
 */

import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { SITE_URL } from "../src/lib/site-url.js";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const site = JSON.parse(readFileSync(resolve(ROOT, "src/data/site.json"), "utf8"));
const key = site.indexNowKey;
const DRY = process.argv.includes("--dry");

if (!key) {
  console.error("ERROR: indexNowKey is missing from src/data/site.json.");
  process.exit(1);
}

const host = new URL(SITE_URL).host;

async function sitemapUrls() {
  const res = await fetch(`${SITE_URL}/sitemap-0.xml`);
  if (!res.ok) throw new Error(`sitemap fetch failed: HTTP ${res.status}`);
  const xml = await res.text();
  const urls = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
  // Only submit URLs on our own host; IndexNow rejects mixed hosts.
  return urls.filter((u) => new URL(u).host === host);
}

async function keyIsLive() {
  const res = await fetch(`${SITE_URL}/${key}.txt`);
  return res.ok && (await res.text()).trim() === key;
}

const urls = await sitemapUrls();
if (urls.length === 0) {
  console.error(`ERROR: no ${host} URLs in the live sitemap. Is the canonical fix deployed?`);
  process.exit(1);
}
console.log(`${urls.length} URLs on ${host}`);

if (DRY) {
  urls.forEach((u) => console.log(`  ${u}`));
  process.exit(0);
}

if (!(await keyIsLive())) {
  console.error(`ERROR: ${SITE_URL}/${key}.txt is not live yet. Deploy first.`);
  process.exit(1);
}

const res = await fetch("https://api.indexnow.org/indexnow", {
  method: "POST",
  headers: { "Content-Type": "application/json; charset=utf-8" },
  body: JSON.stringify({ host, key, keyLocation: `${SITE_URL}/${key}.txt`, urlList: urls }),
});
// 200 = accepted, 202 = accepted pending key check. Anything else is a problem.
console.log(`IndexNow responded HTTP ${res.status}`);
if (res.status !== 200 && res.status !== 202) {
  console.error(await res.text());
  process.exit(1);
}
