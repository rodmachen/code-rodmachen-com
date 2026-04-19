import { publishedPosts, type Post } from '../lib/posts'

const SITE_URL = 'https://code.rodmachen.com'

export const dynamic = 'force-static'

export function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

export function buildRssXml(posts: Pick<Post, 'title' | 'subTitle' | 'date' | 'slug'>[]): string {
  const items = posts
    .map(
      (post) => `
    <item>
      <title>${escapeXml(post.title)}</title>
      <link>${SITE_URL}/posts/${post.slug}/</link>
      <pubDate>${new Date(post.date).toUTCString()}</pubDate>
      <description>${escapeXml(post.subTitle ?? '')}</description>
    </item>`,
    )
    .join('')

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>code – Rod Machen</title>
    <link>${SITE_URL}/</link>
    <description>Code and development writing by Rod Machen.</description>
    ${items}
  </channel>
</rss>`
}

export function GET() {
  const posts = publishedPosts()
  const xml = buildRssXml(posts)
  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
    },
  })
}
