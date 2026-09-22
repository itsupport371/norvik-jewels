import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

type Row = {
  id: string;
  name: string;
  category: string;
  status: 'draft' | 'published';
  base_price: number;
  sku: string | null;
  norvik_sku: string | null;
  updated_at: string;
};

export default async function AdminProductsPage() {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('products')
    .select('id, name, category, status, base_price, sku, norvik_sku, updated_at')
    .order('updated_at', { ascending: false });

  const products = (data ?? []) as Row[];

  return (
    <main className="mx-auto max-w-5xl px-6 py-12">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl text-ink">Products</h1>
          <p className="mt-1 text-sm text-charcoal">
            {products.length} product{products.length === 1 ? '' : 's'} — draft ones are not visible on the live site.
          </p>
        </div>
        <div className="flex gap-3">
          <Link
            href="/admin/products/import"
            className="border border-line px-4 py-2 text-[13px] font-medium uppercase tracking-[0.08em] text-ink hover:bg-softwhite"
          >
            Import from Excel
          </Link>
          <Link
            href="/admin/products/photos"
            className="border border-line px-4 py-2 text-[13px] font-medium uppercase tracking-[0.08em] text-ink hover:bg-softwhite"
          >
            Import Photos
          </Link>
          <Link
            href="/admin/products/new"
            className="bg-antiquegold px-4 py-2 text-[13px] font-medium uppercase tracking-[0.08em] text-softwhite"
          >
            + New Product
          </Link>
        </div>
      </div>

      {error && (
        <p className="mt-6 border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700">
          Couldn&apos;t load products: {error.message}
        </p>
      )}

      <div className="mt-8 overflow-hidden border border-line">
        <table className="w-full text-left text-[13px]">
          <thead className="bg-softwhite text-[11px] uppercase tracking-[0.08em] text-muted">
            <tr>
              <th className="px-4 py-3 font-medium">Name</th>
              <th className="px-4 py-3 font-medium">Category</th>
              <th className="px-4 py-3 font-medium">SKU</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Price</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {products.map((p) => (
              <tr key={p.id}>
                <td className="px-4 py-3 font-medium text-ink">{p.name}</td>
                <td className="px-4 py-3 text-charcoal">{p.category}</td>
                <td className="px-4 py-3 text-charcoal">{p.norvik_sku ?? p.sku ?? '—'}</td>
                <td className="px-4 py-3">
                  <span
                    className={
                      'px-2 py-0.5 text-[11px] font-medium uppercase tracking-[0.06em] ' +
                      (p.status === 'published'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-amber-100 text-amber-800')
                    }
                  >
                    {p.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-charcoal">₹{Math.round(p.base_price).toLocaleString('en-IN')}</td>
                <td className="px-4 py-3 text-right">
                  <Link href={`/admin/products/${p.id}/edit`} className="text-antiquegold underline underline-offset-4">
                    Edit
                  </Link>
                </td>
              </tr>
            ))}
            {products.length === 0 && !error && (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-charcoal">
                  No products yet. Use &quot;Import from Excel&quot; or &quot;+ New Product&quot; to add the first one.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </main>
  );
}
