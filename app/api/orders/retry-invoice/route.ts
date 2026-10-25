import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@/lib/supabase/server';

// Backfills `orders.invoice_pdf_url` for a row that already got saved as
// null — see the comment on getSessionDetails() in
// app/checkout/success/page.tsx for why that can happen (a Stripe timing
// race, not a per-order bug), and 0008_orders_update_policy.sql for the RLS
// policy this write needs. No service-role key here either, same as every
// other write in this project: this runs with the SIGNED-IN shopper's own
// session, so it can only ever touch a row RLS already lets them update —
// their own order (or any order, if the signed-in user is an admin).
export async function POST(req: NextRequest) {
  try {
    const { stripeSessionId } = await req.json();
    if (typeof stripeSessionId !== 'string' || !stripeSessionId) {
      return NextResponse.json({ error: 'Missing stripeSessionId.' }, { status: 400 });
    }

    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Not signed in.' }, { status: 401 });
    }

    const secretKey = process.env.STRIPE_SECRET_KEY;
    if (!secretKey) {
      return NextResponse.json({ error: 'Payment is not configured.' }, { status: 500 });
    }

    const stripe = new Stripe(secretKey.trim());
    const session = await stripe.checkout.sessions.retrieve(stripeSessionId, {
      expand: ['invoice'],
    });
    const invoice = session.invoice;
    const invoicePdfUrl = invoice && typeof invoice !== 'string' ? invoice.invoice_pdf ?? null : null;

    if (!invoicePdfUrl) {
      // Still not ready on Stripe's side (rare — only if this is retried
      // within a second or two of the purchase itself), not an error.
      return NextResponse.json({ invoicePdfUrl: null });
    }

    // RLS (0008_orders_update_policy.sql) is what actually enforces that
    // this can only update a row the signed-in user is allowed to touch —
    // the .eq() below just narrows it to the one order being retried.
    const { data, error } = await supabase
      .from('orders')
      .update({ invoice_pdf_url: invoicePdfUrl })
      .eq('stripe_session_id', stripeSessionId)
      .select('id')
      .maybeSingle();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    if (!data) {
      // Either no such order, or RLS blocked it (not this user's / not an
      // admin) — don't leak which.
      return NextResponse.json({ error: 'Order not found.' }, { status: 404 });
    }

    return NextResponse.json({ invoicePdfUrl });
  } catch (err) {
    console.error('Could not retry invoice:', err);
    return NextResponse.json({ error: 'Could not refresh the invoice right now.' }, { status: 500 });
  }
}
