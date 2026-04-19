import { posts as rawPosts, type Post } from '../../.velite';

export type { Post };

export type SortKey = 'name' | 'date';
export type SortDir = 'asc' | 'desc';

export function formatDate(iso: string): string {
  // Parse YYYY-MM-DD parts directly to avoid UTC-to-local timezone shift.
  // new Date('2024-01-15') is UTC midnight, which renders as the prior day
  // in any negative-offset timezone.
  const [year, month, day] = iso.split('-').map(Number);
  const d = new Date(year, month - 1, day);
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function applySort(list: Post[], key: SortKey, dir: SortDir): Post[] {
  const sorted = [...list];
  const d = dir === 'asc' ? 1 : -1;
  switch (key) {
    case 'name':
      sorted.sort((a, b) => d * a.title.localeCompare(b.title));
      break;
    case 'date':
      sorted.sort((a, b) => d * a.date.localeCompare(b.date));
      break;
  }
  return sorted;
}

export function filterPublished(
  posts: Post[],
  // Turbopack inlines process.env.NODE_ENV as a string literal in client bundles;
  // process.env as an object is not available in browsers (Turbopack does not polyfill it).
  env: { NODE_ENV?: string; SHOW_DRAFTS?: string } = {
    NODE_ENV: process.env.NODE_ENV,
    SHOW_DRAFTS: process.env.SHOW_DRAFTS,
  }
): Post[] {
  const isDev = env.NODE_ENV === 'development';
  const showDrafts = env.SHOW_DRAFTS !== 'false';
  if (isDev && showDrafts) return posts;
  return posts.filter((p) => p.published !== false);
}

export function publishedPosts(): Post[] {
  return filterPublished(rawPosts);
}

export const sortedPosts: Post[] = applySort(publishedPosts(), 'date', 'desc');

export type TagInfo = { tag: string; count: number };

export function getAllTags(posts: Post[] = publishedPosts()): TagInfo[] {
  const counts = new Map<string, number>();
  for (const post of posts) {
    for (const tag of post.tags) {
      counts.set(tag, (counts.get(tag) ?? 0) + 1);
    }
  }
  return Array.from(counts.entries())
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count || a.tag.localeCompare(b.tag));
}

export function getPostsByTag(tag: string, posts: Post[] = publishedPosts()): Post[] {
  return posts.filter((p) => p.tags.includes(tag));
}
