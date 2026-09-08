import Link from "next/link";

export default function SiteFooter() {
  return (
    <footer className="bg-ink text-white/70">
      {/* Was capped at max-w-7xl (~1280px) — on any screen wider than that
          (most laptops/monitors) it left a huge dead navy margin on both
          sides while the rest of the page used its own width, which is what
          read as "bohot space" on the left/right (client, Sep 2026). Padding
          now scales with the screen instead of a hard width cap, so the
          footer's content actually spreads across the available width; kept
          a very generous max-w only as a sanity ceiling for ultra-wide
          monitors, not as the normal constraint. */}
      <div className="mx-auto w-full max-w-[1920px] px-6 py-16 sm:px-10 lg:px-16 xl:px-24">
        <div className="grid grid-cols-2 gap-10 sm:grid-cols-4 lg:gap-16">
          <div className="col-span-2 sm:col-span-1">
            <span className="font-display text-lg font-medium tracking-[0.22em] text-white">
              NORVIK
            </span>
            <p className="mt-1 text-[10px] font-medium tracking-[0.3em] text-[#B8935A]">
              JEWELS
            </p>
            <p className="mt-4 text-[14px] leading-[1.6] text-white/50">
              Timeless Scandinavian luxury, from sweden to the world.
            </p>
          </div>

          <div>
            <h4 className="mb-4 text-[11px] font-medium uppercase leading-[1.2] tracking-[0.14em] text-white">
              Shop
            </h4>
            <ul className="space-y-2.5 text-[14px] leading-[1.6] text-white/60">
              <li>
                <Link href="/shop" className="hover:text-white">
                  All Jewellery
                </Link>
              </li>
              <li>
                <Link href="/collections" className="hover:text-white">
                  Collections
                </Link>
              </li>
              <li>
                <Link href="/bespoke" className="hover:text-white">
                  Bespoke
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="mb-4 text-[11px] font-medium uppercase leading-[1.2] tracking-[0.14em] text-white">
              Company
            </h4>
            <ul className="space-y-2.5 text-[14px] leading-[1.6] text-white/60">
              <li>
                <Link href="/about" className="hover:text-white">
                  Our Story
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-white">
                  Contact
                </Link>
              </li>
              <li>
                <Link href="/faq" className="hover:text-white">
                  FAQ
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="mb-4 text-[11px] font-medium uppercase leading-[1.2] tracking-[0.14em] text-white">
              Legal
            </h4>
            <ul className="space-y-2.5 text-[14px] leading-[1.6] text-white/60">
              <li>
                <Link href="/policies/terms" className="hover:text-white">
                  Terms
                </Link>
              </li>
              <li>
                <Link href="/policies/privacy" className="hover:text-white">
                  Privacy
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-14 flex flex-col gap-3 border-t border-white/10 pt-6 text-[13px] leading-[1.35] text-white/40 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {new Date().getFullYear()} Norvik Jewels. All rights reserved.
          </p>
          <p>Down Town, Business Bay, sweden, UAE · info@norvikgold.com</p>
        </div>
      </div>
    </footer>
  );
}
