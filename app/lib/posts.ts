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
  env: { NODE_ENV?: string; SHOW_DRAFTS?: string } = process.env
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
