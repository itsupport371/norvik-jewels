import Link from 'next/link';
import AdminShell from '@/components/admin-shell';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

// Analytics (10 Oct 2026) — the Dashboard's Sales Overview chart + Catalog
// by Category already cover the two real things we have data for (orders,
// products). Visitor traffic/conversion-rate numbers (like the reference
// image's "45,230 Total Visitors") would need a real analytics tool wired
// in (GA4, Vercel Analytics, etc.) — nothing in this project tracks page
// views today, so that section would otherwise be fabricated.
export default async function AdminAnalyticsPage() {
  const supabase = createClient();
  const { data: userData } = await supabase.auth.getUser();

  return (
    <AdminShell adminEmail={userData.user?.email ?? undefined}>
      <h1 className="font-display text-2xl text-ink">Analytics</h1>
      <div className="mt-6 max-w-xl border border-line bg-white p-6">
        <p className="text-[14px] text-ink">
          Sales and category trends already live on the{' '}
          <Link href="/admin" className="text-antiquegold underline underline-offset-4">
            Dashboard
          </Link>
          .
        </p>
        <p className="mt-2 text-[13px] leading-[1.6] text-charcoal">
          Visitor traffic, conversion rate, and traffic-source numbers would need a real
          analytics tool connected (Google Analytics, Vercel Analytics, etc.) — nothing in this
          project tracks page views today, so showing those here would mean making up numbers.
        </p>
      </div>
    </AdminShell>
  );
}
