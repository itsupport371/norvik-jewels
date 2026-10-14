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
//
// 14 Oct 2026 ("teen hi product dikha line mein with good animation"):
// was a 2-column, up-to-4-card wrapping grid. Capped to exactly 3 — one
// row, never wraps — on every breakpoint (`.slice(0, 3)` here is the
// belt-and-suspenders; `getRelatedServer` in lib/products-server.ts was
// also changed to fetch only 3). Each card now fades/slides up on reveal,
// staggered left-to-right (`.animate-fade-up-in` + per-index delay, see
// app/globals.css), on top of the existing hover image zoom — plus a
// hover lift + shadow on the whole card and a gold underline sliding in
// under the name, so hovering reads as one deliberate motion instead of
// just the photo zooming.
export default function RelatedProducts({ related, open }: { related: Product[]; open: boolean }) {
  if (!open || related.length === 0) return null;
  const items = related.slice(0, 3);

  return (
    <div className="mt-10 border-t border-line pt-6">
      <h2 className="font-display text-[18px] font-medium leading-[1.15] tracking-[-0.01em] text-ink sm:text-[20px]">
        You May Also Like
      </h2>

      <div className="mt-5 grid grid-cols-3 gap-x-3 gap-y-6 sm:gap-x-4">
        {items.map((p, i) => (
          <div
            key={p.slug}
            className="animate-fade-up-in group relative transition-transform duration-300 hover:-translate-y-1"
            style={{ animationDelay: `${i * 100}ms` }}
          >
            <Link
              href={`/product/${p.slug}`}
              className="relative block aspect-square overflow-hidden bg-white p-2 shadow-[0_0_0_rgba(0,0,0,0)] transition-shadow duration-300 group-hover:shadow-lg"
            >
              <div className="relative h-[calc(100%-56px)] overflow-hidden">
                <Image
                  src={p.images[0]}
                  alt={p.name}
                  fill
                  className="object-contain transition-transform duration-500 group-hover:scale-110"
                  sizes="(min-width: 1024px) 15vw, 33vw"
                />
              </div>
              <div className="flex h-14 flex-col items-center justify-center overflow-hidden px-1 text-center">
                <p className="relative line-clamp-2 w-full text-[12px] font-medium leading-[1.3] text-ink">
                  {p.name}
                  <span className="absolute inset-x-1/4 bottom-0 h-px origin-center scale-x-0 bg-antiquegold transition-transform duration-300 group-hover:scale-x-100" />
                </p>
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
