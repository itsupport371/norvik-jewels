import Image from "next/image";
import Link from "next/link";
import SiteHeader from "@/components/site-header";
import SiteFooter from "@/components/site-footer";

const COLLECTIONS = [
  {
    href: "/shop?collection=signature",
    label: "The Signature Collection",
    tagline: "One defining piece from every category.",
    image: "/images/hero-web-2.jpg",
  },
  {
    href: "/shop?category=rings",
    label: "Rings",
    tagline: "Halo settings and solitaires in 18K gold.",
    image: "/images/product-ring-1.jpg",
  },
  {
    href: "/shop?category=earrings",
    label: "Earrings",
    tagline: "Studs and hoops, trillion-cut to floral.",
    image: "/images/product-earring-1.jpg",
  },
  {
    href: "/shop?category=necklaces",
    label: "Necklaces",
    tagline: "Pendants and mangalsutras for everyday wear.",
    image: "/images/swan-pendant-a-white.jpg",
  },
  {
    href: "/shop?category=nose pin",
    label: "Nose Pin",
    tagline: "Delicate gold studs, floral and classic.",
    image: "/images/nose-pin-yellow.jpg",
  },
];

export default function CollectionsPage() {
  return (
    <>
      <SiteHeader />
      <main className="bg-scandi">
        <section className="mx-auto max-w-7xl px-6 py-16 text-center lg:px-10 lg:py-20">
          <p className="mb-3 text-[10px] font-medium uppercase leading-[1.2] tracking-[0.14em] text-antiquegold sm:text-[11px]">
            Norvik Jewels
          </p>
          <h1 className="font-display text-[34px] font-medium leading-[1] tracking-[-0.015em] text-inknavy sm:text-[46px]">
            Our Collections
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-[14px] leading-[1.6] text-inknavy/70 sm:text-[15px]">
            Every collection is designed in sweden and finished by hand — pick a
            category to explore, or start with the pieces we love most.
          </p>
        </section>

        <section className="mx-auto max-w-7xl px-6 pb-20 lg:px-10">
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {COLLECTIONS.map((c) => (
              <Link
                key={c.label}
                href={c.href}
                className="group relative block aspect-square overflow-hidden"
              >
                <Image
                  src={c.image}
                  alt={c.label}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                  sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-midnight/85 via-midnight/10 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-6">
                  <p className="font-display text-xl font-medium leading-[1.05] tracking-[-0.01em] text-softwhite">
                    {c.label}
                  </p>
                  <p className="mt-1 text-[13px] leading-[1.35] text-warmstone">
                    {c.tagline}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
