import Link from 'next/link';
import SiteHeader from '@/components/site-header';
import SiteFooter from '@/components/site-footer';

// Client Care page (30 Oct 2026) — the homepage's "Visit Client Care" button
// (added from the content brief, "Ecommerce_Mann_2", 28 Oct 2026) was just
// pointing at /contact, which has nothing about gold, stones or fit — the
// client flagged this ("hamara jo contact form mein wahi hein"). This page
// uses the brief's own section 6 "Why Norvik" content (Design / Materials /
// Fit / Guidance) — that's the section that actually matches the homepage
// teaser's "Know the gold. Understand the stone. Find the right fit."
// wording, not the plain contact form. Ends with the brief's own CTA
// ("Contact Norvik" → /contact) for anything the page itself doesn't answer.
const PILLARS = [
  {
    label: 'Design',
    heading: 'A considered point of view',
    body: "The calm of Scandinavian design meets Dubai's warmth through clear proportions and a personal approach to gold.",
  },
  {
    label: 'Materials',
    heading: 'Know what you are choosing',
    body: 'Explore the gold, its purity, the stones, and the dimensions of the piece that has caught your eye.',
  },
  {
    label: 'Fit',
    heading: 'A choice made with confidence',
    body: 'Clear measurements and sizing guidance help you find the form that feels right for you.',
  },
];

export default function ClientCarePage() {
  return (
    <>
      <SiteHeader />
      <main>
        <section className="bg-midnight px-6 py-20 text-center lg:py-28">
          <p className="mb-3 text-[10px] font-medium uppercase leading-[1.2] tracking-[0.14em] text-antiquegold sm:text-[11px]">
            Client Care
          </p>
          <h1 className="font-display mx-auto max-w-2xl text-[30px] font-medium leading-[1.08] tracking-[-0.01em] text-softwhite sm:text-[40px]">
            A piece feels different when it feels like you.
          </h1>
          <p className="mx-auto mt-4 max-w-lg text-[14px] leading-[1.6] text-warmstone sm:text-[15px]">
            The first connection may be a shape, a reflection, or a feeling you
            cannot quite name. The confidence that follows comes from knowing
            the details.
          </p>
        </section>

        <section className="bg-scandi px-6 py-16 lg:px-10 lg:py-20">
          <div className="mx-auto grid max-w-5xl grid-cols-1 gap-10 sm:grid-cols-3">
            {PILLARS.map((p) => (
              <div key={p.label}>
                <p className="mb-2 text-[10px] font-medium uppercase leading-[1.2] tracking-[0.14em] text-antiquegold sm:text-[11px]">
                  {p.label}
                </p>
                <p className="font-display mb-2 text-[18px] font-medium leading-[1.2] text-inknavy">
                  {p.heading}
                </p>
                <p className="text-[14px] leading-[1.6] text-inknavy/75">{p.body}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Guidance */}
        <section className="bg-white px-6 py-16 text-center lg:py-20">
          <p className="mb-3 text-[10px] font-medium uppercase leading-[1.2] tracking-[0.14em] text-antiquegold sm:text-[11px]">
            Guidance
          </p>
          <h2 className="font-display mx-auto max-w-lg text-[24px] font-medium leading-[1.15] tracking-[-0.01em] text-ink sm:text-[30px]">
            Room for your questions.
          </h2>
          <p className="mx-auto mt-4 max-w-lg text-[14px] leading-[1.6] text-charcoal sm:text-[15px]">
            Choosing something personal can take a conversation. Speak with us
            about a piece, a gift, or a design you would like to explore.
          </p>
          <Link
            href="/contact"
            className="mt-7 inline-block border border-antiquegold px-8 py-3.5 text-[11px] font-medium uppercase leading-[1.2] tracking-[0.08em] text-ink transition-colors hover:bg-antiquegold hover:text-white sm:text-[12px]"
          >
            Contact Norvik
          </Link>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
