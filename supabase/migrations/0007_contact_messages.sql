-- Norvik Jewels — Contact page (10 Oct 2026)
-- Footer's "Contact" link (components/site-footer.tsx) pointed at /contact,
-- which never existed — a dead link. This adds a real Contact page backed
-- by a real table, same RLS-only pattern as every other write in this
-- project (addresses, wishlist, orders) — no service-role key, no email
-- service wired in, so this is where the form's submissions actually land:
-- the admin can read them straight from Supabase (or a future
-- /admin/reviews-style inbox page) until/unless a real email pipeline is
-- added later.

create table contact_messages (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  phone text,
  message text not null,
  created_at timestamptz not null default now()
);

alter table contact_messages enable row level security;

-- Anyone (including a logged-out visitor) can submit the form — a contact
-- form that requires an account first defeats the point of a contact form.
create policy "Anyone can submit a contact message"
  on contact_messages for insert
  with check (true);

-- Same admin email-allowlist pattern as 0002_admin_write_policy.sql and
-- 0006_admin_orders_select_policy.sql — keep in sync if admins change.
create policy "Admins can view contact messages"
  on contact_messages for select
  using (
    (auth.jwt() ->> 'email') in ('itsupport@norvikgold.com')
  );
