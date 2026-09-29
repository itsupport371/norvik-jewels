'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { getDisplayPrice, type Product } from '@/lib/mock-products';
import { useLocale } from '@/lib/locale-context';
import WishlistQuickButton from '@/components/wishlist-quick-button';

// Was a filled gold triangle "play button" on a glowing dark-navy circle —
// client pointed out it read as an odd video-player icon rather than a
// scroll arrow, and asked this be restyled to match the thin-bordered
// antiquegold arrows now used for photo navigation on the product page
// (28 Sep 2026). Same chevron glyph, same square-with-thin-border treatment.
function Arrow({ direction }: { direction: 'left' | 'right' }) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d={direction === 'left' ? 'M15 18l-6-6 6-6' : 'M9 6l6 6-6 6'} />
    </svg>
  );
}

export default function NewArrivalsRow({ products }: { products: Product[] }) {
  const { formatPrice } = useLocale();
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  function updateArrows() {
    const el = scrollerRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 4);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 4);
  }

  useEffect(() => {
    updateArrows();
    const el = scrollerRef.current;
    if (!el) return;
    el.addEventListener('scroll', updateArrows, { passive: true });
    window.addEventListener('resize', updateArrows);
    return () => {
      el.removeEventListener('scroll', updateArrows);
      window.removeEventListener('resize', updateArrows);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [products.length]);

  function scroll(direction: 'left' | 'right') {
    const el = scrollerRef.current;
    if (!el) return;
    const amount = el.clientWidth * 0.8 * (direction === 'left' ? -1 : 1);
    el.scrollBy({ left: amount, behavior: 'smooth' });
  }

  return (
    <div className="relative">
      {/* Left/right nav — thin-bordered antiquegold squares, same look as the
          product page's photo-nav arrows, instead of the old glowing
          gold-on-navy "play button" circles. Fade out (and stop taking
          clicks) once there's nothing further to scroll to on that side. */}
      <button
        type="button"
        onClick={() => scroll('left')}
        aria-label="Scroll to previous products"
        className={`absolute left-2 top-1/2 z-10 flex h-9 w-9 -translate-y-1/2 items-center justify-center border border-warmstone bg-softwhite text-antiquegold transition-all duration-300 hover:border-antiquegold hover:bg-antiquegold hover:text-white sm:h-10 sm:w-10 ${
          canScrollLeft ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
      >
        <Arrow direction="left" />
      </button>
      <button
        type="button"
        onClick={() => scroll('right')}
        aria-label="Scroll to more products"
        className={`absolute right-2 top-1/2 z-10 flex h-9 w-9 -translate-y-1/2 items-center justify-center border border-warmstone bg-softwhite text-antiquegold transition-all duration-300 hover:border-antiquegold hover:bg-antiquegold hover:text-white sm:h-10 sm:w-10 ${
          canScrollRight ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
      >
        <Arrow direction="right" />
      </button>

      {/* Single scrollable row (not a wrapping grid) — client wanted the
          products to stay side-by-side, not stack into more rows. Native
          scrollbar hidden (no-scrollbar, in globals.css) since the arrow
          buttons above are the intended way to navigate. */}
      <div ref={scrollerRef} className="no-scrollbar flex gap-4 overflow-x-auto scroll-smooth pb-2 sm:gap-5">
        {products.map((product) => (
          <div
            key={product.slug}
            className="group relative w-[42%] shrink-0 sm:w-[30%] lg:w-[23%]"
          >
            <Link
              href={`/product/${product.slug}`}
              className="relative block aspect-square overflow-hidden bg-white p-3"
            >
              <div className="relative h-[calc(100%-88px)] overflow-hidden sm:h-[calc(100%-104px)]">
                <Image
                  src={product.images[0]}
                  alt={product.name}
                  fill
                  className="object-contain transition-transform duration-500 group-hover:scale-105"
                  sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
                />
              </div>
              <div className="flex h-[88px] flex-col items-center justify-center overflow-hidden px-1 text-center sm:h-[104px]">
                <p className="text-[10px] font-medium uppercase leading-[1.2] tracking-[0.14em] text-antiquegold sm:text-[11px]">
                  {product.category}
                </p>
                <p className="mt-1 line-clamp-2 w-full text-[13px] font-medium leading-[1.35] text-inknavy sm:text-[14px]">
                  {product.name}
                </p>
                <p className="mt-1 text-[13px] leading-[1.35] text-inknavy/60">
                  {formatPrice(getDisplayPrice(product))}
                </p>
              </div>
            </Link>
            <WishlistQuickButton slug={product.slug} />
          </div>
        ))}
      </div>
    </div>
  );
}
