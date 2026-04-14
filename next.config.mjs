/** @type {import('next').NextConfig} */
const nextConfig = {
  turbopack: {},
};

let dev = process.env.NODE_ENV === 'development';
if (!globalThis.__VELITE_STARTED) {
  globalThis.__VELITE_STARTED = true;
  const { build } = await import('velite');
  await build({ watch: dev, clean: !dev });
}

import bundleAnalyzer from '@next/bundle-analyzer';

const withAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
});

export default withAnalyzer(nextConfig);
