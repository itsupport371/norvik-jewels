'use client';

import { useEffect, useRef, useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import type { Product } from '@/lib/mock-products';

// Was an anchored dropdown panel that popped open below the icon (28 Sep
// 2026 rebuild) — client called it out again as still looking like a "box"
// suddenly appearing (3 Oct 2026). Rebuilt once more: instead of a panel
// dropping down, the icon itself grows sideways into a bordered input bar.
// Mechanism: a fixed-width bar sits inside an `overflow-hidden` wrapper
// whose width animates 0 -> full; the wrapper's width only grows (never the
// bar inside it), so the bar looks like it's sliding out from behind the
// icon rather than a box popping into existence. The icon stays anchored at
// the same spot the whole time (it's in normal flow; only the bar is
// absolutely positioned to its left), so none of the other header icons
// shift when this opens.
//
// Trigger differs by input type since there's no such thing as "hover" on a
// phone: desktop opens it on mouse-enter/leave of the wrapping element (feels
// instant, no click needed — same pattern as the Shop nav dropdown already
// uses). Touch devices fall back to the existing tap-to-toggle + tap-outside-
// to-close behaves, same growth animation either way. Only an explicit click
// focuses the input (not a hover) — auto-focusing on hover would steal focus
// just from someone moving their mouse across the header.
export default function SearchTrigger({
  light = false,
  products,
}: {
  light?: boolean;
  products: Product[];
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const router = useRouter();
  const rootRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;
    function onClickOutside(e: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        close();
      }
    }
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, [open]);

  const results = query.trim()
    ? products
        .filter(
          (p) =>
            p.name.toLowerCase().includes(query.toLowerCase()) ||
            p.category.toLowerCase().includes(query.toLowerCase()) ||
            p.description.toLowerCase().includes(query.toLowerCase())
        )
        .slice(0, 5)
    : [];

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
      close();
    }
  }

  function close() {
    setOpen(false);
    setQuery('');
  }

  function toggleOpen() {
    if (open) {
      close();
      return;
    }
    setOpen(true);
    // Explicit click (mobile tap, or a desktop click instead of a hover) —
    // focus once the bar has had a moment to grow, so the caret doesn't
    // appear while the box is still mid-animation.
    window.setTimeout(() => inputRef.current?.focus(), 160);
  }

  const barWidth = 'w-[min(80vw,21rem)]';

  return (
    <div
      className="relative flex items-center"
      ref={rootRef}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      {/* Anchor for the growing bar + its results — sits to the left of the
          icon (right: 100% of this row) so it never pushes the icon or the
          account/wishlist/cart icons after it. */}
      <div className="absolute right-full top-1/2 z-50 mr-2 -translate-y-1/2">
        {/* The width-animated wrapper. overflow-hidden is what makes the
            fixed-width bar inside it look like it's sliding out instead of
            just appearing. */}
        <div
          className={`overflow-hidden transition-[width] duration-300 ease-out ${
            open ? barWidth : 'w-0'
          }`}
        >
          <form
            onSubmit={handleSubmit}
            className={`flex items-center gap-2 border border-line bg-white px-3 py-2 ${barWidth}`}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.6"
              className="shrink-0 text-muted"
            >
              <circle cx="11" cy="11" r="7" />
              <path d="M21 21l-4.3-4.3" />
            </svg>
            <input
              ref={inputRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search for rings, earrings, necklaces…"
              className="w-full min-w-0 flex-1 border-0 bg-transparent text-[13.5px] leading-[1.6] text-ink outline-none appearance-none placeholder:text-muted"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery('')}
                aria-label="Clear search"
                className="shrink-0 text-muted transition-colors hover:text-ink"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            )}
          </form>
        </div>

        {/* Results — a plain sibling of the overflow-hidden wrapper above
            (not nested inside it), so the suggestion list isn't clipped by
            the same box that clips the bar during its width animation. Only
            rendered once fully open, so it never flashes mid-slide. */}
        {open && query.trim() && (
          <div className={`mt-2 ${barWidth} border border-line bg-white shadow-lg`}>
            {results.length > 0 ? (
              <div className="max-h-80 space-y-1 overflow-y-auto p-2">
                {results.map((p) => (
                  <Link
                    key={p.slug}
                    href={`/product/${p.slug}`}
                    onClick={close}
                    className="flex items-center gap-3 p-2 transition-colors hover:bg-softwhite"
                  >
                    <div className="relative h-12 w-12 shrink-0 overflow-hidden bg-white">
                      <Image src={p.images[0]} alt={p.name} fill className="object-cover" sizes="48px" />
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-[13px] font-medium leading-[1.35] text-ink sm:text-[14px]">
                        {p.name}
                      </p>
                      <p className="text-[13px] leading-[1.35] text-muted">{p.category}</p>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="p-3 text-[13px] leading-[1.6] text-muted">No results for &ldquo;{query}&rdquo;</p>
            )}
          </div>
        )}
      </div>

      <button
        type="button"
        onClick={toggleOpen}
        aria-label="Search"
        aria-expanded={open}
        className={
          light
            ? 'text-ivory transition-colors hover:text-antiquegold'
            : 'text-charcoal transition-colors hover:text-antiquegold'
        }
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
          <circle cx="11" cy="11" r="7" />
          <path d="M21 21l-4.3-4.3" />
        </svg>
      </button>
    </div>
  );
}
