'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useWishlist } from '@/lib/wishlist-context';
import { products, getDisplayPrice } from '@/lib/mock-products';

export default function WishlistContent() {
  const { wishlist, toggleWishlist } = useWishlist();
  const items = products.filter((p) => wishlist.includes(p.slug));

  return (
    <main className="mx-auto max-w-7xl px-6 py-12 lg:px-10 lg:py-16">
      <h1 className="font-display text-[26px] font-medium leading-[1.05] tracking-[-0.01em] text-ink sm:text-[36px]">
        Wishlist
      </h1>
      <p className="mt-2 text-[14px] leading-[1.6] text-muted">
        {items.length} {items.length === 1 ? 'piece' : 'pieces'}
      </p>

      {items.length === 0 ? (
        <div className="py-20 text-center">
          <p className="text-[14px] leading-[1.6] text-muted">Your wishlist is empty.</p>
          <Link
            href="/shop"
            className="mt-4 inline-block bg-ink px-6 py-3 text-[11px] font-medium uppercase leading-[1.2] tracking-[0.08em] text-white sm:text-[12px]"
          >
            Start Browsing
          </Link>
        </div>
      ) : (
        <div className="mt-10 grid grid-cols-2 gap-x-5 gap-y-10 sm:grid-cols-3 lg:grid-cols-4">
          {items.map((product) => (
            <div key={product.slug} className="group relative">
              <Link
                href={`/product/${product.slug}`}
                className="relative block aspect-square overflow-hidden border border-warmstone bg-white p-2 sm:p-3"
              >
                <div className="relative h-[calc(100%-88px)] overflow-hidden sm:h-[calc(100%-104px)]">
                  <Image
                    src={product.images[0]}
                    alt={product.name}
                    fill
                    className="object-contain transition-transform duration-500 group-hover:scale-105"
                    sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
                  />
                </div>
                <div className="flex h-[88px] flex-col items-center justify-center overflow-hidden px-1 text-center sm:h-[104px]">
                  <p className="text-[10px] font-medium uppercase leading-[1.2] tracking-[0.14em] text-antiquegold sm:text-[11px]">
                    {product.category}
                  </p>
                  <p className="mt-1 line-clamp-2 w-full text-[13px] font-medium leading-[1.35] text-ink sm:text-[14px]">{product.name}</p>
                  <p className="mt-1 text-[13px] leading-[1.35] text-muted">
                    {product.currency}
                    {getDisplayPrice(product).toLocaleString('en-IN')}
                  </p>
                </div>
              </Link>
              <button
                onClick={() => toggleWishlist(product.slug)}
                aria-label="Remove from wishlist"
                className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center bg-ivory/90 text-ink shadow transition-opacity hover:opacity-75"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="#B8935A" stroke="#B8935A" strokeWidth="1.5">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
