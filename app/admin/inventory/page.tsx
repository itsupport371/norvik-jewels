import AdminShell from '@/components/admin-shell';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

// Inventory (10 Oct 2026) — stub, deliberately not faking stock numbers.
// `products` has no stock/quantity column at all (see
// supabase/migrations/0001_products_schema.sql) — every size/metal option
// only ever stores a display label ('In Stock' / 'Made to Order'), never a
// count. Real per-product stock tracking needs a schema decision first
// (one total count per product? per metal+size combination? who
// decrements it — manual admin edits, or does it need to tie into the
// order flow?) before any UI here would show real numbers instead of
// fabricated ones.
export default async function AdminInventoryPage() {
  const supabase = createClient();
  const { data: userData } = await supabase.auth.getUser();

  return (
    <AdminShell adminEmail={userData.user?.email ?? undefined}>
      <h1 className="font-display text-2xl text-ink">Inventory</h1>
      <div className="mt-6 max-w-xl border border-line bg-white p-6">
        <p className="text-[14px] text-ink">Not built yet — needs a schema decision first.</p>
        <p className="mt-2 text-[13px] leading-[1.6] text-charcoal">
          There&apos;s no stock/quantity field anywhere on a product today — each size or metal
          option only stores a label like &quot;In Stock&quot; or &quot;Made to Order&quot;, never a count.
          Before this page can show real stock levels, we&apos;d need to decide: one stock count
          per product, or per metal+size combination? And who updates it — manual edits here,
          or does it need to decrease automatically as orders come in?
        </p>
      </div>
    </AdminShell>
  );
}
