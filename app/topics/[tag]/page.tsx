import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  applySort,
  formatDate,
  getAllTags,
  getPostsByTag,
} from '../../lib/posts';
import { SITE_URL } from '../../lib/site';
import styles from '../topics.module.css';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ tag: string }>
}): Promise<Metadata> {
  const { tag } = await params
  // __empty is a sentinel used by generateStaticParams when no tags exist yet.
  if (tag === '__empty') return { robots: { index: false, follow: false } }
  return {
    title: `Topic: ${tag}`,
    description: `Posts tagged "${tag}" on code – Rod Machen.`,
    alternates: {
      canonical: `${SITE_URL}/topics/${tag}/`,
    },
  }
}

export function generateStaticParams() {
  const tags = getAllTags();
  if (tags.length === 0) return [{ tag: '__empty' }];
  return tags.map(({ tag }) => ({ tag }));
}

export default async function TopicPage({
  params,
}: {
  params: Promise<{ tag: string }>;
}) {
  const { tag } = await params;
  const posts = getPostsByTag(tag);
  if (posts.length === 0) notFound();
  const sorted = applySort(posts, 'date', 'desc');
  return (
    <main className={styles.page} data-testid="topic-page">
      <div className={styles.container}>
        <Link href="/topics/" className={styles.backLink}>
          {'\u2190'} All topics
        </Link>
        <h1 className={styles.heading}>Topic: {tag}</h1>
        <ul className={styles.postList} data-testid="topic-post-list">
          {sorted.map((post) => (
            <li
              key={post.slug}
              className={styles.postItem}
              data-testid={`topic-post-${post.slug}`}
            >
              <Link href={`/posts/${post.slug}/`}>{post.title}</Link>
              <span className={styles.postDate}>{formatDate(post.date)}</span>
            </li>
          ))}
        </ul>
      </div>
    </main>
  );
}
