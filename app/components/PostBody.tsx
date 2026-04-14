'use client';

import styles from './post-body.module.css';

export default function PostBody({ html }: { html: string }) {
  return (
    <div
      className={`blogPostBody ${styles.postBody}`}
      data-testid="post-body"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
