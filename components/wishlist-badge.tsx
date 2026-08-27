'use client';

import { useWishlist } from '@/lib/wishlist-context';

export default function WishlistBadge() {
  const { wishlist } = useWishlist();
  if (wishlist.length === 0) return null;

  return (
    <span className="absolute -right-1.5 -top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-ink text-[9px] font-medium text-white">
      {wishlist.length}
    </span>
  );
}
