// @ts-check
import { defineConfig } from 'astro/config';

import vercel from '@astrojs/vercel';

// https://astro.build/config
export default defineConfig({
  site: 'https://code.rodmachen.com',
  output: 'static',
  trailingSlash: 'always',
  adapter: vercel()
});