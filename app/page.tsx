import Link from "next/link";
import Image from "next/image";
import SiteHeader from "@/components/site-header";
import SiteFooter from "@/components/site-footer";
import CampaignHero from "@/components/campaign-hero";
import PhilosophySlider from "@/components/philosophy-slider";
import NewArrivalsRow from "@/components/new-arrivals-row";
import { getAllProductsServer } from "@/lib/products-server";

// Phase 5: now includes the real, admin-managed catalogue (published rows
// from Supabase) alongside the original static showcase products — see
// lib/products-server.ts. Needs the page to actually fetch data, so this
// can no longer be a plain static component.
export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const products = await getAllProductsServer();

  return (
    <>
      <SiteHeader transparentOnHero />
      <main className="bg-ivory">
        <CampaignHero />

        {/* Philosophy — now a 3-slide carousel (30 Oct 2026, client request),
            see components/philosophy-slider.tsx for the 3 texts and why. */}
        <PhilosophySlider />

        {/* Shop by Collection — row layout, Soft White cards. Sits right
            after the campaign hero now — the "Our Philosophy" quote section
            and the second product hero carousel (HeroCarousel, still in
            components/hero-carousel.tsx if it's ever wanted back) were both
            removed per client request. */}
        <section id="shop-collection" className="mx-auto max-w-7xl px-6 py-20 lg:px-10">
          <div className="mb-10 text-center">
            <p className="mb-3 text-[10px] font-medium uppercase leading-[1.2] tracking-[0.14em] text-antiquegold sm:text-[11px]">
              Explore
            </p>
            <h2 className="font-display text-[26px] font-medium leading-[1.05] tracking-[-0.01em] text-inknavy sm:text-[36px]">
              Shop by Category
            </h2>
          </div>
          {/* Was `flex flex-wrap justify-center` — wrapped strictly by
              available width (6 fit on one line, then 2 dropped to a second,
              awkward-looking row). A fixed grid always breaks evenly: 2 per
              row on phones (4 tiny circles side by side was too cramped),
              4 per row from `sm:` up, so 8 categories read as a clean 2x4. */}
          <div className="grid grid-cols-2 justify-items-center gap-x-8 gap-y-10 sm:grid-cols-4 sm:gap-x-10 lg:gap-x-14">
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
                href: '/shop?category=pendants',
                label: 'Pendants',
                image: '/images/swan-pendant-a-white.jpg',
              },
              {
                href: '/shop?category=pendant set',
                label: 'Pendant Set',
                image: '/images/swan-pendant-b-white.jpg',
              },
              {
                href: '/shop?category=nose pin',
                label: 'Nose Pin',
                image: '/images/nose-pin-yellow.jpg',
              },
              {
                href: '/shop?category=baby earrings',
                label: 'Baby Earrings',
                image: '/images/product-earring-1.jpg',
              },
              {
                href: '/shop?category=tanmaniya',
                label: 'Tanmaniya',
                image: '/images/swan-pendant-a-yellow.jpg',
              },
              {
                href: '/shop?category=bracelet',
                label: 'Bracelet',
                image: '/images/ring-yellow-gold.jpg',
              },
              // New categories above are placeholders pending client
              // confirmation (see lib/mock-products.ts) — same reused
              // images as their placeholder product entries.
            ].map((c) => (
              <Link key={c.label} href={c.href} className="group flex flex-col items-center gap-3 text-center">
                <div className="relative h-24 w-24 overflow-hidden rounded-full sm:h-32 sm:w-32 lg:h-36 lg:w-36">
                  <Image
                    src={c.image}
                    alt={`${c.label} collection`}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                    sizes="(min-width: 1024px) 144px, (min-width: 640px) 128px, 96px"
                  />
                </div>
                <span className="max-w-[110px] text-[13px] font-medium leading-[1.35] text-inknavy transition-colors duration-300 group-hover:text-antiquegold sm:text-[14px]">
                  {c.label}
                </span>
              </Link>
            ))}
          </div>
        </section>

        {/* Collections teaser — content brief (28 Oct 2026), Homepage
            "Collections" block. Distinct from the category tiles just above:
            this points at the curated /collections page (Signature etc.),
            not a product-type filter. Text-only band, no new imagery
            required. */}
        <section className="bg-scandi px-6 py-16 text-center lg:px-10">
          <h2 className="font-display mx-auto max-w-lg text-[24px] font-medium leading-[1.15] tracking-[-0.01em] text-inknavy sm:text-[30px]">
            Different expressions. A shared light.
          </h2>
          <p className="mx-auto mt-4 max-w-md text-[14px] leading-[1.6] text-charcoal sm:text-[15px]">
            Some forms feel like still water. Others carry the warmth of sand or
            the movement of light. Find the collection that feels closest to you.
          </p>
          <Link
            href="/collections"
            className="mt-6 inline-block text-[11px] font-medium uppercase leading-[1.2] tracking-[0.08em] text-inknavy underline underline-offset-4 transition-colors hover:text-antiquegold sm:text-[12px]"
          >
            Discover the collections
          </Link>
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
            {/* Headline/body/CTA updated per content brief (28 Oct 2026) —
                eyebrow kept as "Norvik Signature" per the brief's own note to
                retain the current staging collection name until a renamed
                collection is approved. */}
            <h2 className="font-display mb-6 text-[34px] font-medium leading-[1] tracking-[-0.015em] text-softwhite sm:text-[46px]">
              For the moments that stay.
            </h2>
            <p className="mb-9 max-w-md text-[14px] leading-[1.6] text-warmstone sm:text-[15px]">
              A little more presence. A detail you return to. Gold that gives a
              moment a form, so you can carry it beyond the day.
            </p>
            {/* Links to /shop (all products), not /shop?collection=signature
                (30 Oct 2026, client: "jo products daale hein wo saare
                signature hein" — every product in the catalogue right now
                IS the Signature edit, so filtering down to a `collection`
                field would just show the same thing, if not less). */}
            <Link
              href="/shop"
              className="border border-antiquegold px-8 py-3.5 text-[11px] font-medium uppercase leading-[1.2] tracking-[0.08em] text-softwhite transition-colors hover:bg-antiquegold hover:text-midnight sm:text-[12px]"
            >
              Explore Signature
            </Link>
          </div>
        </section>

        {/* The Norvik Edit — content brief (28 Oct 2026), Homepage "Curated
            jewellery" block. Reuses the New Arrivals row that was hidden on
            3 Oct 2026 (kept, not deleted, per that comment) and the
            `products` already fetched above — real published/static
            catalogue, not invented. Renamed per the brief's own
            implementation note: "Use real approved jewellery and
            photographs. No invented Best Sellers or New Arrivals claims." */}
        <section className="bg-scandi px-6 py-20 lg:px-10">
          <div className="mx-auto max-w-7xl">
            <div className="mb-10 flex items-end justify-between border-b border-warmstone pb-6">
              <div>
                <h2 className="font-display text-[26px] font-medium leading-[1.05] tracking-[-0.01em] text-inknavy sm:text-[36px]">
                  The Norvik Edit
                </h2>
                <p className="mt-2 max-w-sm text-[13px] leading-[1.5] text-charcoal sm:text-[14px]">
                  A few pieces to begin with. The rest of the story is yours.
                </p>
              </div>
              <Link
                href="/shop"
                className="whitespace-nowrap text-[11px] font-medium uppercase leading-[1.2] tracking-[0.08em] text-inknavy underline underline-offset-4 transition-colors hover:text-antiquegold sm:text-[12px]"
              >
                Explore all jewellery
              </Link>
            </div>
            <NewArrivalsRow products={products} />
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
            {/* Points to /our-world, not /about — the header nav now keeps
                only one of "Our World" / "About Norvik" (see header-chrome
                changes, 30 Oct 2026); /about has no nav link anymore. */}
            <Link
              href="/our-world"
              className="text-[11px] font-medium uppercase leading-[1.2] tracking-[0.08em] text-ink underline underline-offset-4 hover:text-antiquegold sm:text-[12px]"
            >
              Our Story
            </Link>
          </div>
        </section>

        {/* Newsletter — commented out for now (3 Oct 2026), client asked to
            remove this section too. Kept here (not deleted) so it can go
            back exactly as it was by uncommenting. Note: this form never
            had a submit handler wired up (no onSubmit/API call) even when
            it was showing — "Subscribe" didn't actually collect emails
            anywhere; worth flagging if/when this comes back.
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
        */}
      </main>
      <SiteFooter />
    </>
  );
}
