'use client';

export default function PostBody({ html }: { html: string }) {
  return (
    <div
      className="blogPostBody"
      data-testid="post-body"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
