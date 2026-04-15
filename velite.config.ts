import { defineConfig, s } from 'velite';
import rehypeShiki from '@shikijs/rehype';
import { transformerNotationDiff } from '@shikijs/transformers';

export default defineConfig({
  root: 'content',
  output: {
    data: '.velite',
    assets: 'public/static',
    base: '/static/',
    name: '[name]-[hash:8].[ext]',
    clean: true,
  },
  markdown: {
    rehypePlugins: [
      [
        // @ts-expect-error -- velite bundles unified types inline in its .d.ts,
        // renaming Settings→Settings$2. @shikijs/rehype imports Plugin<...> from
        // the unified package directly, so TypeScript sees structurally distinct
        // Processor types in the 'this' context. Both resolve to unified@11.0.5
        // at runtime; only TS sees a mismatch. @ts-expect-error (not @ts-ignore)
        // so this line becomes an error if velite ever fixes its type bundling.
        rehypeShiki,
        {
          theme: 'github-light',
          transformers: [transformerNotationDiff()],
        },
      ],
    ],
  },
  collections: {
    posts: {
      name: 'Post',
      pattern: 'posts/**/*.md',
      schema: s
        .object({
          title: s.string(),
          subTitle: s.string().optional(),
          date: s.isodate(),
          tags: s.array(s.string()).default([]),
          slug: s.slug('posts'),
          body: s.markdown(),
        })
        .transform((data) => ({ ...data, permalink: `/posts/${data.slug}` })),
    },
  },
});
