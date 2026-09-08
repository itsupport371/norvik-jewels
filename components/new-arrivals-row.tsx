'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { getDisplayPrice, type Product } from '@/lib/mock-products';
import { useLocale } from '@/lib/locale-context';

// Triangle "play button" style arrow — client asked for something more
// luxurious than the bare browser scrollbar: golden triangle arrows on a
// dark-navy glowing button, sitting half on/half off the row's edge.
function Arrow({ direction }: { direction: 'left' | 'right' }) {
  const points = direction === 'left' ? '17,3 17,21 4,12' : '7,3 7,21 20,12';
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <polygon points={points} />
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
      {/* Left/right nav — glowing gold-on-navy triangle buttons instead of the
          plain browser scrollbar. Fade out (and stop taking clicks) once
          there's nothing further to scroll to on that side. */}
      <button
        type="button"
        onClick={() => scroll('left')}
        aria-label="Scroll to previous products"
        className={`scroll-arrow-glow absolute left-0 top-1/2 z-10 flex h-10 w-10 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-antiquegold bg-inknavy text-antiquegold transition-all duration-300 hover:scale-110 hover:bg-black sm:h-12 sm:w-12 ${
          canScrollLeft ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
      >
        <Arrow direction="left" />
      </button>
      <button
        type="button"
        onClick={() => scroll('right')}
        aria-label="Scroll to more products"
        className={`scroll-arrow-glow absolute right-0 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 translate-x-1/2 items-center justify-center rounded-full border border-antiquegold bg-inknavy text-antiquegold transition-all duration-300 hover:scale-110 hover:bg-black sm:h-12 sm:w-12 ${
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
          <Link
            href={`/product/${product.slug}`}
            key={product.slug}
            className="group relative block aspect-square w-[42%] shrink-0 overflow-hidden bg-white p-3 sm:w-[30%] lg:w-[23%]"
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
        ))}
      </div>
    </div>
  );
}
