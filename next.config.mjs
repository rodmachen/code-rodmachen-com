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

export default nextConfig;
