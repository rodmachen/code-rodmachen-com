**Project:** code.rodmachen.com — a tech/code blog for Rod Machen

**Part of a larger ecosystem:**
- `rodmachen.com` — personal homepage/hub
- `edition.rodmachen.com` — writing hub (newsletter, articles, reviews, bylines)
- `code.rodmachen.com` — this site (tech/code writing, shared on LinkedIn)
- `photo.rodmachen.com` — photo portfolio

**Tech stack (must match sibling sites):**
- Astro 5.x (static output)
- Vercel deployment (`@astrojs/vercel` adapter)
- Cloudinary for images (`astro-cloudinary`, cloud name: `dke4phurv`)
- TypeScript
- Markdown content with frontmatter

**Reference implementation:** The edition site at `/Users/rodmachen/code/edition-rodmachen-com` is the most mature sibling. Key patterns to reference (but not copy wholesale — this site has its own identity):
- `astro.config.mjs` — Vercel adapter, static output, trailing slashes, remark plugin for Cloudinary images
- `src/content.config.ts` — content collection schema using `glob` loader and Zod
- `src/plugins/remark-cloudinary-images.ts` — transforms markdown images to responsive Cloudinary URLs with srcset
- `src/layouts/BaseLayout.astro` — HTML head with OG/Twitter meta tags
- `src/layouts/PostLayout.astro` — post page layout with accent colors via CSS `define:vars`
- `src/pages/rss.xml.ts` — RSS feed generation with `@astrojs/rss`

**Content schema for this site (simplified from edition):**
```
posts collection:
  title: string (required)
  subTitle: string (optional)
  tags: string[] (optional, normalize from string or array)
  date: Date (required, coerced)
  published: boolean (optional)
  thumbnail: string (optional, Cloudinary public ID)
  slug: string (optional override; default derived from filename minus date prefix)
```

No `category` or `template` field needed — all posts are implicitly "code/tech".

**URL structure:**
- `/` — homepage with post listing
- `/[slug]/` — individual posts (trailing slash)
- `/topics/` — tag cloud
- `/topics/[tag]/` — posts filtered by tag
- `/rss.xml` — RSS feed

**Design direction:**
- Tech/code focused — should feel distinct from the more editorial edition site
- Good code block styling with syntax highlighting (consider Astro's built-in Shiki support)
- Monospace accents where appropriate
- Clean, readable long-form layout for technical articles
- Dark mode support would be a natural fit (but not required for MVP)
- Mobile responsive

**MVP Phase 1 — Styling only:**
- Set up Astro project with Vercel adapter
- Create BaseLayout with HTML head, header, footer
- Create PostLayout with post content styling
- Design the homepage layout (post list)
- Style code blocks, headings, body text, links
- Use 1-2 placeholder/sample posts to develop against
- No content migration yet, no topics page, no RSS — just the visual foundation
- Deploy to Vercel to verify

**Phase 2 — Full blog buildout:**
- Content collection with schema
- Dynamic routes for posts and topics
- RSS feed
- Cloudinary image integration (remark plugin)
- SEO: sitemap, robots.txt, OG tags
- Google Analytics
- Cross-site footer links (to rodmachen.com, edition, photo)

**Cross-site navigation:**
- Footer should link to rodmachen.com and sibling subdomains
- Header has a small "Rod Machen" link back to rodmachen.com

**Deployment:**
- Vercel project: `code-rodmachen-com`
- Domain: `code.rodmachen.com` (CNAME to `cname.vercel-dns.com`)
- `site` in astro.config.mjs: `https://code.rodmachen.com`
- Static output, trailing slashes

