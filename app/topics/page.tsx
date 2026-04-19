import type { Metadata } from 'next';
import Link from 'next/link';
import { getAllTags } from '../lib/posts';
import styles from './topics.module.css';

export const metadata: Metadata = {
  title: 'Topics',
  description: 'Browse all topics on code – Rod Machen.',
  alternates: {
    canonical: 'https://code.rodmachen.com/topics/',
  },
};

export default function TopicsPage() {
  const tags = getAllTags();
  return (
    <main className={styles.page} data-testid="topics-page">
      <div className={styles.container}>
        <Link href="/" className={styles.backLink}>
          {'\u2190'} Back to desktop
        </Link>
        <h1 className={styles.heading}>Topics</h1>
        {tags.length === 0 ? (
          <p className={styles.empty}>No topics yet.</p>
        ) : (
          <ul className={styles.tagList} data-testid="topics-list">
            {tags.map(({ tag, count }) => (
              <li key={tag} className={styles.tagItem}>
                <Link href={`/topics/${tag}/`} data-testid={`topic-link-${tag}`}>
                  {tag}
                  <span className={styles.tagCount}>({count})</span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </main>
  );
}
