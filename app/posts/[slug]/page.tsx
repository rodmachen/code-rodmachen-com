import { notFound } from 'next/navigation';
import { publishedPosts } from '../../lib/posts';
import ClassicyShell from '../../components/ClassicyShell';

export function generateStaticParams() {
  const posts = publishedPosts();
  // Static export requires at least one param; use a sentinel when no posts are published.
  // The page handler calls notFound() for any slug not in publishedPosts(), so this is safe.
  if (posts.length === 0) return [{ slug: '__empty' }];
  return posts.map((post) => ({ slug: post.slug }));
}

export default async function PostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const found = publishedPosts().find((p) => p.slug === slug);
  if (!found) notFound();
  return <ClassicyShell />;
}
