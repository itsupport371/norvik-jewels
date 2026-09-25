'use client';

import { useEffect, useRef, useState } from 'react';
import { useLocale } from '@/lib/locale-context';

const GLOBE = (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="shrink-0">
    <circle cx="12" cy="12" r="9" />
    <path d="M3 12h18" />
    <path d="M12 3a14 14 0 0 1 0 18a14 14 0 0 1 0-18z" />
  </svg>
);

const CHEVRON = (
  <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="ml-1 inline-block shrink-0">
    <path d="M6 9l6 6 6-6" />
  </svg>
);

/**
 * Language + currency picker. Language switching is powered by the hidden
 * Google Translate widget mounted in app/layout.tsx (see lib/locale-context)
 * — this component is just the styled trigger + panel, no translation logic
 * of its own. Currency switching only changes how prices are *displayed*
 * (see lib/currency.ts) — the underlying INR price never changes.
 *
 * Two layouts: `bar` is the compact "EN · ₹ INR" trigger — used in the
 * desktop utility bar (≥1024px) AND, since 25 Sep 2026, in the main header's
 * icon row below that (see header-chrome.tsx) so phone/tablet visitors see
 * it directly in the header instead of only inside the hamburger drawer.
 * Below the `sm` breakpoint the "EN · ₹ INR" text is hidden and only the
 * globe icon shows (still opens the same panel on tap) — there isn't room
 * next to the search/account/wishlist/cart icons for the full label on a
 * phone-width screen. `mobile` is an always-expanded chip list — it's no
 * longer used in the hamburger drawer (the `bar` trigger in the header
 * covers every screen size now, so keeping it in the drawer too was just a
 * second, redundant place to find the same setting), but the variant is
 * left in place in case a future layout wants an inline expanded list again.
 */
export default function LocaleSwitcher({ variant = 'bar' }: { variant?: 'bar' | 'mobile' }) {
  const { currency, setCurrency, language, setLanguage, currencies, languages } = useLocale();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onClickOutside(e: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, [open]);

  const currentLanguage = languages.find((l) => l.code === language) ?? languages[0];
  const currentCurrency = currencies.find((c) => c.code === currency) ?? currencies[0];

  if (variant === 'mobile') {
    return (
      <div className="py-3.5">
        <p className="mb-2.5 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.06em] text-inknavy/50">
          {GLOBE} Language &amp; Currency
        </p>
        <div className="flex flex-wrap gap-1.5">
          {languages.map((l) => (
            <button
              key={l.code}
              type="button"
              onClick={() => setLanguage(l.code)}
              className={`border px-2.5 py-1 text-[11.5px] normal-case tracking-normal transition-colors ${
                language === l.code
                  ? 'border-antiquegold bg-antiquegold/10 text-antiquegold'
                  : 'border-warmstone text-inknavy/70'
              }`}
            >
              {l.label}
            </button>
          ))}
        </div>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {currencies.map((c) => (
            <button
              key={c.code}
              type="button"
              onClick={() => setCurrency(c.code)}
              className={`border px-2.5 py-1 text-[11.5px] normal-case tracking-normal transition-colors ${
                currency === c.code
                  ? 'border-antiquegold bg-antiquegold/10 text-antiquegold'
                  : 'border-warmstone text-inknavy/70'
              }`}
            >
              {c.symbol} {c.code}
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="relative" ref={rootRef}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label="Language and currency"
        className="flex items-center gap-1.5 transition-colors hover:text-antiquegold"
      >
        {GLOBE}
        <span className="hidden sm:inline">
          {currentLanguage.code.toUpperCase()} · {currentCurrency.symbol} {currentCurrency.code}
        </span>
        {CHEVRON}
      </button>

      {open && (
        <div className="absolute right-0 top-full z-50 mt-3 w-64 max-w-[calc(100vw-2rem)] border border-warmstone bg-white p-4 normal-case tracking-normal text-inknavy shadow-lg">
          <div>
            <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.08em] text-muted">Language</p>
            <div className="flex flex-wrap gap-1.5">
              {languages.map((l) => (
                <button
                  key={l.code}
                  type="button"
                  onClick={() => {
                    setLanguage(l.code);
                    setOpen(false);
                  }}
                  className={`border px-2.5 py-1 text-[11.5px] transition-colors ${
                    language === l.code
                      ? 'border-antiquegold bg-antiquegold/10 text-antiquegold'
                      : 'border-warmstone/70 text-inknavy/70 hover:border-inknavy/40'
                  }`}
                >
                  {l.label}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-4">
            <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.08em] text-muted">Currency</p>
            <div className="flex flex-col">
              {currencies.map((c) => (
                <button
                  key={c.code}
                  type="button"
                  onClick={() => {
                    setCurrency(c.code);
                    setOpen(false);
                  }}
                  className={`flex items-center justify-between px-2 py-1.5 text-left text-[12.5px] transition-colors ${
                    currency === c.code ? 'bg-antiquegold/10 text-antiquegold' : 'hover:bg-softwhite'
                  }`}
                >
                  <span>
                    {c.symbol} {c.code}
                  </span>
                  <span className="text-[11px] text-muted">{c.label}</span>
                </button>
              ))}
            </div>
          </div>

          <p className="mt-3 border-t border-warmstone/60 pt-2.5 text-[10px] leading-[1.4] text-muted">
            Prices are shown as an approximate conversion. You&rsquo;ll always be charged in INR.
          </p>
        </div>
      )}
    </div>
  );
}
