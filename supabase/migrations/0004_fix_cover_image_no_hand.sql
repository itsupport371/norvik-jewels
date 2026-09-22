-- Norvik Jewels — data fix, 22 Sep 2026
-- Client asked for the cover/thumbnail photo (shop grid, New Arrivals, the
-- metal-color swatch) to always show the ring alone — never the hand-worn
-- "Model" shot from the Phase 4 photo import, which was leading every
-- product's `images` array up to now.
--
-- This is a ONE-TIME DATA FIX for the 50 rings already imported. It does
-- NOT re-upload anything — the photos are already in Supabase Storage from
-- Phase 4. It only reorders/repicks the URLs already stored on each row:
--   - `images`: any URL from a "-model-" file (the hand shot) moves to the
--     END of the array instead of leading it. Nothing is deleted — the
--     Model shot is still in the gallery, just no longer first.
--   - `metal_images`: recomputed per color (yellow/white/rose) from the
--     first non-Model URL for that color, instead of the Model shot.
--
-- The code that builds these fields for any FUTURE photo import
-- (app/admin/products/photos/page.tsx) was fixed in the same session, so
-- this migration only needs to run once, against the products already
-- imported. Safe to re-run — it's idempotent.

update products
set
  images = (
    select coalesce(jsonb_agg(elem order by is_model, ord), images)
    from (
      select elem, ord, (elem ilike '%-model-%') as is_model
      from jsonb_array_elements_text(images) with ordinality as t(elem, ord)
    ) s
  ),
  metal_images = jsonb_strip_nulls(jsonb_build_object(
    'yellow', (
      select elem
      from jsonb_array_elements_text(images) with ordinality as t(elem, ord)
      where elem ilike '%-yellow%' and elem not ilike '%-model-%'
      order by ord
      limit 1
    ),
    'white', (
      select elem
      from jsonb_array_elements_text(images) with ordinality as t(elem, ord)
      where elem ilike '%-white%' and elem not ilike '%-model-%'
      order by ord
      limit 1
    ),
    'rose', (
      select elem
      from jsonb_array_elements_text(images) with ordinality as t(elem, ord)
      where elem ilike '%-rose%' and elem not ilike '%-model-%'
      order by ord
      limit 1
    )
  ))
where images is not null and jsonb_array_length(images) > 0;
