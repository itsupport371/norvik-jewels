'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

// Admin panel shell — sidebar nav + topbar, wrapping every /admin page's
// content (10 Oct 2026, "client aisa kuch admin maang rahe" — shared a
// reference concept image with a persistent dark sidebar across Dashboard /
// Orders / Inventory / CMS / CRM / Analytics / Marketing / Settings /
// Reviews & Roles). Built as a component every page imports and wraps its
// own content in, NOT a Next.js app/admin/layout.tsx — a nested layout
// would also wrap app/admin/login (which has its own full-bleed hero
// background and no sidebar at all), and splitting login into a separate
// route group would mean moving every existing admin/products/** file to a
// new path, which isn't safe to do file-by-file over the device bridge
// (no `git mv`, just read+write). This gets the same visual result with no
// file moves.
//
// Colors deliberately use Norvik's own existing dark/gold pair (midnight +
// antiquegold — the same combo already used on the admin login hero and
// the themed scrollbar) rather than copying the reference image's maroon
// sidebar — the client said "aisa kuch" (something like this), i.e. match
// the structure, not necessarily the exact color, and midnight+antiquegold
// is already the site's own established "serious/internal" dark tone.
//
// Only Dashboard and Products are fully real right now. The rest of the
// nav (Inventory, Website Content, Marketing, Analytics, Reviews &
// Support, Settings) point at real-but-minimal pages — see each page's own
// file for what it actually shows and why (mostly: the data for it doesn't
// exist in the schema yet, e.g. there's no stock/quantity column anywhere
// on `products`, so "Inventory" can't show real numbers until that's
// designed). Orders and Customers ARE real — the `orders` table already
// has everything needed for a flat list/summary, no new schema required.
const NAV_ITEMS: { href: string; label: string; icon: JSX.Element }[] = [
  {
    href: '/admin',
    label: 'Dashboard',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <rect x="3" y="3" width="7" height="9" rx="1" />
        <rect x="14" y="3" width="7" height="5" rx="1" />
        <rect x="14" y="12" width="7" height="9" rx="1" />
        <rect x="3" y="16" width="7" height="5" rx="1" />
      </svg>
    ),
  },
  {
    href: '/admin/products',
    label: 'Products',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M21 8l-9-5-9 5 9 5 9-5z" />
        <path d="M3 8v8l9 5 9-5V8" />
        <path d="M12 13v8" />
      </svg>
    ),
  },
  {
    href: '/admin/orders',
    label: 'Orders',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M6 2l1.5 3h9L18 2" />
        <path d="M3.5 7h17l-1.6 12.2a2 2 0 0 1-2 1.8H7.1a2 2 0 0 1-2-1.8L3.5 7z" />
        <path d="M9 11v4M15 11v4" />
      </svg>
    ),
  },
  {
    href: '/admin/customers',
    label: 'Customers',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <circle cx="9" cy="8" r="3.2" />
        <path d="M2.5 20c0-3.6 2.9-6 6.5-6s6.5 2.4 6.5 6" />
        <circle cx="17.5" cy="8.5" r="2.6" />
        <path d="M15.8 14.2c2.8.4 4.7 2.5 4.7 5.8" />
      </svg>
    ),
  },
  {
    href: '/admin/inventory',
    label: 'Inventory',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <rect x="3" y="7" width="18" height="13" rx="1.5" />
        <path d="M3 11h18" />
        <path d="M8 7V4.5A1.5 1.5 0 0 1 9.5 3h5A1.5 1.5 0 0 1 16 4.5V7" />
      </svg>
    ),
  },
  {
    href: '/admin/content',
    label: 'Website Content',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <rect x="3" y="4" width="18" height="16" rx="1.5" />
        <path d="M3 9h18" />
        <path d="M7 13h10M7 16.5h6" />
      </svg>
    ),
  },
  {
    href: '/admin/marketing',
    label: 'Marketing',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M3 11v2a1 1 0 0 0 1 1h2l5 4V6L6 10H4a1 1 0 0 0-1 1z" />
        <path d="M15 8.5a4 4 0 0 1 0 7" />
        <path d="M18 5.5a8 8 0 0 1 0 13" />
      </svg>
    ),
  },
  {
    href: '/admin/analytics',
    label: 'Analytics',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M4 20V10M11 20V4M18 20v-7" />
        <path d="M3 20h18" />
      </svg>
    ),
  },
  {
    href: '/admin/reviews',
    label: 'Reviews & Support',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M12 17.3l-5.4 2.8 1-5.9L3 9.9l6-.9L12 3.5l3 5.5 6 .9-4.6 4.3 1 5.9z" />
      </svg>
    ),
  },
  {
    href: '/admin/settings',
    label: 'Settings',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 13.5a7.8 7.8 0 0 0 0-3l2-1.5-2-3.4-2.3.9a7.9 7.9 0 0 0-2.6-1.5L14 2.5h-4l-.5 2.5a7.9 7.9 0 0 0-2.6 1.5l-2.3-.9-2 3.4 2 1.5a7.8 7.8 0 0 0 0 3l-2 1.5 2 3.4 2.3-.9c.77.65 1.65 1.17 2.6 1.5L10 21.5h4l.5-2.5a7.9 7.9 0 0 0 2.6-1.5l2.3.9 2-3.4-2-1.5z" />
      </svg>
    ),
  },
];

export default function AdminShell({
  children,
  adminEmail,
}: {
  children: React.ReactNode;
  adminEmail?: string;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  async function handleSignOut() {
    setSigningOut(true);
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/admin/login');
    router.refresh();
  }

  function isActive(href: string) {
    return href === '/admin' ? pathname === '/admin' : pathname.startsWith(href);
  }

  const nav = (
    <>
      <div className="px-6 py-7">
        <Link href="/admin" className="block font-display text-[15px] uppercase tracking-[0.18em] text-white">
          Norvik
        </Link>
        <p className="mt-0.5 text-[10px] uppercase tracking-[0.2em] text-white/40">Jewels — Admin</p>
      </div>

      <nav className="flex-1 space-y-0.5 px-3">
        {NAV_ITEMS.map((item) => {
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileNavOpen(false)}
              className={
                'flex items-center gap-3 px-3 py-2.5 text-[13px] font-medium transition-colors ' +
                (active ? 'bg-antiquegold/15 text-antiquegold' : 'text-white/65 hover:bg-white/5 hover:text-white')
              }
            >
              <span className={active ? 'text-antiquegold' : 'text-white/40'}>{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="space-y-1 border-t border-white/10 px-3 py-4">
        <Link
          href="/"
          target="_blank"
          className="flex items-center gap-3 px-3 py-2.5 text-[13px] font-medium text-white/65 hover:bg-white/5 hover:text-white"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <path d="M14 4h6v6M20 4l-8 8M6 4H4v16h16v-2" />
          </svg>
          View Store
        </Link>
        <button
          onClick={handleSignOut}
          disabled={signingOut}
          className="flex w-full items-center gap-3 px-3 py-2.5 text-left text-[13px] font-medium text-white/65 hover:bg-white/5 hover:text-white disabled:opacity-50"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <path d="M16 17l5-5-5-5M21 12H9" />
          </svg>
          {signingOut ? 'Signing out…' : 'Sign out'}
        </button>
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-softwhite lg:grid lg:grid-cols-[232px_1fr]">
      {/* Sidebar — desktop */}
      <aside className="no-scrollbar sticky top-0 hidden h-screen flex-col overflow-y-auto bg-midnight lg:flex">
        {nav}
      </aside>

      {/* Sidebar — mobile drawer */}
      {mobileNavOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-ink/50" onClick={() => setMobileNavOpen(false)} />
          <aside className="no-scrollbar relative flex h-full w-[260px] flex-col overflow-y-auto bg-midnight">
            {nav}
          </aside>
        </div>
      )}

      <div className="min-w-0">
        {/* Topbar */}
        <header className="sticky top-0 z-30 flex items-center justify-between gap-4 border-b border-line bg-white px-5 py-3.5 lg:px-8">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileNavOpen(true)}
              className="text-ink lg:hidden"
              aria-label="Open menu"
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 6h18M3 12h18M3 18h18" />
              </svg>
            </button>
            <p className="hidden text-[13px] text-muted sm:block">
              {NAV_ITEMS.find((item) => isActive(item.href))?.label ?? 'Dashboard'}
            </p>
          </div>

          <div className="flex items-center gap-3">
            {adminEmail && (
              <div className="hidden items-center gap-2 border-l border-line pl-3 sm:flex">
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-antiquegold text-[11px] font-semibold uppercase text-white">
                  {adminEmail.slice(0, 1)}
                </div>
                <p className="text-[12px] text-charcoal">{adminEmail}</p>
              </div>
            )}
          </div>
        </header>

        <main className="px-5 py-6 lg:px-8 lg:py-8">{children}</main>
      </div>
    </div>
  );
}
