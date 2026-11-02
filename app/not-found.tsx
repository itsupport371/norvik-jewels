import Link from 'next/link';
import SiteHeader from '@/components/site-header';
import SiteFooter from '@/components/site-footer';

// Custom 404 — content brief ("Ecommerce_Mann_2"), Site Microcopy section,
// row 128 ("Page not found"). Added 2 Nov 2026 content recheck — the site
// had no app/not-found.tsx before this, so a bad URL fell through to
// Next.js's bare default page instead of anything on-brand.
export default function NotFound() {
  return (
    <>
      <SiteHeader />
      <main className="flex min-h-[60vh] flex-col items-center justify-center bg-ivory px-6 py-24 text-center">
        <p className="mb-3 text-[10px] font-medium uppercase leading-[1.2] tracking-[0.14em] text-antiquegold sm:text-[11px]">
          404
        </p>
        <h1 className="font-display mx-auto max-w-lg text-[26px] font-medium leading-[1.15] tracking-[-0.01em] text-inknavy sm:text-[34px]">
          There is another way into the Norvik world.
        </h1>
        <Link
          href="/"
          className="mt-7 inline-block border border-antiquegold px-8 py-3.5 text-[11px] font-medium uppercase leading-[1.2] tracking-[0.08em] text-inknavy transition-colors hover:bg-antiquegold hover:text-softwhite sm:text-[12px]"
        >
          Return Home
        </Link>
      </main>
      <SiteFooter />
    </>
  );
}
