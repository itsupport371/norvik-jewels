'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';

// One-time cleanup tool (20 Nov 2026) — built right after
// app/admin/products/diagnose-batch16/page.tsx's scan revealed the FULL
// shape of the Batch-16 solitaire earring duplication, which turned out to
// be more than the single old-vs-new duplicate already cleaned up by
// cleanup-old-batch16-duplicates/page.tsx:
//
//   - 16001-16020 and 16045-16054 (30 designs): a REAL product already
//     exists, PUBLISHED, with 13 photos, under an older Norvik SKU scheme
//     ("EER-016NNN" / "SEER-0NN") that predates this session entirely —
//     the client confirmed these should stay exactly as they are. The
//     CEER-0NN draft this session's Excel re-import created for the same
//     design is a pure redundant duplicate (0 photos, never going live).
//   - 16021-16044 (24 designs): NOTHING is published yet — instead THREE
//     separate 0-photo draft rows exist per design, from three different
//     failed/earlier import attempts (an "EER-016NNN piece" or
//     "SEER-0NN piece" placeholder, a row whose norvik_sku is literally
//     the raw manufacturer SKU "ER-16NNN", and this session's CEER-0NN
//     row). The CEER-0NN row is the one worth keeping — it has the
//     client-approved real name AND the gold-weight-formula-bug-fixed
//     figures from this session's corrected Excel — so the other two are
//     redundant too.
//
// Rule applied per Batch-16 number (16001-16054), grouped by the trailing
// digits of Manufacturer SKU / Norvik SKU (same grouping as the diagnose
// tool): if the group has a PUBLISHED product, that one is the keeper and
// every other product in the group is marked for deletion (regardless of
// its own Norvik SKU scheme) — this is what "ye le publish wale rakhne
// hein" (20 Nov 2026) asked for. Otherwise (no published product in the
// group yet) the CEER-numbered product is the keeper, and every other
// draft in that group is marked for deletion. A product with ANY photos
// already uploaded is NEVER marked for deletion, even if the rule above
// would otherwise pick it — belt-and-suspenders on top of the "published
// wins" rule, in case a future re-scan finds a draft that already has
// photos some other way.
const RANGE_START = 16001;
const RANGE_END = 16054;

type ProductRow = {
  id: string;
  name: string;
  sku: string | null;
  norvik_sku: string | null;
  images: string[] | null;
  status: string;
};

function trailingNumber(s: string | null): number | null {
  if (!s) return null;
  const m = s.match(/(\d+)\s*$/);
  return m ? parseInt(m[1], 10) : null;
}

function hasPhotos(p: ProductRow): boolean {
  return Boolean(p.images && p.images.length > 0);
}

type PlanRow = ProductRow & { keep: boolean; reason: string };

type DeleteStatus = 'idle' | 'deleting' | 'done' | 'error';

export default function CleanupBatch16RedundantDraftsPage() {
  const [scanning, setScanning] = useState(false);
  const [scanned, setScanned] = useState(false);
  const [plan, setPlan] = useState<Map<number, PlanRow[]>>(new Map());
  const [statuses, setStatuses] = useState<Record<string, DeleteStatus>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [scanError, setScanError] = useState<string | null>(null);
  const [deletingAll, setDeletingAll] = useState(false);

  async function handleScan() {
    setScanning(true);
    setScanError(null);
    setPlan(new Map());
    setStatuses({});
    setErrors({});
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('products')
        .select('id, name, sku, norvik_sku, images, status');
      if (error) throw new Error(error.message);

      const all = (data ?? []) as ProductRow[];
      const byNumber = new Map<number, ProductRow[]>();
      for (const p of all) {
        const n = trailingNumber(p.sku) ?? trailingNumber(p.norvik_sku);
        if (n === null || n < RANGE_START || n > RANGE_END) continue;
        if (!byNumber.has(n)) byNumber.set(n, []);
        byNumber.get(n)!.push(p);
      }

      const result = new Map<number, PlanRow[]>();
      for (const [n, rows] of byNumber.entries()) {
        if (rows.length <= 1) continue; // nothing to clean up for this number
        const published = rows.find((r) => r.status === 'published');
        const keeperId = published
          ? published.id
          : rows.find((r) => (r.norvik_sku || '').toUpperCase().startsWith('CEER-'))?.id;
        const planRows: PlanRow[] = rows.map((r) => {
          const wouldDelete = r.id !== keeperId;
          const keep = !wouldDelete || hasPhotos(r); // never delete a row that has photos
          const reason = keep
            ? r.id === keeperId
              ? published
                ? 'Keeper — already published'
                : 'Keeper — newest CEER data'
              : 'Has photos — kept for safety'
            : published
              ? 'Redundant draft (published version exists)'
              : 'Redundant draft (superseded by CEER)';
          return { ...r, keep, reason };
        });
        result.set(n, planRows);
      }

      setPlan(result);
      setScanned(true);
    } catch (err) {
      setScanError(err instanceof Error ? err.message : 'Could not scan products.');
    } finally {
      setScanning(false);
    }
  }

  async function handleDeleteOne(row: PlanRow) {
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
    const toDelete = allRows.filter(
      (r) => !r.keep && (statuses[r.id] ?? 'idle') !== 'done'
    );
    for (const row of toDelete) {
      await handleDeleteOne(row);
    }
    setDeletingAll(false);
  }

  const sortedNumbers = Array.from(plan.keys()).sort((a, b) => a - b);
  const allRows = sortedNumbers.flatMap((n) => plan.get(n) ?? []);
  const toDeleteRows = allRows.filter((r) => !r.keep);
  const remaining = toDeleteRows.filter((r) => (statuses[r.id] ?? 'idle') !== 'done').length;
  const doneCount = toDeleteRows.filter((r) => statuses[r.id] === 'done').length;

  return (
    <main className="mx-auto max-w-5xl px-6 py-12">
      <h1 className="font-display text-2xl text-ink">Clean up redundant Batch-16 drafts</h1>
      <p className="mt-2 text-sm text-charcoal">
        For every Batch-16 number (16001-16054) with more than one product: if one of them is
        already <strong>published</strong>, that one is kept untouched and every other copy is
        marked for deletion. Otherwise the <strong>CEER-numbered</strong> draft is kept (this
        session&apos;s corrected data) and the other copies are marked for deletion. Any product
        that already has photos is never deleted, no matter what.
      </p>

      <button
        onClick={handleScan}
        disabled={scanning}
        className="mt-6 bg-antiquegold px-6 py-2.5 text-[13px] font-medium uppercase tracking-[0.08em] text-softwhite disabled:opacity-50"
      >
        {scanning ? 'Scanning…' : 'Scan and build plan'}
      </button>

      {scanError && (
        <p className="mt-4 border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700">
          {scanError}
        </p>
      )}

      {scanned && allRows.length === 0 && !scanError && (
        <p className="mt-6 border border-green-300 bg-green-50 px-4 py-3 text-[13px] text-green-800">
          No duplicate numbers found in the Batch-16 range. Nothing to clean up.
        </p>
      )}

      {allRows.length > 0 && (
        <div className="mt-8">
          <p className="text-[13px] text-charcoal">
            <strong>{sortedNumbers.length}</strong> number(s) had duplicates —{' '}
            <strong>{toDeleteRows.length}</strong> redundant draft(s) to delete,{' '}
            <strong>{remaining}</strong> left.
          </p>

          {remaining > 0 && (
            <button
              onClick={handleDeleteAll}
              disabled={deletingAll}
              className="mt-4 bg-red-700 px-6 py-2.5 text-[13px] font-medium uppercase tracking-[0.08em] text-softwhite disabled:opacity-50"
            >
              {deletingAll ? 'Deleting…' : `Delete all ${remaining} redundant drafts`}
            </button>
          )}

          {!deletingAll && doneCount > 0 && (
            <p className="mt-3 text-[13px] text-green-800">Deleted {doneCount} so far.</p>
          )}

          <div className="mt-4 max-h-[36rem] overflow-auto border border-line">
            <table className="w-full text-left text-[13px]">
              <thead className="sticky top-0 bg-softwhite text-[11px] uppercase tracking-[0.08em] text-muted">
                <tr>
                  <th className="px-3 py-2 font-medium">Number</th>
                  <th className="px-3 py-2 font-medium">Name</th>
                  <th className="px-3 py-2 font-medium">Norvik SKU</th>
                  <th className="px-3 py-2 font-medium">Photos</th>
                  <th className="px-3 py-2 font-medium">Status</th>
                  <th className="px-3 py-2 font-medium">Plan</th>
                  <th className="px-3 py-2 font-medium">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {sortedNumbers.map((n) =>
                  (plan.get(n) ?? []).map((row, i) => {
                    const delStatus = statuses[row.id] ?? 'idle';
                    return (
                      <tr key={row.id} className={row.keep ? '' : 'bg-red-50'}>
                        {i === 0 && (
                          <td
                            className="px-3 py-1.5 font-mono text-[12px] font-semibold"
                            rowSpan={(plan.get(n) ?? []).length}
                          >
                            {n}
                          </td>
                        )}
                        <td className="px-3 py-1.5">{row.name}</td>
                        <td className="px-3 py-1.5 font-mono text-[12px]">{row.norvik_sku}</td>
                        <td className="px-3 py-1.5">{row.images?.length ?? 0}</td>
                        <td className="px-3 py-1.5">{row.status}</td>
                        <td className={'px-3 py-1.5' + (row.keep ? ' text-green-700' : ' text-red-700')}>
                          {row.keep ? `Keep — ${row.reason}` : row.reason}
                        </td>
                        <td className="px-3 py-1.5">
                          {row.keep ? (
                            <span className="text-muted">—</span>
                          ) : delStatus === 'done' ? (
                            <span className="text-green-700">Deleted ✓</span>
                          ) : delStatus === 'deleting' ? (
                            <span className="text-antiquegold">Deleting…</span>
                          ) : delStatus === 'error' ? (
                            <span className="text-red-700">{errors[row.id] ?? 'Error'}</span>
                          ) : (
                            <button
                              onClick={() => handleDeleteOne(row)}
                              disabled={deletingAll}
                              className="text-[12px] text-red-700 underline underline-offset-4 disabled:opacity-40"
                            >
                              Delete
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </main>
  );
}
