import AdminShell from '@/components/admin-shell';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

// Reviews & Support (10 Oct 2026) — stub. No reviews table or support
// ticket system exists yet; star ratings shown on the storefront (if any)
// are placeholder content, not real customer-submitted reviews.
export default async function AdminReviewsPage() {
  const supabase = createClient();
  const { data: userData } = await supabase.auth.getUser();

  return (
    <AdminShell adminEmail={userData.user?.email ?? undefined}>
      <h1 className="font-display text-2xl text-ink">Reviews &amp; Support</h1>
      <div className="mt-6 max-w-xl border border-line bg-white p-6">
        <p className="text-[14px] text-ink">Not built yet.</p>
        <p className="mt-2 text-[13px] leading-[1.6] text-charcoal">
          There&apos;s no reviews table and no support-ticket system in the project — a real
          version of this page would need both designed first (can shoppers leave a review only
          after a paid order? does support route through email or a form here?).
        </p>
      </div>
    </AdminShell>
  );
}
