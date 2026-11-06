'use client';

import { useState } from 'react';
import Image from 'next/image';
import { createClient } from '@/lib/supabase/client';

// One-time cleanup tool (6 Nov 2026, client/Neha instruction: "9kt every
// products mein") — same self-service pattern as fix-rose-covers and
// fix-missing-names (RLS-only architecture, no service-role key, so every
// write here runs through the logged-in admin's own Supabase session).
//
// The static showcase catalogue in lib/mock-products.ts already had 9 KT
// made the default (first) metal option for every product directly in
// code — but the REAL, live catalogue's product rows (Supabase `products`
// table, `metal_options` jsonb column) are separate data, written by the
// admin import tool, and were untouched by that code change. This page
// finds every real product whose metal_options[0] (the default shown on
// the product page and used for the listing price) is not a 9 KT option,
// and fixes it:
//   - If a 9 KT option already exists further down that product's list
//     (some do, e.g. "...Rose Gold" 9 KT variants), it's moved to the front
//     — nothing else about it changes.
//   - If the product has no 9 KT option at all, a new one is added at the
//     front, copying the current first option's color/metalColor (so the
//     product photo shown by default doesn't change) with priceModifier 0
//     and stock "In Stock".
// Products that already default to 9 KT are left untouched.

type MetalOption = {
  label: string;
  priceModifier: number;
  stock: string;
  metalColor?: 'yellow' | 'white' | 'rose';
};

type ProductRow = {
  id: string;
  name: string;
  sku: string | null;
  norvik_sku: string | null;
  category: string;
  images: string[] | null;
  metal_options: MetalOption[] | null;
};

const NINE_KT_RE = /^\s*9\s*KT/i;
const KARAT_PREFIX_RE = /^\s*\d+\s*KT\s+(.*)$/i;

type Fix = {
  product: ProductRow;
  before: string;
  after: string;
  newMetalOptions: MetalOption[];
  wasReordered: boolean; // true = an existing 9KT option was moved up; false = a new one was created
};

function computeFix(p: ProductRow): Fix | null {
  const options = p.metal_options ?? [];
  if (options.length === 0) return null;
  if (NINE_KT_RE.test(options[0].label)) return null; // already defaults to 9 KT

  const existingIdx = options.findIndex((o) => NINE_KT_RE.test(o.label));
  if (existingIdx > 0) {
    const reordered = [options[existingIdx], ...options.filter((_, i) => i !== existingIdx)];
    return {
      product: p,
      before: options[0].label,
      after: reordered[0].label,
      newMetalOptions: reordered,
      wasReordered: true,
    };
  }

  const first = options[0];
  const colorMatch = first.label.match(KARAT_PREFIX_RE);
  const colorPart = colorMatch ? colorMatch[1] : first.label; // fallback: reuse whole label if it doesn't match "<N> KT <color>"
  const newOption: MetalOption = {
    label: `9 KT ${colorPart}`,
    priceModifier: 0,
    stock: 'In Stock',
    metalColor: first.metalColor,
  };
  const newMetalOptions = [newOption, ...options];
  return {
    product: p,
    before: first.label,
    after: newOption.label,
    newMetalOptions,
    wasReordered: false,
  };
}

type RowStatus = 'pending' | 'applying' | 'done' | 'error';

export default function FixDefault9ktPage() {
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
        .select('id, name, sku, norvik_sku, category, images, metal_options');
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
          .update({ metal_options: fix.newMetalOptions })
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
      <h1 className="font-display text-2xl text-ink">Make 9 KT the default metal</h1>
      <p className="mt-2 text-sm text-charcoal">
        One-time fix (6 Nov 2026) so every product&apos;s default metal option — the one shown
        first on the product page and used for the listing price — is 9 KT gold. If a product
        already has a 9 KT option further down its list, it&apos;s moved to the front; if it has
        none, a new 9 KT option is added (same color as the current default, so the default photo
        doesn&apos;t change). Products already defaulting to 9 KT are left untouched.
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
          Scanned all products — every one already defaults to 9 KT. Nothing to fix.
        </p>
      )}

      {fixes.length > 0 && (
        <div className="mt-8">
          <p className="text-[13px] text-charcoal">
            Found <strong>{fixes.length}</strong> product{fixes.length === 1 ? '' : 's'} not
            defaulting to 9 KT.
          </p>

          <div className="mt-4 max-h-[36rem] overflow-auto border border-line">
            <table className="w-full text-left text-[13px]">
              <thead className="sticky top-0 bg-softwhite text-[11px] uppercase tracking-[0.08em] text-muted">
                <tr>
                  <th className="px-3 py-2 font-medium">Product</th>
                  <th className="px-3 py-2 font-medium">Before</th>
                  <th className="px-3 py-2 font-medium">After</th>
                  <th className="px-3 py-2 font-medium">How</th>
                  <th className="px-3 py-2 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {fixes.map((f) => {
                  const status = statuses[f.product.id] ?? 'pending';
                  const photo = f.product.images?.[0];
                  return (
                    <tr key={f.product.id}>
                      <td className="flex items-center gap-2 px-3 py-1.5">
                        {photo ? (
                          <div className="relative h-10 w-10 flex-shrink-0 overflow-hidden">
                            <Image src={photo} alt="" fill className="object-cover" sizes="40px" />
                          </div>
                        ) : (
                          <div className="h-10 w-10 flex-shrink-0 bg-scandi" />
                        )}
                        <div>
                          {f.product.name}
                          <div className="font-mono text-[11px] text-muted">
                            {f.product.norvik_sku ?? f.product.sku} · {f.product.category}
                          </div>
                        </div>
                      </td>
                      <td className="px-3 py-1.5">{f.before}</td>
                      <td className="px-3 py-1.5 font-medium text-ink">{f.after}</td>
                      <td className="px-3 py-1.5 text-[12px] text-muted">
                        {f.wasReordered ? 'moved up' : 'added new'}
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
            {running
              ? `Fixing… (${doneCount}/${fixes.length} done)`
              : `Fix ${pendingCount} product${pendingCount === 1 ? '' : 's'}`}
          </button>
        </div>
      )}
    </main>
  );
}
