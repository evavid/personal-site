import { getCollection, type CollectionEntry } from "astro:content";

export type Post = CollectionEntry<"posts">;

const WORDS_PER_MINUTE = 220;

export async function getPosts(): Promise<Post[]> {
  const posts = await getCollection("posts", ({ data }) => import.meta.env.DEV || !data.draft);
  return posts.sort((a, b) => b.data.date.getTime() - a.data.date.getTime());
}

export function readingTime(post: Post): number {
  const words = (post.body ?? "").split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / WORDS_PER_MINUTE));
}

export function postUrl(post: Post): string {
  return `/writing/${post.id}/`;
}
