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
