import Link from "next/link";
import { getAllProductsServer } from "@/lib/products-server";
import CookiePreferencesLink from "@/components/cookie-preferences-link";

// 2 Nov 2026 — full content recheck against the brief ("Ecommerce_Mann_2"),
// Footer section (rows 130-138). The structural audit found the Footer was
// missing an entire "Client Care" column (Contact/Delivery/Returns/Size
// guide/Jewellery care/FAQs/Track order) even though that content now
// exists on /client-care — same kind of gap as the earlier missing
// Philosophy section, just in the footer this time. Rebuilt against the
// brief's own column list rather than patched in place:
//   Brand    — row 130 ("Born between two suns.") + row 131 supporting line
//   Explore  — row 132, filtered to categories with real published
//              products (same rule app/page.tsx already applies to the
//              homepage's "Shop by Category" tiles) so this never shows a
//              category with nothing in it
//   Our World— row 133, three links into the one editorial page's own
//              sections (brief's own suggestion: "link to sections in one
//              editorial page rather than duplicate thin pages")
//   Client Care — row 134 (new column). "Track order" points at /account,
//              the real order-history page — not a dedicated tracking
//              flow, which doesn't exist (brief: "do not add ... unless it
//              exists")
//   Legal    — row 135, including "Cookie Preferences" now that a cookie
//              banner exists (components/cookie-consent.tsx)
// Bottom line (rows 136-138): "sweden" typo fixed to "Dubai", phone number
// added back alongside email.
const EXPLORE_CATEGORIES = [
  { href: '/shop?category=rings', label: 'Rings' },
  { href: '/shop?category=earrings', label: 'Earrings' },
  { href: '/shop?category=pendants', label: 'Pendants' },
  { href: '/shop?category=bracelet', label: 'Bracelet' },
  { href: '/shop?category=tanmaniya', label: 'Tanmaniya' },
] as const;

export default async function SiteFooter() {
  const products = await getAllProductsServer();
  const liveCategories = EXPLORE_CATEGORIES.filter((c) =>
    products.some((p) => p.category === c.label && p.images?.[0])
  );

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
        <div className="grid grid-cols-2 gap-10 lg:grid-cols-5 lg:gap-12">
          <div className="col-span-2 lg:col-span-1">
            <span className="font-display text-lg font-medium tracking-[0.22em] text-white">
              NORVIK
            </span>
            <p className="mt-1 text-[10px] font-medium tracking-[0.3em] text-[#B8935A]">
              JEWELS
            </p>
            <p className="mt-4 text-[14px] leading-[1.6] text-white/70">
              Born between two suns.
            </p>
            <p className="mt-2 text-[13px] leading-[1.6] text-white/50">
              The calm of the North. The warmth of the East. Held in 18K
              gold.
            </p>
          </div>

          <div>
            <h4 className="mb-4 text-[11px] font-medium uppercase leading-[1.2] tracking-[0.14em] text-white">
              Explore
            </h4>
            <ul className="space-y-2.5 text-[14px] leading-[1.6] text-white/60">
              <li>
                <Link href="/shop" className="hover:text-white">
                  All Jewellery
                </Link>
              </li>
              {liveCategories.map((c) => (
                <li key={c.label}>
                  <Link href={c.href} className="hover:text-white">
                    {c.label}
                  </Link>
                </li>
              ))}
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
              Our World
            </h4>
            <ul className="space-y-2.5 text-[14px] leading-[1.6] text-white/60">
              <li>
                <Link href="/our-world" className="hover:text-white">
                  Our Story
                </Link>
              </li>
              <li>
                <Link href="/our-world#philosophy" className="hover:text-white">
                  Our Philosophy
                </Link>
              </li>
              <li>
                <Link href="/our-world#co-founder" className="hover:text-white">
                  Founder&apos;s Story
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="mb-4 text-[11px] font-medium uppercase leading-[1.2] tracking-[0.14em] text-white">
              Client Care
            </h4>
            <ul className="space-y-2.5 text-[14px] leading-[1.6] text-white/60">
              <li>
                <Link href="/contact" className="hover:text-white">
                  Contact
                </Link>
              </li>
              <li>
                <Link href="/client-care#delivery" className="hover:text-white">
                  Delivery
                </Link>
              </li>
              <li>
                <Link href="/client-care#returns-exchanges-aftercare" className="hover:text-white">
                  Returns and Aftercare
                </Link>
              </li>
              <li>
                <Link href="/client-care#fit" className="hover:text-white">
                  Size Guide
                </Link>
              </li>
              <li>
                <Link href="/client-care#jewellery-care" className="hover:text-white">
                  Jewellery Care
                </Link>
              </li>
              <li>
                <Link href="/client-care#faqs" className="hover:text-white">
                  FAQs
                </Link>
              </li>
              <li>
                <Link href="/account" className="hover:text-white">
                  Track Order
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
                  Terms of Sale
                </Link>
              </li>
              <li>
                <Link href="/policies/privacy" className="hover:text-white">
                  Privacy Notice
                </Link>
              </li>
              <li>
                <CookiePreferencesLink className="text-white/60 hover:text-white" />
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-14 flex flex-col gap-3 border-t border-white/10 pt-6 text-[13px] leading-[1.35] text-white/40 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {new Date().getFullYear()} Norvik Jewels. All rights reserved.
          </p>
          {/* Physical address removed from display (6 Nov 2026, client
              instruction: "address mat show kar website mein") — was
              showing "Down Town, Business Bay, Dubai, UAE". Phone/email
              kept. If the client wants a real registered address shown
              again later, confirm the exact text with them first (see
              founder-photo-and-footer.md — the content brief never had a
              real one, only an explicit placeholder). */}
          <p>
            +971 585 622 369 · info@norvikjewels.com
          </p>
        </div>
      </div>
    </footer>
  );
}
