"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";

const WEB_SLIDES = [
  "/images/hero-web-1.jpg",
  "/images/hero-web-2.jpg",
  "/images/hero-web-3.jpg",
  "/images/hero-web-4.jpg",
  "/images/hero-web-5.jpg",
];

const MOBILE_SLIDES = [
  "/images/hero-mobile-1.jpg",
  "/images/hero-mobile-2.jpg",
  "/images/hero-mobile-3.jpg",
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
        {WEB_SLIDES.map((src, i) => (
          <div
            key={src}
            className="absolute inset-0 transition-opacity duration-1000"
            style={{ opacity: i === webIndex ? 1 : 0 }}
          >
            <Image
              src={src}
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
        {MOBILE_SLIDES.map((src, i) => (
          <div
            key={src}
            className="absolute inset-0 transition-opacity duration-1000"
            style={{ opacity: i === mobileIndex ? 1 : 0 }}
          >
            <Image
              src={src}
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

      <div className="absolute inset-0 flex flex-col items-center justify-end px-6 pb-24 text-center">
        <p className="mb-4 text-xs font-medium uppercase tracking-[0.3em] text-[#D9BE93]">
          Timeless Scandinavian Luxury
        </p>
        <h1 className="font-display max-w-2xl text-4xl font-medium leading-tight text-ivory sm:text-5xl">
          Jewellery made to be worn,
          <br />
          not kept away.
        </h1>
        <Link
          href="/shop"
          className="mt-8 inline-block bg-ivory px-8 py-3.5 text-xs font-medium uppercase tracking-wide2 text-ink transition-opacity hover:opacity-90"
        >
          Explore the Collection
        </Link>

        {/* Dots — web */}
        <div className="mt-8 hidden gap-2 sm:flex">
          {WEB_SLIDES.map((_, i) => (
            <button
              key={i}
              onClick={() => setWebIndex(i)}
              aria-label={`Go to slide ${i + 1}`}
              className={`h-1.5 rounded-full transition-all ${
                i === webIndex ? "w-6 bg-[#D9BE93]" : "w-1.5 bg-ivory/40"
              }`}
            />
          ))}
        </div>

        {/* Dots — mobile */}
        <div className="mt-8 flex gap-2 sm:hidden">
          {MOBILE_SLIDES.map((_, i) => (
            <button
              key={i}
              onClick={() => setMobileIndex(i)}
              aria-label={`Go to slide ${i + 1}`}
              className={`h-1.5 rounded-full transition-all ${
                i === mobileIndex ? "w-6 bg-[#D9BE93]" : "w-1.5 bg-ivory/40"
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
