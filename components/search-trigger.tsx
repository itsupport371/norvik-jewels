'use client';

import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { products } from '@/lib/mock-products';

export default function SearchTrigger({ light = false }: { light?: boolean }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const router = useRouter();

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
    <>
      <button
        onClick={() => setOpen(true)}
        aria-label="Search"
        className={
          light
            ? 'text-ivory transition-colors hover:text-antiquegold'
            : 'text-charcoal transition-colors hover:text-[#B8935A]'
        }
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
          <circle cx="11" cy="11" r="7" />
          <path d="M21 21l-4.3-4.3" />
        </svg>
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center bg-ink/50 px-4 pt-24"
          onClick={close}
        >
          <div className="w-full max-w-xl bg-ivory p-4" onClick={(e) => e.stopPropagation()}>
            <form onSubmit={handleSubmit} className="flex items-center gap-3 border-b border-line pb-3">
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.6"
                className="shrink-0 text-charcoal"
              >
                <circle cx="11" cy="11" r="7" />
                <path d="M21 21l-4.3-4.3" />
              </svg>
              <input
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search for rings, earrings, necklaces…"
                className="flex-1 text-[14px] leading-[1.6] text-ink outline-none placeholder:text-muted"
              />
              <button type="button" onClick={close} aria-label="Close search" className="text-charcoal hover:text-ink">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </form>

            {results.length > 0 && (
              <div className="mt-3 space-y-1">
                {results.map((p) => (
                  <Link
                    key={p.slug}
                    href={`/product/${p.slug}`}
                    onClick={close}
                    className="flex items-center gap-3 p-2 transition-colors hover:bg-[#F7F5F2]"
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
              <p className="mt-3 text-[14px] leading-[1.6] text-muted">No results for &ldquo;{query}&rdquo;</p>
            )}
          </div>
        </div>
      )}
    </>
  );
}
