'use client';

import { useCart } from '@/lib/cart-context';

export default function CartBadge() {
  const { totalItems } = useCart();
  if (totalItems === 0) return null;

  return (
    <span className="absolute -right-1.5 -top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-ink text-[9px] font-medium text-white">
      {totalItems}
    </span>
  );
}
