import AdminShell from '@/components/admin-shell';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

// Settings & Admin Controls (10 Oct 2026) — mostly a stub, but the admin
// email allow-list IS real and worth surfacing here read-only: it's the
// actual access-control list from lib/supabase/middleware.ts / the
// ADMIN_EMAILS env var (also mirrored in
// supabase/migrations/0002_admin_write_policy.sql and 0006's orders
// policy) — not invented for this page. Everything else (payment methods,
// shipping rules, taxes, SEO) is either hardcoded elsewhere in the code
// (lib/pricing.ts, Stripe dashboard config) or not configurable at all yet
// — changing those from a UI here would need real settings tables, not
// just a page.
export default async function AdminSettingsPage() {
  const supabase = createClient();
  const { data: userData } = await supabase.auth.getUser();

  const adminEmails = (process.env.ADMIN_EMAILS ?? '')
    .split(',')
    .map((e) => e.trim())
    .filter(Boolean);

  return (
    <AdminShell adminEmail={userData.user?.email ?? undefined}>
      <h1 className="font-display text-2xl text-ink">Settings &amp; Admin Controls</h1>

      <div className="mt-6 max-w-xl border border-line bg-white p-6">
        <p className="text-[13px] font-medium uppercase tracking-[0.06em] text-muted">Admin Access</p>
        <p className="mt-2 text-[13px] leading-[1.6] text-charcoal">
          These emails can sign in to /admin (set via the <code className="text-[12px]">ADMIN_EMAILS</code>{' '}
          environment variable — change it in Vercel to add or remove an admin):
        </p>
        <ul className="mt-3 space-y-1">
          {adminEmails.map((email) => (
            <li key={email} className="text-[13px] text-ink">
              {email}
            </li>
          ))}
          {adminEmails.length === 0 && <li className="text-[13px] text-muted">No admin emails configured.</li>}
        </ul>
      </div>

      <div className="mt-4 max-w-xl border border-line bg-white p-6">
        <p className="text-[14px] text-ink">Everything else here is not built yet.</p>
        <p className="mt-2 text-[13px] leading-[1.6] text-charcoal">
          Payment methods, shipping rules, taxes, and SEO settings aren&apos;t stored in a database
          table an admin screen could edit — they&apos;re either hardcoded in the project (pricing,
          GST) or configured directly in the Stripe Dashboard. Making those editable from here is
          real scope, not a quick add.
        </p>
      </div>
    </AdminShell>
  );
}
