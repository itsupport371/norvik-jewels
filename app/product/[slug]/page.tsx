import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import SiteHeader from '@/components/site-header';
import SiteFooter from '@/components/site-footer';
import ProductConfigurator from '@/components/product-configurator';
import { getProductBySlug, products } from '@/lib/mock-products';

export function generateStaticParams() {
  return products.map((p) => ({ slug: p.slug }));
}

export default function ProductPage({ params }: { params: { slug: string } }) {
  const product = getProductBySlug(params.slug);

  if (!product) {
    notFound();
  }

  const related = products
    .filter((p) => p.category === product.category && p.slug !== product.slug)
    .slice(0, 4);

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
                <Link href={`/product/${p.slug}`} key={p.slug} className="group block">
                  <div className="relative aspect-square overflow-hidden bg-white">
                    <Image
                      src={p.images[0]}
                      alt={p.name}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                      sizes="(min-width: 1024px) 25vw, 50vw"
                    />
                  </div>
                  <p className="mt-3 text-[13px] font-medium leading-[1.35] text-ink sm:text-[14px]">{p.name}</p>
                  <p className="mt-1 text-[13px] leading-[1.35] text-muted">
                    {p.currency}{p.basePrice.toLocaleString('en-IN')}
                  </p>
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
