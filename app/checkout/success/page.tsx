import Link from 'next/link';
import SiteHeader from '@/components/site-header';
import SiteFooter from '@/components/site-footer';
import ClearCartOnSuccess from '@/components/clear-cart-on-success';

export default function CheckoutSuccessPage() {
  return (
    <>
      <SiteHeader />
      <ClearCartOnSuccess />
      <main className="mx-auto max-w-xl px-6 py-24 text-center">
        <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-full bg-[#1F4D3D]">
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
            <path d="M20 6L9 17l-5-5" />
          </svg>
        </div>
        <h1 className="font-display text-[26px] font-medium leading-[1.05] tracking-[-0.01em] text-ink sm:text-[36px]">Payment Successful</h1>
        <p className="mt-4 text-[14px] leading-[1.6] text-charcoal sm:text-[15px]">
          This was a test-mode payment — no real money was charged. Thank you
          for trying the Norvik Jewels checkout flow.
        </p>
        <Link
          href="/shop"
          className="mt-8 inline-block bg-ink px-6 py-3 text-[11px] font-medium uppercase leading-[1.2] tracking-[0.08em] text-white sm:text-[12px]"
        >
          Continue Shopping
        </Link>
      </main>
      <SiteFooter />
    </>
  );
}
