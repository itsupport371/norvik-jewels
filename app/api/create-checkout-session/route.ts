import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

export async function POST(req: NextRequest) {
  try {
    const { items, email } = await req.json();

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: 'No items to check out.' }, { status: 400 });
    }

    const secretKey = process.env.STRIPE_SECRET_KEY;
    if (!secretKey) {
      return NextResponse.json(
        { error: 'Payment is not configured yet.' },
        { status: 500 }
      );
    }

    const stripe = new Stripe(secretKey.trim());
    const origin = req.headers.get('origin') || 'http://localhost:3000';

    const line_items = items.map((item: { name: string; price: number; quantity: number }) => ({
      price_data: {
        currency: 'inr',
        product_data: { name: item.name || 'Norvik Jewels item' },
        unit_amount: Math.max(50, Math.round(Number(item.price) * 100)), // paise, min ₹0.50
      },
      quantity: Math.max(1, Math.round(Number(item.quantity) || 1)),
    }));

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      line_items,
      customer_email: typeof email === 'string' && email.trim() ? email.trim() : undefined,
      success_url: `${origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/checkout`,
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error('Stripe error:', err);
    return NextResponse.json(
      { error: 'Something went wrong creating the payment session.' },
      { status: 500 }
    );
  }
}
