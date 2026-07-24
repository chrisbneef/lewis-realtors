import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";

// The site's first content collection: the weekly West Linn blog.
// Posts are Markdown under src/content/blog/. Theme alternates weekly
// (odd ISO week = real-estate, even = lifestyle) but is set per-post.
const blog = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/blog" }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    theme: z.enum(["real-estate", "lifestyle"]),
    publishDate: z.coerce.date(),
    updatedDate: z.coerce.date().optional(),
    author: z.string().default("Melissa Shaw"),
    keywords: z.array(z.string()).default([]),
    heroImage: z.string().optional(),
    // Provenance for every factual/market claim (GEO + accuracy discipline).
    sources: z
      .array(z.object({ label: z.string(), url: z.string().optional() }))
      .default([]),
    draft: z.boolean().default(false),
  }),
});

export const collections = { blog };
