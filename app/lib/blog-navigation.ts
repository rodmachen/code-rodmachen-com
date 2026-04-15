export type FocusAction = {
  type: 'ClassicyWindowFocus';
  app: { id: 'blog' };
  window: { id: string };
};

export function pathToSlug(path: string | null | undefined): string | null {
  if (!path) return null;
  const trimmed = path.endsWith('/') && path.length > 1 ? path.slice(0, -1) : path;
  if (trimmed === '/' || trimmed === '/posts') return null;
  if (trimmed.startsWith('/posts/')) {
    const rest = trimmed.slice('/posts/'.length);
    return rest.length > 0 ? rest : null;
  }
  return null;
}

export function reconcileOpenSlugs(
  current: string[],
  desired: string | null,
): string[] {
  if (!desired) return current;
  if (current.includes(desired)) return current;
  return [...current, desired];
}

export function focusedWindowId(slug: string | null): string {
  return slug ? `blog.reader.${slug}` : 'blog.listings';
}

export function focusAction(slug: string | null): FocusAction {
  return {
    type: 'ClassicyWindowFocus',
    app: { id: 'blog' },
    window: { id: focusedWindowId(slug) },
  };
}
