'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCart, getCartBreakdown, getItemBreakdown } from '@/lib/cart-context';
import { useLocale } from '@/lib/locale-context';

export default function CartContent() {
  const { cart, removeFromCart, updateQuantity, totalPrice } = useCart();
  const { formatPrice } = useLocale();
  const router = useRouter();
  // Short "Price Details" breakdown (Item Value / Making / GST) — a summary,
  // not the full per-line table the product page's Specifications panel
  // shows.
  const priceDetails = getCartBreakdown(cart);

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
        {cart.map((item) => {
          // Each product's own breakdown — shown separately per line below,
          // not just folded into the one combined total at the bottom, so
          // with multiple different products in the bag it's clear which
          // part of the price comes from which item (client ask, Sep 2026).
          const { itemValue, making, gst } = getItemBreakdown(item);
          return (
            <div key={item.id} className="py-5">
              {/* Image + name/details + price — kept to one row on every
                  screen size, but with min-w-0 on the text column and
                  shrink-0 on the image/price so long product names wrap
                  instead of pushing the row wider than the screen. */}
              <div className="flex gap-3 sm:gap-4">
                <div className="relative h-20 w-20 shrink-0 overflow-hidden bg-white sm:h-24 sm:w-24">
                  <Image src={item.image} alt={item.name} fill className="object-cover" sizes="96px" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <Link
                        href={`/product/${item.slug}`}
                        className="line-clamp-2 text-[13px] font-medium leading-[1.35] text-ink hover:underline sm:text-[14px]"
                      >
                        {item.name}
                      </Link>
                      <p className="mt-1 text-[12px] leading-[1.35] text-muted sm:text-[13px]">{item.metalKey}</p>
                      {item.colorKey && (
                        <p className="text-[12px] leading-[1.35] text-muted sm:text-[13px]">Diamond Quality: {item.colorKey}</p>
                      )}
                      {item.sizeKey && <p className="text-[12px] leading-[1.35] text-muted sm:text-[13px]">Size: {item.sizeKey}</p>}
                    </div>
                    <p className="shrink-0 text-[13px] font-medium leading-[1.35] text-ink sm:text-[14px]">
                      {formatPrice(item.price * item.quantity)}
                    </p>
                  </div>

                  {/* Quantity + remove — on their own row and free to use
                      the full row width, instead of being squeezed into
                      whatever was left over next to the price (that squeeze
                      is what was breaking the layout on narrower phones). */}
                  <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
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
              </div>

              {/* This item's own Price Details — Item Value / Making / GST
                  for THIS product (× its quantity), separate from every
                  other product in the bag. */}
              <div className="mt-4 grid grid-cols-3 gap-2 border-t border-line/60 pt-3 sm:ml-[112px]">
                <div>
                  <p className="text-[10px] font-medium uppercase leading-[1.2] tracking-[0.06em] text-muted">Item Value</p>
                  <p className="mt-0.5 text-[12px] font-medium leading-[1.35] text-charcoal sm:text-[13px]">
                    {formatPrice(itemValue * item.quantity)}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] font-medium uppercase leading-[1.2] tracking-[0.06em] text-muted">Making</p>
                  <p className="mt-0.5 text-[12px] font-medium leading-[1.35] text-charcoal sm:text-[13px]">
                    {formatPrice(making * item.quantity)}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] font-medium uppercase leading-[1.2] tracking-[0.06em] text-muted">GST (3%)</p>
                  <p className="mt-0.5 text-[12px] font-medium leading-[1.35] text-charcoal sm:text-[13px]">
                    {formatPrice(gst * item.quantity)}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-8 flex flex-col items-center gap-4 sm:items-end">
        {/* Combined total across every product above (each of which already
            shows its own breakdown) — the grand summary for the whole bag. */}
        <div className="w-full max-w-xs space-y-2 border-t border-line pt-4 text-[13px] leading-[1.35] sm:w-72">
          <p className="text-[10px] font-medium uppercase leading-[1.2] tracking-[0.14em] text-antiquegold">
            Bag Total ({cart.length} {cart.length === 1 ? 'item' : 'items'})
          </p>
          <div className="flex justify-between text-charcoal">
            <span>Item Value (Gold + Diamond)</span>
            <span>{formatPrice(priceDetails.itemValue)}</span>
          </div>
          <div className="flex justify-between text-charcoal">
            <span>Making Charges</span>
            <span>{formatPrice(priceDetails.making)}</span>
          </div>
          <div className="flex justify-between text-charcoal">
            <span>GST (3%)</span>
            <span>{formatPrice(priceDetails.gst)}</span>
          </div>
        </div>
        <div className="flex w-full max-w-xs justify-between border-t border-line pt-4 text-base font-semibold text-ink sm:w-72">
          <span>Total</span>
          <span>{formatPrice(totalPrice)}</span>
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
