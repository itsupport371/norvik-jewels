-- Norvik Jewels — Admin Panel foundation, Phase 1
-- Creates the real product catalogue table in Supabase, replacing the
-- hardcoded array in lib/mock-products.ts (that file stays as a fallback /
-- reference for now — nothing reads from this table yet, so running this
-- migration is safe and does not change anything visible on the live site).
--
-- Design choice: metalOptions / sizeOptions / diamond / images are stored as
-- JSONB rather than fully normalized tables. This mirrors the existing
-- Product type in lib/mock-products.ts almost 1:1, which keeps the
-- import/export code simple and is the right level of complexity for a
-- catalogue of a few hundred SKUs. Can be normalized later if it ever needs
-- to be queried/filtered at the option level in SQL.

-- Note: an earlier, unrelated "products" table (from a different starter
-- template — camelCase columns like categoryId/collectionId/isActive, never
-- wired up to this site) already existed in this Supabase project and was
-- confirmed empty (select count(*) from products = 0) before being dropped.
-- If you are re-running this on a fresh project where no such table exists,
-- the "drop table" line below is simply a no-op.
drop table if exists products cascade;

create extension if not exists "pgcrypto";

create table products (
  id uuid primary key default gen_random_uuid(),

  -- Identity
  slug text unique not null,
  name text not null,
  category text not null check (category in (
    'Rings', 'Earrings', 'Pendants', 'Pendant Set', 'Nose Pin',
    'Baby Earrings', 'Tanmaniya', 'Bracelet'
  )),

  -- Source data (from the manufacturer Excel — kept for traceability /
  -- re-import matching, not shown to customers)
  sku text,          -- e.g. "M-165"
  norvik_sku text,   -- e.g. "ILR-0165"

  -- Content
  description text not null default '',
  images jsonb not null default '[]',        -- string[] of image URLs
  metal_images jsonb,                        -- { yellow, white, rose } -> URL

  -- Configurable options (same shape as OptionChoice[] in mock-products.ts)
  metal_options jsonb not null default '[]',
  size_options jsonb not null default '[]',
  diamond jsonb,                              -- DiamondConfig | null

  -- Pricing inputs (fed into the shared lib/pricing.ts engine — never a
  -- hand-typed final price, so it can never drift from the product page)
  gold_weight_grams numeric not null default 0,
  diamond_piece_count integer,
  diamond_carat_total numeric,
  base_price numeric not null default 0,       -- cached display price (see getDisplayPrice)
  compare_at_price numeric,
  currency text not null default '₹',

  is_signature boolean not null default false,

  -- Draft/Publish workflow — see Phase 3/6. A row only appears on the live
  -- site once status = 'published'.
  status text not null default 'draft' check (status in ('draft', 'published')),

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index products_status_idx on products (status);
create index products_category_idx on products (category);
create unique index products_norvik_sku_idx on products (norvik_sku) where norvik_sku is not null;

-- Keep updated_at current on every edit.
create or replace function set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger products_set_updated_at
  before update on products
  for each row execute function set_updated_at();

-- Row Level Security: anyone (including logged-out shoppers) can read
-- published products; writes are blocked from the client entirely — only
-- the admin API routes (using the Supabase service role key, server-side
-- only) can insert/update/delete. This matches how /admin will work: admin
-- pages call our own Next.js API routes, never the browser Supabase client,
-- for anything that changes data.
alter table products enable row level security;

create policy "Published products are publicly readable"
  on products for select
  using (status = 'published');
