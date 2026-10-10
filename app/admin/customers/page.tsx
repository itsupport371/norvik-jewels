import AdminShell from '@/components/admin-shell';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

// Customers — real data, aggregated from orders (10 Oct 2026). There's no
// separate customers/profiles table in this project (see Dashboard's
// comment on why — no service-role key, so auth.users isn't queryable) —
// this page is every distinct email that has placed an order, with their
// order count and lifetime spend. A shopper with an account but no orders
// yet won't appear here; that's a real limitation of building this from
// `orders` alone, not a bug.
type OrderRow = {
  email: string;
  total: number;
  status: string;
  created_at: string;
};

function formatINR(n: number) {
  return '₹' + Math.round(n).toLocaleString('en-IN');
}

export default async function AdminCustomersPage() {
  const supabase = createClient();
  const [{ data: userData }, { data, error }] = await Promise.all([
    supabase.auth.getUser(),
    supabase.from('orders').select('email, total, status, created_at').order('created_at', { ascending: false }),
  ]);

  const orders = (data ?? []) as OrderRow[];

  const byEmail = new Map<string, { email: string; orderCount: number; totalSpent: number; lastOrder: string }>();
  for (const o of orders) {
    const existing = byEmail.get(o.email);
    const paidAmount = o.status === 'paid' ? Number(o.total ?? 0) : 0;
    if (existing) {
      existing.orderCount += 1;
      existing.totalSpent += paidAmount;
      if (o.created_at > existing.lastOrder) existing.lastOrder = o.created_at;
    } else {
      byEmail.set(o.email, { email: o.email, orderCount: 1, totalSpent: paidAmount, lastOrder: o.created_at });
    }
  }
  const customers = [...byEmail.values()].sort((a, b) => b.totalSpent - a.totalSpent);

  return (
    <AdminShell adminEmail={userData.user?.email ?? undefined}>
      <div>
        <h1 className="font-display text-2xl text-ink">Customers</h1>
        <p className="mt-1 text-sm text-charcoal">
          {customers.length} customer{customers.length === 1 ? '' : 's'} with at least one order.
        </p>
      </div>

      {error && (
        <p className="mt-6 border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700">
          Couldn&apos;t load customers: {error.message} — if this says RLS/permission denied, run
          supabase/migrations/0006_admin_orders_select_policy.sql.
        </p>
      )}

      <div className="mt-8 overflow-hidden border border-line bg-white">
        <table className="w-full text-left text-[13px]">
          <thead className="bg-softwhite text-[11px] uppercase tracking-[0.08em] text-muted">
            <tr>
              <th className="px-4 py-3 font-medium">Email</th>
              <th className="px-4 py-3 font-medium">Orders</th>
              <th className="px-4 py-3 font-medium">Lifetime Spend</th>
              <th className="px-4 py-3 font-medium">Last Order</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {customers.map((c) => (
              <tr key={c.email}>
                <td className="px-4 py-3 font-medium text-ink">{c.email}</td>
                <td className="px-4 py-3 text-charcoal">{c.orderCount}</td>
                <td className="px-4 py-3 text-charcoal">{formatINR(c.totalSpent)}</td>
                <td className="px-4 py-3 text-charcoal">
                  {new Date(c.lastOrder).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                </td>
              </tr>
            ))}
            {customers.length === 0 && !error && (
              <tr>
                <td colSpan={4} className="px-4 py-10 text-center text-charcoal">
                  No customers yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </AdminShell>
  );
}
