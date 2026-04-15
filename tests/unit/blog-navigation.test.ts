import { describe, test, expect } from 'vitest';
import {
  pathToSlug,
  reconcileOpenSlugs,
  focusedWindowId,
  focusAction,
  type FocusAction,
} from '../../app/lib/blog-navigation';

describe('pathToSlug', () => {
  test('root path → null', () => {
    expect(pathToSlug('/')).toBeNull();
  });

  test('/posts (bare listings path) → null', () => {
    expect(pathToSlug('/posts')).toBeNull();
  });

  test('/posts/<slug> → slug', () => {
    expect(pathToSlug('/posts/hello-classicy')).toBe('hello-classicy');
  });

  test('multi-segment slug returns the full remainder', () => {
    // Blog slugs are single-segment today, but the hook should not silently
    // drop nested segments if content ever gains subpaths.
    expect(pathToSlug('/posts/topics/javascript')).toBe('topics/javascript');
  });

  test('trailing slash on /posts/<slug>/ still yields slug', () => {
    expect(pathToSlug('/posts/foo/')).toBe('foo');
  });

  test('/posts/ (trailing slash) treated as listings → null', () => {
    expect(pathToSlug('/posts/')).toBeNull();
  });

  test('unrelated paths → null (defensive)', () => {
    expect(pathToSlug('/about')).toBeNull();
    expect(pathToSlug('/foo/bar')).toBeNull();
  });

  test('null or empty path → null', () => {
    expect(pathToSlug(null)).toBeNull();
    expect(pathToSlug('')).toBeNull();
  });
});

describe('reconcileOpenSlugs', () => {
  test('desired slug not in list → appends', () => {
    expect(reconcileOpenSlugs([], 'foo')).toEqual(['foo']);
    expect(reconcileOpenSlugs(['a'], 'b')).toEqual(['a', 'b']);
  });

  test('desired slug already in list → returns same reference (no state churn)', () => {
    const current = ['a', 'b'];
    expect(reconcileOpenSlugs(current, 'a')).toBe(current);
    expect(reconcileOpenSlugs(current, 'b')).toBe(current);
  });

  test('desired = null → returns same reference (listings focus, no open slug change)', () => {
    const current = ['a', 'b'];
    expect(reconcileOpenSlugs(current, null)).toBe(current);
    expect(reconcileOpenSlugs([], null)).toEqual([]);
  });

  test('preserves existing order when appending', () => {
    expect(reconcileOpenSlugs(['a', 'b', 'c'], 'd')).toEqual(['a', 'b', 'c', 'd']);
  });
});

describe('focusedWindowId', () => {
  test('null slug → listings window id', () => {
    expect(focusedWindowId(null)).toBe('blog.listings');
  });

  test('slug → reader window id', () => {
    expect(focusedWindowId('hello-classicy')).toBe('blog.reader.hello-classicy');
  });
});

describe('focusAction', () => {
  test('null slug → dispatch action focusing listings', () => {
    const action: FocusAction = focusAction(null);
    expect(action).toEqual({
      type: 'ClassicyWindowFocus',
      app: { id: 'blog' },
      window: { id: 'blog.listings' },
    });
  });

  test('slug → dispatch action focusing reader window', () => {
    const action: FocusAction = focusAction('hello-classicy');
    expect(action).toEqual({
      type: 'ClassicyWindowFocus',
      app: { id: 'blog' },
      window: { id: 'blog.reader.hello-classicy' },
    });
  });
});
