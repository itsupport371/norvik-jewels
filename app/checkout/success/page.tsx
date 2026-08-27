import Link from "next/link";
import SiteHeader from "@/components/site-header";
import SiteFooter from "@/components/site-footer";
import ClearCartOnSuccess from "@/components/clear-cart-on-success";

export default function CheckoutSuccessPage() {
  return (
    <>
      <SiteHeader />
      <ClearCartOnSuccess />
      <main className="mx-auto max-w-xl px-6 py-24 text-center">
        <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-full bg-[#1F4D3D]">
          <svg
            width="26"
            height="26"
            viewBox="0 0 24 24"
            fill="none"
            stroke="white"
            strokeWidth="2.5"
          >
            <path d="M20 6L9 17l-5-5" />
          </svg>
        </div>
        <h1 className="font-display text-3xl font-medium text-ink">
          Payment Successful
        </h1>
        <p className="mt-4 text-sm leading-relaxed text-charcoal">
          This was a test-mode payment — no real money was charged. Thank you
          for trying the Norvik Jewels checkout flow.
        </p>
        <Link
          href="/shop"
          className="mt-8 inline-block bg-ink px-6 py-3 text-xs font-medium uppercase tracking-wide2 text-white"
        >
          Continue Shopping
        </Link>
      </main>
      <SiteFooter />
    </>
  );
}
