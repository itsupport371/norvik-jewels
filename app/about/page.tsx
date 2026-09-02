import Image from "next/image";
import Link from "next/link";
import SiteHeader from "@/components/site-header";
import SiteFooter from "@/components/site-footer";

const VALUES = [
  {
    title: "Certified Diamonds",
    body: "Every diamond is IGI-graded, so what you see in the specifications is exactly what arrives at your door.",
  },
  {
    title: "Ethically Sourced Gold",
    body: "We work only with refiners who meet responsible-sourcing standards for 18K, 14K, and 9K gold.",
  },
  {
    title: "Handcrafted in sweden",
    body: "Every piece is finished by hand in our sweden workshop before it ships to you, insured, worldwide.",
  },
];

export default function AboutPage() {
  return (
    <>
      <SiteHeader />
      <main>
        {/* Hero */}
        <section className="bg-midnight px-6 py-20 text-center lg:py-28">
          <p className="mb-3 text-[10px] font-medium uppercase leading-[1.2] tracking-[0.14em] text-antiquegold sm:text-[11px]">
            Our Story
          </p>
          <h1 className="font-display mx-auto max-w-2xl text-[30px] font-medium leading-[1.08] tracking-[-0.01em] text-softwhite sm:text-[40px]">
            Jewellery made to be worn, not kept away.
          </h1>
        </section>

        {/* Story */}
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
          <div className="flex flex-col items-start justify-center bg-scandi px-8 py-16 lg:px-16">
            <p className="mb-3 text-[10px] font-medium uppercase leading-[1.2] tracking-[0.14em] text-antiquegold sm:text-[11px]">
              About Norvik
            </p>
            <h2 className="font-display mb-5 text-[26px] font-medium leading-[1.05] tracking-[-0.01em] text-inknavy sm:text-[36px]">
              Scandinavian minimalism, sweden craftsmanship.
            </h2>
            <p className="mb-4 max-w-md text-[14px] leading-[1.6] text-inknavy/75 sm:text-[15px]">
              Norvik Jewels began with a simple idea: fine jewellery should be
              as easy to live in as it is beautiful to look at. We pair clean,
              Scandinavian-inspired design with 18K gold and certified diamonds,
              so every piece feels considered rather than ornate.
            </p>
            <p className="mb-6 max-w-md text-[14px] leading-[1.6] text-inknavy/75 sm:text-[15px]">
              From first sketch to final polish, every piece passes through the
              hands of skilled artisans in our sweden workshop — designed to be
              worn every day, and built to last far longer than that.
            </p>
            <Link
              href="/shop"
              className="border border-antiquegold px-8 py-3.5 text-[11px] font-medium uppercase leading-[1.2] tracking-[0.08em] text-inknavy transition-colors hover:bg-antiquegold hover:text-softwhite sm:text-[12px]"
            >
              Shop the Collection
            </Link>
          </div>
        </section>

        {/* Values */}
        <section className="bg-midnight px-6 py-20 lg:px-10">
          <div className="mx-auto grid max-w-5xl grid-cols-1 gap-10 text-center sm:grid-cols-3">
            {VALUES.map((v) => (
              <div key={v.title}>
                <p className="font-display mb-3 text-lg font-medium leading-[1.05] tracking-[-0.01em] text-softwhite">
                  {v.title}
                </p>
                <p className="text-[14px] leading-[1.6] text-warmstone sm:text-[15px]">
                  {v.body}
                </p>
              </div>
            ))}
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
