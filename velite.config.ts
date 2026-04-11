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
    // `unified` is installed twice in node_modules (direct dep of
    // @shikijs/rehype, transitive of velite via @mdx-js/mdx). Their
    // Plugin<...> types come from different resolved paths and TS treats
    // them as structurally distinct even at the same version. Runtime
    // behavior is correct; the cast below silences the spurious mismatch.
    rehypePlugins: [
      [
        rehypeShiki as any,
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
