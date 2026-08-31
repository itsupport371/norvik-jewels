import Link from "next/link";
import Image from "next/image";
import SiteHeader from "@/components/site-header";
import SiteFooter from "@/components/site-footer";
import HeroCarousel from "@/components/hero-carousel";
import { products, getDisplayPrice } from "@/lib/mock-products";

export default function HomePage() {
  return (
    <>
      <SiteHeader />
      <main className="bg-ivory">
        <HeroCarousel />

        {/* Shop by Collection — row layout, Soft White cards */}
        <section className="mx-auto max-w-7xl px-6 py-20 lg:px-10">
          <div className="mb-10 text-center">
            <p className="mb-3 text-[10px] font-medium uppercase leading-[1.2] tracking-[0.14em] text-antiquegold sm:text-[11px]">
              Explore
            </p>
            <h2 className="font-display text-[26px] font-medium leading-[1.05] tracking-[-0.01em] text-inknavy sm:text-[36px]">
              Shop by Collection
            </h2>
          </div>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 sm:gap-5">
            {[
              {
                href: '/shop?category=rings',
                label: 'Rings',
                image: '/images/product-ring-1.jpg',
              },
              {
                href: '/shop?category=earrings',
                label: 'Earrings',
                image: '/images/product-earring-1.jpg',
              },
              {
                href: '/shop?category=necklaces',
                label: 'Necklaces',
                image: '/images/swan-pendant-a-white.jpg',
              },
              {
                href: '/shop?category=nose pin',
                label: 'Nose Pin',
                image: '/images/nose-pin-yellow.jpg',
              },
            ].map((c) => (
              <Link
                key={c.label}
                href={c.href}
                className="group block border border-warmstone bg-white p-4 transition-colors hover:border-antiquegold"
              >
                <div className="relative aspect-square overflow-hidden bg-white">
                  <Image
                    src={c.image}
                    alt={`${c.label} collection`}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                    sizes="(min-width: 640px) 25vw, 50vw"
                  />
                </div>
                <span className="mt-4 block text-center font-sans text-[13px] font-medium leading-[1.35] text-inknavy sm:text-[15px]">
                  {c.label}
                </span>
              </Link>
            ))}
          </div>
        </section>

        {/* Signature Collection banner */}
        <section className="grid grid-cols-1 bg-midnight lg:grid-cols-2">
          <div className="relative min-h-[360px] lg:order-2 lg:min-h-[560px]">
            <Image
              src="/images/hero-web-2.jpg"
              alt="The Signature Collection"
              fill
              className="object-cover"
              sizes="(min-width: 1024px) 50vw, 100vw"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-midnight/40 via-transparent to-transparent lg:bg-gradient-to-l" />
          </div>
          <div className="flex flex-col items-start justify-center px-8 py-20 lg:order-1 lg:px-20">
            <p className="mb-4 text-[10px] font-medium uppercase leading-[1.2] tracking-[0.14em] text-antiquegold sm:text-[11px]">
              Norvik Signature
            </p>
            <h2 className="font-display mb-6 text-[34px] font-medium leading-[1] tracking-[-0.015em] text-softwhite sm:text-[46px]">
              The Signature Collection
            </h2>
            <p className="mb-9 max-w-md text-[14px] leading-[1.6] text-warmstone sm:text-[15px]">
              A curated edit of our most-loved designs — one defining piece from
              every category, chosen for the way it catches the light.
            </p>
            <Link
              href="/shop?collection=signature"
              className="border border-antiquegold px-8 py-3.5 text-[11px] font-medium uppercase leading-[1.2] tracking-[0.08em] text-softwhite transition-colors hover:bg-antiquegold hover:text-midnight sm:text-[12px]"
            >
              Shop the Collection
            </Link>
          </div>
        </section>

        {/* New Arrivals */}
        <section className="bg-scandi px-6 py-20 lg:px-10">
          <div className="mx-auto max-w-7xl">
            <div className="mb-10 flex items-end justify-between border-b border-warmstone pb-6">
              <div>
                <p className="mb-2 text-[10px] font-medium uppercase leading-[1.2] tracking-[0.14em] text-antiquegold sm:text-[11px]">
                  Just In
                </p>
                <h2 className="font-display text-[26px] font-medium leading-[1.05] tracking-[-0.01em] text-inknavy sm:text-[36px]">
                  New Arrivals
                </h2>
              </div>
              <Link
                href="/shop"
                className="text-[11px] font-medium uppercase leading-[1.2] tracking-[0.08em] text-inknavy underline underline-offset-4 transition-colors hover:text-antiquegold sm:text-[12px]"
              >
                View All
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-5 lg:grid-cols-5">
              {products.map((product) => (
                <Link
                  href={`/product/${product.slug}`}
                  key={product.slug}
                  className="group block border border-warmstone bg-white p-3 transition-colors hover:border-antiquegold"
                >
                  <div className="relative aspect-square overflow-hidden bg-white">
                    <Image
                      src={product.images[0]}
                      alt={product.name}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                      sizes="(min-width: 1024px) 20vw, (min-width: 640px) 33vw, 50vw"
                    />
                  </div>
                  <p className="mt-4 text-[10px] font-medium uppercase leading-[1.2] tracking-[0.14em] text-antiquegold sm:text-[11px]">
                    {product.category}
                  </p>
                  <p className="mt-1 text-[13px] font-medium leading-[1.35] text-inknavy sm:text-[14px]">
                    {product.name}
                  </p>
                  <p className="mt-1 text-[13px] leading-[1.35] text-inknavy/60">
                    {product.currency}
                    {getDisplayPrice(product).toLocaleString("en-IN")}
                  </p>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Craftsmanship / Brand story */}
        <section className="grid grid-cols-1 lg:grid-cols-2">
          <div className="relative aspect-[4/3] lg:aspect-auto">
            <Image
              src="/images/product-earring-3.jpg"
              alt="Norvik Jewels craftsmanship"
              fill
              className="object-cover"
              sizes="(min-width: 1024px) 50vw, 100vw"
            />
          </div>
          <div className="flex flex-col items-start justify-center bg-white px-8 py-16 lg:px-16">
            <p className="mb-3 text-[10px] font-medium uppercase leading-[1.2] tracking-[0.14em] text-antiquegold sm:text-[11px]">
              Craftsmanship
            </p>
            <h2 className="font-display mb-5 text-[30px] font-medium leading-[1.08] tracking-[-0.01em] text-ink sm:text-[38px]">
              Every piece, considered.
            </h2>
            <p className="mb-6 max-w-md text-[14px] leading-[1.6] text-charcoal sm:text-[15px]">
              {/* Placeholder — replace with real brand copy from Norvik Jewels. */}
              From first sketch to final polish, every Norvik Jewels piece passes
              through the hands of skilled artisans who bring Scandinavian
              minimalism to 18K gold and certified diamonds — designed in Dubai,
              made to last a lifetime.
            </p>
            <Link
              href="/about"
              className="text-[11px] font-medium uppercase leading-[1.2] tracking-[0.08em] text-ink underline underline-offset-4 hover:text-antiquegold sm:text-[12px]"
            >
              Our Story
            </Link>
          </div>
        </section>

        {/* Newsletter */}
        <section className="bg-ink px-6 py-20 text-center">
          <p className="mx-auto mb-3 text-[10px] font-medium uppercase leading-[1.2] tracking-[0.14em] text-antiquegold sm:text-[11px]">
            Stay in the Know
          </p>
          <h2 className="font-display mx-auto mb-8 max-w-md text-[30px] font-medium leading-[1.08] tracking-[-0.01em] text-white sm:text-[38px]">
            New collections, bespoke stories, and early access — in your inbox.
          </h2>
          <form className="mx-auto flex max-w-sm flex-col gap-3 sm:flex-row">
            <input
              type="email"
              placeholder="your@email.com"
              className="flex-1 border border-white/20 bg-transparent px-4 py-3 text-[14px] leading-[1.6] text-white outline-none placeholder:text-white/40 focus:border-white sm:text-[15px]"
            />
            <button
              type="submit"
              className="whitespace-nowrap bg-ivory px-6 py-3 text-[11px] font-medium uppercase leading-[1.2] tracking-[0.08em] text-ink transition-opacity hover:opacity-90 sm:text-[12px]"
            >
              Subscribe
            </button>
          </form>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
