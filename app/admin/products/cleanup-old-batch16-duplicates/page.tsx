'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';

// One-time cleanup tool (20 Nov 2026) — "Batch-16 solitaire earring" ended
// up imported TWICE under two different Norvik SKU schemes:
//
// 1. An earlier import (before this batch had its own "Norvik SKU" column
//    added to the Excel) created 54 draft products with norvik_sku falling
//    back to the raw manufacturer SKU itself (e.g. norvik_sku="ER-16015",
//    sku="ER-16015") — these never got a real name or any photos, so they
//    sat as placeholder "ER-16015 piece" drafts.
// 2. The client then had a "Norvik SKU" column added to the Excel using a
//    brand-new "CEER-NNN" numbering (to avoid exactly this collision), and
//    re-imported — which created 54 NEW products (norvik_sku="CEER-015",
//    same sku="ER-16015", a real name, correct gold weight) alongside the
//    old ones rather than replacing them, since the old rows' norvik_sku
//    didn't match the new CEER values.
//
// Both sets now share the same Manufacturer SKU per design, which broke
// Import Photos' folder matching (app/admin/products/photos/page.tsx's
// trailing-digit fallback deliberately refuses to guess when more than one
// product shares the same SKU, to avoid uploading a photo to the wrong
// product) — every "160NN"-style folder showed 0 matches.
//
// This page finds ONLY the first (old, orphaned) set — a placeholder name
// of the exact form "<SKU> piece", no images uploaded, norvik_sku in the
// old "ER-16NNN" shape — AND only when a CEER-numbered replacement with
// the identical Manufacturer SKU already exists, so it only ever touches a
// row that's a confirmed, superseded duplicate. A product with a real name
// or any photo already set is never matched by this, on purpose.
const OLD_NORVIK_SKU_RE = /^ER-16\d{3}$/i;
const PLACEHOLDER_NAME_RE = /^(.+?)\s+piece$/i;

type ProductRow = {
  id: string;
  name: string;
  sku: string | null;
  norvik_sku: string | null;
  images: string[] | null;
  updated_at: string;
};

function isPlaceholderName(p: ProductRow): boolean {
  const m = p.name.match(PLACEHOLDER_NAME_RE);
  if (!m) return false;
  const expected = (p.norvik_sku || p.sku || '').trim();
  return expected.length > 0 && m[1].trim().toLowerCase() === expected.toLowerCase();
}

function hasNoPhotos(p: ProductRow): boolean {
  return !p.images || p.images.length === 0;
}

type DuplicateRow = ProductRow & { replacementNorvikSku: string };

type DeleteStatus = 'idle' | 'deleting' | 'done' | 'error';

export default function CleanupOldBatch16DuplicatesPage() {
  const [scanning, setScanning] = useState(false);
  const [scanned, setScanned] = useState(false);
  const [duplicates, setDuplicates] = useState<DuplicateRow[]>([]);
  const [statuses, setStatuses] = useState<Record<string, DeleteStatus>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [scanError, setScanError] = useState<string | null>(null);
  const [deletingAll, setDeletingAll] = useState(false);

  async function handleScan() {
    setScanning(true);
    setScanError(null);
    setDuplicates([]);
    setStatuses({});
    setErrors({});
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('products')
        .select('id, name, sku, norvik_sku, images, updated_at');
      if (error) throw new Error(error.message);

      const all = (data ?? []) as ProductRow[];

      // Every product whose own Manufacturer SKU is already claimed by a
      // CEER-numbered product — the confirmed "this old row has a
      // replacement" signal.
      const skuHasCeerReplacement = new Set(
        all
          .filter((p) => (p.norvik_sku || '').toUpperCase().startsWith('CEER-'))
          .map((p) => (p.sku || '').trim().toUpperCase())
          .filter(Boolean)
      );
      const ceerByManufacturerSku = new Map<string, string>();
      for (const p of all) {
        if ((p.norvik_sku || '').toUpperCase().startsWith('CEER-') && p.sku) {
          ceerByManufacturerSku.set(p.sku.trim().toUpperCase(), p.norvik_sku!);
        }
      }

      const found: DuplicateRow[] = all
        .filter(
          (p) =>
            p.norvik_sku &&
            OLD_NORVIK_SKU_RE.test(p.norvik_sku.trim()) &&
            isPlaceholderName(p) &&
            hasNoPhotos(p) &&
            skuHasCeerReplacement.has((p.sku || '').trim().toUpperCase())
        )
        .map((p) => ({
          ...p,
          replacementNorvikSku: ceerByManufacturerSku.get((p.sku || '').trim().toUpperCase()) ?? '',
        }));

      found.sort((a, b) => (a.norvik_sku || '').localeCompare(b.norvik_sku || '', undefined, { numeric: true }));
      setDuplicates(found);
      setScanned(true);
    } catch (err) {
      setScanError(err instanceof Error ? err.message : 'Could not scan products.');
    } finally {
      setScanning(false);
    }
  }

  async function handleDeleteOne(row: DuplicateRow) {
    setStatuses((prev) => ({ ...prev, [row.id]: 'deleting' }));
    try {
      const supabase = createClient();
      const { error } = await supabase.from('products').delete().eq('id', row.id);
      if (error) throw new Error(error.message);
      setStatuses((prev) => ({ ...prev, [row.id]: 'done' }));
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Delete failed.';
      setErrors((prev) => ({ ...prev, [row.id]: message }));
      setStatuses((prev) => ({ ...prev, [row.id]: 'error' }));
    }
  }

  async function handleDeleteAll() {
    setDeletingAll(true);
    const toDelete = duplicates.filter((r) => (statuses[r.id] ?? 'idle') !== 'done');
    for (const row of toDelete) {
      await handleDeleteOne(row);
    }
    setDeletingAll(false);
  }

  const remaining = duplicates.filter((r) => (statuses[r.id] ?? 'idle') !== 'done').length;
  const doneCount = duplicates.filter((r) => statuses[r.id] === 'done').length;

  return (
    <main className="mx-auto max-w-4xl px-6 py-12">
      <h1 className="font-display text-2xl text-ink">Clean up old Batch-16 duplicates</h1>
      <p className="mt-2 text-sm text-charcoal">
        Finds the old, orphaned Batch-16 solitaire earring drafts — placeholder name (e.g.
        &quot;ER-16015 piece&quot;), <strong>no photos</strong>, old-style Norvik SKU — that are now
        duplicated by a newer CEER-numbered product with the same Manufacturer SKU. Only rows
        matching ALL of these are shown; any product with a real name or any photo already set is
        never touched.
      </p>

      <button
        onClick={handleScan}
        disabled={scanning}
        className="mt-6 bg-antiquegold px-6 py-2.5 text-[13px] font-medium uppercase tracking-[0.08em] text-softwhite disabled:opacity-50"
      >
        {scanning ? 'Scanning…' : 'Scan for duplicates'}
      </button>

      {scanError && (
        <p className="mt-4 border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700">
          {scanError}
        </p>
      )}

      {scanned && duplicates.length === 0 && !scanError && (
        <p className="mt-6 border border-green-300 bg-green-50 px-4 py-3 text-[13px] text-green-800">
          Scanned all products — no old Batch-16 duplicates found. Nothing to clean up.
        </p>
      )}

      {duplicates.length > 0 && (
        <div className="mt-8">
          <p className="text-[13px] text-charcoal">
            Found <strong>{duplicates.length}</strong> old duplicate draft
            {duplicates.length === 1 ? '' : 's'} — <strong>{remaining}</strong> left to delete.
          </p>

          {remaining > 0 && (
            <button
              onClick={handleDeleteAll}
              disabled={deletingAll}
              className="mt-4 bg-red-700 px-6 py-2.5 text-[13px] font-medium uppercase tracking-[0.08em] text-softwhite disabled:opacity-50"
            >
              {deletingAll ? 'Deleting…' : `Delete all ${remaining} duplicates`}
            </button>
          )}

          {!deletingAll && doneCount > 0 && (
            <p className="mt-3 text-[13px] text-green-800">Deleted {doneCount} so far.</p>
          )}

          <div className="mt-4 max-h-[32rem] overflow-auto border border-line">
            <table className="w-full text-left text-[13px]">
              <thead className="sticky top-0 bg-softwhite text-[11px] uppercase tracking-[0.08em] text-muted">
                <tr>
                  <th className="px-3 py-2 font-medium">Old Norvik SKU</th>
                  <th className="px-3 py-2 font-medium">Manufacturer SKU</th>
                  <th className="px-3 py-2 font-medium">Name</th>
                  <th className="px-3 py-2 font-medium">Replaced by</th>
                  <th className="px-3 py-2 font-medium">Status</th>
                  <th className="px-3 py-2" />
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {duplicates.map((row) => {
                  const status = statuses[row.id] ?? 'idle';
                  return (
                    <tr key={row.id}>
                      <td className="px-3 py-1.5 font-mono text-[12px]">{row.norvik_sku}</td>
                      <td className="px-3 py-1.5 font-mono text-[12px]">{row.sku}</td>
                      <td className="px-3 py-1.5 italic text-muted">{row.name}</td>
                      <td className="px-3 py-1.5 font-mono text-[12px] text-green-700">
                        {row.replacementNorvikSku}
                      </td>
                      <td className="px-3 py-1.5">
                        {status === 'idle' && <span className="text-charcoal">Pending</span>}
                        {status === 'deleting' && <span className="text-antiquegold">Deleting…</span>}
                        {status === 'done' && <span className="text-green-700">Deleted ✓</span>}
                        {status === 'error' && (
                          <span className="text-red-700">{errors[row.id] ?? 'Error'}</span>
                        )}
                      </td>
                      <td className="px-3 py-1.5 text-right">
                        {status !== 'done' && (
                          <button
                            onClick={() => handleDeleteOne(row)}
                            disabled={status === 'deleting' || deletingAll}
                            className="text-[12px] text-red-700 underline underline-offset-4 disabled:opacity-40"
                          >
                            Delete
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </main>
  );
}
