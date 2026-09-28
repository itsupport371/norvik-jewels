'use client';

import { useEffect, useRef, useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import type { Product } from '@/lib/mock-products';

// Was a full-screen `fixed inset-0` dark overlay with a plain, border-less
// input floating near the top of the page — client called it out as looking
// cheap ("bakwas") and, separately, didn't want it dimming/blocking the rest
// of the page underneath (28 Sep 2026). Rebuilt as an anchored dropdown
// panel instead — same pattern as LocaleSwitcher's own panel (relative
// wrapper, absolute panel, click-outside-to-close) — so it opens right under
// the search icon like the site's other menus, never covers anything else,
// and the input itself now looks like a real search box (bordered, focus
// ring in the site's antiquegold accent) instead of a bare underline.
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

  return (
    <div className="relative" ref={rootRef}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label="Search"
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

      {open && (
        <div className="absolute right-0 top-full z-50 mt-3 w-80 max-w-[calc(100vw-2rem)] border border-warmstone bg-white p-4 normal-case tracking-normal text-inknavy shadow-lg">
          <form
            onSubmit={handleSubmit}
            className="flex items-center gap-2 border border-line px-3 py-2 transition-colors focus-within:border-antiquegold"
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
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search for rings, earrings, necklaces…"
              className="flex-1 text-[13.5px] leading-[1.6] text-ink outline-none placeholder:text-muted"
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

          {results.length > 0 && (
            <div className="mt-3 max-h-80 space-y-1 overflow-y-auto">
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
                    <p className="truncate text-[13px] font-medium leading-[1.35] text-ink sm:text-[14px]">{p.name}</p>
                    <p className="text-[13px] leading-[1.35] text-muted">{p.category}</p>
                  </div>
                </Link>
              ))}
            </div>
          )}

          {query.trim() && results.length === 0 && (
            <p className="mt-3 text-[13px] leading-[1.6] text-muted">No results for &ldquo;{query}&rdquo;</p>
          )}
        </div>
      )}
    </div>
  );
}
