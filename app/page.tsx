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

        {/* Featured Collections */}
        <section className="mx-auto max-w-7xl px-6 py-20 lg:px-10">
          <div className="mb-10 text-center">
            <h2 className="font-display text-2xl font-medium text-ink sm:text-3xl">
              Shop by Collection
            </h2>
          </div>
          <div className="grid grid-cols-2 gap-6">
            <Link
              href="/shop?category=rings"
              className="group relative aspect-[4/3] overflow-hidden bg-ink"
            >
              <Image
                src="/images/product-ring-1.jpg"
                alt="Rings collection"
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-105"
                sizes="(min-width: 640px) 50vw, 100vw"
              />
              <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/60 to-transparent" />
              <span className="absolute bottom-6 left-6 font-display text-xl font-medium text-white">
                Rings
              </span>
            </Link>
            <Link
              href="/shop?category=earrings"
              className="group relative aspect-[4/3] overflow-hidden bg-ink"
            >
              <Image
                src="/images/product-earring-1.jpg"
                alt="Earrings collection"
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-105"
                sizes="(min-width: 640px) 50vw, 100vw"
              />
              <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/60 to-transparent" />
              <span className="absolute bottom-6 left-6 font-display text-xl font-medium text-white">
                Earrings
              </span>
            </Link>
            <Link
              href="/shop?category=necklaces"
              className="group relative aspect-[4/3] overflow-hidden bg-ink"
            >
              <Image
                src="/images/swan-pendant-a-white.jpg"
                alt="Necklaces collection"
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-105"
                sizes="(min-width: 640px) 50vw, 100vw"
              />
              <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/60 to-transparent" />
              <span className="absolute bottom-6 left-6 font-display text-xl font-medium text-white">
                Necklaces
              </span>
            </Link>
            <Link
              href="/shop?category=nose pin"
              className="group relative aspect-[4/3] overflow-hidden bg-ink"
            >
              <Image
                src="/images/nose-pin-yellow.jpg"
                alt="Nose Pin collection"
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-105"
                sizes="(min-width: 640px) 50vw, 100vw"
              />
              <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/60 to-transparent" />
              <span className="absolute bottom-6 left-6 font-display text-xl font-medium text-white">
                Nose Pin
              </span>
            </Link>
          </div>
        </section>

        {/* New Arrivals */}
        <section className="mx-auto max-w-7xl px-6 pb-20 lg:px-10">
          <div className="mb-10 flex items-end justify-between">
            <h2 className="font-display text-2xl font-medium text-ink sm:text-3xl">
              New Arrivals
            </h2>
            <Link
              href="/shop"
              className="text-xs font-medium uppercase tracking-wide2 text-charcoal underline underline-offset-4 hover:text-[#B8935A]"
            >
              View All
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-x-5 gap-y-10 sm:grid-cols-3 lg:grid-cols-5">
            {products.map((product) => (
              <Link
                href={`/product/${product.slug}`}
                key={product.slug}
                className="group block"
              >
                <div className="relative aspect-square overflow-hidden bg-[#F7F5F2]">
                  <Image
                    src={product.images[0]}
                    alt={product.name}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                    sizes="(min-width: 1024px) 20vw, (min-width: 640px) 33vw, 50vw"
                  />
                </div>
                <p className="mt-3 text-xs font-medium text-ink">
                  {product.name}
                </p>
                <p className="mt-1 text-xs text-muted">
                  {product.currency}
                  {getDisplayPrice(product).toLocaleString("en-IN")}
                </p>
              </Link>
            ))}
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
          <div className="flex flex-col items-start justify-center bg-[#F7F5F2] px-8 py-16 lg:px-16">
            <p className="mb-3 text-xs font-medium uppercase tracking-[0.25em] text-[#B8935A]">
              Craftsmanship
            </p>
            <h2 className="font-display mb-5 text-2xl font-medium text-ink sm:text-3xl">
              Every piece, considered.
            </h2>
            <p className="mb-6 max-w-md text-sm leading-relaxed text-charcoal">
              {/* Placeholder — replace with real brand copy from Norvik Jewels. */}
              From first sketch to final polish, every Norvik Jewels piece
              passes through the hands of skilled artisans who bring
              Scandinavian minimalism to 18K gold and certified diamonds —
              designed in Dubai, made to last a lifetime.
            </p>
            <Link
              href="/about"
              className="text-xs font-medium uppercase tracking-wide2 text-ink underline underline-offset-4 hover:text-[#B8935A]"
            >
              Our Story
            </Link>
          </div>
        </section>

        {/* Newsletter */}
        <section className="bg-ink px-6 py-20 text-center">
          <p className="mx-auto mb-3 text-xs font-medium uppercase tracking-[0.25em] text-[#D9BE93]">
            Stay in the Know
          </p>
          <h2 className="font-display mx-auto mb-8 max-w-md text-2xl font-medium text-white">
            New collections, bespoke stories, and early access — in your inbox.
          </h2>
          <form className="mx-auto flex max-w-sm flex-col gap-3 sm:flex-row">
            <input
              type="email"
              placeholder="your@email.com"
              className="flex-1 border border-white/20 bg-transparent px-4 py-3 text-sm text-white outline-none placeholder:text-white/40 focus:border-white"
            />
            <button
              type="submit"
              className="whitespace-nowrap bg-ivory px-6 py-3 text-xs font-medium uppercase tracking-wide2 text-ink transition-opacity hover:opacity-90"
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
