import { defineConfig, s } from 'velite';

export default defineConfig({
  root: 'content',
  output: {
    data: '.velite',
    assets: 'public/static',
    base: '/static/',
    name: '[name]-[hash:8].[ext]',
    clean: true,
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
