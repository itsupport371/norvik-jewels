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
      <h1 className="font-display text-3xl font-medium text-ink sm:text-4xl">
        Wishlist
      </h1>
      <p className="mt-2 text-sm text-muted">
        {items.length} {items.length === 1 ? 'piece' : 'pieces'}
      </p>

      {items.length === 0 ? (
        <div className="py-20 text-center">
          <p className="text-sm text-muted">Your wishlist is empty.</p>
          <Link
            href="/shop"
            className="mt-4 inline-block bg-ink px-6 py-3 text-xs font-medium uppercase tracking-wide2 text-white"
          >
            Start Browsing
          </Link>
        </div>
      ) : (
        <div className="mt-10 grid grid-cols-2 gap-x-5 gap-y-10 sm:grid-cols-3 lg:grid-cols-4">
          {items.map((product) => (
            <div key={product.slug} className="group relative">
              <Link href={`/product/${product.slug}`} className="block">
                <div className="relative aspect-square overflow-hidden bg-[#F7F5F2]">
                  <Image
                    src={product.images[0]}
                    alt={product.name}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                    sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
                  />
                </div>
                <p className="mt-3 text-xs uppercase tracking-wide2 text-muted">
                  {product.category}
                </p>
                <p className="mt-1 text-sm font-medium text-ink">{product.name}</p>
                <p className="mt-1 text-xs text-muted">
                  {product.currency}
                  {getDisplayPrice(product).toLocaleString('en-IN')}
                </p>
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
