---
layout: ../layouts/PostLayout.astro  
title: Code Template  
subTitle: A template for future code posts.  
date: 2026-04-09T00:00:00.000Z  
tags:  
  - template
  - astro
accentColor: "#4a9eff"
---

Opening paragraph. Set the context — what problem are you solving or what are you exploring?

## Main Section

Body content goes here.

### Subsection

More detail. Code blocks are supported and syntax-highlighted:

```typescript
// Your code here
const example = "value";

Another Section

- Bullet point one
- Bullet point two

▎ Blockquote for emphasis or attribution. — Source

Conclusion

Wrap up the main takeaway.

**Frontmatter fields:**

| Field | Required | Notes |
|---|---|---|
| `layout` | yes | Always `../layouts/PostLayout.astro` |
| `title` | yes | Displayed as `<h1>` in accent color |
| `date` | yes | ISO 8601 format with time (`T00:00:00.000Z`) |
| `subTitle` | no | Shown below title, also used as meta description |
| `tags` | no | Array of lowercase strings |
| `accentColor` | no | CSS color for the title; defaults to `var(--accent)` |

The `accentColor` field is the one place you can vary per-post. Everything else is driven by the layout.
```
