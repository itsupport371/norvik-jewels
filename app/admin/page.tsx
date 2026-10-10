import Link from 'next/link';
import AdminShell from '@/components/admin-shell';
import AdminSalesChart from '@/components/admin-sales-chart';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

// Admin Dashboard home (10 Oct 2026) — replaces the old bare "Products /
// Import from Excel" link grid. Client shared a reference concept image
// (an admin dashboard mockup with a persistent sidebar, KPI cards, a sales
// chart, top categories, recent orders) and said "client aisa kuch admin
// maang rahe" — asked to build something like it. Scope decision (asked
// the client): build THIS page for real first — stats cards, chart,
// categories, recent orders, products table, all from real Supabase data —
// rather than all 9 modules from the image at once; the rest of the
// sidebar (see components/admin-shell.tsx) links to real-but-minimal pages
// for now.
//
// Every number on this page is computed from the `products` and `orders`
// tables, nothing invented. Two things in the reference image specifically
// do NOT appear here because there's no real data behind them yet:
//  - "Low Stock Alerts" — there is no stock/quantity column anywhere on
//    `products` (see supabase/migrations/0001_products_schema.sql), so a
//    stock-level alert would have to be a fabricated number. Replaced with
//    "Needs Attention" — draft products with zero images — which IS real
//    and is exactly the condition the publish-safety-check (product-form.tsx,
//    "ha ha karde proper") already guards against at save time; this card
//    is the admin-facing version of the same check.
//  - "New Customers" (signup-based) — real signup dates live in
//    auth.users, which isn't queryable without a service-role key (this
//    project deliberately has none — see 0002_admin_write_policy.sql).
//    "Customers" below is the distinct count of emails that have placed an
//    orders — a real number, just a different definition.
//
// Needs supabase/migrations/0006_admin_orders_select_policy.sql run first —
// without it, every `orders` query below returns zero rows (RLS blocks the
// admin from seeing any order except their own, same as a regular shopper).
type ProductRow = {
  id: string;
  name: string;
  category: string;
  status: 'draft' | 'published';
  images: string[] | null;
  base_price: number;
  updated_at: string;
};

type OrderRow = {
  id: string;
  email: string;
  total: number;
  status: string;
  items: { name: string; quantity: number; amount: number }[];
  created_at: string;
};

function formatINR(n: number) {
  return '₹' + Math.round(n).toLocaleString('en-IN');
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
}

export default async function AdminDashboardPage() {
  const supabase = createClient();

  const [{ data: userData }, { data: productsData, error: productsError }, { data: ordersData, error: ordersError }] =
    await Promise.all([
      supabase.auth.getUser(),
      supabase
        .from('products')
        .select('id, name, category, status, images, base_price, updated_at')
        .order('updated_at', { ascending: false }),
      supabase
        .from('orders')
        .select('id, email, total, status, items, created_at')
        .order('created_at', { ascending: false }),
    ]);

  const products = (productsData ?? []) as ProductRow[];
  const orders = (ordersData ?? []) as OrderRow[];

  const paidOrders = orders.filter((o) => o.status === 'paid');
  const totalSales = paidOrders.reduce((sum, o) => sum + Number(o.total ?? 0), 0);
  const avgOrderValue = paidOrders.length > 0 ? totalSales / paidOrders.length : 0;
  const customerCount = new Set(orders.map((o) => o.email)).size;

  const publishedCount = products.filter((p) => p.status === 'published').length;
  const draftCount = products.length - publishedCount;
  const needsAttentionProducts = products.filter(
    (p) => p.status === 'draft' && (!p.images || p.images.length === 0)
  );

  // Last 14 days, paid orders only, oldest -> newest.
  const DAYS = 14;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const salesByDay = Array.from({ length: DAYS }, (_, i) => {
    const d = new Date(today);
    d.setDate(d.getDate() - (DAYS - 1 - i));
    return { date: d, total: 0 };
  });
  for (const o of paidOrders) {
    const d = new Date(o.created_at);
    d.setHours(0, 0, 0, 0);
    const bucket = salesByDay.find((b) => b.date.getTime() === d.getTime());
    if (bucket) bucket.total += Number(o.total ?? 0);
  }
  const chartData = salesByDay.map((b) => ({
    label: b.date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }),
    shortLabel: b.date.toLocaleDateString('en-IN', { day: 'numeric' }),
    value: b.total,
  }));

  const categoryCounts = new Map<string, number>();
  for (const p of products) {
    categoryCounts.set(p.category, (categoryCounts.get(p.category) ?? 0) + 1);
  }
  const categories = [...categoryCounts.entries()].sort((a, b) => b[1] - a[1]);
  const maxCategoryCount = Math.max(...categories.map(([, c]) => c), 1);

  const statCards = [
    { label: 'Total Sales', value: formatINR(totalSales), sub: `${paidOrders.length} paid order${paidOrders.length === 1 ? '' : 's'}` },
    { label: 'Orders', value: String(orders.length), sub: `${customerCount} customer${customerCount === 1 ? '' : 's'}` },
    { label: 'Avg. Order Value', value: formatINR(avgOrderValue), sub: 'per paid order' },
    { label: 'Products', value: String(products.length), sub: `${publishedCount} published · ${draftCount} draft` },
    {
      label: 'Needs Attention',
      value: String(needsAttentionProducts.length),
      sub: 'draft, no images',
      warn: needsAttentionProducts.length > 0,
    },
  ];

  return (
    <AdminShell adminEmail={userData.user?.email ?? undefined}>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl text-ink">Dashboard</h1>
          <p className="mt-1 text-[13px] text-charcoal">Welcome back. Here&apos;s what&apos;s happening with Norvik Jewels.</p>
        </div>
        <div className="flex gap-3">
          <Link
            href="/admin/products/import"
            className="border border-line bg-white px-4 py-2 text-[13px] font-medium uppercase tracking-[0.08em] text-ink hover:bg-softwhite"
          >
            Import from Excel
          </Link>
          <Link
            href="/admin/products/new"
            className="bg-antiquegold px-4 py-2 text-[13px] font-medium uppercase tracking-[0.08em] text-white"
          >
            + New Product
          </Link>
        </div>
      </div>

      {(productsError || ordersError) && (
        <p className="mt-6 border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700">
          {productsError && <>Couldn&apos;t load products: {productsError.message}. </>}
          {ordersError && <>Couldn&apos;t load orders: {ordersError.message} — if this says RLS/permission denied, run supabase/migrations/0006_admin_orders_select_policy.sql.</>}
        </p>
      )}

      {/* KPI cards */}
      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {statCards.map((c) => (
          <div key={c.label} className="border border-line bg-white p-4">
            <p className="text-[11px] font-medium uppercase tracking-[0.06em] text-muted">{c.label}</p>
            <p className={'mt-1.5 font-display text-[22px] leading-none ' + ('warn' in c && c.warn ? 'text-red-700' : 'text-ink')}>
              {c.value}
            </p>
            <p className="mt-1.5 text-[11px] text-charcoal">{c.sub}</p>
          </div>
        ))}
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-[1fr_320px]">
        {/* Sales overview */}
        <div className="border border-line bg-white p-5">
          <p className="font-display text-[15px] text-ink">Sales Overview</p>
          <p className="text-[12px] text-muted">Last {DAYS} days, paid orders</p>
          <div className="mt-5">
            {paidOrders.length === 0 ? (
              <p className="flex h-[150px] items-center justify-center text-[13px] text-muted">No paid orders yet.</p>
            ) : (
              <AdminSalesChart data={chartData} currency="₹" />
            )}
          </div>
        </div>

        {/* Catalog by category */}
        <div className="border border-line bg-white p-5">
          <p className="font-display text-[15px] text-ink">Catalog by Category</p>
          <p className="text-[12px] text-muted">{products.length} products total</p>
          <div className="mt-5 space-y-3">
            {categories.length === 0 && <p className="text-[13px] text-muted">No products yet.</p>}
            {categories.map(([category, count]) => (
              <div key={category}>
                <div className="flex items-center justify-between text-[12px]">
                  <span className="text-charcoal">{category}</span>
                  <span className="font-medium text-ink">{count}</span>
                </div>
                <div className="mt-1 h-1.5 w-full bg-line">
                  <div
                    className="h-1.5 bg-antiquegold"
                    style={{ width: `${(count / maxCategoryCount) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        {/* Recent orders */}
        <div className="border border-line bg-white">
          <div className="flex items-center justify-between border-b border-line px-5 py-3.5">
            <p className="font-display text-[15px] text-ink">Recent Orders</p>
            <Link href="/admin/orders" className="text-[12px] font-medium uppercase tracking-[0.06em] text-antiquegold">
              View all
            </Link>
          </div>
          <div className="divide-y divide-line">
            {orders.slice(0, 6).map((o) => (
              <div key={o.id} className="flex items-center justify-between gap-3 px-5 py-3">
                <div className="min-w-0">
                  <p className="truncate text-[13px] font-medium text-ink">{o.email}</p>
                  <p className="text-[11px] text-muted">
                    {formatDate(o.created_at)} · {o.items?.length ?? 0} item{(o.items?.length ?? 0) === 1 ? '' : 's'}
                  </p>
                </div>
                <div className="shrink-0 text-right">
                  <p className="text-[13px] font-medium text-ink">{formatINR(o.total)}</p>
                  <span
                    className={
                      'text-[10px] font-medium uppercase tracking-[0.06em] ' +
                      (o.status === 'paid' ? 'text-green-700' : o.status === 'refunded' ? 'text-red-700' : 'text-amber-700')
                    }
                  >
                    {o.status}
                  </span>
                </div>
              </div>
            ))}
            {orders.length === 0 && <p className="px-5 py-8 text-center text-[13px] text-muted">No orders yet.</p>}
          </div>
        </div>

        {/* Recent products */}
        <div className="border border-line bg-white">
          <div className="flex items-center justify-between border-b border-line px-5 py-3.5">
            <p className="font-display text-[15px] text-ink">Recently Updated Products</p>
            <Link href="/admin/products" className="text-[12px] font-medium uppercase tracking-[0.06em] text-antiquegold">
              View all
            </Link>
          </div>
          <div className="divide-y divide-line">
            {products.slice(0, 6).map((p) => (
              <Link
                key={p.id}
                href={`/admin/products/${p.id}/edit`}
                className="flex items-center justify-between gap-3 px-5 py-3 hover:bg-softwhite"
              >
                <div className="min-w-0">
                  <p className="truncate text-[13px] font-medium text-ink">{p.name}</p>
                  <p className="text-[11px] text-muted">{p.category}</p>
                </div>
                <div className="shrink-0 text-right">
                  <p className="text-[13px] text-charcoal">{formatINR(p.base_price)}</p>
                  <span
                    className={
                      'text-[10px] font-medium uppercase tracking-[0.06em] ' +
                      (p.status === 'published' ? 'text-green-700' : 'text-amber-700')
                    }
                  >
                    {p.status}
                  </span>
                </div>
              </Link>
            ))}
            {products.length === 0 && <p className="px-5 py-8 text-center text-[13px] text-muted">No products yet.</p>}
          </div>
        </div>
      </div>
    </AdminShell>
  );
}
