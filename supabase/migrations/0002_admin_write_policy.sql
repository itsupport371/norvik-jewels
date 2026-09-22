-- Norvik Jewels — Admin Panel, Phase 3
-- Lets the admin's own logged-in session write directly to `products`
-- (insert/update/delete), enforced at the database level via RLS — not
-- just the app-level check in lib/supabase/middleware.ts. No service-role
-- key needed anywhere for this: the admin pages use the same browser
-- Supabase client the rest of the site already uses, and Postgres itself
-- checks the signed-in user's email against this list.
--
-- IMPORTANT: keep this email list in sync with ADMIN_EMAILS in .env (and in
-- Vercel's Environment Variables). They're separate on purpose (one is an
-- app-level route gate, this is the database-level backstop), but they
-- should name the same people. If you add/remove an admin, update both.

drop policy if exists "Admins can manage all products" on products;
create policy "Admins can manage all products"
  on products for all
  using (
    (auth.jwt() ->> 'email') in ('itsupport@norvikgold.com')
  )
  with check (
    (auth.jwt() ->> 'email') in ('itsupport@norvikgold.com')
  );
