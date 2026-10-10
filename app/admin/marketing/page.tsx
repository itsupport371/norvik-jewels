import AdminShell from '@/components/admin-shell';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

// Marketing (10 Oct 2026) — stub. No coupons/campaigns table exists; the
// "FLAT 15% OFF" banner on the storefront is hand-coded copy, not a real
// discount code a shopper enters at checkout.
export default async function AdminMarketingPage() {
  const supabase = createClient();
  const { data: userData } = await supabase.auth.getUser();

  return (
    <AdminShell adminEmail={userData.user?.email ?? undefined}>
      <h1 className="font-display text-2xl text-ink">Marketing</h1>
      <div className="mt-6 max-w-xl border border-line bg-white p-6">
        <p className="text-[14px] text-ink">Not built yet.</p>
        <p className="mt-2 text-[13px] leading-[1.6] text-charcoal">
          There&apos;s no coupon/campaign system in the project — any &quot;% off&quot; banner on the
          storefront today is just hand-written copy, not a code Stripe actually checks at
          checkout. Real coupons need their own table and checkout-flow changes.
        </p>
      </div>
    </AdminShell>
  );
}
