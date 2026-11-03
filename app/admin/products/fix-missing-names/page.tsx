'use client';

import { useState } from 'react';
import Image from 'next/image';
import { createClient } from '@/lib/supabase/client';

// One-time cleanup tool (3 Nov 2026) — client reported product cards
// showing a SKU instead of a real name (e.g. "EPS-01237 piece") on the live
// site. Root cause: app/admin/products/import/page.tsx's fillMissingNames()
// falls back to `${norvikSku || sku} piece` when a sheet row has no Display
// Name column and no matching row elsewhere in the workbook to borrow one
// from (see that file's comments, ~line 440-484) — the import preview flags
// these as `hasName: false` so they can be corrected before import, but
// these 15 (ER-4xx Earrings + EPS-012xx/IER-04xx Pendants & Earrings) made
// it through to the live catalogue with the placeholder still attached.
//
// Not safe to "auto-fix" the way fix-rose-covers is — there's no
// deterministic correct name to compute from the data on hand, only the
// client's own records know what each design is actually called. This page
// finds every product still carrying the exact fallback shape and lets her
// type the real name in next to each one, saved individually as she goes
// (not a blind "fix all", since every row needs a different typed answer).
const FALLBACK_NAME_RE = /^(.+)\s+piece$/i;

type ProductRow = {
  id: string;
  name: string;
  sku: string | null;
  norvik_sku: string | null;
  category: string;
  images: string[] | null;
};

function isFallbackName(p: ProductRow): boolean {
  const m = p.name.match(FALLBACK_NAME_RE);
  if (!m) return false;
  const expected = (p.norvik_sku || p.sku || '').trim();
  return expected.length > 0 && m[1].trim().toLowerCase() === expected.toLowerCase();
}

type RowStatus = 'idle' | 'saving' | 'done' | 'error';

export default function FixMissingNamesPage() {
  const [scanning, setScanning] = useState(false);
  const [scanned, setScanned] = useState(false);
  const [rows, setRows] = useState<ProductRow[]>([]);
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [statuses, setStatuses] = useState<Record<string, RowStatus>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [scanError, setScanError] = useState<string | null>(null);

  async function handleScan() {
    setScanning(true);
    setScanError(null);
    setRows([]);
    setDrafts({});
    setStatuses({});
    setErrors({});
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('products')
        .select('id, name, sku, norvik_sku, category, images');
      if (error) throw new Error(error.message);

      const found = ((data ?? []) as ProductRow[]).filter(isFallbackName);
      found.sort((a, b) => (a.norvik_sku || a.sku || '').localeCompare(b.norvik_sku || b.sku || ''));
      setRows(found);
      setScanned(true);
    } catch (err) {
      setScanError(err instanceof Error ? err.message : 'Could not scan products.');
    } finally {
      setScanning(false);
    }
  }

  async function handleSave(row: ProductRow) {
    const newName = (drafts[row.id] ?? '').trim();
    if (!newName) return;
    setStatuses((prev) => ({ ...prev, [row.id]: 'saving' }));
    try {
      const supabase = createClient();
      const { error } = await supabase.from('products').update({ name: newName }).eq('id', row.id);
      if (error) throw new Error(error.message);
      setStatuses((prev) => ({ ...prev, [row.id]: 'done' }));
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Save failed.';
      setErrors((prev) => ({ ...prev, [row.id]: message }));
      setStatuses((prev) => ({ ...prev, [row.id]: 'error' }));
    }
  }

  const remaining = rows.filter((r) => statuses[r.id] !== 'done').length;

  return (
    <main className="mx-auto max-w-4xl px-6 py-12">
      <h1 className="font-display text-2xl text-ink">Fix missing product names</h1>
      <p className="mt-2 text-sm text-charcoal">
        Finds products whose name is still the import tool&apos;s placeholder (e.g. &quot;EPS-01237
        piece&quot;) instead of a real design name — these slipped through without being corrected
        during import. Type the real name next to each one and save it; there&apos;s no way to guess
        these automatically, so each row is saved on its own as you fill it in.
      </p>

      <button
        onClick={handleScan}
        disabled={scanning}
        className="mt-6 bg-antiquegold px-6 py-2.5 text-[13px] font-medium uppercase tracking-[0.08em] text-softwhite disabled:opacity-50"
      >
        {scanning ? 'Scanning…' : 'Scan all products'}
      </button>

      {scanError && (
        <p className="mt-4 border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700">
          {scanError}
        </p>
      )}

      {scanned && rows.length === 0 && !scanError && (
        <p className="mt-6 border border-green-300 bg-green-50 px-4 py-3 text-[13px] text-green-800">
          Scanned all products — none still have a placeholder name. Nothing to fix.
        </p>
      )}

      {rows.length > 0 && (
        <div className="mt-8">
          <p className="text-[13px] text-charcoal">
            Found <strong>{rows.length}</strong> product{rows.length === 1 ? '' : 's'} with a
            placeholder name — <strong>{remaining}</strong> left to fix.
          </p>

          <div className="mt-4 divide-y divide-line border border-line">
            {rows.map((row) => {
              const status = statuses[row.id] ?? 'idle';
              const photo = row.images?.[0];
              return (
                <div key={row.id} className="flex items-center gap-4 px-4 py-3">
                  {photo ? (
                    <div className="relative h-14 w-14 flex-shrink-0 overflow-hidden">
                      <Image src={photo} alt={row.name} fill className="object-cover" sizes="56px" />
                    </div>
                  ) : (
                    <div className="h-14 w-14 flex-shrink-0 bg-scandi" />
                  )}

                  <div className="w-32 flex-shrink-0">
                    <p className="font-mono text-[12px] text-charcoal">
                      {row.norvik_sku ?? row.sku}
                    </p>
                    <p className="text-[11px] text-muted">{row.category}</p>
                  </div>

                  <input
                    value={drafts[row.id] ?? ''}
                    onChange={(e) =>
                      setDrafts((prev) => ({ ...prev, [row.id]: e.target.value }))
                    }
                    placeholder="Type the real product name"
                    disabled={status === 'saving' || status === 'done'}
                    className="flex-1 border border-line bg-ivory px-3 py-2 text-[13px] text-ink outline-none focus:border-ink disabled:opacity-60"
                  />

                  <button
                    onClick={() => handleSave(row)}
                    disabled={!drafts[row.id]?.trim() || status === 'saving' || status === 'done'}
                    className="flex-shrink-0 bg-antiquegold px-4 py-2 text-[11px] font-medium uppercase tracking-[0.08em] text-softwhite disabled:opacity-40"
                  >
                    {status === 'saving' ? 'Saving…' : status === 'done' ? 'Saved ✓' : 'Save'}
                  </button>

                  {status === 'error' && (
                    <span className="flex-shrink-0 text-[11px] text-red-700">{errors[row.id]}</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </main>
  );
}
