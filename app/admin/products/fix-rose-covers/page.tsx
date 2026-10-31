'use client';

import { useState } from 'react';
import Image from 'next/image';
import { createClient } from '@/lib/supabase/client';

// One-time cleanup tool (31 Oct 2026) — NOT part of the normal import flow,
// safe to leave in place and re-run any time (it only ever touches products
// it finds the bug on).
//
// The client found, via a live product ("Whisper Cluster Ring"), that
// clicking "Rose Gold" showed a screenshot of the manufacturer's CAD file
// (Matrix for Rhino) instead of a real rose-gold photo. Root cause: every
// "Thako mat Thuko mat Rings" folder (both volumes) has one generic
// design-render export per design, named just "<digits>-r.jpg" (e.g.
// "165-r.jpg") — "r" for "render", not "Rose" — which the photo-import
// tool's filename matching (app/admin/products/photos/page.tsx) used to
// mistake for a no-angle-number Rose photo, making it the stored
// metal_images.rose cover. That regex bug is fixed (see that file's
// BARE_LETTER_RE / EXCLUDED_NAME_RE comments, 31 Oct 2026) so it can't
// happen again on a fresh import — but it already happened for every
// product imported before the fix. A site-wide scan (same filename
// pattern, run against the live product data) found 74 ring products with
// this exact issue, all "ILR-0xxx" SKUs. This page finds and fixes those
// 74 (or however many remain) directly, without re-running the whole photo
// import.
//
// What it does, per affected product:
//   1. Removes the bad "<digits>-r/w/y.jpg" file(s) from Image URLs.
//   2. For any metal color whose cover (metal_images.<color>) pointed at
//      that bad file, repoints it at the first REAL photo of that color
//      still in the gallery (same ordering the import tool itself uses).
// Products with no bad file found are left completely untouched.

const BAD_RENDER_RE = /^\d+-[rwy]\.(jpe?g|png)$/i;

// Mirrors the color-detection half of parseFileName() in
// app/admin/products/photos/page.tsx (kept duplicated rather than shared,
// since that file is a page component, not a library — see its own
// comments for the full history of each pattern below).
const IMAGE_NAME_RE = /[\s-](Model-)?(Yellow|White|Rose)[\s-]*(\d+)?\.+(jpe?g|png)$/i;
const RENDER_LETTER_RE = /-Render-([RWY])(\d+)?\.+(jpe?g|png)$/i;
const BARE_LETTER_RE = /-([RWY])(\d+)\.+(jpe?g|png)$/i; // digit required — see photos/page.tsx, 31 Oct 2026
const LETTER_COLOR: Record<string, 'yellow' | 'white' | 'rose'> = { r: 'rose', w: 'white', y: 'yellow' };

function basename(url: string): string {
  try {
    return decodeURIComponent(url.split('/').pop() || '');
  } catch {
    return url.split('/').pop() || '';
  }
}

function colorOf(filename: string): 'yellow' | 'white' | 'rose' | null {
  if (BAD_RENDER_RE.test(filename)) return null;
  const m = filename.match(IMAGE_NAME_RE);
  if (m) return m[2].toLowerCase() as 'yellow' | 'white' | 'rose';
  const rm = filename.match(RENDER_LETTER_RE);
  if (rm) return LETTER_COLOR[rm[1].toLowerCase()];
  const bm = filename.match(BARE_LETTER_RE);
  if (bm) return LETTER_COLOR[bm[1].toLowerCase()];
  return null;
}

type MetalImages = Record<string, string>;

type ProductRow = {
  id: string;
  name: string;
  sku: string | null;
  norvik_sku: string | null;
  images: string[] | null;
  metal_images: MetalImages | null;
};

type Fix = {
  product: ProductRow;
  badUrls: string[];
  newImages: string[];
  newMetalImages: MetalImages;
  changedColors: { color: string; oldUrl: string; newUrl: string | null }[];
};

function computeFix(p: ProductRow): Fix | null {
  const images = p.images ?? [];
  const badUrls = images.filter((u) => BAD_RENDER_RE.test(basename(u)));
  if (badUrls.length === 0) return null;

  const newImages = images.filter((u) => !badUrls.includes(u));
  const newMetalImages: MetalImages = { ...(p.metal_images ?? {}) };
  const changedColors: Fix['changedColors'] = [];

  for (const bad of badUrls) {
    const m = basename(bad).match(/^\d+-([rwy])\./i);
    const letter = m ? m[1].toLowerCase() : null;
    const color = letter ? LETTER_COLOR[letter] : null;
    if (!color) continue;
    if (newMetalImages[color] === bad) {
      const replacement = newImages.find((u) => colorOf(basename(u)) === color) ?? null;
      changedColors.push({ color, oldUrl: bad, newUrl: replacement });
      if (replacement) {
        newMetalImages[color] = replacement;
      } else {
        delete newMetalImages[color];
      }
    }
  }

  return { product: p, badUrls, newImages, newMetalImages, changedColors };
}

type RowStatus = 'pending' | 'applying' | 'done' | 'error';

export default function FixRoseCoversPage() {
  const [scanning, setScanning] = useState(false);
  const [scanned, setScanned] = useState(false);
  const [fixes, setFixes] = useState<Fix[]>([]);
  const [statuses, setStatuses] = useState<Record<string, RowStatus>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [running, setRunning] = useState(false);
  const [scanError, setScanError] = useState<string | null>(null);

  async function handleScan() {
    setScanning(true);
    setScanError(null);
    setFixes([]);
    setStatuses({});
    setErrors({});
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('products')
        .select('id, name, sku, norvik_sku, images, metal_images');
      if (error) throw new Error(error.message);

      const found: Fix[] = [];
      for (const row of (data ?? []) as ProductRow[]) {
        const fix = computeFix(row);
        if (fix) found.push(fix);
      }
      found.sort((a, b) => a.product.name.localeCompare(b.product.name));
      setFixes(found);
      setScanned(true);
    } catch (err) {
      setScanError(err instanceof Error ? err.message : 'Could not scan products.');
    } finally {
      setScanning(false);
    }
  }

  async function handleFixAll() {
    setRunning(true);
    const supabase = createClient();
    for (const fix of fixes) {
      setStatuses((prev) => ({ ...prev, [fix.product.id]: 'applying' }));
      try {
        const { error } = await supabase
          .from('products')
          .update({ images: fix.newImages, metal_images: fix.newMetalImages })
          .eq('id', fix.product.id);
        if (error) throw new Error(error.message);
        setStatuses((prev) => ({ ...prev, [fix.product.id]: 'done' }));
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Update failed.';
        setErrors((prev) => ({ ...prev, [fix.product.id]: message }));
        setStatuses((prev) => ({ ...prev, [fix.product.id]: 'error' }));
      }
    }
    setRunning(false);
  }

  const pendingCount = fixes.filter((f) => statuses[f.product.id] !== 'done').length;
  const doneCount = fixes.filter((f) => statuses[f.product.id] === 'done').length;

  return (
    <main className="mx-auto max-w-5xl px-6 py-12">
      <h1 className="font-display text-2xl text-ink">Fix CAD-render metal covers</h1>
      <p className="mt-2 text-sm text-charcoal">
        One-time cleanup for the &quot;165-r.jpg&quot;-style design-render files that got
        uploaded as if they were real color photos (see the client-facing &quot;Whisper Cluster
        Ring&quot; rose-gold issue, 31 Oct 2026). Scans every product, finds any still carrying one
        of these files, and removes it — repointing that metal color&apos;s cover photo to the
        first real photo of that color still in the gallery. Products with nothing wrong are left
        untouched.
      </p>

      <button
        onClick={handleScan}
        disabled={scanning || running}
        className="mt-6 bg-antiquegold px-6 py-2.5 text-[13px] font-medium uppercase tracking-[0.08em] text-softwhite disabled:opacity-50"
      >
        {scanning ? 'Scanning…' : 'Scan all products'}
      </button>

      {scanError && (
        <p className="mt-4 border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700">
          {scanError}
        </p>
      )}

      {scanned && fixes.length === 0 && !scanError && (
        <p className="mt-6 border border-green-300 bg-green-50 px-4 py-3 text-[13px] text-green-800">
          Scanned all products — none have the bad render-file issue. Nothing to fix.
        </p>
      )}

      {fixes.length > 0 && (
        <div className="mt-8">
          <p className="text-[13px] text-charcoal">
            Found <strong>{fixes.length}</strong> product{fixes.length === 1 ? '' : 's'} with the
            issue.
          </p>

          <div className="mt-4 max-h-[36rem] overflow-auto border border-line">
            <table className="w-full text-left text-[13px]">
              <thead className="sticky top-0 bg-softwhite text-[11px] uppercase tracking-[0.08em] text-muted">
                <tr>
                  <th className="px-3 py-2 font-medium">Product</th>
                  <th className="px-3 py-2 font-medium">Bad file(s)</th>
                  <th className="px-3 py-2 font-medium">Cover fixed</th>
                  <th className="px-3 py-2 font-medium">New cover</th>
                  <th className="px-3 py-2 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {fixes.map((f) => {
                  const status = statuses[f.product.id] ?? 'pending';
                  return (
                    <tr key={f.product.id}>
                      <td className="px-3 py-1.5">
                        {f.product.name}
                        <div className="font-mono text-[11px] text-muted">
                          {f.product.norvik_sku ?? f.product.sku}
                        </div>
                      </td>
                      <td className="px-3 py-1.5 font-mono text-[11px]">
                        {f.badUrls.map((u) => basename(u)).join(', ')}
                      </td>
                      <td className="px-3 py-1.5">
                        {f.changedColors.length === 0
                          ? '—'
                          : f.changedColors.map((c) => c.color).join(', ')}
                      </td>
                      <td className="px-3 py-1.5">
                        {f.changedColors.map((c) =>
                          c.newUrl ? (
                            <div key={c.color} className="relative mr-1 inline-block h-10 w-10 align-middle">
                              <Image
                                src={c.newUrl}
                                alt={`New ${c.color} cover`}
                                fill
                                className="object-cover"
                                sizes="40px"
                              />
                            </div>
                          ) : (
                            <span key={c.color} className="italic text-amber-700">
                              no {c.color} photo left — cover removed
                            </span>
                          )
                        )}
                      </td>
                      <td className="px-3 py-1.5">
                        {status === 'pending' && <span className="text-charcoal">Ready</span>}
                        {status === 'applying' && <span className="text-antiquegold">Applying…</span>}
                        {status === 'done' && <span className="text-green-700">Fixed ✓</span>}
                        {status === 'error' && (
                          <span className="text-red-700">{errors[f.product.id] ?? 'Error'}</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <button
            onClick={handleFixAll}
            disabled={running || pendingCount === 0}
            className="mt-6 bg-antiquegold px-6 py-2.5 text-[13px] font-medium uppercase tracking-[0.08em] text-softwhite disabled:opacity-50"
          >
            {running ? `Fixing… (${doneCount}/${fixes.length} done)` : `Fix ${pendingCount} product${pendingCount === 1 ? '' : 's'}`}
          </button>
        </div>
      )}
    </main>
  );
}
