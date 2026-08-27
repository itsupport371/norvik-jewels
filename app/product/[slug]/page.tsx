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
        <nav className="mb-8 flex items-center gap-2 text-xs text-muted">
          <Link href="/" className="hover:text-ink">Home</Link>
          <span>/</span>
          <Link href="/shop" className="hover:text-ink">Shop</Link>
          <span>/</span>
          <Link
            href={`/shop?category=${product.category.toLowerCase()}`}
            className="hover:text-ink"
          >
            {product.category}
          </Link>
          <span>/</span>
          <span className="text-charcoal">{product.name}</span>
        </nav>

        <ProductConfigurator product={product} />

        {related.length > 0 && (
          <section className="mt-20 border-t border-line pt-12">
            <h2 className="font-display mb-8 text-xl font-medium text-ink sm:text-2xl">
              You May Also Like
            </h2>
            <div className="grid grid-cols-2 gap-x-5 gap-y-10 sm:grid-cols-4">
              {related.map((p) => (
                <Link href={`/product/${p.slug}`} key={p.slug} className="group block">
                  <div className="relative aspect-square overflow-hidden bg-[#F7F5F2]">
                    <Image
                      src={p.images[0]}
                      alt={p.name}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                      sizes="(min-width: 1024px) 25vw, 50vw"
                    />
                  </div>
                  <p className="mt-3 text-sm font-medium text-ink">{p.name}</p>
                  <p className="mt-1 text-xs text-muted">
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
