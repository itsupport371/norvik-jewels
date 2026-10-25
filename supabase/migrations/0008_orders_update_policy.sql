-- Norvik Jewels — Orders update policy, for retrying a missing invoice link
-- (25 Oct 2026)
-- Root cause of "Download Invoice" sometimes missing: see the big comment on
-- getSessionDetails() in app/checkout/success/page.tsx — Stripe can finish
-- the Checkout Session before the Invoice PDF it asked for is ready, and
-- that page only ever writes the order row once. That page now retries
-- before giving up, fixing this for new orders — but 0005_orders_schema.sql
-- only gave `orders` SELECT and INSERT policies, nothing lets a shopper's
-- own session UPDATE an existing row, so there was no way to backfill an
-- order that already got saved with invoice_pdf_url = null (like the
-- client's own test purchase that surfaced this). This adds that, plus the
-- matching admin policy (same email allow-list as 0006_admin_orders_select_
-- policy.sql), used by the new "Retry invoice" action in My Orders — see
-- app/api/orders/retry-invoice/route.ts.

create policy "Users can update their own orders"
  on orders for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "Admins can update all orders" on orders;
create policy "Admins can update all orders"
  on orders for update
  using (
    (auth.jwt() ->> 'email') in ('itsupport@norvikgold.com')
  )
  with check (
    (auth.jwt() ->> 'email') in ('itsupport@norvikgold.com')
  );
