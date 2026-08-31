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

const WEB_SLIDES: Slide[] = [
  {
    image: '/images/hero-web-1.jpg',
    eyebrow: 'Trillion-Cut Brilliance',
    heading: ['Earrings,', 'Reimagined.'],
    ctaLabel: 'Explore Earrings',
    ctaHref: '/shop?category=earrings',
  },
  {
    image: '/images/hero-web-2.jpg',
    eyebrow: 'Everyday Signature',
    heading: ['Mangalsutras,', 'Made Modern.'],
    ctaLabel: 'Explore Necklaces',
    ctaHref: '/shop?category=necklaces',
  },
  {
    image: '/images/hero-web-3.jpg',
    eyebrow: 'Timeless Scandinavian Luxury',
    heading: ['Jewellery made to be worn,', 'not kept away.'],
    ctaLabel: 'Explore the Collection',
    ctaHref: '/shop',
  },
  {
    image: '/images/hero-web-4.jpg',
    eyebrow: 'Crafted in 18K Gold',
    heading: ['Heirlooms,', 'Begin Today.'],
    ctaLabel: 'Explore Necklaces',
    ctaHref: '/shop?category=necklaces',
  },
  {
    image: '/images/hero-web-5.jpg',
    eyebrow: 'Designed in Dubai',
    heading: ['Necklaces,', 'Refined.'],
    ctaLabel: 'Explore Necklaces',
    ctaHref: '/shop?category=necklaces',
  },
];

const MOBILE_SLIDES: Slide[] = [
  {
    image: '/images/hero-mobile-1.jpg',
    eyebrow: 'Trillion-Cut Brilliance',
    heading: ['Earrings,', 'Reimagined.'],
    ctaLabel: 'Explore Earrings',
    ctaHref: '/shop?category=earrings',
  },
  {
    image: '/images/hero-mobile-2.jpg',
    eyebrow: 'Timeless Scandinavian Luxury',
    heading: ['Jewellery made to be worn,', 'not kept away.'],
    ctaLabel: 'Explore the Collection',
    ctaHref: '/shop',
  },
  {
    image: '/images/hero-mobile-3.jpg',
    eyebrow: 'Designed in Dubai',
    heading: ['Necklaces,', 'Refined.'],
    ctaLabel: 'Explore Necklaces',
    ctaHref: '/shop?category=necklaces',
  },
];

function useCarousel(count: number, intervalMs = 4500) {
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

export default function HeroCarousel() {
  const [webIndex, setWebIndex] = useCarousel(WEB_SLIDES.length);
  const [mobileIndex, setMobileIndex] = useCarousel(MOBILE_SLIDES.length);

  return (
    <section className="relative h-[86vh] min-h-[560px] w-full overflow-hidden bg-ink">
      {/* Web slides */}
      <div className="hidden h-full w-full sm:block">
        {WEB_SLIDES.map((slide, i) => (
          <div
            key={slide.image}
            className="absolute inset-0 transition-opacity duration-1000"
            style={{ opacity: i === webIndex ? 1 : 0 }}
          >
            <Image
              src={slide.image}
              alt="Norvik Jewels jewellery"
              fill
              priority={i === 0}
              className="object-cover opacity-90"
              sizes="100vw"
            />
          </div>
        ))}
      </div>

      {/* Mobile slides */}
      <div className="block h-full w-full sm:hidden">
        {MOBILE_SLIDES.map((slide, i) => (
          <div
            key={slide.image}
            className="absolute inset-0 transition-opacity duration-1000"
            style={{ opacity: i === mobileIndex ? 1 : 0 }}
          >
            <Image
              src={slide.image}
              alt="Norvik Jewels jewellery"
              fill
              priority={i === 0}
              className="object-cover opacity-90"
              sizes="100vw"
            />
          </div>
        ))}
      </div>

      <div className="absolute inset-0 bg-gradient-to-t from-ink/80 via-ink/20 to-ink/10" />
      {/* Extra darkening behind the mobile text block only — the photo's bright
          highlights (diamonds/metal) can sit right where the text lives on a
          portrait crop, so this guarantees contrast regardless of the slide. */}
      <div className="absolute inset-x-0 bottom-0 h-[60%] bg-gradient-to-t from-midnight/95 via-midnight/65 to-transparent sm:hidden" />

      {/* Text — web, one block per slide, cross-fades with the image */}
      <div className="absolute inset-0 hidden flex-col items-start justify-end px-6 pb-24 text-left sm:flex sm:px-16 lg:px-24">
        <div className="relative flex min-h-[260px] w-full max-w-2xl flex-col items-start justify-end">
          {WEB_SLIDES.map((slide, i) => (
            <div
              key={slide.image}
              className="absolute inset-0 flex flex-col items-start justify-end transition-opacity duration-1000"
              style={{ opacity: i === webIndex ? 1 : 0 }}
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

        {/* Dots — web */}
        <div className="mt-8 flex gap-2">
          {WEB_SLIDES.map((_, i) => (
            <button
              key={i}
              onClick={() => setWebIndex(i)}
              aria-label={`Go to slide ${i + 1}`}
              className={`h-1.5 rounded-full transition-all ${
                i === webIndex ? 'w-6 bg-[#D9BE93]' : 'w-1.5 bg-ivory/40'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Text — mobile, one block per slide, cross-fades with the image */}
      <div className="absolute inset-0 flex flex-col items-center justify-end px-6 pb-24 text-center sm:hidden">
        <div className="relative flex min-h-[220px] w-full flex-col items-center justify-end">
          {MOBILE_SLIDES.map((slide, i) => (
            <div
              key={slide.image}
              className="absolute inset-0 flex flex-col items-center justify-end transition-opacity duration-1000"
              style={{ opacity: i === mobileIndex ? 1 : 0 }}
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

        {/* Dots — mobile */}
        <div className="mt-8 flex gap-2">
          {MOBILE_SLIDES.map((_, i) => (
            <button
              key={i}
              onClick={() => setMobileIndex(i)}
              aria-label={`Go to slide ${i + 1}`}
              className={`h-1.5 rounded-full transition-all ${
                i === mobileIndex ? 'w-6 bg-[#D9BE93]' : 'w-1.5 bg-ivory/40'
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}