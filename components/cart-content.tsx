'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCart } from '@/lib/cart-context';

export default function CartContent() {
  const { cart, removeFromCart, updateQuantity, totalPrice } = useCart();
  const router = useRouter();

  if (cart.length === 0) {
    return (
      <main className="mx-auto max-w-3xl px-6 py-24 text-center">
        <h1 className="font-display text-[26px] font-medium leading-[1.05] tracking-[-0.01em] text-ink sm:text-[36px]">Your Bag</h1>
        <p className="mt-4 text-[14px] leading-[1.6] text-muted">Your bag is empty.</p>
        <Link
          href="/shop"
          className="mt-6 inline-block bg-ink px-6 py-3 text-[11px] font-medium uppercase leading-[1.2] tracking-[0.08em] text-white sm:text-[12px]"
        >
          Start Browsing
        </Link>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-5xl px-6 py-12 lg:px-10 lg:py-16">
      <h1 className="font-display text-[26px] font-medium leading-[1.05] tracking-[-0.01em] text-ink sm:text-[36px]">
        Your Bag
      </h1>
      <p className="mt-2 text-[14px] leading-[1.6] text-muted">
        {cart.length} {cart.length === 1 ? 'item' : 'items'}
      </p>

      <div className="mt-8 divide-y divide-line border-y border-line">
        {cart.map((item) => (
          <div key={item.id} className="flex gap-4 py-5">
            <div className="relative h-24 w-24 shrink-0 overflow-hidden bg-white">
              <Image src={item.image} alt={item.name} fill className="object-cover" sizes="96px" />
            </div>
            <div className="flex flex-1 flex-col justify-between">
              <div>
                <Link href={`/product/${item.slug}`} className="text-[13px] font-medium leading-[1.35] text-ink hover:underline sm:text-[14px]">
                  {item.name}
                </Link>
                <p className="mt-1 text-[13px] leading-[1.35] text-muted">{item.metalKey}</p>
                {item.colorKey && (
                  <p className="text-[13px] leading-[1.35] text-muted">Diamond Quality: {item.colorKey}</p>
                )}
                {item.sizeKey && <p className="text-[13px] leading-[1.35] text-muted">Size: {item.sizeKey}</p>}
              </div>
              <div className="mt-2 flex items-center justify-between">
                <div className="flex items-center border border-line">
                  <button
                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                    className="flex h-8 w-8 items-center justify-center text-ink hover:bg-[#F7F5F2]"
                    aria-label="Decrease quantity"
                  >
                    −
                  </button>
                  <span className="flex h-8 w-8 items-center justify-center text-[13px] leading-[1.35]">
                    {item.quantity}
                  </span>
                  <button
                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    className="flex h-8 w-8 items-center justify-center text-ink hover:bg-[#F7F5F2]"
                    aria-label="Increase quantity"
                  >
                    +
                  </button>
                </div>
                <button
                  onClick={() => removeFromCart(item.id)}
                  className="text-[11px] font-medium uppercase leading-[1.2] tracking-[0.08em] text-muted underline underline-offset-2 hover:text-ink"
                >
                  Remove
                </button>
              </div>
            </div>
            <p className="shrink-0 text-[13px] font-medium leading-[1.35] text-ink sm:text-[14px]">
              {item.currency}
              {(item.price * item.quantity).toLocaleString('en-IN')}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-8 flex flex-col items-center gap-4 sm:items-end">
        <div className="flex w-full max-w-xs justify-between text-base font-semibold text-ink sm:w-72">
          <span>Total</span>
          <span>
            {cart[0]?.currency ?? '₹'}
            {totalPrice.toLocaleString('en-IN')}
          </span>
        </div>
        <button
          onClick={() => router.push('/checkout?cart=1')}
          className="w-full max-w-xs bg-ink py-4 text-[11px] font-medium uppercase leading-[1.2] tracking-[0.08em] text-white transition-opacity hover:opacity-90 sm:w-72 sm:text-[12px]"
        >
          Proceed to Checkout
        </button>
      </div>
    </main>
  );
}
