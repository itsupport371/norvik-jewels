import Image from "next/image";
import Link from "next/link";
import SiteHeader from "@/components/site-header";
import SiteFooter from "@/components/site-footer";

const EDITORIAL = [
  {
    image: "/images/hero-web-1.jpg",
    caption: "Trillion-cut studs, styled for everyday wear.",
  },
  {
    image: "/images/hero-web-4.jpg",
    caption: "Floral mangalsutras, reimagined in 18K gold.",
  },
  {
    image: "/images/hero-web-5.jpg",
    caption: "Necklaces designed in sweden, worn worldwide.",
  },
];

export default function OurWorldPage() {
  return (
    <>
      <SiteHeader />
      <main>
        {/* Hero */}
        <section className="relative flex h-[46vh] min-h-[360px] w-full items-center justify-center overflow-hidden bg-midnight text-center">
          <Image
            src="/images/hero-web-3.jpg"
            alt="Our World"
            fill
            className="object-cover opacity-60"
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-midnight/90 via-midnight/40 to-midnight/20" />
          <div className="relative px-6">
            <p className="mb-3 text-[10px] font-medium uppercase leading-[1.2] tracking-[0.14em] text-antiquegold sm:text-[11px]">
              Our World
            </p>
            <h1 className="font-display mx-auto max-w-xl text-[34px] font-medium leading-[1] tracking-[-0.015em] text-softwhite sm:text-[46px]">
              Designed in sweden. Worn everywhere.
            </h1>
          </div>
        </section>

        {/* Intro */}
        <section className="bg-scandi px-6 py-16 text-center lg:py-20">
          <p className="mx-auto max-w-2xl text-[14px] leading-[1.6] text-inknavy/75 sm:text-[15px]">
            Norvik Jewels is designed at our sweden studio and worn across the
            world — from everyday studs to heirloom mangalsutras. Every order
            ships insured, wherever you are.
          </p>
        </section>

        {/* Editorial grid */}
        <section className="bg-scandi px-6 pb-20 lg:px-10">
          <div className="mx-auto grid max-w-7xl grid-cols-1 gap-5 sm:grid-cols-3">
            {EDITORIAL.map((e) => (
              <div
                key={e.image}
                className="group relative aspect-[3/4] overflow-hidden"
              >
                <Image
                  src={e.image}
                  alt={e.caption}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                  sizes="(min-width: 640px) 33vw, 100vw"
                />
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-midnight/80 to-transparent p-5">
                  <p className="text-[13px] leading-[1.35] text-softwhite">
                    {e.caption}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Co-Founder Story — content brief (28 Oct 2026, "Ecommerce_Mann_2"),
            section 5. Added here (not a standalone page — none existed) so
            the homepage's "Read the co-founder's story" link
            (/our-world#co-founder) has a real destination. Reworked 30 Oct
            2026 into the same 2-column (text + photo) layout as the
            homepage Founder teaser (app/page.tsx), from a reference image
            the client sent — photo reused from the campaign hero's navy
            slide (components/campaign-hero.tsx), not a new upload. Sign-off
            name used exactly as given in the brief; flagged there to
            confirm the preferred public spelling before this goes live. */}
        <section id="co-founder" className="grid grid-cols-1 lg:grid-cols-2">
          <div className="relative order-first aspect-[4/3] lg:order-none lg:aspect-auto">
            <Image
              src="/images/campaign-navy-desktop.jpg"
              alt="Neha S Shah, Co-founder, Norvik Jewels"
              fill
              className="object-cover object-[75%_35%]"
              sizes="(min-width: 1024px) 50vw, 100vw"
            />
          </div>
          <div className="flex flex-col items-start justify-center bg-white px-8 py-16 lg:px-16">
            <p className="mb-3 text-[10px] font-medium uppercase leading-[1.2] tracking-[0.14em] text-antiquegold sm:text-[11px]">
              Co-Founder
            </p>
            <h2 className="font-display mb-6 max-w-md text-[28px] font-medium leading-[1.1] tracking-[-0.01em] text-ink sm:text-[36px]">
              A life between two worlds.
            </h2>
            <div className="max-w-md space-y-4 text-[14px] leading-[1.7] text-charcoal sm:text-[15px]">
              <p>
                When I moved to Sweden, I was not planning to create a jewellery
                house. But living there changed the way I understood beauty. I
                began to notice the confidence of clear lines, the care within a
                proportion, and the strength of leaving only what was essential.
                Beauty could be quiet and still leave a lasting impression.
              </p>
              <p>
                My years in Dubai introduced me to another expression of luxury.
                I was drawn to its warmth, its attention to detail, and the
                confidence with which it celebrates beauty. Gold carried a
                presence that felt both expressive and personal.
              </p>
              <p>
                Over time, I found myself drawn to the space between these two
                perspectives. Could a piece hold the richness of Dubai and the
                restraint of Scandinavian design? Could it feel luxurious the
                moment you put it on, and entirely natural to the way you are?
              </p>
              <p>
                That question became the beginning of Norvik Jewels. As a
                co-founder, I wanted to bring these two feelings together in
                gold: clear in its form, considered in its details, and warm in
                the way it meets the person wearing it.
              </p>
              <p>
                For me, luxury is a feeling of balance. A piece has a presence
                of its own, while leaving room for your individuality. Its
                meaning grows through the life you wear it in: the moment you
                chose it, the person who gave it, the memories it comes to
                hold.
              </p>
              <p>
                My hope is that you find a piece that feels unmistakably yours.
                Something you enjoy wearing, and come to feel part of yourself.
                Because the most beautiful jewellery becomes part of your
                story. And, in time, part of you.
              </p>
            </div>
            <p className="mt-6 text-[14px] leading-[1.6] text-ink">
              Neha S Shah
              <br />
              <span className="text-[12px] text-charcoal">Co-founder, Norvik Jewels</span>
            </p>
          </div>
        </section>

        {/* CTA strip */}
        <section className="bg-midnight px-6 py-16 text-center">
          <p className="mb-3 text-[10px] font-medium uppercase leading-[1.2] tracking-[0.14em] text-antiquegold sm:text-[11px]">
            Free Insured Shipping
          </p>
          <h2 className="font-display mx-auto mb-8 max-w-md text-[30px] font-medium leading-[1.08] tracking-[-0.01em] text-softwhite sm:text-[38px]">
            Wherever you are, Norvik ships to you.
          </h2>
          <Link
            href="/shop"
            className="inline-block border border-antiquegold px-8 py-3.5 text-[11px] font-medium uppercase leading-[1.2] tracking-[0.08em] text-softwhite transition-colors hover:bg-antiquegold hover:text-midnight sm:text-[12px]"
          >
            Explore the Shop
          </Link>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
