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
// these made it through to the live catalogue with the placeholder still
// attached. Scanning the live site found 163 of them, not the much smaller
// number first estimated from one page of products — client flagged that
// typing 163 names by hand isn't realistic, and that the real names already
// exist in the Excel she originally uploaded.
//
// So instead of pure manual entry, step 2 below lets her re-upload that
// same Excel (or any workbook with a SKU + name column) directly in the
// browser — parsed client-side with the `xlsx` package already used by
// app/admin/products/import/page.tsx, same general idea — and matches rows
// to the placeholder products by SKU / Norvik SKU. Matched rows are
// pre-filled (still editable) so applying them is one click instead of 163
// typed answers; only genuine stragglers (no name in the sheet either) need
// typing. This is a separate, simpler parser than the import tool's own —
// it only needs a SKU->name map, not full gold/diamond/pricing parsing — so
// it doesn't carry (or need) that file's many batch-specific quirks.
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

function normalizeSku(v: string): string {
  return v.trim().toLowerCase().replace(/\s+/g, ' ');
}

function normalizeHeader(cell: unknown): string | null {
  if (typeof cell !== 'string') return null;
  return cell.toLowerCase().replace(/\s+/g, ' ').trim();
}

// Builds a SKU -> name lookup from every sheet in the uploaded workbook.
// Deliberately generic rather than tuned to one batch's column layout: any
// header containing "name" is treated as a name column, any header
// containing "sku" as a SKU column — and column 0 is always tried too,
// since several of the import tool's own batches (see its comments) carry
// an unlabeled manufacturer-SKU column there. Every SKU-like cell found in
// a row maps to that row's name, so matching works regardless of whether
// the sheet's SKU column is labelled "SKU", "SKU Code", or "Norvik SKU".
function buildNameLookup(workbook: import('xlsx').WorkBook, XLSX: typeof import('xlsx')): Map<string, string> {
  const lookup = new Map<string, string>();
  for (const sheetName of workbook.SheetNames) {
    const sheet = workbook.Sheets[sheetName];
    const sheetRows = XLSX.utils.sheet_to_json<unknown[]>(sheet, { header: 1, raw: true });
    if (!sheetRows || sheetRows.length < 2) continue;
    const header = sheetRows[0] ?? [];
    const nameCols: number[] = [];
    const skuCols: number[] = [];
    header.forEach((cell, i) => {
      const norm = normalizeHeader(cell);
      if (norm === null) return;
      if (norm.includes('name')) nameCols.push(i);
      if (norm.includes('sku')) skuCols.push(i);
    });
    if (nameCols.length === 0) continue;

    for (const row of sheetRows.slice(1)) {
      const nameCell = nameCols.map((c) => row[c]).find((v) => typeof v === 'string' && v.trim());
      const name = typeof nameCell === 'string' ? nameCell.trim() : '';
      if (!name) continue;
      const candidateCols = skuCols.length > 0 ? [...skuCols, 0] : [0];
      for (const c of candidateCols) {
        const cell = row[c];
        if (typeof cell === 'string' && cell.trim()) {
          lookup.set(normalizeSku(cell), name);
        } else if (typeof cell === 'number') {
          lookup.set(normalizeSku(String(cell)), name);
        }
      }
    }
  }
  return lookup;
}

type RowStatus = 'idle' | 'saving' | 'done' | 'error';

export default function FixMissingNamesPage() {
  const [scanning, setScanning] = useState(false);
  const [scanned, setScanned] = useState(false);
  const [rows, setRows] = useState<ProductRow[]>([]);
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [matchedFromExcel, setMatchedFromExcel] = useState<Record<string, boolean>>({});
  const [statuses, setStatuses] = useState<Record<string, RowStatus>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [scanError, setScanError] = useState<string | null>(null);
  const [excelFileNames, setExcelFileNames] = useState<string[]>([]);
  const [excelParsing, setExcelParsing] = useState(false);
  const [excelError, setExcelError] = useState<string | null>(null);
  const [applyingAll, setApplyingAll] = useState(false);

  async function handleScan() {
    setScanning(true);
    setScanError(null);
    setRows([]);
    setDrafts({});
    setMatchedFromExcel({});
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

  // Accepts several files at once (products were imported in batches —
  // 3 Nov 2026, client: "kaise upload karu multiple excels, already admin
  // mein photos/products ke waqt ki thi" — the same multi-batch Excel sets
  // used for the original import/photo-matching tools). Every file's
  // SKU->name map is merged together before matching, so a product whose
  // real name sits in any one of the uploaded files gets found — order
  // doesn't matter, and a SKU repeated across files just keeps whichever
  // file's row is read last (harmless: real designs don't share SKUs).
  async function handleExcelFiles(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    if (files.length === 0) return;
    // Appended, not replaced — the file picker can be used more than once
    // (e.g. one batch at a time, or a forgotten file added after the
    // first upload) and earlier matches should stay filled in.
    setExcelFileNames((prev) => [...prev, ...files.map((f) => f.name)]);
    setExcelError(null);
    setExcelParsing(true);
    try {
      const XLSX = await import('xlsx');
      const combinedLookup = new Map<string, string>();
      const failedFiles: string[] = [];

      for (const file of files) {
        try {
          const buffer = await file.arrayBuffer();
          const workbook = XLSX.read(buffer, { type: 'array' });
          const lookup = buildNameLookup(workbook, XLSX);
          for (const [sku, name] of lookup) combinedLookup.set(sku, name);
        } catch {
          failedFiles.push(file.name);
        }
      }

      const newDrafts: Record<string, string> = {};
      const newMatched: Record<string, boolean> = {};
      for (const row of rows) {
        if (statuses[row.id] === 'done') continue;
        const bySku = row.norvik_sku ? combinedLookup.get(normalizeSku(row.norvik_sku)) : undefined;
        const byFallback = row.sku ? combinedLookup.get(normalizeSku(row.sku)) : undefined;
        const match = bySku ?? byFallback;
        if (match) {
          newDrafts[row.id] = match;
          newMatched[row.id] = true;
        }
      }
      setDrafts((prev) => ({ ...prev, ...newDrafts }));
      setMatchedFromExcel((prev) => ({ ...prev, ...newMatched }));

      if (failedFiles.length > 0) {
        setExcelError(`Could not read: ${failedFiles.join(', ')} — the rest were still matched.`);
      } else if (Object.keys(newDrafts).length === 0) {
        setExcelError(
          "Read the file(s) but couldn't match any SKUs against the products still needing a name — check they're the right sheets, or the SKU column headers."
        );
      }
    } catch (err) {
      setExcelError(err instanceof Error ? err.message : 'Could not read those files.');
    } finally {
      setExcelParsing(false);
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

  async function handleApplyAllMatched() {
    setApplyingAll(true);
    const toApply = rows.filter(
      (r) => matchedFromExcel[r.id] && statuses[r.id] !== 'done' && (drafts[r.id] ?? '').trim()
    );
    for (const row of toApply) {
      await handleSave(row);
    }
    setApplyingAll(false);
  }

  const remaining = rows.filter((r) => statuses[r.id] !== 'done').length;
  const matchedCount = rows.filter(
    (r) => matchedFromExcel[r.id] && statuses[r.id] !== 'done'
  ).length;

  return (
    <main className="mx-auto max-w-4xl px-6 py-12">
      <h1 className="font-display text-2xl text-ink">Fix missing product names</h1>
      <p className="mt-2 text-sm text-charcoal">
        Finds products whose name is still the import tool&apos;s placeholder (e.g. &quot;EPS-01237
        piece&quot;) instead of a real design name — these slipped through without being corrected
        during import.
      </p>

      <h2 className="mt-8 text-[13px] font-medium uppercase tracking-[0.08em] text-antiquegold">
        Step 1
      </h2>
      <button
        onClick={handleScan}
        disabled={scanning}
        className="mt-2 bg-antiquegold px-6 py-2.5 text-[13px] font-medium uppercase tracking-[0.08em] text-softwhite disabled:opacity-50"
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

          <h2 className="mt-8 text-[13px] font-medium uppercase tracking-[0.08em] text-antiquegold">
            Step 2 — upload the Excel with the real names
          </h2>
          <p className="mt-1 text-[13px] text-charcoal">
            Upload the product Excel files you already have — same ones used for the import and
            photos tools, select as many at once as you need (any sheet with a SKU column and a
            Name column works). They&apos;re matched by SKU automatically and fill the names in
            below — nothing is saved until you click &quot;Save&quot; or &quot;Apply matched
            names&quot;.
          </p>
          <input
            type="file"
            accept=".xlsx,.xls"
            multiple
            onChange={handleExcelFiles}
            disabled={excelParsing}
            className="mt-3 text-[13px]"
          />
          {excelFileNames.length > 0 && !excelParsing && (
            <p className="mt-1 text-[12px] text-muted">
              Read {excelFileNames.length} file{excelFileNames.length === 1 ? '' : 's'}: {excelFileNames.join(', ')}
            </p>
          )}
          {excelParsing && <p className="mt-1 text-[12px] text-muted">Reading…</p>}
          {excelError && (
            <p className="mt-2 border border-red-300 bg-red-50 px-4 py-3 text-[13px] text-red-700">
              {excelError}
            </p>
          )}

          {matchedCount > 0 && (
            <button
              onClick={handleApplyAllMatched}
              disabled={applyingAll}
              className="mt-4 bg-antiquegold px-6 py-2.5 text-[13px] font-medium uppercase tracking-[0.08em] text-softwhite disabled:opacity-50"
            >
              {applyingAll ? 'Applying…' : `Apply ${matchedCount} matched name${matchedCount === 1 ? '' : 's'}`}
            </button>
          )}

          <div className="mt-6 divide-y divide-line border border-line">
            {rows.map((row) => {
              const status = statuses[row.id] ?? 'idle';
              const photo = row.images?.[0];
              const fromExcel = matchedFromExcel[row.id] && status !== 'done';
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

                  <div className="flex-1">
                    <input
                      value={drafts[row.id] ?? ''}
                      onChange={(e) => {
                        setDrafts((prev) => ({ ...prev, [row.id]: e.target.value }));
                        setMatchedFromExcel((prev) => ({ ...prev, [row.id]: false }));
                      }}
                      placeholder="Type the real product name"
                      disabled={status === 'saving' || status === 'done'}
                      className="w-full border border-line bg-ivory px-3 py-2 text-[13px] text-ink outline-none focus:border-ink disabled:opacity-60"
                    />
                    {fromExcel && (
                      <p className="mt-1 text-[11px] text-green-700">from Excel — check before saving</p>
                    )}
                  </div>

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
