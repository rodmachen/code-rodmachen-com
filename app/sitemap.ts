import type { MetadataRoute } from 'next'
import { publishedPosts, getAllTags } from './lib/posts'

export const dynamic = 'force-static'

const SITE_URL = 'https://code.rodmachen.com'

export default function sitemap(): MetadataRoute.Sitemap {
  const posts = publishedPosts()
  const tags = getAllTags(posts)

  const postUrls: MetadataRoute.Sitemap = posts.map((post) => ({
    url: `${SITE_URL}/posts/${post.slug}/`,
    lastModified: new Date(post.date),
  }))

  const tagUrls: MetadataRoute.Sitemap = tags.map(({ tag }) => ({
    url: `${SITE_URL}/topics/${tag}/`,
  }))

  return [
    { url: `${SITE_URL}/` },
    { url: `${SITE_URL}/topics/` },
    ...tagUrls,
    ...postUrls,
  ]
}
