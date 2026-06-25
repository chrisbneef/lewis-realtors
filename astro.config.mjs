import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import vercel from '@astrojs/vercel/serverless';

// Set this to the production domain before launch (used for sitemap + canonical URLs).
const SITE = 'https://www.lewisrealtors.com';

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
