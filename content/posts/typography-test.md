---
title: Typography Test
date: 2026-04-09
tags: [meta]
slug: typography-test
---

This is a longer paragraph to test how the line height and font size look when there is a significant amount of text on the screen. It should wrap nicely and maintain a comfortable reading measure. We want to ensure that the user experience is pleasant and that the text is not too strained. Typography is a critical aspect of design and we must get it right.

# Heading 1
## Heading 2
### Heading 3
#### Heading 4

Here is an ordered list:
1. First item
2. Second item
3. Third item

Here is an unordered list:
- Item A
- Item B
- Item C

| Header 1 | Header 2 | Header 3 |
| -------- | -------- | -------- |
| Row 1    | Data     | More     |
| Row 2    | Data     | More     |
| Row 3    | Data     | More     |

```typescript
import { defineConfig, s } from 'velite';

export default defineConfig({
  root: 'content',
  collections: {
    posts: {
      name: 'Post',
      pattern: 'posts/**/*.md',
      schema: s.object({
        title: s.string(),
        date: s.isodate(),
      })
    }
  }
});
```
