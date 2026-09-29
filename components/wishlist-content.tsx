'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useWishlist } from '@/lib/wishlist-context';
import { getDisplayPrice, type Product } from '@/lib/mock-products';
import { useLocale } from '@/lib/locale-context';
import WishlistQuickButton from '@/components/wishlist-quick-button';

export default function WishlistContent({ products }: { products: Product[] }) {
  const { wishlist } = useWishlist();
  const { formatPrice } = useLocale();
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
                className="relative block aspect-square overflow-hidden bg-white p-2 sm:p-3"
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
                    {formatPrice(getDisplayPrice(product))}
                  </p>
                </div>
              </Link>
              <WishlistQuickButton slug={product.slug} />
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
