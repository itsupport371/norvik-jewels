-- Norvik Jewels — Admin Panel, Phase 4
-- Storage bucket + RLS for bulk product photo import via
-- /admin/products/photos. Same admin-email-based RLS pattern as
-- 0002_admin_write_policy.sql — no service role key needed anywhere, the
-- browser's own Supabase client (anon key + the signed-in admin's session)
-- can upload directly, same as the Excel import already does for the
-- `products` table.
--
-- Bucket is public (public read) because product photos need to be shown
-- to logged-out shoppers on the live site — same visibility model as the
-- static files already in /public/images, just served from Storage instead.
--
-- IMPORTANT: keep the email list here in sync with
-- 0002_admin_write_policy.sql and ADMIN_EMAILS (.env / Vercel). If you
-- add/remove an admin, update all three.

insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do nothing;

drop policy if exists "Public can view product images" on storage.objects;
create policy "Public can view product images"
  on storage.objects for select
  using (bucket_id = 'product-images');

drop policy if exists "Admins can upload product images" on storage.objects;
create policy "Admins can upload product images"
  on storage.objects for insert
  with check (
    bucket_id = 'product-images'
    and (auth.jwt() ->> 'email') in ('itsupport@norvikgold.com')
  );

drop policy if exists "Admins can update product images" on storage.objects;
create policy "Admins can update product images"
  on storage.objects for update
  using (
    bucket_id = 'product-images'
    and (auth.jwt() ->> 'email') in ('itsupport@norvikgold.com')
  )
  with check (
    bucket_id = 'product-images'
    and (auth.jwt() ->> 'email') in ('itsupport@norvikgold.com')
  );

drop policy if exists "Admins can delete product images" on storage.objects;
create policy "Admins can delete product images"
  on storage.objects for delete
  using (
    bucket_id = 'product-images'
    and (auth.jwt() ->> 'email') in ('itsupport@norvikgold.com')
  );
