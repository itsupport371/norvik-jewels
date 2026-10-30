-- Norvik Jewels — Bespoke enquiry page (30 Oct 2026)
-- Content brief ("Ecommerce_Mann_2", 28 Oct 2026) section 7 gated its
-- bespoke CTA/page on "Publish when the bespoke design and enquiry service
-- is available" — client confirmed to go ahead and build it. Same
-- RLS-only pattern as 0007_contact_messages.sql: no service-role key, no
-- email service wired in, so this table IS where a submission actually
-- lands — the admin reads it straight from Supabase, same as contact
-- messages, until/unless a real email pipeline is added later.

create table bespoke_enquiries (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  phone_or_whatsapp text,
  preferred_contact_method text,
  idea text not null,
  occasion text,
  budget text,
  message text,
  created_at timestamptz not null default now()
);

alter table bespoke_enquiries enable row level security;

-- Anyone (including a logged-out visitor) can submit the form.
create policy "Anyone can submit a bespoke enquiry"
  on bespoke_enquiries for insert
  with check (true);

-- Same admin email-allowlist pattern as 0002_admin_write_policy.sql,
-- 0006_admin_orders_select_policy.sql and 0007_contact_messages.sql — keep
-- in sync if admins change.
create policy "Admins can view bespoke enquiries"
  on bespoke_enquiries for select
  using (
    (auth.jwt() ->> 'email') in ('itsupport@norvikgold.com')
  );
