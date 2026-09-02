'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import WishlistBadge from '@/components/wishlist-badge';
import CartBadge from '@/components/cart-badge';
import SearchTrigger from '@/components/search-trigger';

const CHEVRON = (
  <svg
    width="9"
    height="9"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    className="ml-1 inline-block"
  >
    <path d="M6 9l6 6 6-6" />
  </svg>
);

export default function HeaderChrome({
  accountHref,
  isLoggedIn,
  transparentOnHero = false,
}: {
  accountHref: string;
  isLoggedIn: boolean;
  transparentOnHero?: boolean;
}) {
  // On pages with a full-bleed hero (currently just the homepage), the header
  // starts transparent so it blends into the hero photo's own dark
  // background instead of sitting on top of it as a solid white bar — then
  // solidifies to the normal white header as soon as the visitor scrolls or
  // hovers over it, so the nav is always easy to read once they interact.
  const [scrolled, setScrolled] = useState(!transparentOnHero);
  const [hovered, setHovered] = useState(false);

  useEffect(() => {
    if (!transparentOnHero) return;
    function onScroll() {
      setScrolled(window.scrollY > 10);
    }
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [transparentOnHero]);

  const solid = !transparentOnHero || scrolled || hovered;

  return (
    <div
      className={transparentOnHero ? 'fixed inset-x-0 top-0 z-50' : ''}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Utility bar */}
      <div
        className={`items-center justify-between border-b px-6 text-[11px] transition-all duration-300 lg:px-10 ${
          transparentOnHero && !solid ? 'hidden' : 'hidden lg:flex'
        } ${
          solid
            ? 'border-warmstone bg-scandi py-2 text-inknavy/80'
            : 'border-transparent bg-transparent py-2 text-ivory/90'
        }`}
      >
        <div className="flex items-center gap-1.5">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <circle cx="12" cy="10" r="3" />
            <path d="M12 21s-7-6.5-7-11a7 7 0 0 1 14 0c0 4.5-7 11-7 11z" />
          </svg>
          <span>Delivering to India</span>
        </div>
        <div className="flex items-center gap-1.5 text-antiquegold">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <path d="M3 7h13v10H3z" />
            <path d="M16 10h3l2 3v4h-5" />
            <circle cx="7.5" cy="17.5" r="1.5" />
            <circle cx="17.5" cy="17.5" r="1.5" />
          </svg>
          <span>Free insured shipping on all orders</span>
        </div>
        <div className="flex items-center gap-5">
          <span className="flex items-center">
            INR
            {CHEVRON}
          </span>
        </div>
      </div>

      {/* Main header */}
      <header
        className={`z-50 w-full border-b transition-colors duration-300 ${transparentOnHero ? '' : 'sticky top-0'} ${
          solid ? 'border-warmstone bg-scandi' : 'border-transparent bg-transparent'
        }`}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 lg:px-10">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <Image
              src={solid ? '/images/logo-full-jewels-light.png' : '/images/logo-full-jewels-dark.png'}
              alt="Norvik Jewels"
              width={280}
              height={93}
              className="h-10 w-auto sm:h-11"
            />
          </Link>

          {/* Nav — placeholder links until those pages are built */}
          <nav
            className={`hidden items-center gap-8 text-[13px] font-medium uppercase leading-[1.2] tracking-[0.02em] transition-colors duration-300 lg:flex ${
              solid ? 'text-inknavy/85' : 'text-ivory'
            }`}
          >
            <Link href="/shop" className="flex items-center transition-colors hover:text-antiquegold">
              Shop
              {CHEVRON}
            </Link>
            <Link href="/collections" className="flex items-center transition-colors hover:text-antiquegold">
              Collections
              {CHEVRON}
            </Link>
            <Link href="/shop?sort=new" className="transition-colors hover:text-antiquegold">
              New Arrivals
            </Link>
            <Link href="/shop?sort=bestsellers" className="transition-colors hover:text-antiquegold">
              Best Sellers
            </Link>
            <Link href="/our-world" className="transition-colors hover:text-antiquegold">
              Our World
            </Link>
            <Link href="/about" className="transition-colors hover:text-antiquegold">
              About Norvik
            </Link>
          </nav>

          {/* Icon actions */}
          <div
            className={`flex items-center gap-3 transition-colors duration-300 sm:gap-5 ${
              solid ? 'text-inknavy/80' : 'text-ivory'
            }`}
          >
            <SearchTrigger light={!solid} />
            <Link href={accountHref} aria-label="Account" className="relative transition-colors hover:text-antiquegold">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                <circle cx="12" cy="8" r="4" />
                <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
              </svg>
              {isLoggedIn && (
                <span className="absolute -right-0.5 -top-0.5 h-1.5 w-1.5 rounded-full bg-antiquegold" />
              )}
            </Link>
            <Link href="/wishlist" aria-label="Wishlist" className="relative block transition-colors hover:text-antiquegold">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
              </svg>
              <WishlistBadge />
            </Link>
            <Link href="/cart" aria-label="Cart" className="relative transition-colors hover:text-antiquegold">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                <path d="M6 6h15l-1.5 9h-12z" />
                <circle cx="9" cy="20" r="1" />
                <circle cx="18" cy="20" r="1" />
              </svg>
              <CartBadge />
            </Link>
          </div>
        </div>
      </header>
    </div>
  );
}
