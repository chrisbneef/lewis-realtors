import rss from "@astrojs/rss";
import { getCollection } from "astro:content";
import site from "../../data/site.json";
import { SITE_URL } from "../../lib/site-url.js";

export async function GET(context) {
  const posts = (await getCollection("blog", ({ data }) => !data.draft)).sort(
    (a, b) => new Date(b.data.publishDate).getTime() - new Date(a.data.publishDate).getTime()
  );
  return rss({
    title: `${site.brand} Journal`,
    description: `West Linn, ${site.state} real estate and lifestyle notes from ${site.agent.name}.`,
    site: context.site ?? SITE_URL,
    items: posts.map((p) => ({
      title: p.data.title,
      description: p.data.description,
      pubDate: new Date(p.data.publishDate),
      link: `/blog/${p.id}/`,
      categories: [p.data.theme, ...p.data.keywords],
    })),
    customData: `<language>en-us</language>`,
  });
}
