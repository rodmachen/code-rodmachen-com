import { notFound } from 'next/navigation';
import { publishedPosts } from '../../lib/posts';
import ClassicyShell from '../../components/ClassicyShell';

export function generateStaticParams() {
  return publishedPosts().map((post) => ({ slug: post.slug }));
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
