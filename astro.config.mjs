import { defineConfig } from 'astro/config';
import { loadEnv } from 'vite';
import sitemap from '@astrojs/sitemap';
import vercel from '@astrojs/vercel/serverless';
import { SITE_URL } from './src/lib/site-url.js';

// Local dev/build only: mirror .env into process.env so server routes can read
// secrets at runtime. Server code must use process.env (never a computed lookup
// on import.meta.env, which makes Vite inline every secret into the bundle).
// On Vercel these come from the project's environment variables instead.
const localEnv = loadEnv(process.env.NODE_ENV ?? 'development', process.cwd(), '');
for (const [key, value] of Object.entries(localEnv)) {
  if (process.env[key] === undefined) process.env[key] = value;
}

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
