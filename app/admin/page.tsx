// Admin dashboard — placeholder for Phase 1/2 of the admin panel build.
// Access is already gated by lib/supabase/middleware.ts (ADMIN_EMAILS
// allow-list): if you can see this page, the admin login + protection is
// working end-to-end. The real product list / add / edit / Excel-import
// screens land here in the next phase — this page just confirms the
// foundation before building on top of it.
export default function AdminDashboardPage() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-16">
      <h1 className="font-display text-2xl text-ink">Admin</h1>
      <p className="mt-2 text-sm text-charcoal">
        Login + access control is working. Product management (list, add/edit,
        Excel import) is coming next.
      </p>
    </main>
  );
}
