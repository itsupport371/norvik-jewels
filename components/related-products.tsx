'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import type { Product } from '@/lib/mock-products';

// Was an always-visible grid right under the product details — client asked
// for a "Show More" button instead, so the related grid only appears once
// someone actually wants to see it, keeping the product page shorter by
// default (28 Sep 2026). The "You May Also Like" heading stays visible so
// shoppers still know it's there; only the grid itself is gated behind the
// button. A small client component (not part of the product page's own
// server component) purely because it needs useState for the toggle.
export default function RelatedProducts({ related }: { related: Product[] }) {
  const [open, setOpen] = useState(false);

  if (related.length === 0) return null;

  return (
    <section className="mt-20 border-t border-line pt-12">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h2 className="font-display text-[26px] font-medium leading-[1.05] tracking-[-0.01em] text-ink sm:text-[36px]">
          You May Also Like
        </h2>
        {!open && (
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="shrink-0 border border-ink px-5 py-2.5 text-[11px] font-medium uppercase leading-[1.2] tracking-[0.08em] text-ink transition-colors hover:bg-ink hover:text-white sm:text-[12px]"
          >
            Show More
          </button>
        )}
      </div>

      {open && (
        <div className="mt-8 grid grid-cols-2 gap-x-5 gap-y-10 sm:grid-cols-4">
          {related.map((p) => (
            <Link
              href={`/product/${p.slug}`}
              key={p.slug}
              className="group relative block aspect-square overflow-hidden bg-white p-2 sm:p-3"
            >
              <div className="relative h-[calc(100%-64px)] overflow-hidden sm:h-[calc(100%-76px)]">
                <Image
                  src={p.images[0]}
                  alt={p.name}
                  fill
                  className="object-contain transition-transform duration-500 group-hover:scale-105"
                  sizes="(min-width: 1024px) 25vw, 50vw"
                />
              </div>
              <div className="flex h-16 flex-col items-center justify-center overflow-hidden px-1 text-center sm:h-[76px]">
                <p className="line-clamp-2 w-full text-[13px] font-medium leading-[1.35] text-ink sm:text-[14px]">{p.name}</p>
                <p className="mt-1 text-[13px] leading-[1.35] text-muted">
                  {p.currency}{p.basePrice.toLocaleString('en-IN')}
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}
