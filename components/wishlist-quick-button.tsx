'use client';

import { useWishlist } from '@/lib/wishlist-context';

// Small heart-toggle overlay for a product tile — client asked so shoppers
// can add/remove a wishlist item straight from any product grid (shop, new
// arrivals, search results, related products) without opening the product
// page first (29 Sep 2026). Same look the Wishlist page's own remove button
// already used (bg-ivory/90 square, filled antiquegold heart when active) —
// just pulled out here so every grid shares one implementation instead of
// four copies of the same button.
// Always render this as a SIBLING of the tile's <Link> (both inside a
// shared `relative` wrapper), not nested inside it — a <button> inside an
// <a> is invalid HTML and some browsers/screen readers handle it
// inconsistently. e.preventDefault()/stopPropagation() below still guards
// against the click bubbling into anything else in that wrapper.
export default function WishlistQuickButton({ slug }: { slug: string }) {
  const { isWishlisted, toggleWishlist } = useWishlist();
  const active = isWishlisted(slug);

  return (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        toggleWishlist(slug);
      }}
      aria-label={active ? 'Remove from wishlist' : 'Add to wishlist'}
      aria-pressed={active}
      className="absolute right-2 top-2 z-10 flex h-8 w-8 items-center justify-center bg-ivory/90 text-ink shadow transition-opacity hover:opacity-75"
    >
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill={active ? '#B8935A' : 'none'}
        stroke={active ? '#B8935A' : 'currentColor'}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
      </svg>
    </button>
  );
}
