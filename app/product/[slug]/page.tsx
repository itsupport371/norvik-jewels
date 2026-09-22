import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
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
        <ProductConfigurator product={product} />

        {related.length > 0 && (
          <section className="mt-20 border-t border-line pt-12">
            <h2 className="font-display mb-8 text-[26px] font-medium leading-[1.05] tracking-[-0.01em] text-ink sm:text-[36px]">
              You May Also Like
            </h2>
            <div className="grid grid-cols-2 gap-x-5 gap-y-10 sm:grid-cols-4">
              {related.map((p) => (
                <Link
                  href={`/product/${p.slug}`}
                  key={p.slug}
                  className="group relative block aspect-square overflow-hidden bg-white p-2 sm:p-3"
                >
                  <div className="relative h-[calc(100%-64px)] overflow-hidden sm:h-[calc(100%-76px)]">
                    <Image
                      src={p.images[0]}
                      alt={p.name}
                      fill
                      className="object-contain transition-transform duration-500 group-hover:scale-105"
                      sizes="(min-width: 1024px) 25vw, 50vw"
                    />
                  </div>
                  <div className="flex h-16 flex-col items-center justify-center overflow-hidden px-1 text-center sm:h-[76px]">
                    <p className="line-clamp-2 w-full text-[13px] font-medium leading-[1.35] text-ink sm:text-[14px]">{p.name}</p>
                    <p className="mt-1 text-[13px] leading-[1.35] text-muted">
                      {p.currency}{p.basePrice.toLocaleString('en-IN')}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </main>
      <SiteFooter />
    </>
  );
}
