import { describe, test, expect } from 'vitest';
import { applySort, formatDate, sortedPosts, type Post } from '../../app/lib/posts';

const samplePosts: Post[] = [
  { title: 'Zebra Post', subTitle: '', date: '2024-01-15', tags: [], slug: 'zebra', body: '', permalink: '/posts/zebra' },
  { title: 'Apple Post', subTitle: '', date: '2023-06-01', tags: [], slug: 'apple', body: '', permalink: '/posts/apple' },
  { title: 'Mango Post', subTitle: '', date: '2024-03-20', tags: [], slug: 'mango', body: '', permalink: '/posts/mango' },
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
