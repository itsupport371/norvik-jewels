import Link from 'next/link';

// Admin dashboard — Phase 3: real links to product management now that
// the list/add/edit/import screens exist.
export default function AdminDashboardPage() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-16">
      <h1 className="font-display text-2xl text-ink">Admin</h1>
      <p className="mt-2 text-sm text-charcoal">Norvik Jewels product management.</p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        <Link href="/admin/products" className="block border border-line p-5 hover:bg-softwhite">
          <p className="font-display text-lg text-ink">Products</p>
          <p className="mt-1 text-[13px] text-charcoal">View, add, and edit products. Draft vs. Published.</p>
        </Link>
        <Link href="/admin/products/import" className="block border border-line p-5 hover:bg-softwhite">
          <p className="font-display text-lg text-ink">Import from Excel</p>
          <p className="mt-1 text-[13px] text-charcoal">Bulk-create draft products from a manufacturer sheet.</p>
        </Link>
      </div>
    </main>
  );
}
