import { notFound } from 'next/navigation';
import SiteHeader from '@/components/site-header';
import SiteFooter from '@/components/site-footer';
import ProductConfigurator from '@/components/product-configurator';
import RelatedProducts from '@/components/related-products';
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
        <ProductConfigurator product={product} />

        {/* Extracted into its own client component (28 Sep 2026) — the grid
            is now gated behind a "Show More" button instead of always
            showing, which needs useState, and this page itself stays a
            server component (product/related data is fetched here, not in
            the browser). See components/related-products.tsx. */}
        <RelatedProducts related={related} />
      </main>
      <SiteFooter />
    </>
  );
}
