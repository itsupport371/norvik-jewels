'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { getProductBySlug } from '@/lib/mock-products';
import { useCart } from '@/lib/cart-context';

export default function CheckoutContent() {
  const searchParams = useSearchParams();
  const isCartMode = searchParams.get('cart') === '1';

  const slug = searchParams.get('slug') ?? '';
  const metal = searchParams.get('metal') ?? '';
  const color = searchParams.get('color');
  const size = searchParams.get('size');
  const singlePrice = Number(searchParams.get('price') ?? 0);

  const singleProduct = !isCartMode ? getProductBySlug(slug) : undefined;
  const { cart, totalPrice: cartTotal } = useCart();

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [addressLine2, setAddressLine2] = useState('');
  const [landmark, setLandmark] = useState('');
  const [city, setCity] = useState('');
  const [pincode, setPincode] = useState('');
  const [paying, setPaying] = useState(false);
  const [payError, setPayError] = useState<string | null>(null);

  if (isCartMode && cart.length === 0) {
    return (
      <main className="mx-auto max-w-xl px-6 py-24 text-center">
        <h1 className="font-display text-2xl text-ink">Your bag is empty</h1>
        <Link
          href="/shop"
          className="mt-6 inline-block bg-ink px-6 py-3 text-xs font-medium uppercase tracking-wide2 text-white"
        >
          Continue Shopping
        </Link>
      </main>
    );
  }

  if (!isCartMode && !singleProduct) {
    return (
      <main className="mx-auto max-w-xl px-6 py-24 text-center">
        <h1 className="font-display text-2xl text-ink">No item selected</h1>
        <p className="mt-3 text-sm text-muted">
          Please go back and choose a piece to check out.
        </p>
        <Link
          href="/shop"
          className="mt-6 inline-block bg-ink px-6 py-3 text-xs font-medium uppercase tracking-wide2 text-white"
        >
          Continue Shopping
        </Link>
      </main>
    );
  }

  const price = isCartMode ? cartTotal : singlePrice;
  const currency = isCartMode ? cart[0]?.currency ?? '₹' : singleProduct?.currency ?? '₹';
  const shipping = 0;
  const total = price + shipping;
  const isAddressComplete =
    name.trim() !== '' &&
    phone.trim() !== '' &&
    address.trim() !== '' &&
    city.trim() !== '' &&
    pincode.trim() !== '';

  async function handlePayment() {
    if (!isAddressComplete) return;
    setPaying(true);
    setPayError(null);
    try {
      const items = isCartMode
        ? cart.map((c) => ({ name: c.name, price: c.price, quantity: c.quantity }))
        : [{ name: singleProduct!.name, price: total, quantity: 1 }];

      const res = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items, cartCheckout: isCartMode }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        setPayError(data.error ?? 'Something went wrong. Please try again.');
        setPaying(false);
      }
    } catch {
      setPayError('Something went wrong. Please try again.');
      setPaying(false);
    }
  }

  return (
    <main className="mx-auto max-w-6xl px-6 py-10 lg:px-10 lg:py-14">
      <h1 className="font-display mb-8 text-2xl font-medium text-ink sm:text-3xl">
        Checkout
      </h1>

      <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1fr_380px]">
        {/* Left: address form */}
        <div>
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide2 text-ink">
            Delivery Address
          </h2>
          <div className="space-y-4 border border-line p-5">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide2 text-muted">
                  Full Name
                </label>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Aditi Sharma"
                  className="w-full border border-line bg-ivory px-4 py-3 text-base text-ink outline-none focus:border-ink sm:text-sm"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide2 text-muted">
                  Phone
                </label>
                <input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 98765 43210"
                  className="w-full border border-line bg-ivory px-4 py-3 text-base text-ink outline-none focus:border-ink sm:text-sm"
                />
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide2 text-muted">
                Address Line 1
              </label>
              <input
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="House no., street, area"
                className="w-full border border-line bg-ivory px-4 py-3 text-base text-ink outline-none focus:border-ink sm:text-sm"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide2 text-muted">
                Address Line 2 <span className="normal-case text-muted/70">(Optional)</span>
              </label>
              <input
                value={addressLine2}
                onChange={(e) => setAddressLine2(e.target.value)}
                placeholder="Apartment, floor, building name"
                className="w-full border border-line bg-ivory px-4 py-3 text-base text-ink outline-none focus:border-ink sm:text-sm"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide2 text-muted">
                Landmark <span className="normal-case text-muted/70">(Optional)</span>
              </label>
              <input
                value={landmark}
                onChange={(e) => setLandmark(e.target.value)}
                placeholder="Nearby landmark for easy delivery"
                className="w-full border border-line bg-ivory px-4 py-3 text-base text-ink outline-none focus:border-ink sm:text-sm"
              />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide2 text-muted">
                  City
                </label>
                <input
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="Mumbai"
                  className="w-full border border-line bg-ivory px-4 py-3 text-base text-ink outline-none focus:border-ink sm:text-sm"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide2 text-muted">
                  Pincode
                </label>
                <input
                  value={pincode}
                  onChange={(e) => setPincode(e.target.value)}
                  placeholder="400001"
                  className="w-full border border-line bg-ivory px-4 py-3 text-base text-ink outline-none focus:border-ink sm:text-sm"
                />
              </div>
            </div>
          </div>

          <p className="mt-3 text-xs text-muted">
            Saved addresses and address-book selection will be added once the account system is fully connected.
          </p>
        </div>

        {/* Right: order summary */}
        <div>
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide2 text-ink">
            Order Summary
          </h2>
          <div className="border border-line p-5">
            {isCartMode ? (
              <div className="space-y-4">
                {cart.map((item) => (
                  <div key={item.id} className="flex gap-3">
                    <div className="relative h-16 w-16 shrink-0 overflow-hidden bg-[#F7F5F2]">
                      <Image src={item.image} alt={item.name} fill className="object-cover" sizes="64px" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-ink">{item.name}</p>
                      <p className="text-xs text-muted">Qty: {item.quantity}</p>
                    </div>
                    <p className="shrink-0 text-sm font-medium text-ink">
                      {item.currency}
                      {(item.price * item.quantity).toLocaleString('en-IN')}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex gap-4">
                <div className="relative h-20 w-20 shrink-0 overflow-hidden bg-[#F7F5F2]">
                  <Image src={singleProduct!.images[0]} alt={singleProduct!.name} fill className="object-cover" sizes="80px" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-ink">{singleProduct!.name}</p>
                  <p className="mt-1 text-xs text-muted">{metal}</p>
                  {color && <p className="text-xs text-muted">Diamond Quality: {color}</p>}
                  {size && <p className="text-xs text-muted">Size: {size}</p>}
                </div>
                <p className="shrink-0 text-sm font-medium text-ink">
                  {currency}
                  {price.toLocaleString('en-IN')}
                </p>
              </div>
            )}

            <div className="mt-5 space-y-2 border-t border-line pt-4 text-sm">
              <div className="flex justify-between text-charcoal">
                <span>Subtotal</span>
                <span>
                  {currency}
                  {price.toLocaleString('en-IN')}
                </span>
              </div>
              <div className="flex justify-between text-charcoal">
                <span>Shipping</span>
                <span className="text-[#1F4D3D]">Free</span>
              </div>
            </div>

            <div className="mt-4 flex justify-between border-t border-line pt-4 text-base font-semibold text-ink">
              <span>Total</span>
              <span>
                {currency}
                {total.toLocaleString('en-IN')}
              </span>
            </div>
          </div>

          <button
            onClick={handlePayment}
            disabled={paying || !isAddressComplete}
            className="mt-4 w-full bg-ink py-4 text-sm font-medium uppercase tracking-wide2 text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {paying ? 'Redirecting…' : 'Proceed to Payment'}
          </button>
          {!isAddressComplete && !paying && (
            <p className="mt-2 text-center text-xs text-muted">
              Please fill in your delivery address to continue.
            </p>
          )}
          {payError && (
            <p className="mt-2 text-center text-xs text-red-700">{payError}</p>
          )}
          <p className="mt-2 text-center text-xs text-muted">
            Test mode — use card 4242 4242 4242 4242, any future date, any CVC.
          </p>
        </div>
      </div>
    </main>
  );
}
