'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';

type Slide = {
  image: string;
  eyebrow: string;
  heading: [string, string];
  ctaLabel: string;
  ctaHref: string;
};

const SLIDES: Slide[] = [
  {
    image: '/images/campaign-navy.jpg',
    eyebrow: 'Fine Diamond Jewellery',
    heading: ['Radiance,', 'Redefined.'],
    ctaLabel: 'Explore Earrings',
    ctaHref: '/shop?category=earrings',
  },
  {
    image: '/images/campaign-gold.jpg',
    eyebrow: 'Crafted in 18K Gold',
    heading: ['Details That', 'Endure.'],
    ctaLabel: 'Explore Rings',
    ctaHref: '/shop?category=rings',
  },
];

function useCarousel(count: number, intervalMs = 5000) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (count <= 1) return;
    const id = setInterval(() => {
      setIndex((i) => (i + 1) % count);
    }, intervalMs);
    return () => clearInterval(id);
  }, [count, intervalMs]);

  return [index, setIndex] as const;
}

// This is now the very first section on the homepage, so it's the one the
// transparent-over-hero header floats above (see components/header-chrome.tsx).
export default function CampaignHero() {
  const [index, setIndex] = useCarousel(SLIDES.length);

  return (
    <section className="relative h-[86vh] min-h-[560px] w-full overflow-hidden bg-ink">
      {SLIDES.map((slide, i) => (
        <div
          key={slide.image}
          className="absolute inset-0 transition-opacity duration-1000"
          style={{ opacity: i === index ? 1 : 0 }}
        >
          <Image
            src={slide.image}
            alt="Norvik Jewels fine jewellery"
            fill
            priority={i === 0}
            // These are wide landscape studio shots with the model on the
            // right side of the frame. Plain object-cover centers the crop,
            // which on a narrow/tall mobile screen crops the model almost
            // entirely out and leaves just the empty backdrop. Biasing the
            // crop toward the right (and slightly above center vertically)
            // keeps her face and the jewellery in frame on phones/tablets;
            // it's a no-op on wide desktop screens since nothing gets
            // cropped horizontally there.
            className="object-cover object-[78%_25%]"
            sizes="100vw"
          />
        </div>
      ))}

      <div className="absolute inset-0 bg-gradient-to-t from-ink/80 via-ink/15 to-ink/5" />
      {/* Constant top scrim so the transparent header's ivory logo/nav stays
          readable regardless of how bright either slide's own background is. */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-ink/50 to-transparent" />

      {/* Scroll cue — nudges visitors down past this hero to the shop grid below. */}
      <button
        type="button"
        onClick={() => {
          document.getElementById('shop-collection')?.scrollIntoView({ behavior: 'smooth' });
        }}
        aria-label="Scroll to shop collection"
        className="absolute bottom-8 right-6 hidden flex-col items-center gap-2 text-ivory/80 transition-colors hover:text-ivory sm:right-16 sm:flex lg:right-24"
      >
        <span className="text-[10px] font-medium uppercase leading-[1.2] tracking-[0.14em]">
          Scroll to Explore
        </span>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="animate-bounce">
          <path d="M12 4v14" />
          <path d="M6 13l6 6 6-6" />
        </svg>
      </button>

      <div className="absolute inset-0 flex flex-col items-start justify-end px-6 pb-24 text-left sm:px-16 lg:px-24">
        <div className="relative flex min-h-[260px] w-full max-w-2xl flex-col items-start justify-end">
          {SLIDES.map((slide, i) => (
            <div
              key={slide.image}
              className="absolute inset-0 flex flex-col items-start justify-end transition-opacity duration-1000"
              style={{ opacity: i === index ? 1 : 0 }}
            >
              <p className="mb-4 text-[10px] font-medium uppercase leading-[1.2] tracking-[0.14em] text-antiquegold sm:text-[11px]">
                {slide.eyebrow}
              </p>
              <h1 className="font-display max-w-2xl text-[44px] font-medium leading-[0.98] tracking-[-0.02em] text-ivory sm:text-[clamp(64px,5vw,72px)] sm:leading-[0.95]">
                {slide.heading[0]}
                <br />
                {slide.heading[1]}
              </h1>
              <Link
                href={slide.ctaHref}
                className="mt-8 inline-block bg-ivory px-8 py-3.5 text-[11px] font-medium uppercase leading-[1.2] tracking-[0.08em] text-ink transition-opacity hover:opacity-90 sm:text-[12px]"
              >
                {slide.ctaLabel}
              </Link>
            </div>
          ))}
        </div>

        {/* Dots */}
        <div className="mt-8 flex gap-2">
          {SLIDES.map((_, i) => (
            <button
              key={i}
              onClick={() => setIndex(i)}
              aria-label={`Go to slide ${i + 1}`}
              className={`h-1.5 rounded-full transition-all ${
                i === index ? 'w-6 bg-[#D9BE93]' : 'w-1.5 bg-ivory/40'
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
