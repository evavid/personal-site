import rss from "@astrojs/rss";
import type { APIContext } from "astro";
import { site, categories } from "../config";
import { getPosts, postUrl } from "../lib/posts";

export async function GET(context: APIContext) {
  const posts = await getPosts();
  return rss({
    title: site.name,
    description: site.tagline,
    site: context.site!,
    items: posts.map((post) => ({
      title: post.data.title,
      pubDate: post.data.date,
      description: post.data.excerpt,
      categories: [categories[post.data.category]],
      link: postUrl(post),
    })),
  });
}
