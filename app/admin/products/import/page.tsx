'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import {
  slugify,
  buildMetalOptions,
  buildSizeOptions,
  computeBasePrice,
  type ProductFormValue,
} from '../product-form';

// Parses the manufacturer Excel format used for "Rings Vol.1" (and expected
// to be the same shape for future categories — see ADMIN_PANEL_PROGRESS.md):
// one header row, then for each SKU a block of rows where only the first
// row has the SKU/Norvik SKU/gold weight/diamond total/name — the rows
// below it (until the next non-empty SKU cell) are additional diamond
// size/count breakdown lines for the SAME piece, not separate products.
type ParsedRow = {
  sku: string;
  norvikSku: string;
  name: string;
  goldWeightGrams: number;
  diamondCaratTotal: number;
  diamondPieceCount: number;
  hasName: boolean;
};

const DEFAULT_METAL_KEYS = ['18-yellow', '18-white', '18-rose', '14-yellow', '14-white', '14-rose', '9-yellow', '9-white', '9-rose'];

function parseWorkbookRows(rows: unknown[][]): ParsedRow[] {
  const results: ParsedRow[] = [];
  let current: ParsedRow | null = null;
  let pieceCount = 0;

  for (const row of rows) {
    const sku = row[0];
    if (typeof sku === 'string' && sku.trim()) {
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
        name: name || `${norvikSku || sku.trim()} Diamond Ring`,
        hasName: Boolean(name),
        goldWeightGrams: Number(row[10] ?? 0),
        diamondCaratTotal: Number(row[9] ?? 0),
        diamondPieceCount: 0,
      };
      pieceCount = 0;
    }
    if (!current) continue;
    // Round (cols 1-2), Marquise (cols 3-4), Pear (cols 5-6) count columns.
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

export default function ImportProductsPage() {
  const router = useRouter();
  const [rows, setRows] = useState<ParsedRow[]>([]);
  const [fileName, setFileName] = useState('');
  const [parsing, setParsing] = useState(false);
  const [importing, setImporting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<{ created: number; skipped: number } | null>(null);

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
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const rows = XLSX.utils.sheet_to_json<unknown[]>(sheet, { header: 1, raw: true });
      const parsed = parseWorkbookRows(rows.slice(1)); // skip header row
      setRows(parsed);
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

    // Check which norvik_sku values already exist so re-running an import
    // (e.g. after fixing the 4 missing names) doesn't create duplicates.
    const norvikSkus = rows.map((r) => r.norvikSku).filter(Boolean);
    const { data: existing } = await supabase
      .from('products')
      .select('norvik_sku')
      .in('norvik_sku', norvikSkus);
    const existingSet = new Set((existing ?? []).map((e) => e.norvik_sku));

    const toInsert = rows.filter((r) => !existingSet.has(r.norvikSku));

    const payloads = toInsert.map((r) => {
      const formValue: ProductFormValue = {
        name: r.name,
        slug: slugify(r.name),
        category: 'Rings',
        sku: r.sku,
        norvik_sku: r.norvikSku,
        description: `${r.diamondPieceCount} diamonds, ${r.diamondCaratTotal.toFixed(2)} ct total, set in ${r.goldWeightGrams.toFixed(2)}g of gold.`,
        images: [],
        metal_images: null,
        gold_weight_grams: r.goldWeightGrams,
        diamond_piece_count: r.diamondPieceCount,
        diamond_carat_total: r.diamondCaratTotal,
        metal_option_keys: DEFAULT_METAL_KEYS,
        size_mode: 'ring-run',
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
    setDone({ created: payloads.length, skipped: rows.length - payloads.length });
  }

  const missingNameCount = rows.filter((r) => !r.hasName).length;

  return (
    <main className="mx-auto max-w-4xl px-6 py-12">
      <h1 className="font-display text-2xl text-ink">Import products from Excel</h1>
      <p className="mt-2 text-sm text-charcoal">
        Reads the manufacturer&apos;s Excel format (one row per SKU, plus diamond size/count breakdown rows below
        it). Creates every row as a <strong>Draft</strong> — nothing goes live until you publish it from the
        products list. Images aren&apos;t set by this import yet; add them afterward by editing each product.
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
            Found <strong>{rows.length}</strong> SKUs.
            {missingNameCount > 0 && (
              <>
                {' '}
                <strong>{missingNameCount}</strong> of them have no name in the sheet — those will import with a
                placeholder name (e.g. &quot;ILR-0234 Diamond Ring&quot;) that you can rename later.
              </>
            )}
          </p>

          <div className="mt-4 max-h-96 overflow-auto border border-line">
            <table className="w-full text-left text-[13px]">
              <thead className="sticky top-0 bg-softwhite text-[11px] uppercase tracking-[0.08em] text-muted">
                <tr>
                  <th className="px-3 py-2 font-medium">SKU</th>
                  <th className="px-3 py-2 font-medium">Norvik SKU</th>
                  <th className="px-3 py-2 font-medium">Name</th>
                  <th className="px-3 py-2 font-medium">Gold (g)</th>
                  <th className="px-3 py-2 font-medium">Diamond ct</th>
                  <th className="px-3 py-2 font-medium">Pieces</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {rows.map((r) => (
                  <tr key={r.norvikSku || r.sku}>
                    <td className="px-3 py-1.5">{r.sku}</td>
                    <td className="px-3 py-1.5">{r.norvikSku}</td>
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
            disabled={importing}
            className="mt-6 bg-antiquegold px-6 py-2.5 text-[13px] font-medium uppercase tracking-[0.08em] text-softwhite disabled:opacity-50"
          >
            {importing ? 'Importing…' : `Import ${rows.length} as Drafts`}
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
