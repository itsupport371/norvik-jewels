import Link from 'next/link';
import Stripe from 'stripe';
import SiteHeader from '@/components/site-header';
import SiteFooter from '@/components/site-footer';
import ClearCartOnSuccess from '@/components/clear-cart-on-success';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

// Demo/testing request (4 Oct 2026): after a test purchase, two things were
// missing — an invoice the buyer could get, and the order showing up under
// Account → My Orders (that page was a static "no orders yet" placeholder
// with no table behind it at all; see supabase/migrations/0005_orders_schema.sql
// and components/account-dashboard.tsx). Both are handled from right here,
// once the Checkout Session is confirmed complete:
//   1. `invoice_creation` on the session (api/create-checkout-session) makes
//      Stripe generate a real Invoice PDF — fetched below and shown as a
//      "Download Invoice" button. Whether Stripe also auto-EMAILS it depends
//      on a Dashboard setting the client has to turn on themselves (Settings
//      → Invoices → "Email finalized invoices to customers", test mode has
//      its own toggle) — not something this code can flip, so the page
//      doesn't rely on email alone.
//   2. If the shopper is signed in, the completed order is written to the
//      new `orders` table so it shows up under My Orders. This happens here
//      rather than via a Stripe webhook because this project has no
//      service-role key (by design, RLS-only) — a webhook has no signed-in
//      user to attach the order to, so it can't satisfy the
//      `auth.uid() = user_id` insert policy. Doing it from the success page,
//      using the same signed-in session the shopper already has, is the
//      only way to record an order without that key. The real tradeoff:
//      this only runs if the shopper's browser actually reaches this page —
//      a closed tab mid-redirect means no order row. Fine for this demo;
//      worth moving to a proper webhook + service role later if this becomes
//      real order tracking.
// Bug (found live 25 Oct 2026): the client's first test purchase showed a
// working "Download Invoice" link; the very next one didn't, in either My
// Orders or Admin → Orders — and once it's missing it stays missing (this
// page only ever runs once per session and writes whatever it found
// straight into `orders.invoice_pdf_url`). Root cause: `invoice_creation`
// makes Stripe generate the Invoice object + its PDF, but that happens a
// moment AFTER the Checkout Session itself flips to `payment_status:
// 'paid'` — not atomically with it. The very first fetch here, right after
// the browser lands on this page post-redirect, can beat that — the PDF
// just isn't ready yet. It isn't a one-off: whether it wins the race is
// pure timing on Stripe's side, so it can happen on any purchase, not just
// a "second one" specifically. Retries a few times with a short delay
// before giving up, so the link (and what gets saved below) is correct the
// one time this page normally runs for a given session, instead of only
// when the race happens to be won.
async function getSessionDetails(sessionId: string | undefined) {
  if (!sessionId) return null;
  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) return null;
  try {
    const stripe = new Stripe(secretKey.trim());
    let session: Stripe.Checkout.Session | null = null;
    for (let attempt = 0; attempt < 5; attempt++) {
      session = await stripe.checkout.sessions.retrieve(sessionId, {
        expand: ['invoice', 'line_items'],
      });
      const invoice = session.invoice;
      const pdfReady = Boolean(invoice && typeof invoice !== 'string' && invoice.invoice_pdf);
      // Nothing to wait for if the payment didn't actually succeed, or the
      // PDF is already there, or this was the last attempt.
      if (pdfReady || session.payment_status !== 'paid' || attempt === 4) break;
      await new Promise((resolve) => setTimeout(resolve, 1200));
    }
    return session;
  } catch (err) {
    console.error('Could not fetch checkout session:', err);
    return null;
  }
}

async function recordOrder(session: Stripe.Checkout.Session) {
  if (session.payment_status !== 'paid') return;

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return; // Guest checkout — no account to attach the order to.

  const invoice = session.invoice;
  const invoicePdfUrl = invoice && typeof invoice !== 'string' ? invoice.invoice_pdf ?? null : null;

  const items =
    session.line_items?.data.map((li) => ({
      name: li.description ?? 'Norvik Jewels item',
      quantity: li.quantity ?? 1,
      amount: (li.amount_total ?? 0) / 100,
    })) ?? [];

  try {
    await supabase.from('orders').upsert(
      {
        user_id: user.id,
        email: session.customer_details?.email ?? user.email ?? '',
        stripe_session_id: session.id,
        items,
        total: (session.amount_total ?? 0) / 100,
        currency: 'INR',
        status: 'paid',
        invoice_pdf_url: invoicePdfUrl,
      },
      { onConflict: 'stripe_session_id' }
    );
  } catch (err) {
    // Non-fatal — the payment already succeeded with Stripe regardless of
    // whether this record-keeping write works, so never block the success
    // page on it.
    console.error('Could not record order:', err);
  }
}

export default async function CheckoutSuccessPage({
  searchParams,
}: {
  searchParams: { session_id?: string };
}) {
  const session = await getSessionDetails(searchParams.session_id);
  if (session) {
    await recordOrder(session);
  }
  const invoice = session?.invoice;
  const invoiceUrl = invoice && typeof invoice !== 'string' ? invoice.invoice_pdf ?? null : null;

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
          href="/account"
          className="mt-4 block text-[11px] font-medium uppercase leading-[1.2] tracking-[0.08em] text-ink underline underline-offset-4 hover:text-antiquegold sm:text-[12px]"
        >
          View My Orders
        </Link>
        <Link
          href="/shop"
          className="mt-2 block text-[11px] font-medium uppercase leading-[1.2] tracking-[0.08em] text-muted underline underline-offset-4 hover:text-antiquegold sm:text-[12px]"
        >
          Continue Shopping
        </Link>
      </main>
      <SiteFooter />
    </>
  );
}
