'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import type { Product } from '@/lib/mock-products';

// Was an always-visible, full-width grid below the whole two-column product
// layout — client asked for two changes together (28-29 Sep 2026): (1) a
// "Show More" button instead of always showing the grid, and (2) move the
// whole thing up into the empty white space that was sitting unused next to
// the details column — ProductConfigurator's own grid has Image+Specs in
// column 1 across both its rows, but column 2 only ever had the
// configurator content in row 1; row 2 of column 2 was dead space below
// "Add to Bag". Now rendered INSIDE that grid at lg:col-start-2
// lg:row-start-2 (see product-configurator.tsx) — same row as
// Specifications, same left border-t treatment, so the two columns read as
// a matched pair on desktop instead of a separate section far down the
// page. On mobile the grid collapses to one column, so this still stacks in
// normal document order right after Specifications — NOT hidden there.
// Sized as 2 columns throughout (was 4 on the largest breakpoint) since it
// now lives in a half-width column on desktop, not the full page width the
// old full-page section used.
export default function RelatedProducts({ related }: { related: Product[] }) {
  const [open, setOpen] = useState(false);

  if (related.length === 0) return null;

  return (
    <div className="mt-10 border-t border-line pt-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h2 className="font-display text-[18px] font-medium leading-[1.15] tracking-[-0.01em] text-ink sm:text-[20px]">
          You May Also Like
        </h2>
        {!open && (
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="shrink-0 border border-ink px-4 py-2 text-[11px] font-medium uppercase leading-[1.2] tracking-[0.08em] text-ink transition-colors hover:bg-ink hover:text-white"
          >
            Show More
          </button>
        )}
      </div>

      {open && (
        <div className="mt-5 grid grid-cols-2 gap-x-4 gap-y-6">
          {related.map((p) => (
            <Link
              href={`/product/${p.slug}`}
              key={p.slug}
              className="group relative block aspect-square overflow-hidden bg-white p-2"
            >
              <div className="relative h-[calc(100%-56px)] overflow-hidden">
                <Image
                  src={p.images[0]}
                  alt={p.name}
                  fill
                  className="object-contain transition-transform duration-500 group-hover:scale-105"
                  sizes="(min-width: 1024px) 22vw, 50vw"
                />
              </div>
              <div className="flex h-14 flex-col items-center justify-center overflow-hidden px-1 text-center">
                <p className="line-clamp-2 w-full text-[12px] font-medium leading-[1.3] text-ink">{p.name}</p>
                <p className="mt-1 text-[12px] leading-[1.3] text-muted">
                  {p.currency}{p.basePrice.toLocaleString('en-IN')}
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
