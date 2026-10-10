import AdminShell from '@/components/admin-shell';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

// Orders — real data (10 Oct 2026), part of the admin dashboard build.
// Flat list only, no filters/pagination/refund actions yet (the reference
// concept image's Orders module has those) — this is the minimal real
// version: everything `orders` already stores (email, items, total,
// status, date), nothing invented. Needs
// supabase/migrations/0006_admin_orders_select_policy.sql run first, same
// as the Dashboard — otherwise RLS only shows the admin their own orders.
type OrderRow = {
  id: string;
  email: string;
  total: number;
  currency: string;
  status: string;
  items: { name: string; quantity: number; amount: number }[];
  invoice_pdf_url: string | null;
  created_at: string;
};

function formatINR(n: number) {
  return '₹' + Math.round(n).toLocaleString('en-IN');
}

export default async function AdminOrdersPage() {
  const supabase = createClient();
  const [{ data: userData }, { data, error }] = await Promise.all([
    supabase.auth.getUser(),
    supabase
      .from('orders')
      .select('id, email, total, currency, status, items, invoice_pdf_url, created_at')
      .order('created_at', { ascending: false }),
  ]);

  const orders = (data ?? []) as OrderRow[];

  return (
    <AdminShell adminEmail={userData.user?.email ?? undefined}>
      <div>
        <h1 className="font-display text-2xl text-ink">Orders</h1>
        <p className="mt-1 text-sm text-charcoal">
          {orders.length} order{orders.length === 1 ? '' : 's'}.
        </p>
      </div>

      {error && (
        <p className="mt-6 border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700">
          Couldn&apos;t load orders: {error.message} — if this says RLS/permission denied, run
          supabase/migrations/0006_admin_orders_select_policy.sql.
        </p>
      )}

      <div className="mt-8 overflow-hidden border border-line bg-white">
        <table className="w-full text-left text-[13px]">
          <thead className="bg-softwhite text-[11px] uppercase tracking-[0.08em] text-muted">
            <tr>
              <th className="px-4 py-3 font-medium">Customer</th>
              <th className="px-4 py-3 font-medium">Items</th>
              <th className="px-4 py-3 font-medium">Total</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Date</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {orders.map((o) => (
              <tr key={o.id}>
                <td className="px-4 py-3 font-medium text-ink">{o.email}</td>
                <td className="px-4 py-3 text-charcoal">
                  {(o.items ?? []).map((it) => `${it.quantity}× ${it.name}`).join(', ') || '—'}
                </td>
                <td className="px-4 py-3 text-charcoal">{formatINR(o.total)}</td>
                <td className="px-4 py-3">
                  <span
                    className={
                      'px-2 py-0.5 text-[11px] font-medium uppercase tracking-[0.06em] ' +
                      (o.status === 'paid'
                        ? 'bg-green-100 text-green-800'
                        : o.status === 'refunded'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-amber-100 text-amber-800')
                    }
                  >
                    {o.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-charcoal">
                  {new Date(o.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                </td>
                <td className="px-4 py-3 text-right">
                  {o.invoice_pdf_url && (
                    <a href={o.invoice_pdf_url} target="_blank" rel="noopener noreferrer" className="text-antiquegold underline underline-offset-4">
                      Invoice
                    </a>
                  )}
                </td>
              </tr>
            ))}
            {orders.length === 0 && !error && (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-charcoal">
                  No orders yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </AdminShell>
  );
}
