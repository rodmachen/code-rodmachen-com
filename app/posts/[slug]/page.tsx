import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { publishedPosts } from '../../lib/posts';
import { SITE_URL } from '../../lib/site';
import ClassicyShell from '../../components/ClassicyShell';
const CLOUDINARY_CLOUD = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim()
}

function buildCloudinaryOgUrl(publicId: string): string | null {
  if (!CLOUDINARY_CLOUD) return null
  return `https://res.cloudinary.com/${CLOUDINARY_CLOUD}/image/upload/c_fill,w_1200,h_630,f_auto,q_auto/${publicId}`
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  // __empty is a sentinel used by generateStaticParams when no posts are published yet.
  // It routes to notFound(), so suppress indexing.
  if (slug === '__empty') return { robots: { index: false, follow: false } }
  const post = publishedPosts().find((p) => p.slug === slug)
  if (!post) return {}

  const description = post.subTitle
    ? post.subTitle
    : stripHtml(post.body).slice(0, 160)

  const ogImageUrl = post.thumbnail ? buildCloudinaryOgUrl(post.thumbnail) : null

  return {
    title: post.title,
    description,
    alternates: {
      canonical: `${SITE_URL}/posts/${slug}/`,
    },
    openGraph: {
      title: post.title,
      description,
      type: 'article',
      publishedTime: post.date,
      ...(ogImageUrl ? { images: [{ url: ogImageUrl, width: 1200, height: 630 }] } : {}),
    },
    twitter: {
      title: post.title,
      description,
      ...(ogImageUrl ? { images: [ogImageUrl] } : {}),
    },
  }
}

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
