-- Norvik Jewels — Admin Dashboard orders read access (10 Oct 2026)
-- The new /admin dashboard shows real revenue/order stats (Total Sales,
-- Orders, Avg Order Value, Customers, Recent Orders) pulled from the
-- `orders` table. But 0005_orders_schema.sql only gave `orders` a
-- customer-facing policy — "Users can view their own orders"
-- (auth.uid() = user_id) — so the admin's own signed-in session, querying
-- through the same anon-key browser/server client as everyone else, would
-- only ever see ITS OWN orders (almost certainly none), not the whole
-- store's. This adds the matching admin-read policy, same pattern/email
-- list as 0002_admin_write_policy.sql on `products` — no service-role key
-- needed, same as every other admin feature in this project.
--
-- IMPORTANT: keep this email list in sync with 0002_admin_write_policy.sql
-- and ADMIN_EMAILS in .env / Vercel. If you add/remove an admin, update
-- all three.

drop policy if exists "Admins can view all orders" on orders;
create policy "Admins can view all orders"
  on orders for select
  using (
    (auth.jwt() ->> 'email') in ('itsupport@norvikgold.com')
  );
