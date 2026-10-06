'use client';

import Image from 'next/image';
import Link from 'next/link';
import type { Product } from '@/lib/mock-products';
import WishlistQuickButton from '@/components/wishlist-quick-button';

// Was an always-visible, full-width grid below the whole two-column product
// layout — client asked for two changes together (28-29 Sep 2026): a "Show
// More" button instead of always showing the grid, and move the whole thing
// up into the empty white space that was sitting unused next to the details
// column — ProductConfigurator's own grid has Image+Specs in column 1
// across both its rows, but column 2 only ever had the configurator content
// in row 1; row 2 of column 2 was dead space below "Add to Bag". Rendered
// INSIDE that grid at lg:col-start-2 lg:row-start-2 (see
// product-configurator.tsx) — same row as Specifications, same left
// border-t treatment, so the two columns read as a matched pair on desktop
// instead of a separate section far down the page. On mobile the grid
// collapses to one column, so this still stacks in normal document order
// right after Specifications — NOT hidden there.
//
// 6 Oct 2026: the text "Show More" button (and the always-visible "You May
// Also Like" heading) are gone. The trigger is now a small icon button next
// to Wishlist/Share, on both web and mobile (see the grid-icon button in
// product-configurator.tsx) — so `open` is fully controlled by the parent
// now, nothing is rendered here at all (not even a heading) until that icon
// is tapped.
export default function RelatedProducts({ related, open }: { related: Product[]; open: boolean }) {
  if (!open || related.length === 0) return null;

  return (
    <div className="mt-10 border-t border-line pt-6">
      <h2 className="font-display text-[18px] font-medium leading-[1.15] tracking-[-0.01em] text-ink sm:text-[20px]">
        You May Also Like
      </h2>

      <div className="mt-5 grid grid-cols-2 gap-x-4 gap-y-6">
        {related.map((p) => (
          <div key={p.slug} className="group relative">
            <Link href={`/product/${p.slug}`} className="relative block aspect-square overflow-hidden bg-white p-2">
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
            <WishlistQuickButton slug={p.slug} />
          </div>
        ))}
      </div>
    </div>
  );
}
