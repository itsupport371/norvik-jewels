import Image from "next/image";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import WishlistBadge from "@/components/wishlist-badge";
import CartBadge from "@/components/cart-badge";
import SearchTrigger from "@/components/search-trigger";

export default async function SiteHeader() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const accountHref = user ? "/account" : "/login";
  return (
    <header className="sticky top-0 z-50 border-b border-linestrong/30 bg-ink">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 lg:px-10">
        {/* Logo */}
        <Link href="/" className="flex items-center">
          <Image
            src="/images/logo-full-new.png"
            alt="Norvik Jewels"
            width={280}
            height={93}
            className="h-9 w-auto"
          />
        </Link>

        {/* Nav — placeholder links until those pages are built */}
        <nav className="hidden items-center gap-9 text-xs font-medium uppercase tracking-wide2 text-ivory/85 lg:flex">
          <Link href="/shop" className="transition-colors hover:text-[#D9BE93]">
            Shop
          </Link>
          <Link
            href="/collections"
            className="transition-colors hover:text-[#D9BE93]"
          >
            Collections
          </Link>
          <Link
            href="/about"
            className="transition-colors hover:text-[#D9BE93]"
          >
            About
          </Link>
          <Link
            href="/bespoke"
            className="transition-colors hover:text-[#D9BE93]"
          >
            Bespoke
          </Link>
        </nav>

        {/* Icon actions */}
        <div className="flex items-center gap-5">
          <SearchTrigger />
          <Link
            href={accountHref}
            aria-label="Account"
            className="relative text-ivory/85 transition-colors hover:text-[#D9BE93]"
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
              <span className="absolute -right-0.5 -top-0.5 h-1.5 w-1.5 rounded-full bg-[#B8935A]" />
            )}
          </Link>
          <Link
            href="/wishlist"
            aria-label="Wishlist"
            className="relative hidden text-ivory/85 transition-colors hover:text-[#D9BE93] sm:block"
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
            className="relative text-ivory/85 transition-colors hover:text-[#D9BE93]"
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
  );
}
