import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import vercel from '@astrojs/vercel/serverless';
import { SITE_URL } from './src/lib/site-url.js';

// Production origin (canonical + sitemap URLs). Edit src/lib/site-url.js to change.
const SITE = SITE_URL;

// Static by default (every page is prerendered: fast, fully crawlable). Routes
// that opt out with `export const prerender = false` (the capture-lead endpoint)
// build into a single Vercel serverless function.
export default defineConfig({
  site: SITE,
  adapter: vercel(),
  integrations: [sitemap()],
  build: {
    inlineStylesheets: 'auto',
  },
});
