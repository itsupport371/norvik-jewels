import Link from 'next/link';
import Stripe from 'stripe';
import SiteHeader from '@/components/site-header';
import SiteFooter from '@/components/site-footer';
import ClearCartOnSuccess from '@/components/clear-cart-on-success';

export const dynamic = 'force-dynamic';

// Demo/testing request (4 Oct 2026): after a test purchase, the buyer should
// get an invoice. The checkout session (api/create-checkout-session) now
// asks Stripe to generate a real Invoice (PDF) for the order via
// `invoice_creation`. Whether Stripe also auto-EMAILS that invoice depends
// on a one-time Dashboard setting the client has to turn on themselves
// (Settings → Invoices → "Email finalized invoices to customers", test mode
// has its own toggle) — not something this code can flip. So this page
// doesn't rely on email alone: it looks the invoice up itself and shows a
// direct "Download Invoice" link right here, which always works regardless
// of that email setting.
async function getInvoiceUrl(sessionId: string | undefined) {
  if (!sessionId) return null;
  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) return null;
  try {
    const stripe = new Stripe(secretKey.trim());
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['invoice'],
    });
    const invoice = session.invoice;
    if (invoice && typeof invoice !== 'string') {
      return invoice.invoice_pdf ?? null;
    }
    return null;
  } catch (err) {
    console.error('Could not fetch invoice for checkout session:', err);
    return null;
  }
}

export default async function CheckoutSuccessPage({
  searchParams,
}: {
  searchParams: { session_id?: string };
}) {
  const invoiceUrl = await getInvoiceUrl(searchParams.session_id);

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
        {invoiceUrl && (
          <a
            href={invoiceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-6 inline-block border border-ink px-6 py-3 text-[11px] font-medium uppercase leading-[1.2] tracking-[0.08em] text-ink transition-colors hover:bg-ink hover:text-white sm:text-[12px]"
          >
            Download Invoice (PDF)
          </a>
        )}
        <Link
          href="/shop"
          className="mt-4 block text-[11px] font-medium uppercase leading-[1.2] tracking-[0.08em] text-ink underline underline-offset-4 hover:text-antiquegold sm:text-[12px]"
        >
          Continue Shopping
        </Link>
      </main>
      <SiteFooter />
    </>
  );
}
