---
layout: ../layouts/PostLayout.astro
title: Building the Next Generation of code.rodmachen.com
subTitle: A deep dive into why I chose Astro and Vercel for my code blog.
date: 2026-04-08T00:00:00.000Z
tags:
  - astro
  - vercel
  - architecture
---

Welcome to the new technical blog. This is a placeholder post to demonstrate the visual foundation of the site before we begin the Phase 2 content collection.

## The Philosophy

When redesigning this space, I wanted to separate my tech-focused writing from my broader editorial pieces on `edition.rodmachen.com`. The goal was a clean, minimalist reading experience tailored specifically for code snippets and technical deep-dives.

### Why Astro?

Astro's islands architecture is brilliant for a mostly static site like a blog. We get the performance of static HTML while still being able to drop in interactive components where necessary.

```typescript
// Example of some TypeScript code
interface Post {
  title: string;
  slug: string;
  date: Date;
  tags: string[];
}

function getPostUrl(post: Post): string {
  return `/${post.slug}/`;
}
```

## Styling and Layout

The design leans heavily on native system fonts and CSS variables for a seamless dark mode transition. Monospace accents are used for metadata and tags to give it a distinct "developer" feel.

- High contrast text
- Syntax highlighted code blocks via Shiki
- Minimalist navigation

> "Good design is as little design as possible." - Dieter Rams

I'll be migrating content over soon. Stay tuned.
