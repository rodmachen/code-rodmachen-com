import { describe, test, expect } from 'vitest';
import { applySort, filterPublished, formatDate, sortedPosts, type Post } from '../../app/lib/posts';

const samplePosts: Post[] = [
  { title: 'Zebra Post', subTitle: '', date: '2024-01-15', published: true, tags: [], slug: 'zebra', body: '', permalink: '/posts/zebra' },
  { title: 'Apple Post', subTitle: '', date: '2023-06-01', published: true, tags: [], slug: 'apple', body: '', permalink: '/posts/apple' },
  { title: 'Mango Post', subTitle: '', date: '2024-03-20', published: true, tags: [], slug: 'mango', body: '', permalink: '/posts/mango' },
];

const mixedPosts: Post[] = [
  { title: 'Published A', subTitle: '', date: '2024-01-01', published: true, tags: [], slug: 'pub-a', body: '', permalink: '/posts/pub-a' },
  { title: 'Draft B', subTitle: '', date: '2024-01-02', published: false, tags: [], slug: 'draft-b', body: '', permalink: '/posts/draft-b' },
  { title: 'Published C', subTitle: '', date: '2024-01-03', published: true, tags: [], slug: 'pub-c', body: '', permalink: '/posts/pub-c' },
];

describe('formatDate', () => {
  test('formats ISO date as human-readable string', () => {
    expect(formatDate('2024-01-15')).toBe('Jan 15, 2024');
  });

  test('formats another date correctly', () => {
    expect(formatDate('2023-06-01')).toBe('Jun 1, 2023');
  });
});

describe('applySort', () => {
  test('sorts by date desc (newest first)', () => {
    const result = applySort(samplePosts, 'date', 'desc');
    expect(result.map((p) => p.slug)).toEqual(['mango', 'zebra', 'apple']);
  });

  test('sorts by date asc (oldest first)', () => {
    const result = applySort(samplePosts, 'date', 'asc');
    expect(result.map((p) => p.slug)).toEqual(['apple', 'zebra', 'mango']);
  });

  test('sorts by name asc (alphabetical)', () => {
    const result = applySort(samplePosts, 'name', 'asc');
    expect(result.map((p) => p.slug)).toEqual(['apple', 'mango', 'zebra']);
  });

  test('sorts by name desc (reverse alphabetical)', () => {
    const result = applySort(samplePosts, 'name', 'desc');
    expect(result.map((p) => p.slug)).toEqual(['zebra', 'mango', 'apple']);
  });

  test('does not mutate the input array', () => {
    const original = [...samplePosts];
    applySort(samplePosts, 'name', 'asc');
    expect(samplePosts).toEqual(original);
  });
});

describe('sortedPosts', () => {
  test('is sorted by date descending', () => {
    for (let i = 0; i < sortedPosts.length - 1; i++) {
      expect(sortedPosts[i].date >= sortedPosts[i + 1].date).toBe(true);
    }
  });
});

describe('filterPublished', () => {
  const prod = { NODE_ENV: 'production' };
  const dev = { NODE_ENV: 'development' };
  const devNoDrafts = { NODE_ENV: 'development', SHOW_DRAFTS: 'false' };

  test('empty list → empty result', () => {
    expect(filterPublished([], prod)).toEqual([]);
  });

  test('all published in production → returns all', () => {
    expect(filterPublished(samplePosts, prod)).toHaveLength(3);
  });

  test('mixed in production → returns only published', () => {
    const result = filterPublished(mixedPosts, prod);
    expect(result.map((p) => p.slug)).toEqual(['pub-a', 'pub-c']);
  });

  test('all drafts in production → returns empty', () => {
    const allDrafts = mixedPosts.map((p) => ({ ...p, published: false }));
    expect(filterPublished(allDrafts, prod)).toHaveLength(0);
  });

  test('mixed in dev (no SHOW_DRAFTS) → returns all including drafts', () => {
    const result = filterPublished(mixedPosts, dev);
    expect(result).toHaveLength(3);
  });

  test('mixed in dev with SHOW_DRAFTS=false → filters drafts', () => {
    const result = filterPublished(mixedPosts, devNoDrafts);
    expect(result.map((p) => p.slug)).toEqual(['pub-a', 'pub-c']);
  });

  test('no NODE_ENV (test runner env) → filters drafts', () => {
    const result = filterPublished(mixedPosts, {});
    expect(result.map((p) => p.slug)).toEqual(['pub-a', 'pub-c']);
  });
});
