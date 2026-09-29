import { notFound } from 'next/navigation';
import SiteHeader from '@/components/site-header';
import SiteFooter from '@/components/site-footer';
import ProductConfigurator from '@/components/product-configurator';
import { getProductBySlugServer, getRelatedServer } from '@/lib/products-server';

// Phase 5: the real catalogue is a Draft/Publish workflow in Supabase, not a
// fixed list known at build time, so this can no longer be statically
// generated the way the all-static catalogue was (no more
// generateStaticParams) — always render fresh so a newly Published (or
// unpublished) product shows/disappears immediately instead of waiting for
// a rebuild.
export const dynamic = 'force-dynamic';

export default async function ProductPage({ params }: { params: { slug: string } }) {
  const product = await getProductBySlugServer(params.slug);

  if (!product) {
    notFound();
  }

  const related = await getRelatedServer(product.category, product.slug);

  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-7xl px-6 py-12 lg:px-10 lg:py-16">
        {/* `related` is now passed down and rendered INSIDE the
            configurator's own grid (28-29 Sep 2026) — it fills what used to
            be empty white space next to Specifications on desktop, instead
            of sitting as its own full-width section below everything. See
            components/related-products.tsx for the reasoning. */}
        <ProductConfigurator product={product} related={related} />
      </main>
      <SiteFooter />
    </>
  );
}
