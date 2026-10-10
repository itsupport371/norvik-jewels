import AdminShell from '@/components/admin-shell';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

// Website Content / CMS (10 Oct 2026) — stub. Banners, homepage sections,
// nav, About page copy etc. are all hand-coded in the Next.js components
// today (campaign-hero.tsx, homepage sections in app/page.tsx, and so on),
// not driven by any database table an admin screen could edit. Making
// them editable from here means moving that content into Supabase first —
// real scope, not a quick add to this page.
export default async function AdminContentPage() {
  const supabase = createClient();
  const { data: userData } = await supabase.auth.getUser();

  return (
    <AdminShell adminEmail={userData.user?.email ?? undefined}>
      <h1 className="font-display text-2xl text-ink">Website Content</h1>
      <div className="mt-6 max-w-xl border border-line bg-white p-6">
        <p className="text-[14px] text-ink">Not built yet.</p>
        <p className="mt-2 text-[13px] leading-[1.6] text-charcoal">
          Banners, homepage sections, and page copy (About, Our World, etc.) are all hand-coded
          in the site&apos;s components right now — there&apos;s no database table behind any of it for an
          admin screen to edit. That would need to move into Supabase first before this page
          could do anything real.
        </p>
      </div>
    </AdminShell>
  );
}
