# Admin Panel + Real Product Catalog — Progress Notes

_Last updated: 22 Sep 2026 (Earrings batch imported). Keep this file updated
as work continues — it's the source of truth for "what's done, what's next"
across sessions._

## Decision: build a real admin panel (not the fast-manual-import shortcut)

Client said "jo best ho wo karo" for the real-product-catalog rollout. Agreed
plan, phased:

1. **Database schema** — DONE
2. **Admin login gate** — DONE (confirmed working on localhost AND production)
3. **Admin UI: product list + add/edit form + Excel import** — DONE (this
   session) — see Phase 3 below. Not yet used for a real import.
4. Photo upload / bulk SKU-matched import into products — DONE
5. Switch storefront pages off `lib/mock-products.ts` onto the database,
   Draft/Publish workflow — DONE (built + pushed, not yet client-tested)

## Phase 1 — Database (Supabase) — DONE

- `products` table created via `supabase/migrations/0001_products_schema.sql`,
  run manually in the Supabase SQL Editor (no Supabase CLI/migration runner
  set up in this project — every migration file here has to be pasted into
  the SQL Editor by hand and run).
- An unrelated leftover `products` table (different, camelCase/Prisma-style
  schema from an old, never-wired-up starter template) already existed in
  this Supabase project — confirmed empty and dropped first. The migration
  file documents this and is safe to re-run on a fresh project.
- `metal_options` / `size_options` / `diamond` / `images` are stored as
  JSONB, mirroring the `Product` type in `lib/mock-products.ts` almost 1:1.
  `status` is `'draft' | 'published'`.
- **Nothing on the live site reads from this table yet** — `lib/mock-products.ts`
  is still what every customer-facing page uses. The table is inert until
  Phase 5.

## Phase 2 — Admin login gate — DONE, verified in both environments

- `lib/supabase/middleware.ts` protects `/admin/*` (except `/admin/login`):
  redirects to login unless the signed-in user's email is in the
  `ADMIN_EMAILS` env var (comma-separated allow-list).
- `.env` (local) has `ADMIN_EMAILS=itsupport@norvikgold.com`. Vercel
  Environment Variables also has it set for Production — **confirmed
  working**, admin login + gate tested successfully on the live site.
- `app/admin/login/page.tsx` reuses `AuthForm`, with the same diamond-halo-
  ring background as `/login` and `/signup` (client asked for this).
- **Deployment gotcha hit and fixed**: after adding `ADMIN_EMAILS`, a
  "Redeploy" was accidentally run against the repo's very first commit
  instead of the latest one, which promoted that ancient/generic build to
  Production (client saw a totally different, unstyled-looking site and
  was confused). Fixed by finding the correct latest `staging`-branch
  deployment in the Vercel Deployments list and using "Promote to
  Production" on that one instead. Lesson: when redeploying, double-check
  which commit/row you're acting on, not just "the top one" — the list can
  reorder.

## Phase 3 — Admin product list, add/edit form, Excel import — DONE (this session)

New files:
- `supabase/migrations/0002_admin_write_policy.sql` — **run this in the
  Supabase SQL Editor before testing Phase 3** (not run yet as of this
  writing). Adds an RLS policy so a signed-in admin (matched by email,
  same list as `ADMIN_EMAILS` — kept in the SQL itself, not read from the
  env var, so keep both lists in sync by hand) can insert/update/delete
  `products` directly from the browser Supabase client. Deliberately
  avoids needing a Supabase **service role key** anywhere (there wasn't
  one in `.env` — only the public anon key — and adding one would've been
  another manual secret to fetch/store/rotate for no real benefit at this
  scale).
- `app/admin/products/page.tsx` — list of all products (Server Component,
  reads via the user's own session), Draft/Published badge, links to
  Excel import and to add/edit.
- `app/admin/products/product-form.tsx` — shared Client Component form
  (used by both New and Edit). Fields: name → auto slug, category,
  manufacturer SKU + Norvik SKU, description, image URLs (plain text, one
  per line — **no file upload UI yet**, see Phase 4), gold weight, diamond
  piece count + carat total, a karat(9/14/18) × color(Yellow/White/Rose)
  checkbox grid that builds `metal_options`, a size mode toggle ("One
  Size" vs the standard ring run 5–25, duplicated here as a local
  constant since `lib/mock-products.ts` doesn't export it), Signature
  Collection checkbox, Draft/Published status, and a live estimated-price
  preview computed with the same `lib/pricing.ts` engine and the same
  shared placeholder rates as the rest of the site (making 12%, diamond
  ₹100000/ct) — deliberately not a separate number.
  - **Important, deliberate design decision**: the form always saves
    `diamond: null` — it does NOT expose the "Diamond Shape/Cut/Carat/
    Certification" customization that `product-configurator.tsx` shows for
    products like "Halo Diamond Ring". That configurator pattern is for a
    *swappable center stone* (solitaire-style); these ready-made pavé/
    cluster ring designs have dozens of small *fixed* stones — there's no
    "customer picks their own diamond" concept for them. To make this
    correct, **`components/product-specifications.tsx`'s `hasDiamond` check
    was changed** from `Boolean(product.diamond) && diamondCaratTotal > 0`
    to just `diamondCaratTotal > 0`, so the spec sheet still correctly
    shows real diamond weight/piece-count facts even with no `diamond`
    config. (Pricing was already fine either way — `diamondCaratTotal`
    feeds `calculatePrice()` directly in both `product-configurator.tsx`
    and `getDisplayPrice()`, never gated on `hasDiamond`.)
- `app/admin/products/new/page.tsx`, `app/admin/products/[id]/edit/page.tsx`
  — thin wrappers around the form (empty vs. fetched-and-reshaped initial
  values).
- `app/admin/products/import/page.tsx` — Excel upload using the `xlsx`
  npm package (added to `package.json` — **`npm install` needs to be run**
  to actually fetch it, nothing here can run npm on the client's machine).
  Parses the same block-structured sheet format as the Rings Vol.1 file
  (one row per SKU with the SKU/Norvik SKU/gold weight/diamond total/name,
  followed by sub-rows of diamond size+count that get summed into
  `diamond_piece_count`), shows a preview table, and bulk-inserts as
  Drafts. Skips rows whose Norvik SKU already exists in the table (safe to
  re-run after fixing missing names). Missing names fall back to
  `"<NORVIK_SKU> Diamond Ring"`.
- `app/admin/page.tsx` — dashboard now links to Products and Import
  instead of just being a placeholder.

**Status as of 27 Aug/19 Sep 2026 session — Phase 3 is now fully done and tested**:
- Migration `0002_admin_write_policy.sql` (admin RLS write policy) — **RUN**,
  confirmed "Success. No rows returned" in Supabase SQL Editor.
- `npm install` — **RUN**, `xlsx` package installed, `npm run dev` restarted
  fine.
- Real import test — **DONE AND SUCCESSFUL**. Client sent an updated Excel
  (`Indian_rings_Name.xlsx`) with all 50 SKUs and, importantly, **all 50
  names now filled in** (the previously-missing M-234/M-235/M-291/M-296
  names were provided by the client in this file). Verified the file
  structure/columns and data completeness before import (no missing names,
  no duplicate/blank Norvik SKUs, no missing gold/diamond data). Uploaded
  via `/admin/products/import` → preview showed all 50 rows correctly →
  clicked "Import 50 as Drafts" → **"Created 50 draft products."** Next: spot-
  check one product via Edit to confirm pricing/metal options/etc. look right.
  - Minor cosmetic note (not a blocker): the SKU column in this file has
    inconsistent spacing, e.g. `M -165` / `M - 166` instead of `M-165`. Doesn't
    affect import, pricing, or the stored `norvik_sku` (which is clean,
    e.g. `ILR-0165`). Will matter for Phase 4 photo-folder matching (folders
    are named exactly `M-165` etc.) — handle then, either by fixing the sheet
    or normalizing whitespace in the matching logic.
- Images: the import created all 50 products with **no images** (empty
  array) — admin has to add image URLs by hand per product via Edit for
  now. Bulk photo upload (matching the `M-165\`-style SKU-named folders to
  Supabase Storage automatically) is Phase 4, not built yet.

## Real product data ready to import (Rings Vol. 1)

- Excel: `Thako mat Thuko Mat Rings Vol.1.xlsx` — 50 SKUs (`M-165` …
  `M-324`) → Norvik SKUs (`ILR-0165` … `ILR-0324`), with gold weight,
  total diamond carat weight, and diamond size/count breakdown per SKU.
- A follow-up version (`...With_NAME.xlsx`, and a second copy
  `..._Name_2.xlsx` which is byte-identical in its name data — client
  likely resent the same file by mistake) added a "Product display name"
  column. **46 of 50 have real names** (e.g. "Whisper Cluster Ring",
  "Orbit Halo Ring") — no duplicates. **4 are still missing a name and
  need to be gotten from the client**:
  - M-234 (ILR-0234)
  - M-235 (ILR-0235)
  - M-291 (ILR-0291)
  - M-296 (ILR-0296)
  Everything else about these 4 (gold weight, diamond data) is complete —
  only the display name is missing. The import tool handles this
  gracefully (placeholder name, easy to rename later), so this does NOT
  block running the import.
- Matching photo folder (access already granted):
  `C:\Users\91972\Downloads\08-09-2026_Pulkit ji_Aanvi Gold\Indian\Rings\Thako Mat Thuko Mat Vol.1\`
  — one sub-folder per SKU, folder name = SKU code exactly (e.g. `M-165\`).
  Each has 1 hero "Model" shot + 4 photos each for Rose/White/Yellow gold,
  plus `.3dm`/`.stl` (3D CAD — not used on the site) and one `.png` render.
  **Not yet wired into the import** — see Phase 4 above.

## Agreed defaults for this batch (client said "best ho wo karo")

- Making charge %, gold rate, diamond base rate/carat, Color/Clarity %:
  reuse the SAME site-wide placeholder values in `lib/pricing.ts` /
  `lib/mock-products.ts` — did not invent different numbers just for these
  50 rings. Diamond rate (₹1,00,000/ct) and gold rate are shared/global —
  changing them is a separate decision affecting the whole catalog, not
  scoped to this import.
- Ring sizes: the existing 5–25 (US-style, mm sublabel) run.
- Karat options: 18KT (from Excel) + 14KT + 9KT, all 3 colors — same
  `goldWeightGrams` reused across karats (matches how the site already
  handles this elsewhere; there's no per-karat weight data anywhere).
- No fake discounts/compareAtPrice, "Made to Order" stock status for all.
  Signature Collection picks are not yet chosen — do this after import,
  from the real 46 names, not before.
- Diamond customization UI: intentionally NOT offered on these pieces (see
  Phase 3 write-up above) — they're fixed designs, not build-your-own.

## Open items / next conversation should pick up here

1. ~~Run `0002_admin_write_policy.sql` in Supabase SQL Editor.~~ **DONE.**
2. ~~Run `npm install` / restart `npm run dev`.~~ **DONE.**
3. ~~Test Phase 3 end-to-end via Excel import.~~ **DONE — 50 drafts created
   successfully from `Indian_rings_Name.xlsx` (all 50 names present).**
4. **NEXT STEP:** open `/admin/products`, pick one imported product, click
   Edit, and spot-check it — name/SKU/Norvik SKU correct, gold weight +
   diamond ct + piece count correct, metal options grid (9/14/18KT ×
   Yellow/White/Rose) all checked, size mode = ring run, status = Draft,
   estimated price preview looks sane. Then browse a few more of the 50 in
   the list view to eyeball names/SKUs at a glance.
5. ~~Get the 4 missing names from the client (M-234/235/291/296).~~ **DONE —
   client's updated file had all 50 names, no placeholders needed.**
6. ~~Phase 4: bulk photo import.~~ **BUILT (20 Sep 2026), not yet run.** New
   files, committed straight to the connected folder on the client's
   computer (not just /home/claude/work — those are also kept in sync as
   the local reference copies):
   - `supabase/migrations/0003_product_images_storage.sql` — **run this in
     the Supabase SQL Editor before using the tool** (not run yet as of
     this writing). Creates a public `product-images` Storage bucket plus
     the same admin-email RLS pattern as `0002_admin_write_policy.sql` (no
     service role key needed — the browser's own client uploads directly).
     `next.config.mjs` already allowlists `*.supabase.co` for `next/image`,
     so no config change was needed there.
   - `app/admin/products/photos/page.tsx` — new "Import Photos" admin page
     (linked from `/admin/products`). Admin picks the manufacturer's whole
     photo folder via a folder picker (`webkitdirectory`); the tool groups
     files by immediate sub-folder name (the SKU, e.g. `M-165`), matches
     each folder to a product by normalizing both sides' SKU (strips all
     whitespace, so `M-165` / `M -165` / `M - 166` all match the same way —
     see the spacing note below), uploads the real photos to
     `product-images` storage under `products/<norvik_sku>/<file>`, and
     writes the resulting URLs onto that product's `images` (full gallery,
     hero shot first) and `metal_images` (one representative photo per
     Yellow/White/Rose — the hero shot doubles as Yellow's since it's shot
     in yellow gold) columns. Filename pattern matched:
     `{SKU}-Model-Yellow.jpg` (hero) and `{SKU}-{Yellow|White|Rose} N.jpg`
     (gallery, N=1-4); `.3dm`/`.stl`/the bare `{SKU}.png` render are
     ignored automatically (no color word in the name). Has a per-folder
     status table (Ready/Unmatched/Uploading/Done/Error) and is safe to
     re-run — storage uploads use `upsert: true` and re-running only
     retries folders that errored or haven't been done yet.
   - `app/admin/products/product-form.tsx` — **bugfix while building this**:
     the Edit form used to always recompute `metal_images` as "every color
     gets `images[0]`" on every save, which would have silently wiped out
     the real per-color photos the very next time someone saved an edit
     (e.g. just fixing a typo in the name) after running the photo import.
     Now it preserves an existing per-color URL as long as that URL is
     still present in the Images field, only falling back to the
     `images[0]` default for a color that doesn't have its own photo yet.
   - `app/admin/products/[id]/edit/page.tsx` — now also loads the row's
     `metal_images` into the form (needed for the bugfix above).
   - `app/admin/products/page.tsx` — added an "Import Photos" button next
     to "Import from Excel".
   - Verified against the real folder structure via the device link before
     writing this (listed `Thako Mat Thuko Mat Vol.1/` — all 50 folders are
     present and cleanly named `M-165` etc. with no spacing issues; the
     spacing inconsistency is only in the Excel `sku` column already stored
     in the DB, not in the folder names — confirmed exact file naming
     inside `M-165/`, `M-234/`, `M-324/` folders matches the pattern coded
     above, 13 real photos + 2-3 CAD/render files per folder).
   - **DONE AND SUCCESSFUL (20 Sep 2026).** Migration run in Supabase SQL
     Editor ("Success. No rows returned"). First run of the tool found one
     naming inconsistency the code didn't yet handle: most SKU folders name
     their numbered shots with a space (`M-165-Rose 1.jpg`) but some (e.g.
     M-218, M-276, and others) use a hyphen instead (`M-218-Rose-1.jpg`) —
     the regex only matched 1 of 13 photos (the hero) for those folders.
     Fixed by widening the separator match from `\s*` to `[\s-]*` in
     `IMAGE_NAME_RE`; verified against every file in all 50 folders
     (fetched a full recursive listing of the photo folder and ran the
     regex offline) before re-running — confirmed all 50 folders now parse
     to exactly 13 photos each, and the only files still correctly excluded
     are the CAD renders (`{SKU}.png`, `{SKU}-Rounds.png/.jpg` — a second,
     unrelated CAD-only render some folders have alongside the main one).
     Re-ran the tool against all 50 folders (883 total files scanned, 650
     photos uploaded, 233 CAD/render files correctly ignored) —
     **"Uploaded photos for 50 products."** Pushed the regex fix straight to
     `app/admin/products/photos/page.tsx` on the client's computer via the
     device link (same as the other Phase 4 files).
   - **Next**: spot-check a product's Edit page (Image URLs pre-filled,
     photo actually loads) and, once satisfied, the product detail page
     itself (metal swatch switching to the right photo) — needs the
     product briefly set to Published, or a signed-in admin preview, since
     drafts aren't visible on the live site yet.
7. ~~Phase 5: switch the storefront (home/shop/search/product page/cart/
   wishlist/new-arrivals) from `lib/mock-products.ts` to reading published
   rows from the `products` table.~~ **BUILT AND PUSHED (21 Sep 2026)** to
   the client's computer via the device link. Triggered by a live 404 on
   `/product/eternal-heart-ring` (a DB-only product) — confirmed by-design
   (Phase 5 hadn't been done yet), then client asked to do it same day.

   **Approach**: server-side fetch + prop-drilling, matching the codebase's
   existing convention (`NewArrivalsRow` already took `products` as a
   prop) — no client-side Context/hook needed. Verified first that RLS
   from `0002_admin_write_policy.sql` already allows public `select` on
   `status = 'published'` rows, so the new server helpers can use the same
   anon-key client, no service role key.

   New file:
   - `lib/products-server.ts` — the single source of truth for server-side
     product fetching from here on. Exports `getAllProductsServer()`,
     `getProductBySlugServer(slug)`, and `getRelatedServer(category, slug)`.
     Each **merges** the static showcase catalogue in `lib/mock-products.ts`
     (kept completely untouched — still the fallback/reference for the
     original 11 products and all shared pricing constants) with real
     `published` rows from Supabase (static wins on a slug collision).
     Only ever import this from a Server Component — Client Components get
     the merged list passed down as a `products` prop instead.

   Modified — pages (all made `async`, added
   `export const dynamic = 'force-dynamic'`, fetch via the helpers above):
   - `app/page.tsx` — home page, passes `products` into `NewArrivalsRow`.
   - `app/product/[slug]/page.tsx` — removed `generateStaticParams` and the
     old static-only `getProductBySlug` lookup; now uses
     `getProductBySlugServer` (404s via `notFound()` only if not found in
     static OR DB) and `getRelatedServer` for "You May Also Like".
   - `app/shop/page.tsx`, `app/search/page.tsx`, `app/wishlist/page.tsx`,
     `app/checkout/page.tsx` — each fetches once and passes `products` down
     to its Client Component.
   - `components/site-header.tsx` — already an async Server Component;
     fetches `products` and passes to `HeaderChrome` (needed for the Shop
     dropdown categories and search-suggestions to include real products).

   Modified — Client Components (each now takes `products: Product[]` as a
   prop instead of importing the static array directly):
   - `components/header-chrome.tsx` — `SHOP_CATEGORIES` is now computed
     from the live `products` prop via `useMemo` instead of being a
     module-level constant; passes `products` down to `SearchTrigger`.
   - `components/search-trigger.tsx`, `components/shop-content.tsx`,
     `components/search-content.tsx`, `components/wishlist-content.tsx`,
     `components/checkout-content.tsx` — same treatment; `checkout-content`
     additionally swaps its old `getProductBySlug(slug)` static lookup for
     `products.find((p) => p.slug === slug)`.

   All 14 files pushed straight to the client's computer via the device
   link (same `SendUserFile` → `device_commit_files` pattern as Phase 4).

   **Not yet done — next conversation should pick up here**:
   - Client needs to restart `npm run dev` to pick up the changes.
   - End-to-end test on the live/local site: home page New Arrivals should
     include real DB products; `/shop` should list and filter them;
     `/product/eternal-heart-ring` (and other DB-only slugs) should load
     with no 404; search should find them by name/category/description;
     header's Shop dropdown should include "Rings" (or whatever categories
     exist in the DB) alongside the static categories; wishlist and
     checkout (`?slug=...` single-item flow) should resolve DB products
     correctly.
   - Specifically re-verify the metal color swatch on a DB product's page
     switches to the correct Yellow/White/Rose photo — this was the
     original unfulfilled Phase 4 verification goal that got deferred when
     the 404 was discovered and Phase 5 took priority.
8. **Excel import tool now handles a second sheet shape (22 Sep 2026)** —
   client sent `Sensual Appeal Vol.1_excel.xlsx` (25 Earrings, SKUs
   ST-251–ST-275), which is NOT laid out like the Rings Vol.1 file:
   - Only one diamond shape (Round: mm size + count), not three
     (Round/Marquise/Pear).
   - Extra columns not used here (Length, Width, Volume, Casting Wt., %
     Reduction).
   - **No "Norvik SKU" column at all** — just Manufacturer SKU
     ("SKU Code") and a display-name column ("Display Earings").
   - `app/admin/products/import/page.tsx` now auto-detects which shape a
     workbook is (checks the header row for the word "Norvik" — present ⇒
     the original "rings-v1" parser; absent ⇒ the new "single-diamond-v1"
     parser) and exposes a **Category** dropdown and **Sizes** (One
     Size / Ring run) choice above the preview table, both defaulted
     sensibly per detected shape (Rings → category Rings, ring-run sizes;
     the new shape → category Earrings, One Size) but editable before
     importing — so future categories with either sheet shape don't need a
     code change, just picking the right category in the UI.
   - Since this shape has no Norvik SKU, the importer **reuses the
     Manufacturer SKU as the Norvik SKU** (e.g. `ST-251` stays `ST-251`
     instead of becoming something like `ILR-0165`). This only affects the
     Supabase Storage folder name used later for photos (Norvik SKU isn't
     used for matching — the photo importer matches by Manufacturer SKU) so
     it's safe, but flagged in the preview table (italic) in case the
     client has their own numbering convention for this category and wants
     it corrected per-product after import.
   - `app/admin/products/product-form.tsx` now exports `CATEGORIES` (was
     module-private) so the import page can reuse the same list instead of
     duplicating it.
   - **DONE AND SUCCESSFUL (22 Sep 2026).** Two bugs found and fixed while
     testing this real file, both in `app/admin/products/import/page.tsx`:
     1. The client's actual file (a slightly newer version than the first
        one sent) turned out to HAVE a "NORVIK SKUS" column after all
        (`IER-0251`…`IER-0275`, one column left of the name column) — the
        first version they'd sent was missing it. Format detection used to
        key off "does the header contain the word Norvik", which routed
        this file to the OLD Rings-shaped positional parser (wrong columns
        entirely for this shape) purely because a Norvik column existed.
        Fixed by detecting format from "Marquise"/"Pear" columns instead
        (a real Rings-only signal), and making `parseSingleDiamondV1` find
        its columns by header TEXT (`findCol()`) rather than a fixed
        position, so it picks up a Norvik SKU column if present and falls
        back to the Manufacturer SKU cleanly if not, regardless of which
        column it's in.
     2. After that fix, `parseWorkbookRows` was still passing
        header-stripped rows into `parseSingleDiamondV1`, which ALSO
        expects (and strips) its own header row — so it was reading the
        blank spacer row as the header, every `findCol()` lookup failed,
        and Name/Gold/Diamond ct silently fell back to blank/0 (SKU and
        Pieces still looked right because those two specifically have a
        positional fallback). Fixed by passing the full `allRows`
        (including the real header) into `parseSingleDiamondV1`, keeping
        `parseRingsV1` on header-stripped rows since it never reads a
        header at all.
     Verified against the real file with a standalone parser simulation
     (Python, mirroring the exact TS logic) before and after each fix,
     confirming all 25 rows resolve correctly, then confirmed again in the
     actual admin UI preview table. Imported — **75 products total now**
     (50 Rings + 25 Earrings), all 25 new ones Draft, category Earrings,
     Norvik SKUs `IER-0251`–`IER-0275`.
   - **Photo import — another filename-convention difference found and
     fixed (22 Sep 2026).** Photo folder:
     `C:\Users\91972\Downloads\08-09-2026_Pulkit ji_Aanvi Gold\Indian\Earrings\Sensual Appeal Vol.1\`
     (granted access this session), one sub-folder per SKU (`ST-251`…
     `ST-275`), same shape as the Rings photo folders. But the Earrings
     files put a **space** before the color word (`ST-251 Rose 1.jpg`)
     instead of Rings' **hyphen** (`M-165-Rose 1.jpg`) — the photo import
     tool's `IMAGE_NAME_RE` in `app/admin/products/photos/page.tsx`
     required a literal hyphen there, so only files matching
     `-Model-Yellow.jpg` (the hero shot, hyphen-prefixed either way) were
     found — every folder showed "1 photo found", and folders with no hero
     shot at all didn't show up as matched. Fixed by widening the
     character class right before the color word from a literal `-` to
     `[\s-]` (space or hyphen), same fix already applied to the *trailing*
     separator (before the photo number) back in Phase 4. Verified against
     the real folder listing (25 folders, 883-ish files) with a regex
     simulation before pushing: folders with a `-Model-Yellow.jpg` hero shot
     resolve to 13 photos, folders without one resolve to 12 (Rose/White/
     Yellow × 4 each) — matches expectation; `-Detail.jpg`,
     `-Rounds-Detail.jpg`, and the CAD files (`.3dm`/`.stl`) stay correctly
     excluded either way.
   - **DONE AND SUCCESSFUL (22 Sep 2026).** Re-ran the tool after the regex
     fix — all 25 folders matched, 12 or 13 photos each as predicted, 152
     CAD/render files correctly ignored. "Uploaded photos for 25 products."
     All 25 Earrings now have real Image URLs and `metal_images` set, cover
     image = ring-only per the 22 Sep cover-image fix (no hand-model shot
     leading the gallery).
   - **Still pending**: the 25 Earrings are still **Draft** — publish them
     (individually via Edit, or the same `update products set status =
     'published' where status = 'draft'` SQL pattern used for the Rings
     batch, once the client is ready to show them live) whenever the client
     wants them on the storefront. No further code changes needed for that
     step.
9. **Pre-Vercel-push cleanup (22 Sep 2026), requested by client after seeing
   the local demo**:
   - **Remove the old static/placeholder products from the live storefront.**
     `lib/products-server.ts` no longer merges in the static `products` array
     from `lib/mock-products.ts` — `getAllProductsServer`,
     `getProductBySlugServer`, and `getRelatedServer` now read ONLY
     `status = 'published'` rows from the database. `lib/mock-products.ts`
     itself is untouched (its `Product` type and shared pricing constants are
     still used everywhere), it's just not shown to shoppers anymore. Header
     categories (`SHOP_CATEGORIES` in `header-chrome.tsx`) will now also only
     reflect real DB categories (i.e. just "Rings" until other categories are
     imported) since they're derived from the same `products` prop.
   - **Cover/thumbnail photo should never be the hand-worn "Model" shot** —
     client wants only the bare ring as the cover image everywhere (shop
     grid, New Arrivals, the metal-color swatch on the product page).
     - `app/admin/products/photos/page.tsx` fixed for future imports: the
       Model hero shot is still uploaded but now pushed to the END of the
       `images` array instead of leading it, and `metal_images` per color is
       now built only from that color's ring-only shots — never the Model
       shot.
     - `supabase/migrations/0004_fix_cover_image_no_hand.sql` — **run this
       in the Supabase SQL Editor** (not run yet as of this writing) to fix
       the 50 rings already imported, without needing to redo the 650-photo
       browser upload. It's a pure data reorder: moves any `-model-` URL in
       each row's existing `images` array to the end, and recomputes
       `metal_images` from the first non-Model URL per color. Safe/idempotent
       to re-run.
   - **Not yet done**: run migration `0004` in Supabase SQL Editor, restart
     `npm run dev`, spot-check a few product pages (cover image = ring only,
     shop grid thumbnails = ring only) before pushing to Vercel.
10. Also still pending from earlier in the project (not urgent): the
   `.scroll-arrow-glow` CSS class on the New Arrivals arrows has no
   matching rule (no glow effect) — client said leave as-is for now;
   Norvik's gold-karat catalog (9/14/18K only, no 22K/Platinum) — also
   leave as-is unless asked.

## Excel import — 3rd manufacturer shape + multi-sheet support (25 Sep 2026)

- New file: `Taka Tak Studs Vol-3Norvik.xlsx` — 100 SKUs total, across
  **two sheets in the same workbook**:
  - `IND-EAR-TUKTUK-FANCY` — 50 stud designs (`ST-51`…`ST-101`, skipping
    ST-94) → Norvik SKUs `IFER-0xx`/`IEFR-0xx`, mixed diamond shapes
    (Round + Marquise and/or Pear per piece), has its own Display name
    column.
  - `Round` — the SAME 50 designs' **all-round-diamond variant**
    (`ST-51-Rounds`…`ST-101-Rounds`) → Norvik SKUs `IERR-0xx`. Round-only,
    no Display name column at all.
  - This is a THIRD manufacturer shape, and the first workbook we've seen
    with more than one product sheet that both need importing.
- `app/admin/products/import/page.tsx` extended:
  - **Multi-sheet**: now reads every sheet in the workbook (used to only
    read `SheetNames[0]`), so a file like this one imports all 100 rows
    from both sheets in one go. Preview table now shows which sheet each
    row came from.
  - **New format `header-driven-v1`** replaces the old `single-diamond-v1`
    — same header-text column lookup approach (not fixed position), but
    now generalized to sum however many "Diamond Count" columns the sheet
    has (1 for a single-shape sheet, 3 for a Round/Marquise/Pear sheet like
    this file's Fancy sheet) instead of assuming exactly one. Format
    detection changed to prefer header text: if the sheet labels its gold
    weight or diamond weight column at all (`findCol` on `'18kt'`/`'gold
    wt'`/`'diamond wt'` etc.), it's `header-driven-v1` regardless of how
    many diamond-shape columns it has — only a sheet with NO such labels
    falls back to the original fixed-position `rings-v1` parser. This
    matters because this file's Fancy sheet has Marquise/Pear columns
    (the old signal for routing to `rings-v1`) but ALSO has extra
    Length/Width/Volume/Casting/Reduction columns before Norvik
    SKU/Display name, which would have made the old fixed-position parser
    (offsets 9/10/11/12) read completely wrong columns — same class of bug
    as the Sensual Appeal Vol.1 import, caught before pushing this time by
    simulating the exact parsing logic in Python against the real file
    first (all 100 rows: correct gold weight, diamond ct, piece count, no
    zeroes, no duplicate/missing Norvik SKUs).
  - **Missing-name fallback for the Round sheet**: since it has no Display
    name column at all, a new `fillMissingNames` pass runs after all sheets
    are parsed — for any row with no name, it strips a trailing
    `-Rounds`/`Rounds` from the SKU, looks for another row elsewhere in the
    workbook with that base SKU, and borrows its name with "(All Diamond)"
    appended (e.g. Fancy's "Petal Trinity Diamond Studs" → Round's "Petal
    Trinity Diamond Studs (All Diamond)"), instead of a generic "<SKU>
    piece" placeholder for all 50 Round rows. Still shown italic/flagged as
    a guess in the preview (not a name the client actually typed) so it's
    easy to spot-check or rename before importing.
  - Verified the new parsing logic compiles clean under `tsc --strict`
    (extracted in isolation) on top of the Python simulation above, before
    pushing — the double round-trip cost of the last two import bugs made
    this worth doing every time now.
- **Client decision (25 Sep 2026): only import the "Round" sheet for now**
  — photos exist only for the all-round-diamond variant, not the Fancy
  (Marquise/Pear) shapes, so importing the Fancy sheet's 50 rows too would
  just create 50 more Drafts nobody can photograph yet.
  - `app/admin/products/import/page.tsx` extended again: when a workbook
    has more than one sheet, a **"Sheets to import" checkbox row** appears
    (one checkbox per sheet, row count shown, all checked by default) —
    uncheck a sheet to exclude just its rows from the preview/Import
    button, without losing it as a name source. This is why the Round
    sheet's "(All Diamond)" borrowed names still work correctly even with
    Fancy unchecked: `fillMissingNames` runs across ALL parsed rows before
    the checkboxes filter anything, so an unchecked sheet can still supply
    a name to a checked one.
  - To do THIS import: upload the file, uncheck
    **`IND-EAR-TUKTUK-FANCY`**, leave **`Round`** checked, Category
    Earrings / Sizes One Size, then Import — should create 50 drafts (not
    100).
  - Caught and fixed a real TypeScript inference bug while building this
    (not just the usual manufacturer-Excel-shape kind): the sheet-checkbox
    list's `sheetNames` array needed an explicit `: string[]` annotation —
    without it, `tsc --strict` failed on the checkbox's `onChange` handler
    with `Argument of type 'unknown' is not assignable to parameter of
    type 'string'` even though the value plainly comes from a
    `.map((r) => r.sheetName)` on a fully-typed array. Found this by
    running the new code through `tsc --noEmit --strict` in isolation
    before pushing (same verification habit as the parsing-logic checks
    above) rather than waiting for `npm run build` to catch it.
- **Client resent a "-Round" version of the file (25 Sep 2026) — do NOT use
  it.** Compared cell-by-cell against the original: the client tried to
  move the Display names from the Fancy sheet into the Round sheet by hand,
  but the paste landed shifted by one row and on the block's SUB-rows
  instead of each SKU's main row — e.g. Round's `ST-51-Rounds` row got the
  right name ("Petal Trinity Diamond Studs") by luck, but the very next
  (sub-)row got "Blossom Whirl Diamond Studs" (that's actually **ST-52's**
  name), `ST-52-Rounds`'s own row got "Triple Drop" (actually **ST-53's**),
  `ST-53-Rounds` came out blank, etc. — every name is off by one design,
  landing on the wrong SKU. The Fancy sheet's names are now blank too (cut
  from there, presumably). Not something to silently auto-correct (risk of
  publishing the wrong name on the wrong product) — told the client in
  plain terms with 3 concrete examples and to just re-upload the
  **original** file instead (it had clean names) and use the new sheet
  checkboxes to keep only Round. No code change needed for this — it's a
  data problem in the client's spreadsheet, not the tool.
- **DONE AND SUCCESSFUL (25 Sep 2026).** Client uploaded the original file,
  unchecked `IND-EAR-TUKTUK-FANCY`, kept `Round` checked, imported 50 as
  Drafts. Products list now shows **125 products** (75 before + these 50).
  All 50 came in as Earrings/Draft with the borrowed "... (All Diamond)"
  names, correct Norvik SKUs (`IERR-051`…`IERR-0101`), and computed prices
  — confirmed via screenshot of the products list.
- **Photo folder located (25 Sep 2026)**:
  `C:\Users\91972\Downloads\08-09-2026_Pulkit ji_Aanvi Gold\Indian\Earrings\Taka Tak Studs Vol.3\`
  — one sub-folder per Round SKU (`ST-51-Rounds` … `ST-101-Rounds`, 50
  folders, access granted). Each folder has the Round variant's 12 real
  photos (4 each Rose/White/Yellow, **no "Model" hero shot in this
  batch**), a Rounds detail shot, Rounds CAD (`.3dm`/`.stl`), PLUS the
  Fancy variant's own bare render/CAD/detail shot alongside it (e.g.
  `ST-51.jpg`, `ST-51.3dm`, `ST-51-Details.jpg`) — harmless, since none of
  those have a color word so `IMAGE_NAME_RE` already skips them, and no
  product exists with the bare `ST-51`-style SKU anyway (Fancy wasn't
  imported).
  - Verified via a full recursive listing fetched offline (Python, before
    touching the live tool): all 50 folders present, 12/12 real photos
    match in 49 of them. **Found and fixed one manufacturer typo**:
    `ST-91-Rounds-Rose 4..jpg` has a double period, which the existing
    `IMAGE_NAME_RE`'s single `\.` didn't match — would have silently
    imported only 3 Rose photos for ST-91 with no error shown anywhere.
    Widened the regex's extension-dot from `\.` to `\.+` in
    `app/admin/products/photos/page.tsx` (verified in Python against every
    filename in the folder first — still correctly excludes Details/CAD/
    bare-render files, still matches every other batch's normal filenames).
  - Folder name matches these 50 products' `sku` column exactly (it *is*
    the Excel SKU, e.g. `ST-51-Rounds`) — no spacing workaround needed this
    time, unlike the Rings batch.
  - **Not yet run** — next step is selecting this folder on
    `/admin/products/photos`; should show all 50 matched, 12 photos each
    (11→12 for ST-91 once the regex fix is picked up). Then publish
    (`update products set status = 'published' where status = 'draft'` for
    these 50, or individually) whenever the client's ready to show them
    live.
  - **DONE (25 Sep 2026)**: photos uploaded successfully for all 50 (one
    retry needed for ST-56-Rounds — a transient HTTP 520 on its last photo,
    fixed by re-clicking "Upload photos", which only retries
    not-yet-`done` folders). All 125 products (Rings + both Earrings
    batches) then published in one go — client asked to publish everything
    at once since the earlier 25-Earrings batch had also been left as Draft
    this whole time. Ran migration `0004_fix_cover_image_no_hand.sql`
    first (was still outstanding — fixes the ORIGINAL 50 Rings' cover image
    only; both Earrings batches already had correct ring/earring-only
    covers from photo-import time), then
    `update products set status = 'published' where status = 'draft';`.

## Client-reported issues, 25 Sep 2026

- **"Images load with a slight delay"** — checked `next/image` usage across
  shop grid / home / product page (`components/shop-content.tsx`,
  `new-arrivals-row.tsx`, `product-configurator.tsx`) and
  `next.config.mjs`: all correctly configured (proper `sizes`, `priority`
  on the main product-page image, avif/webp + Supabase remote pattern
  allowed) — not a code bug. Likely causes explained to the client: (1)
  `next/image` optimizes/converts external images on first request per
  unique size, so the very first view of an image is slower than repeat
  views (cached after); this resets on every new Vercel *Preview* URL,
  which is why testing on ever-changing previews feels slow every time —
  once settled on a stable Production domain this stops happening for
  repeat visitors; (2) the manufacturer photos are uploaded as-is (200—
  500KB, uncompressed/un-resized), so the *original* fetch before
  optimization is heavier than it needs to be. Offered to add an
  automatic resize/compress step to the Import Photos tool — **not yet
  requested**, client is discussing with their client first. Told them
  plainly that **buying a custom domain does NOT by itself fix load
  speed** — it's a DNS/branding change, unrelated to image optimization or
  CDN behavior; a stable Production URL (any URL, not specifically a
  custom one) is what stops the cache-reset behavior in point (1).

- **Mobile header: language/currency switcher hard to find** — it only
  existed in two places: the desktop utility bar (`hidden lg:flex`, so
  completely absent below 1024px) and a chip-list version buried at the
  bottom of the hamburger drawer's link list — needing an extra tap to
  even find it. Fixed in `components/header-chrome.tsx` /
  `components/locale-switcher.tsx`: the same compact "globe · EN · ₹ INR"
  trigger now also renders directly in the main header's icon row
  (alongside search/account/wishlist/cart), shown only below `lg` (`lg:hidden`
  wrapper) so it isn't duplicated once the utility bar takes over at
  1024px+. Below the `sm` breakpoint the text label hides and only the
  globe icon shows (not enough room next to 4 other icons on a phone
  screen) — same dropdown panel opens either way. Removed the now-redundant
  chip-list copy from the drawer. Also widened the dropdown panel's
  `max-w` to never overflow a narrow phone's viewport.

- **Homepage "Shop by Category" wrapped unevenly (6 then 2)** — was
  `flex flex-wrap justify-center`, which breaks purely by however many fit
  per line at the current width, not a fixed count. Changed to a real grid
  in `app/page.tsx`: `grid-cols-2` on phones (4 across was too cramped for
  8 small circle-icons + labels), `sm:grid-cols-4` from tablet width up —
  so the 8 categories now always read as a clean 2×4, matching what the
  client asked for ("4-4 ki rows").
