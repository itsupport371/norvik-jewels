'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import {
  slugify,
  buildMetalOptions,
  buildSizeOptions,
  computeBasePrice,
  CATEGORIES,
  type ProductFormValue,
} from '../product-form';

// This page reads manufacturer Excel workbooks in one of two shapes, and
// now reads EVERY sheet in the workbook (not just the first) — see the
// "Taka Tak Studs Vol.3" note below, whose file has a "Fancy" sheet and a
// separate "Round" sheet, both needing import as their own products.
//
// Format is auto-detected per sheet from the header row (row 1):
//
// 1. "rings-v1" — the original "Rings Vol.1" shape: one header row, then for
//    each SKU a block of rows where only the first row has the SKU /
//    Norvik SKU / gold weight / diamond total / name — the rows below it
//    (until the next non-empty SKU cell) are additional diamond size/count
//    breakdown lines for the SAME piece, across three diamond shapes
//    (Round, Marquise, Pear — count columns 2/4/6, fixed positions). This
//    sheet has no reliable header text for its gold-weight / diamond-total
//    / Norvik SKU / name columns, so those are read by fixed position
//    instead. Only used when the header has NO named gold/diamond-weight
//    column at all (see detectFormat) — every sheet seen since has one.
// 2. "header-driven-v1" — everything else. Same block-per-SKU idea, but
//    columns are located by HEADER TEXT (see findCol/findAllCols), not
//    fixed position, and there can be ONE OR MORE diamond-shape count
//    columns (all found and summed together) — this covers:
//      - "Sensual Appeal Vol.1" (Earrings, 22 Sep 2026): one diamond shape
//        (Round only), a "Gold Wt"-style header, and a Norvik SKU column
//        that isn't always present or in the same spot.
//      - "Taka Tak Studs Vol.3" (25 Sep 2026): the "Fancy" sheet has THREE
//        diamond-shape columns (Round/Marquise/Pear, like rings-v1) but
//        ALSO extra dimension/casting columns (Length, Width, Volume,
//        Casting Wt., % Reduction) inserted before Norvik SKU/Display
//        name — so rings-v1's fixed offsets (9/10/11/12) land on the wrong
//        columns entirely. Its "Round" sheet (an all-round-diamond variant
//        of the same 50 designs, SKU suffixed "-Rounds") has only ONE
//        diamond-shape column and NO Display name column at all — see
//        fillMissingNames, which borrows the matching Fancy-sheet row's
//        name (by stripping the "-Rounds" suffix) rather than leaving a
//        generic "<SKU> piece" placeholder for 50 rows at once.
type ParsedRow = {
  sku: string;
  norvikSku: string;
  hasNorvikSku: boolean;
  name: string;
  goldWeightGrams: number;
  diamondCaratTotal: number;
  diamondPieceCount: number;
  hasName: boolean;
  sheetName: string;
};

const DEFAULT_METAL_KEYS = ['18-yellow', '18-white', '18-rose', '14-yellow', '14-white', '14-rose', '9-yellow', '9-white', '9-rose'];

function isNonEmptyString(v: unknown): v is string {
  return typeof v === 'string' && v.trim().length > 0;
}

function findCol(header: unknown[], patterns: string[]): number {
  for (let i = 0; i < header.length; i++) {
    const cell = header[i];
    if (typeof cell !== 'string') continue;
    const norm = cell.toLowerCase();
    if (patterns.some((p) => norm.includes(p))) return i;
  }
  return -1;
}

// Like findCol, but returns every matching column instead of just the
// first — needed because a "Fancy" sheet can have up to three separate
// "Diamond Count" columns (one per diamond shape) that all need summing.
function findAllCols(header: unknown[], patterns: string[]): number[] {
  const result: number[] = [];
  for (let i = 0; i < header.length; i++) {
    const cell = header[i];
    if (typeof cell !== 'string') continue;
    const norm = cell.toLowerCase();
    if (patterns.some((p) => norm.includes(p))) result.push(i);
  }
  return result;
}

function detectFormat(headerRow: unknown[] | undefined): 'rings-v1' | 'header-driven-v1' {
  const header = headerRow ?? [];
  // Prefer header-text detection whenever the sheet actually labels its
  // gold-weight or diamond-weight column (covers every sheet shape seen so
  // far except the original Rings Vol.1 one) — this is what lets
  // header-driven-v1 handle a 3-diamond-shape sheet (Taka Tak Studs Vol.3's
  // "Fancy" sheet, which also has "Marquise"/"Pear" text, like rings-v1
  // does) correctly instead of falling into the fixed-position parser.
  const hasGoldHeader = findCol(header, ['gold wt', 'gold weight', '18kt', 'karat wt']) >= 0;
  const hasDiamondWtHeader = findCol(header, ['diamond wt', 'diamond weight']) >= 0;
  if (hasGoldHeader || hasDiamondWtHeader) return 'header-driven-v1';
  // No named gold/diamond-weight column at all — only the original Rings
  // Vol.1 shape looks like this. Its diamond count is broken down by THREE
  // shapes (Round/Marquise/Pear) in separate column pairs — that's the
  // reliable signal for it specifically.
  const joined = header.filter(isNonEmptyString).join(' ').toLowerCase();
  return joined.includes('marquise') || joined.includes('pear') ? 'rings-v1' : 'header-driven-v1';
}

// "rings-v1": row[0]=sku, row[9]=diamondCaratTotal, row[10]=goldWeightGrams,
// row[11]=norvikSku, row[12]=name. Diamond piece count summed from the
// Round/Marquise/Pear count columns (2, 4, 6) across the whole block.
function parseRingsV1(rows: unknown[][]): ParsedRow[] {
  const results: ParsedRow[] = [];
  let current: ParsedRow | null = null;
  let pieceCount = 0;

  for (const row of rows) {
    const sku = row[0];
    if (isNonEmptyString(sku)) {
      if (current) {
        current.diamondPieceCount = pieceCount;
        results.push(current);
      }
      const norvikSku = String(row[11] ?? '').trim();
      const rawName = row[12];
      const name = typeof rawName === 'string' ? rawName.trim() : '';
      current = {
        sku: sku.trim(),
        norvikSku,
        hasNorvikSku: Boolean(norvikSku),
        name: name || `${norvikSku || sku.trim()} Diamond Ring`,
        hasName: Boolean(name),
        goldWeightGrams: Number(row[10] ?? 0),
        diamondCaratTotal: Number(row[9] ?? 0),
        diamondPieceCount: 0,
        sheetName: '',
      };
      pieceCount = 0;
    }
    if (!current) continue;
    for (const countCol of [2, 4, 6]) {
      const count = row[countCol];
      if (typeof count === 'number') pieceCount += count;
    }
  }
  if (current) {
    current.diamondPieceCount = pieceCount;
    results.push(current);
  }
  return results;
}

// "header-driven-v1" — one or more diamond-shape columns (Round always;
// Marquise/Pear if the sheet has them), a handful of dimension/casting
// columns we don't use, a gold-weight column, and (usually) a display-name
// column. Columns are located by HEADER TEXT, not fixed position, because
// a Norvik SKU column may or may not be present, and can sit at a
// different offset between sheets — this is what actually broke on the
// first Sensual Appeal Vol.1 import (22 Sep 2026): the Rings-v1 parser's
// fixed offsets 9/10/11/12 didn't line up with that sheet's columns, so
// gold weight came out NaN and the name ended up with "Diamond Ring"
// appended (the Rings parser's own fallback). All "Diamond Count" columns
// found are summed together per SKU block, so this also correctly handles
// a 3-diamond-shape sheet like Taka Tak Studs Vol.3's "Fancy" sheet.
// Falls back to the manufacturer SKU when no Norvik SKU column is found,
// and to an empty name (filled in afterward by fillMissingNames) when no
// Display name column is found at all — see the "Round" sheet note above.
function parseHeaderDrivenV1(allRows: unknown[][], sheetName: string): ParsedRow[] {
  const header = allRows[0] ?? [];
  const rows = allRows.slice(1);

  const skuCol = findCol(header, ['sku code', 'sku']);
  const nameCol = findCol(header, ['display']);
  const goldCol = findCol(header, ['gold wt', 'gold weight', '18kt', 'karat wt']);
  const diamondWeightCol = findCol(header, ['diamond wt', 'diamond weight']);
  const diamondCountCols = findAllCols(header, ['diamond count']);
  const norvikCol = findCol(header, ['norvik']);

  const results: ParsedRow[] = [];
  let current: ParsedRow | null = null;
  let pieceCount = 0;

  for (const row of rows) {
    const skuRaw = row[skuCol >= 0 ? skuCol : 0];
    if (isNonEmptyString(skuRaw)) {
      if (current) {
        current.diamondPieceCount = pieceCount;
        results.push(current);
      }
      const skuTrimmed = skuRaw.trim();
      const norvikRaw = norvikCol >= 0 ? row[norvikCol] : undefined;
      const norvikSku = typeof norvikRaw === 'string' ? norvikRaw.trim() : '';
      const rawName = nameCol >= 0 ? row[nameCol] : undefined;
      const name = typeof rawName === 'string' ? rawName.trim() : '';
      current = {
        sku: skuTrimmed,
        norvikSku: norvikSku || skuTrimmed,
        hasNorvikSku: Boolean(norvikSku),
        // Left blank (not defaulted here) when the sheet has no name
        // column at all — fillMissingNames tries to borrow a sibling
        // sheet's name first, and only falls back to a generic
        // placeholder if that fails too.
        name,
        hasName: Boolean(name),
        goldWeightGrams: Number((goldCol >= 0 ? row[goldCol] : undefined) ?? 0),
        diamondCaratTotal: Number((diamondWeightCol >= 0 ? row[diamondWeightCol] : undefined) ?? 0),
        diamondPieceCount: 0,
        sheetName,
      };
      pieceCount = 0;
    }
    if (!current) continue;
    const countCols = diamondCountCols.length > 0 ? diamondCountCols : [2];
    for (const col of countCols) {
      const count = row[col];
      if (typeof count === 'number') pieceCount += count;
    }
  }
  if (current) {
    current.diamondPieceCount = pieceCount;
    results.push(current);
  }
  return results;
}

// A sheet whose rows have no name of their own (e.g. Taka Tak Studs
// Vol.3's "Round" sheet, an all-round-diamond variant of the "Fancy"
// sheet's 50 designs, SKU-suffixed "-Rounds", with no Display name column
// at all) borrows the matching row's name from elsewhere in the same
// workbook rather than falling back to a generic "<SKU> piece" placeholder
// for the whole sheet. Matched by SKU with whitespace/case ignored and a
// trailing "-Rounds"/"Rounds" suffix stripped. Still left flagged as
// hasName: false (shown as an editable placeholder in the preview) since
// it's a guess, not something the client actually typed.
const ROUND_VARIANT_SUFFIX_RE = /[\s-]*rounds?$/i;
function normalizeSkuForMatch(sku: string): string {
  return sku.toLowerCase().replace(/\s+/g, '');
}
function fillMissingNames(rows: ParsedRow[]): void {
  const nameByBaseSku = new Map<string, string>();
  for (const r of rows) {
    if (r.hasName) nameByBaseSku.set(normalizeSkuForMatch(r.sku), r.name);
  }
  for (const r of rows) {
    if (r.hasName) continue;
    const strippedSku = r.sku.replace(ROUND_VARIANT_SUFFIX_RE, '');
    const borrowed =
      normalizeSkuForMatch(strippedSku) !== normalizeSkuForMatch(r.sku)
        ? nameByBaseSku.get(normalizeSkuForMatch(strippedSku))
        : undefined;
    r.name = borrowed ? `${borrowed} (All Diamond)` : `${r.norvikSku || r.sku} piece`;
  }
}

// Reads every sheet in the workbook (not just the first) — Taka Tak Studs
// Vol.3 (25 Sep 2026) is the first file we've seen with more than one
// product sheet ("Fancy" shapes + an all-Round variant), and both need to
// come in as their own products. Each sheet is format-detected on its own,
// since a workbook could in principle mix shapes (none has yet).
function parseWorkbook(
  workbook: import('xlsx').WorkBook,
  XLSX: typeof import('xlsx'),
): { format: 'rings-v1' | 'header-driven-v1'; rows: ParsedRow[] } {
  const allRows: ParsedRow[] = [];
  let sawRingsV1 = false;
  let lastFormat: 'rings-v1' | 'header-driven-v1' = 'header-driven-v1';

  for (const sheetName of workbook.SheetNames) {
    const sheet = workbook.Sheets[sheetName];
    const sheetRows = XLSX.utils.sheet_to_json<unknown[]>(sheet, { header: 1, raw: true });
    if (!sheetRows || sheetRows.length < 2) continue; // empty / instructions-only sheet
    const format = detectFormat(sheetRows[0]);
    // parseRingsV1 expects data rows only (it never reads a header — its
    // column positions are fixed). parseHeaderDrivenV1 expects the header
    // row included at index 0, since it locates its columns by header
    // text — passing it the already-header-stripped rows (as this used to)
    // meant it read the blank spacer row as the header instead, so every
    // findCol() lookup failed and Name/Gold/Diamond ct silently fell back
    // to 0/blank even though the real header matched fine on its own.
    const parsed =
      format === 'rings-v1'
        ? parseRingsV1(sheetRows.slice(1)).map((r) => ({ ...r, sheetName }))
        : parseHeaderDrivenV1(sheetRows, sheetName);
    if (parsed.length === 0) continue;
    if (format === 'rings-v1') sawRingsV1 = true;
    lastFormat = format;
    allRows.push(...parsed);
  }

  fillMissingNames(allRows);
  // The badge/defaults only need one format to show — if ANY sheet came in
  // as rings-v1 that's the more useful thing to flag (it's the format that
  // still needs the caveats in the on-page copy below).
  return { format: sawRingsV1 ? 'rings-v1' : lastFormat, rows: allRows };
}

export default function ImportProductsPage() {
  const router = useRouter();
  // Holds every parsed row from every sheet in the workbook — a sheet a
  // client doesn't want (e.g. a "Fancy" sheet with no matching photos yet)
  // is deselected via includedSheets below, not dropped here, because a
  // deselected sheet's rows can still be needed as a NAME SOURCE for
  // another sheet's rows (see fillMissingNames — a "Round" sheet with no
  // name column of its own borrows its name from the matching Fancy row
  // even when the Fancy row itself won't be imported).
  const [rows, setRows] = useState<ParsedRow[]>([]);
  const [includedSheets, setIncludedSheets] = useState<Record<string, boolean>>({});
  const [format, setFormat] = useState<'rings-v1' | 'header-driven-v1' | null>(null);
  const [category, setCategory] = useState<(typeof CATEGORIES)[number]>('Rings');
  const [sizeMode, setSizeMode] = useState<'one' | 'ring-run'>('ring-run');
  const [fileName, setFileName] = useState('');
  const [parsing, setParsing] = useState(false);
  const [importing, setImporting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<{ created: number; skipped: number } | null>(null);

  const sheetNames: string[] = Array.from(new Set(rows.map((r) => r.sheetName)));
  const visibleRows = rows.filter((r) => includedSheets[r.sheetName] ?? true);

  function toggleSheet(sheetName: string, checked: boolean) {
    setIncludedSheets((prev) => ({ ...prev, [sheetName]: checked }));
  }

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    setError(null);
    setDone(null);
    setParsing(true);
    try {
      const XLSX = await import('xlsx');
      const buffer = await file.arrayBuffer();
      const workbook = XLSX.read(buffer, { type: 'array' });
      const { format: detected, rows: parsed } = parseWorkbook(workbook, XLSX);
      setFormat(detected);
      // Sensible defaults per detected sheet shape — both are still
      // editable below before importing, in case this batch is a
      // different category than the shape usually implies.
      if (detected === 'rings-v1') {
        setCategory('Rings');
        setSizeMode('ring-run');
      } else {
        setCategory('Earrings');
        setSizeMode('one');
      }
      setRows(parsed);
      // Every sheet starts checked (included) — the client unchecks the
      // ones they don't want imported as their own products (e.g. a
      // "Fancy" sheet with no photos ready yet, keeping only its "Round"
      // sibling). See the includedSheets comment above for why this
      // filters rows for display/import rather than dropping them earlier.
      const parsedSheetNames = Array.from(new Set(parsed.map((r) => r.sheetName)));
      setIncludedSheets(Object.fromEntries(parsedSheetNames.map((s) => [s, true])));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not read that file.');
    } finally {
      setParsing(false);
    }
  }

  async function handleImport() {
    setImporting(true);
    setError(null);
    const supabase = createClient();

    // Only the checked sheets' rows — see includedSheets above.
    const selectedRows = rows.filter((r) => includedSheets[r.sheetName] ?? true);

    // Check which norvik_sku values already exist so re-running an import
    // (e.g. after fixing missing names) doesn't create duplicates.
    const norvikSkus = selectedRows.map((r) => r.norvikSku).filter(Boolean);
    const { data: existing } = await supabase
      .from('products')
      .select('norvik_sku')
      .in('norvik_sku', norvikSkus);
    const existingSet = new Set((existing ?? []).map((e) => e.norvik_sku));

    const toInsert = selectedRows.filter((r) => !existingSet.has(r.norvikSku));

    const payloads = toInsert.map((r) => {
      const formValue: ProductFormValue = {
        name: r.name,
        slug: slugify(r.name),
        category,
        sku: r.sku,
        norvik_sku: r.norvikSku,
        description: `${r.diamondPieceCount} diamonds, ${r.diamondCaratTotal.toFixed(2)} ct total, set in ${r.goldWeightGrams.toFixed(2)}g of gold.`,
        images: [],
        metal_images: null,
        gold_weight_grams: r.goldWeightGrams,
        diamond_piece_count: r.diamondPieceCount,
        diamond_carat_total: r.diamondCaratTotal,
        metal_option_keys: DEFAULT_METAL_KEYS,
        size_mode: sizeMode,
        is_signature: false,
        status: 'draft',
      };
      return {
        name: formValue.name,
        slug: formValue.slug,
        category: formValue.category,
        sku: formValue.sku || null,
        norvik_sku: formValue.norvik_sku || null,
        description: formValue.description,
        images: formValue.images,
        metal_images: null,
        metal_options: buildMetalOptions(formValue.metal_option_keys),
        size_options: buildSizeOptions(formValue.size_mode),
        diamond: null,
        gold_weight_grams: formValue.gold_weight_grams,
        diamond_piece_count: formValue.diamond_piece_count,
        diamond_carat_total: formValue.diamond_carat_total,
        base_price: computeBasePrice(formValue),
        currency: '₹',
        is_signature: false,
        status: 'draft' as const,
      };
    });

    if (payloads.length > 0) {
      const { error: insertError } = await supabase.from('products').insert(payloads);
      if (insertError) {
        setImporting(false);
        setError(insertError.message);
        return;
      }
    }

    setImporting(false);
    setDone({ created: payloads.length, skipped: selectedRows.length - payloads.length });
  }

  const missingNameCount = visibleRows.filter((r) => !r.hasName).length;
  const missingNorvikSkuCount = visibleRows.filter((r) => !r.hasNorvikSku).length;

  return (
    <main className="mx-auto max-w-4xl px-6 py-12">
      <h1 className="font-display text-2xl text-ink">Import products from Excel</h1>
      <p className="mt-2 text-sm text-charcoal">
        Reads the manufacturer&apos;s Excel format (one row per SKU, plus diamond size/count breakdown rows below
        it) — works with the original &quot;Rings&quot;-style sheet or the newer header-labelled sheets (one or more
        diamond shapes, Norvik SKU column optional — the Manufacturer SKU is reused when it&apos;s missing). Reads
        every sheet in the workbook, so a file with more than one product sheet (e.g. a &quot;Fancy&quot; sheet plus a
        separate all-Round variant) imports all of them together. Creates every row as a <strong>Draft</strong> —
        nothing goes live until you publish it from the products list. Images aren&apos;t set by this import yet; add
        them afterward (or via Import Photos).
      </p>

      <div className="mt-6 border border-dashed border-line px-6 py-8 text-center">
        <input type="file" accept=".xlsx,.xls" onChange={handleFile} />
        {fileName && <p className="mt-2 text-[13px] text-charcoal">{fileName}</p>}
        {parsing && <p className="mt-2 text-[13px] text-charcoal">Reading file…</p>}
      </div>

      {error && (
        <p className="mt-4 border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>
      )}

      {rows.length > 0 && !done && (
        <div className="mt-8">
          <p className="text-[13px] text-charcoal">
            Found <strong>{rows.length}</strong> SKUs across <strong>{sheetNames.length}</strong> sheet
            {sheetNames.length === 1 ? '' : 's'}, detected as{' '}
            <strong>{format === 'rings-v1' ? 'Rings-style (fixed columns)' : 'header-labelled'}</strong>.
            {sheetNames.length > 1 && (
              <>
                {' '}
                <strong>{visibleRows.length}</strong> selected below for import.
              </>
            )}
            {missingNameCount > 0 && (
              <>
                {' '}
                <strong>{missingNameCount}</strong> of the selected rows have no name in the sheet — those will
                import with a placeholder name that you can rename later.
              </>
            )}
            {missingNorvikSkuCount > 0 && (
              <>
                {' '}
                <strong>{missingNorvikSkuCount}</strong> of the selected rows have no Norvik SKU in the sheet — the
                Manufacturer SKU is reused for it below (edit individual products afterward if Norvik has its own
                numbering for this category).
              </>
            )}
          </p>

          {sheetNames.length > 1 && (
            <div className="mt-4 border border-line px-4 py-3">
              <span className="mb-1.5 block text-[11px] font-medium uppercase tracking-[0.08em] text-antiquegold">
                Sheets to import — uncheck any you don&apos;t want as products yet (e.g. no photos ready for that
                shape). A sheet you uncheck can still supply a name to another sheet&apos;s rows (see the
                &quot;(All Diamond)&quot;-style names above).
              </span>
              <div className="flex flex-wrap gap-5 text-[13px] text-ink">
                {sheetNames.map((sheetName) => (
                  <label key={sheetName} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={includedSheets[sheetName] ?? true}
                      onChange={(e) => toggleSheet(sheetName, e.target.checked)}
                    />
                    {sheetName} ({rows.filter((r) => r.sheetName === sheetName).length})
                  </label>
                ))}
              </div>
            </div>
          )}

          <div className="mt-4 flex flex-wrap items-end gap-6">
            <label className="block">
              <span className="mb-1.5 block text-[11px] font-medium uppercase tracking-[0.08em] text-antiquegold">
                Category for this batch
              </span>
              <select
                className="border border-line bg-white px-3 py-2 text-[13px]"
                value={category}
                onChange={(e) => setCategory(e.target.value as (typeof CATEGORIES)[number])}
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </label>

            <div>
              <span className="mb-1.5 block text-[11px] font-medium uppercase tracking-[0.08em] text-antiquegold">
                Sizes
              </span>
              <div className="flex gap-5 text-[13px] text-ink">
                <label className="flex items-center gap-2">
                  <input type="radio" checked={sizeMode === 'one'} onChange={() => setSizeMode('one')} />
                  One Size
                </label>
                <label className="flex items-center gap-2">
                  <input type="radio" checked={sizeMode === 'ring-run'} onChange={() => setSizeMode('ring-run')} />
                  Ring sizes (5–25)
                </label>
              </div>
            </div>
          </div>

          <div className="mt-4 max-h-96 overflow-auto border border-line">
            <table className="w-full text-left text-[13px]">
              <thead className="sticky top-0 bg-softwhite text-[11px] uppercase tracking-[0.08em] text-muted">
                <tr>
                  <th className="px-3 py-2 font-medium">Sheet</th>
                  <th className="px-3 py-2 font-medium">SKU</th>
                  <th className="px-3 py-2 font-medium">Norvik SKU</th>
                  <th className="px-3 py-2 font-medium">Name</th>
                  <th className="px-3 py-2 font-medium">Gold (g)</th>
                  <th className="px-3 py-2 font-medium">Diamond ct</th>
                  <th className="px-3 py-2 font-medium">Pieces</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {visibleRows.map((r) => (
                  <tr key={`${r.sheetName}:${r.norvikSku || r.sku}`}>
                    <td className="px-3 py-1.5 text-muted">{r.sheetName}</td>
                    <td className="px-3 py-1.5">{r.sku}</td>
                    <td className={'px-3 py-1.5' + (r.hasNorvikSku ? '' : ' italic text-muted')}>{r.norvikSku}</td>
                    <td className={'px-3 py-1.5' + (r.hasName ? '' : ' italic text-muted')}>{r.name}</td>
                    <td className="px-3 py-1.5">{r.goldWeightGrams}</td>
                    <td className="px-3 py-1.5">{r.diamondCaratTotal}</td>
                    <td className="px-3 py-1.5">{r.diamondPieceCount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <button
            onClick={handleImport}
            disabled={importing || visibleRows.length === 0}
            className="mt-6 bg-antiquegold px-6 py-2.5 text-[13px] font-medium uppercase tracking-[0.08em] text-softwhite disabled:opacity-50"
          >
            {importing ? 'Importing…' : `Import ${visibleRows.length} as Drafts`}
          </button>
        </div>
      )}

      {done && (
        <div className="mt-8 border border-green-300 bg-green-50 px-4 py-4 text-[13px] text-green-800">
          <p>
            Created <strong>{done.created}</strong> draft product{done.created === 1 ? '' : 's'}.
            {done.skipped > 0 && ` Skipped ${done.skipped} that already exist (matched by Norvik SKU).`}
          </p>
          <button onClick={() => router.push('/admin/products')} className="mt-3 underline underline-offset-4">
            Go to products list
          </button>
        </div>
      )}
    </main>
  );
}
