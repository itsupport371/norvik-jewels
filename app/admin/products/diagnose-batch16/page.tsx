'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';

// Read-only diagnostic (20 Nov 2026) — Import Photos still shows 0 matched
// for every "160NN"-numbered folder (both Export\Batch-16 and
// Complementry\Export\Batch-16) even after the obvious old-vs-new
// duplicate drafts were cleaned up. Rather than guess again, this lists
// every product whose Manufacturer SKU or Norvik SKU ends in a
// Batch-16-range number (16001-16054), grouped by that trailing number, so
// it's immediately visible whether a number still has more than one
// product attached to it (which is exactly what blocks the photos tool's
// trailing-digit fallback — see app/admin/products/photos/page.tsx).
const RANGE_START = 16001;
const RANGE_END = 16054;

type ProductRow = {
  id: string;
  name: string;
  sku: string | null;
  norvik_sku: string | null;
  images: string[] | null;
  status: string;
  updated_at: string;
};

function trailingNumber(s: string | null): number | null {
  if (!s) return null;
  const m = s.match(/(\d+)\s*$/);
  return m ? parseInt(m[1], 10) : null;
}

export default function DiagnoseBatch16Page() {
  const [scanning, setScanning] = useState(false);
  const [scanned, setScanned] = useState(false);
  const [groups, setGroups] = useState<Map<number, ProductRow[]>>(new Map());
  const [scanError, setScanError] = useState<string | null>(null);

  async function handleScan() {
    setScanning(true);
    setScanError(null);
    setGroups(new Map());
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('products')
        .select('id, name, sku, norvik_sku, images, status, updated_at');
      if (error) throw new Error(error.message);

      const all = (data ?? []) as ProductRow[];
      const byNumber = new Map<number, ProductRow[]>();
      for (const p of all) {
        const n = trailingNumber(p.sku) ?? trailingNumber(p.norvik_sku);
        if (n === null || n < RANGE_START || n > RANGE_END) continue;
        if (!byNumber.has(n)) byNumber.set(n, []);
        byNumber.get(n)!.push(p);
      }
      setGroups(byNumber);
      setScanned(true);
    } catch (err) {
      setScanError(err instanceof Error ? err.message : 'Could not scan products.');
    } finally {
      setScanning(false);
    }
  }

  const sortedNumbers = Array.from(groups.keys()).sort((a, b) => a - b);
  const missingNumbers: number[] = [];
  for (let n = RANGE_START; n <= RANGE_END; n++) {
    if (!groups.has(n)) missingNumbers.push(n);
  }
  const collisionNumbers = sortedNumbers.filter((n) => (groups.get(n) ?? []).length > 1);

  return (
    <main className="mx-auto max-w-5xl px-6 py-12">
      <h1 className="font-display text-2xl text-ink">Diagnose Batch-16 SKU numbers (read-only)</h1>
      <p className="mt-2 text-sm text-charcoal">
        Lists every product whose Manufacturer SKU or Norvik SKU ends in 16001-16054, grouped by
        that number — so it&apos;s immediately visible which numbers have more than one product
        attached (that&apos;s what breaks Import Photos&apos; folder matching) or none at all. Makes
        no changes.
      </p>

      <button
        onClick={handleScan}
        disabled={scanning}
        className="mt-6 bg-antiquegold px-6 py-2.5 text-[13px] font-medium uppercase tracking-[0.08em] text-softwhite disabled:opacity-50"
      >
        {scanning ? 'Scanning…' : 'Scan 16001-16054'}
      </button>

      {scanError && (
        <p className="mt-4 border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700">
          {scanError}
        </p>
      )}

      {scanned && (
        <div className="mt-8">
          <p className="text-[13px] text-charcoal">
            <strong>{collisionNumbers.length}</strong> number(s) have more than one product.{' '}
            <strong>{missingNumbers.length}</strong> number(s) have no product at all.
          </p>

          {missingNumbers.length > 0 && (
            <p className="mt-2 text-[12px] text-amber-700">
              Missing: {missingNumbers.join(', ')}
            </p>
          )}

          <div className="mt-4 max-h-[36rem] overflow-auto border border-line">
            <table className="w-full text-left text-[13px]">
              <thead className="sticky top-0 bg-softwhite text-[11px] uppercase tracking-[0.08em] text-muted">
                <tr>
                  <th className="px-3 py-2 font-medium">Number</th>
                  <th className="px-3 py-2 font-medium"># products</th>
                  <th className="px-3 py-2 font-medium">Name</th>
                  <th className="px-3 py-2 font-medium">Manufacturer SKU</th>
                  <th className="px-3 py-2 font-medium">Norvik SKU</th>
                  <th className="px-3 py-2 font-medium">Photos</th>
                  <th className="px-3 py-2 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {sortedNumbers.map((n) => {
                  const rows = groups.get(n) ?? [];
                  const collision = rows.length > 1;
                  return rows.map((p, i) => (
                    <tr key={p.id} className={collision ? 'bg-red-50' : ''}>
                      {i === 0 && (
                        <td
                          className="px-3 py-1.5 font-mono text-[12px] font-semibold"
                          rowSpan={rows.length}
                        >
                          {n}
                        </td>
                      )}
                      {i === 0 && (
                        <td
                          className={'px-3 py-1.5 font-mono text-[12px]' + (collision ? ' text-red-700 font-semibold' : '')}
                          rowSpan={rows.length}
                        >
                          {rows.length}
                        </td>
                      )}
                      <td className="px-3 py-1.5">{p.name}</td>
                      <td className="px-3 py-1.5 font-mono text-[12px]">{p.sku}</td>
                      <td className="px-3 py-1.5 font-mono text-[12px]">{p.norvik_sku}</td>
                      <td className="px-3 py-1.5">{p.images?.length ?? 0}</td>
                      <td className="px-3 py-1.5">{p.status}</td>
                    </tr>
                  ));
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </main>
  );
}
