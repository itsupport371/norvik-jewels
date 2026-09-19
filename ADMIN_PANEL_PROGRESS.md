# Admin Panel + Real Product Catalog — Progress Notes

_Last updated: 19 Sep 2026. Keep this file updated as work continues — it's
the source of truth for "what's done, what's next" across sessions._

## Decision: build a real admin panel (not the fast-manual-import shortcut)

Client said "jo best ho wo karo" for the real-product-catalog rollout. Agreed
plan, phased:

1. **Database schema** — DONE (see below)
2. **Admin login gate** — DONE (see below)
3. Admin UI: product list + add/edit form — NOT STARTED
4. Excel import tool (bulk-create Draft products from an Excel like the
   Rings Vol.1 sheet) — NOT STARTED
5. Photo upload / bulk SKU-matched import — NOT STARTED
6. Switch storefront pages off `lib/mock-products.ts` onto the database,
   Draft/Publish workflow — NOT STARTED

## Phase 1 — Database (Supabase) — DONE

- New `products` table created in Supabase (SQL Editor), matching
  `supabase/migrations/0001_products_schema.sql` in the repo.
- **Important**: an unrelated leftover `products` table already existed in
  this Supabase project (different, camelCase/Prisma-style schema —
  `categoryId`, `collectionId`, `isActive`, etc. — apparently from an old,
  never-wired-up starter template). Confirmed it was empty
  (`select count(*) from products` = 0) and dropped it before creating the
  real one. The migration file already includes `drop table if exists
  products cascade;` at the top, documented with a comment — safe to
  re-run.
- Table stores `metalOptions` / `sizeOptions` / `diamond` / `images` as
  JSONB (not fully normalized) to mirror the existing `Product` type in
  `lib/mock-products.ts` almost 1:1. `status` column is `'draft' |
  'published'` — nothing in this table is customer-visible yet since no
  page reads from it (RLS policy only allows `select` where `status =
  'published'`, and nothing is published).
- **Nothing on the live site changed yet** — `lib/mock-products.ts` is
  still what every page (`app/page.tsx`, `/shop`, `/search`, `/product/[slug]`,
  cart, wishlist, new-arrivals) actually reads from. The new `products`
  table is inert until Phase 6.

## Phase 2 — Admin login gate — DONE

- `lib/supabase/middleware.ts` — added a block that protects any
  `/admin/*` route (except `/admin/login` itself): redirects to
  `/admin/login` unless the signed-in user's email is in the
  `ADMIN_EMAILS` env var (comma-separated allow-list, e.g.
  `itsupport@norvikgold.com`). This is deliberately simple (no DB role
  table) since there are only a couple of internal users.
- `.env` — client added `ADMIN_EMAILS=itsupport@norvikgold.com` locally.
  **Still pending**: same var needs to be added in Vercel (Settings →
  Environment Variables) + a redeploy, for the gate to work in production.
- `app/admin/login/page.tsx` — reuses the existing `AuthForm` component
  (same Supabase email/password sign-in as the customer `/login` page).
  Now also uses the same diamond-halo-ring background photo as
  `/login` and `/signup` (client asked for this Sep 19, so admin login
  doesn't look like a bare/generic internal tool).
- `app/admin/page.tsx` — placeholder dashboard, just confirms the gate
  works end-to-end. **This is the next thing to build out into the real
  product list.**
- Verified working: visiting `localhost:3000/admin` correctly redirects to
  `/admin/login?redirect=%2Fadmin` when not authenticated as an admin.

## Real product data ready to import (Rings Vol. 1)

- Client has an Excel (`Thako mat Thuko Mat Rings Vol.1.xlsx`) with 50 SKUs
  (`M-165` … `M-324`), each mapped to a Norvik SKU (`ILR-0165` … `ILR-0324`).
  Columns: gold weight (18KT, gm), total diamond weight (cts), diamond
  size/count breakdown (round + marquise + pear sub-rows).
- Matching photo folder (client granted access):
  `C:\Users\91972\Downloads\08-09-2026_Pulkit ji_Aanvi Gold\Indian\Rings\Thako Mat Thuko Mat Vol.1\`
  — one sub-folder per SKU, folder name = SKU code exactly (e.g. `M-165\`).
  Each folder has: 1 hero/"Model" shot + 4 photos each for Rose/White/Yellow
  gold (13 JPGs total), plus `.3dm`/`.stl` (3D CAD/manufacturing files —
  **not** used on the website) and one `.png` render.
- Client has since also gotten **product names** for these rings from
  somewhere (mentioned Sep 19) — not yet shared with me/collected into the
  data pipeline. Follow up on this before building the Excel-import
  mapping, since "name" is one of the fields the raw Excel doesn't have.
- Full Excel diamond-breakdown data was already parsed once (round/marquise/
  pear sizes+counts per SKU, all totals cross-checked against the sheet's
  own "Diamond Wt (Cts)" column) — reusable when Phase 4 (Excel importer)
  is actually built; not persisted as a file anywhere yet, so re-parse the
  original Excel if needed rather than assuming it's cached.

## Agreed defaults for this batch (client said "best ho wo karo")

- Making charge %, gold rate, diamond base rate/carat, Color/Clarity %:
  reuse the SAME site-wide placeholder values already in
  `lib/pricing.ts` / `lib/mock-products.ts` — deliberately did NOT invent a
  different number just for these 50 rings (would desync from the rest of
  the catalog). Flagged to client: diamond rate (₹1,00,000/ct) and gold
  rate are shared, global, and affect ALL products already on the site —
  changing them is a separate decision, not scoped to this import.
- Ring sizes: reuse the existing 5–23 (US-style, mm sublabel) run already
  used by "Halo Diamond Ring" in `lib/mock-products.ts`.
- Karat options: offer 18KT (from Excel) + 14KT + 9KT, all 3 colors
  (Yellow/White/Rose) — same `goldWeightGrams` reused across karats,
  matching how the site already handles multi-karat metal options
  elsewhere (it doesn't have per-karat weight data anywhere currently).
- Naming: honest/data-driven default ("Diamond Ring – ILR-0165" style) was
  the fallback plan — now superseded since client says they have real
  names; use those once shared.
- No fake discounts/compareAtPrice, "Made to Order" stock status for all,
  feature the 3–4 highest-diamond-carat designs as Signature Collection.
- Images per product: 1 hero ("Model") + 1 representative photo per metal
  color (4 images total) feeding into `images[]` + `metalImages{}`.

## Open items / next conversation should pick up here

1. Add `ADMIN_EMAILS` to Vercel env vars + redeploy (client hasn't
   confirmed this is done).
2. Get the real product names client mentioned collecting, so Phase 4's
   import mapping can use them instead of the SKU-based fallback.
3. Build Phase 3 (admin product list + add/edit form) — next actual coding
   task once client confirms ready to continue.
4. Then Phase 4 (Excel import) using the Rings Vol.1 file as the real test
   case, Phase 5 (photo matching by SKU folder name), Phase 6 (switch
   storefront reads off the DB + Draft/Publish).
