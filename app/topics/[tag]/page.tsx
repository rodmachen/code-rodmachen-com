import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  applySort,
  formatDate,
  getAllTags,
  getPostsByTag,
} from '../../lib/posts';
import styles from '../topics.module.css';

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
