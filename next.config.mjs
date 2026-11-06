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
    // 6 Nov 2026: product images across the site started showing broken on
    // the live domain — every `/_next/image` request was returning HTTP 402
    // (Payment Required). Confirmed this is NOT a code/data bug: the actual
    // source images on Supabase Storage load fine (200 OK) when fetched
    // directly. Vercel's Hobby plan has a monthly quota on its own Image
    // Optimization service (the thing that resizes/re-encodes images on the
    // fly via `/_next/image`); once that quota is used up it returns 402
    // instead of the image, for every remaining request until the next
    // billing cycle (or an upgrade to Pro). `unoptimized: true` turns off
    // that resizing step entirely — `next/image` then just serves the
    // original file directly, so pages keep working regardless of this
    // quota. Trade-off: no more automatic resize/avif-webp conversion, so
    // pages may be a bit heavier than before — acceptable vs. broken images
    // blocking real customers. Revisit (remove this line) if/when the
    // client upgrades the Vercel plan and wants optimization back.
    unoptimized: true,
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
