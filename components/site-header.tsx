import Image from "next/image";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import WishlistBadge from "@/components/wishlist-badge";
import CartBadge from "@/components/cart-badge";
import SearchTrigger from "@/components/search-trigger";

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

export default async function SiteHeader() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const accountHref = user ? "/account" : "/login";
  return (
    <>
      {/* Utility bar */}
      <div className="hidden items-center justify-between border-b border-warmstone bg-scandi px-6 py-2 text-[11px] text-inknavy/80 lg:flex lg:px-10">
        <div className="flex items-center gap-1.5">
          <svg
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
          >
            <circle cx="12" cy="10" r="3" />
            <path d="M12 21s-7-6.5-7-11a7 7 0 0 1 14 0c0 4.5-7 11-7 11z" />
          </svg>
          <span>Delivering to India</span>
        </div>
        <div className="flex items-center gap-1.5 text-antiquegold">
          <svg
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
          >
            <path d="M3 7h13v10H3z" />
            <path d="M16 10h3l2 3v4h-5" />
            <circle cx="7.5" cy="17.5" r="1.5" />
            <circle cx="17.5" cy="17.5" r="1.5" />
          </svg>
          <span>Free insured shipping on all orders</span>
        </div>
        <div className="flex items-center gap-5">
          <span className="flex items-center gap-1.5">
            <svg
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
            >
              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.36 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.34 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
            </svg>
            +91 98765 43210
          </span>
          <span className="flex items-center">
            INR
            {CHEVRON}
          </span>
        </div>
      </div>

      {/* Main header */}
      <header className="sticky top-0 z-50 border-b border-warmstone bg-scandi">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 lg:px-10">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <Image
              src="/images/logo-full-jewels-light.png"
              alt="Norvik Jewels"
              width={280}
              height={93}
              className="h-10 w-auto sm:h-11"
            />
          </Link>

          {/* Nav — placeholder links until those pages are built */}
          <nav className="hidden items-center gap-8 text-xs font-medium uppercase tracking-wide2 text-inknavy/85 lg:flex">
            <Link
              href="/shop"
              className="flex items-center transition-colors hover:text-antiquegold"
            >
              Shop
              {CHEVRON}
            </Link>
            <Link
              href="/collections"
              className="flex items-center transition-colors hover:text-antiquegold"
            >
              Collections
              {CHEVRON}
            </Link>
            <Link
              href="/shop?sort=new"
              className="transition-colors hover:text-antiquegold"
            >
              New Arrivals
            </Link>
            <Link
              href="/shop?sort=bestsellers"
              className="transition-colors hover:text-antiquegold"
            >
              Best Sellers
            </Link>
            <Link
              href="/our-world"
              className="transition-colors hover:text-antiquegold"
            >
              Our World
            </Link>
            <Link
              href="/about"
              className="transition-colors hover:text-antiquegold"
            >
              About Norvik
            </Link>
          </nav>

          {/* Icon actions */}
          <div className="flex items-center gap-3 sm:gap-5">
            <SearchTrigger />
            <Link
              href={accountHref}
              aria-label="Account"
              className="relative text-inknavy/80 transition-colors hover:text-antiquegold"
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.6"
              >
                <circle cx="12" cy="8" r="4" />
                <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
              </svg>
              {user && (
                <span className="absolute -right-0.5 -top-0.5 h-1.5 w-1.5 rounded-full bg-antiquegold" />
              )}
            </Link>
            <Link
              href="/wishlist"
              aria-label="Wishlist"
              className="relative block text-inknavy/80 transition-colors hover:text-antiquegold"
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.6"
              >
                <path d="M12 20s-7-4.35-9.3-8.3C1.2 8.6 2.7 5 6.2 5c2 0 3.4 1.1 4 2.2C10.8 6.1 12.2 5 14.2 5c3.5 0 5 3.6 3.5 6.7C19.3 15.65 12 20 12 20z" />
              </svg>
              <WishlistBadge />
            </Link>
            <Link
              href="/cart"
              aria-label="Cart"
              className="relative text-inknavy/80 transition-colors hover:text-antiquegold"
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.6"
              >
                <path d="M6 6h15l-1.5 9h-12z" />
                <circle cx="9" cy="20" r="1" />
                <circle cx="18" cy="20" r="1" />
              </svg>
              <CartBadge />
            </Link>
          </div>
        </div>
      </header>
    </>
  );
}
