/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
      },
    ],
  },
  // `next dev`'s webpack persistent disk cache (.next/cache/webpack) gzip's
  // its cache packs on every rebuild. On machines with limited free memory
  // (seen on Windows here) that gzip step can throw "Failed to allocate
  // memory" / "DataCloneError: out of memory" after the cache has grown
  // across a long dev session with many hot reloads. Switching dev to the
  // in-memory cache avoids that crash entirely — it costs a slightly slower
  // cold start after each `npm run dev`, but nothing else changes; the
  // production build (`next build`) still uses the normal filesystem cache.
  webpack: (config, { dev }) => {
    if (dev) {
      config.cache = { type: 'memory' };
    }
    return config;
  },
};

export default nextConfig;
