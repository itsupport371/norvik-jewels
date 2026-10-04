-- Norvik Jewels — Orders table (4 Oct 2026)
-- Client ran a test purchase through the Stripe demo checkout and it never
-- showed up under Account → My Orders — because nothing in this project
-- was ever recording an order anywhere. The Stripe Checkout Session itself
-- is the only record of a completed payment; "My Orders" has been a
-- static "You haven't placed an order yet" placeholder since it was built
-- (see components/account-dashboard.tsx) with no table behind it at all.
--
-- This adds that table. Orders are written from app/checkout/success/page.tsx
-- once a Checkout Session is confirmed complete (see that file for why it's
-- done there and not via a Stripe webhook — no service-role key in this
-- project, by design, so inserts have to go through the signed-in user's
-- own session, same as every other write in this app).
--
-- Guest checkouts (not signed in) are NOT recorded here — there's no
-- user_id to attach them to, and "My Orders" only exists behind the signed-
-- in account pages anyway. A signed-in shopper's test purchase is recorded
-- under their own account, same as a real order would be.

-- Note: an unrelated, pre-existing "orders" table (from a different
-- starter template, same situation as the old "products" table documented
-- in 0001_products_schema.sql) already existed in this Supabase project
-- and was confirmed empty (select count(*) from orders = 0) before being
-- dropped. If you're re-running this on a fresh project where no such
-- table exists, the "drop table" line below is simply a no-op.
drop table if exists orders cascade;

create table orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,

  -- Kept even though user_id already identifies the account — useful for
  -- support/lookup without a join, same reasoning as storing sku/norvik_sku
  -- directly on products instead of only an id.
  email text not null,

  stripe_session_id text,
  items jsonb not null default '[]',   -- [{ name, quantity, amount }]
  total numeric not null default 0,    -- always INR — see create-checkout-session/route.ts
  currency text not null default 'INR',
  status text not null default 'paid' check (status in ('paid', 'refunded', 'cancelled')),
  invoice_pdf_url text,

  created_at timestamptz not null default now()
);

create index orders_user_id_idx on orders (user_id);

-- One order row per Checkout Session — the success page can be hit more
-- than once (refresh, back button), so this is what makes that an upsert
-- instead of a duplicate row each time.
create unique index orders_stripe_session_id_idx on orders (stripe_session_id) where stripe_session_id is not null;

alter table orders enable row level security;

create policy "Users can view their own orders"
  on orders for select
  using (auth.uid() = user_id);

create policy "Users can insert their own orders"
  on orders for insert
  with check (auth.uid() = user_id);
