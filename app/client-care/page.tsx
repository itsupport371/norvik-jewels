import Image from 'next/image';
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

// Client Care hub — content brief ("Ecommerce_Mann_2", 28 Oct 2026),
// sections 8-12 (Gold and Materials / Jewellery Care / Delivery / Returns,
// Exchanges and Aftercare / FAQs). Added 2 Nov 2026 — client sent a
// reference screenshot of this exact sidebar + content layout and flagged
// that this content (separate from the "Why Norvik" pillars above, which
// only ever covered section 6) was missing from the page entirely.
//
// A few lines below still have the brief's own [bracketed] placeholders
// (delivery destinations, return window, warranty terms, etc.) — these are
// real operational facts (shipping coverage, return days, warranty
// duration) the brief itself hasn't filled in yet, not something to guess
// at. Left exactly as the brief has them rather than invented, per its own
// implementation notes on these rows ("Do not invent or import another
// retailer's terms," "Do not publish worldwide delivery without confirmed
// support"). Everything else here is the brief's finished copy, used in
// full — nothing stubbed as "coming soon".
const HUB_SECTIONS = [
  { id: 'gold-and-materials', navLabel: 'Gold and materials' },
  { id: 'jewellery-care', navLabel: 'Jewellery care' },
  { id: 'delivery', navLabel: 'Delivery' },
  { id: 'returns-exchanges-aftercare', navLabel: 'Returns, exchanges and aftercare' },
  { id: 'faqs', navLabel: 'FAQs' },
];

const GOLD_AND_MATERIALS_ITEMS = [
  {
    label: 'Gold',
    body: '18K gold is our chosen medium. Its colour and character form part of the Norvik language. Each product should identify its gold colour, purity, finish, and metal weight.',
  },
  {
    label: 'Stones',
    body: 'A stone brings its own kind of light. The product details should tell you what it is, whether a diamond is natural or laboratory-grown, its stated weight, and what documentation is supplied.',
  },
  {
    label: 'Reports and marks',
    body: 'For the piece you are considering, review the listed reports and purity marks, or ask our team what documentation accompanies it.',
  },
];

const FAQS: { q: string; a: string; ctaLabel?: string; ctaHref?: string }[] = [
  {
    q: 'What is the story behind Norvik Jewels?',
    a: 'Norvik Jewels brings together the calm of Sweden and the warmth of Dubai in an 18K gold design identity. Our story begins between two suns, and continues in the meaning each piece holds for its wearer.',
  },
  {
    q: 'What jewellery does Norvik design?',
    a: 'Norvik Jewels designs gold jewellery. Explore the product details for the specific gold colour, purity, dimensions, and stones in each piece.',
  },
  {
    q: 'What does lagom mean?',
    a: 'Lagom is the Swedish idea of just the right amount. For Norvik, it is a way of thinking about proportion and detail, leaving room for the person wearing the piece.',
  },
  {
    q: 'What does tyst lyx mean?',
    a: 'Tyst lyx means quiet luxury. We use it to describe a beauty that feels considered and personal, with details that reveal themselves when you look a little closer.',
  },
  {
    q: 'How do I know which stones are used?',
    a: 'Review the stone information for the piece you are considering. It should identify the stone type and state whether a diamond is natural or laboratory-grown, together with available weight and report details.',
  },
  {
    q: 'Can I enquire about a bespoke piece?',
    a: 'Share what you have in mind through our bespoke enquiry form. We will discuss whether the idea can be accommodated and what the next steps would be.',
  },
  {
    q: 'How do I find my size?',
    a: 'Use the measurements and size guide provided for your chosen piece. If you are unsure, contact us before ordering so we can help you check the fit.',
    ctaLabel: 'View the size guide',
    ctaHref: '/client-care#fit',
  },
  {
    q: 'Where do you deliver?',
    a: 'Our current destinations are [confirmed destinations]. Please review the delivery information and the options available for your address before ordering.',
    ctaLabel: 'View delivery information',
    ctaHref: '/client-care#delivery',
  },
  {
    q: 'Can I return or exchange a piece?',
    a: 'Eligibility depends on the piece and the terms that apply to your purchase. Please read our Returns, Exchanges and Aftercare page for the confirmed window, conditions, and process.',
    ctaLabel: 'View return information',
    ctaHref: '/client-care#returns-exchanges-aftercare',
  },
  {
    q: 'How do I contact you?',
    a: 'Contact the Norvik team at [verified support email], or use the telephone and WhatsApp options on our Client Care page.',
    ctaLabel: 'Contact Norvik',
    ctaHref: '/contact',
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

        {/* Fit — 30 Oct 2026, client: page was all text, no photo ("tune
            aisa to kuch daala hi nahi hein"); wanted a 2-column text+photo
            section like the homepage Founder teaser, placed in the middle
            of this page, above Guidance. Copy is the brief's own "Fit"
            pillar text (already used in the grid above), given the bigger
            featured treatment here since it's the one pillar with a real,
            on-brand photo already in the project (the ring sizing shot). */}
        <section id="fit" className="grid grid-cols-1 lg:grid-cols-2">
          <div className="relative aspect-[4/3] lg:aspect-auto">
            <Image
              src="/images/ring-size-guide.jpg"
              alt="Norvik Jewels ring sizing guidance"
              fill
              className="object-cover"
              sizes="(min-width: 1024px) 50vw, 100vw"
            />
          </div>
          <div className="flex flex-col items-start justify-center bg-scandi px-8 py-16 lg:px-16">
            <p className="mb-3 text-[10px] font-medium uppercase leading-[1.2] tracking-[0.14em] text-antiquegold sm:text-[11px]">
              Fit
            </p>
            <h2 className="font-display mb-5 max-w-md text-[26px] font-medium leading-[1.1] tracking-[-0.01em] text-inknavy sm:text-[32px]">
              A choice made with confidence.
            </h2>
            <p className="max-w-md text-[14px] leading-[1.6] text-inknavy/75 sm:text-[15px]">
              Clear measurements and sizing guidance help you find the form
              that feels right for you.
            </p>
          </div>
        </section>

        {/* Client Care hub — sidebar nav + stacked sections, see
            HUB_SECTIONS/GOLD_AND_MATERIALS_ITEMS/FAQS above for the content
            and why. Anchor-scroll sidebar (not a JS tab switcher) — same
            pattern already used elsewhere on the site (e.g. the "Read the
            co-founder's story" link on the homepage → /our-world#co-founder),
            simplest thing that works and needs no client-side state. */}
        <section className="bg-white px-6 py-16 lg:px-10 lg:py-20">
          <div className="mx-auto grid max-w-6xl grid-cols-1 gap-10 lg:grid-cols-[220px_1fr] lg:gap-16">
            <nav className="lg:sticky lg:top-28 lg:self-start">
              <ul className="flex flex-wrap gap-x-6 gap-y-1 border-b border-line pb-6 text-[13px] leading-[1.6] text-charcoal lg:block lg:space-y-1 lg:border-b-0 lg:border-l lg:pb-0">
                {HUB_SECTIONS.map((s) => (
                  <li key={s.id}>
                    <a
                      href={`#${s.id}`}
                      className="-ml-px block border-transparent py-1 text-charcoal hover:text-antiquegold lg:border-l-2 lg:py-2 lg:pl-4 lg:hover:border-antiquegold"
                    >
                      {s.navLabel}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>

            <div className="space-y-20">
              {/* Gold and Materials */}
              <div id="gold-and-materials">
                <p className="mb-3 text-[10px] font-medium uppercase leading-[1.2] tracking-[0.14em] text-antiquegold sm:text-[11px]">
                  Gold and Materials
                </p>
                <h2 className="font-display mb-4 max-w-lg text-[26px] font-medium leading-[1.15] tracking-[-0.01em] text-ink sm:text-[32px]">
                  The feeling begins with knowing.
                </h2>
                <p className="max-w-lg text-[14px] leading-[1.6] text-charcoal sm:text-[15px]">
                  A beautiful piece deserves clear information. Here, you can
                  understand the gold and stones behind the designs you are
                  considering.
                </p>
                <dl className="mt-8 space-y-6">
                  {GOLD_AND_MATERIALS_ITEMS.map((item) => (
                    <div key={item.label} className="grid grid-cols-1 gap-1 sm:grid-cols-[140px_1fr] sm:gap-8">
                      <dt className="font-medium text-[14px] text-ink sm:text-[15px]">{item.label}</dt>
                      <dd className="max-w-xl text-[14px] leading-[1.6] text-charcoal sm:text-[15px]">
                        {item.body}
                      </dd>
                    </div>
                  ))}
                </dl>
              </div>

              {/* Jewellery Care */}
              <div id="jewellery-care">
                <p className="mb-3 text-[10px] font-medium uppercase leading-[1.2] tracking-[0.14em] text-antiquegold sm:text-[11px]">
                  Jewellery Care
                </p>
                <h2 className="font-display mb-4 max-w-lg text-[26px] font-medium leading-[1.15] tracking-[-0.01em] text-ink sm:text-[32px]">
                  A little care for what you care about.
                </h2>
                <p className="max-w-lg text-[14px] leading-[1.6] text-charcoal sm:text-[15px]">
                  Your jewellery becomes part of the moments you live. A
                  considered routine helps protect the materials, finish, and
                  settings along the way.
                </p>
                <div className="mt-8 space-y-6">
                  <div>
                    <p className="mb-1 font-medium text-[14px] text-ink sm:text-[15px]">Everyday care</p>
                    <p className="max-w-xl text-[14px] leading-[1.6] text-charcoal sm:text-[15px]">
                      Follow the instructions for the particular gold, stones,
                      and finish in your piece. Keep jewellery away from harsh
                      chemicals and abrasive cleaners. Store pieces separately
                      so they do not rub against one another. Ask for advice
                      before using a polishing product, an ultrasonic cleaner,
                      or a cleaning method you have not used before.
                    </p>
                  </div>
                  <div>
                    <p className="mb-1 font-medium text-[14px] text-ink sm:text-[15px]">Settings and clasps</p>
                    <p className="max-w-xl text-[14px] leading-[1.6] text-charcoal sm:text-[15px]">
                      If a clasp feels loose, a setting catches, or something
                      seems different, stop wearing the piece and contact us
                      for guidance.
                    </p>
                    <Link
                      href="/contact"
                      className="mt-2 inline-block text-[11px] font-medium uppercase leading-[1.2] tracking-[0.08em] text-ink underline underline-offset-4 hover:text-antiquegold sm:text-[12px]"
                    >
                      Ask about jewellery care
                    </Link>
                  </div>
                </div>
              </div>

              {/* Delivery */}
              <div id="delivery">
                <p className="mb-3 text-[10px] font-medium uppercase leading-[1.2] tracking-[0.14em] text-antiquegold sm:text-[11px]">
                  Delivery
                </p>
                <h2 className="font-display mb-4 max-w-lg text-[26px] font-medium leading-[1.15] tracking-[-0.01em] text-ink sm:text-[32px]">
                  The last part of its journey. The first part of yours.
                </h2>
                <p className="max-w-lg text-[14px] leading-[1.6] text-charcoal sm:text-[15px]">
                  Find delivery information for your destination, including
                  the available service, expected timeline, and any charges,
                  before you place your order.
                </p>
                <p className="mt-3 max-w-lg text-[12px] italic leading-[1.5] text-charcoal/50">
                  Pending confirmation — the bracketed details below will be
                  replaced with final destinations, timelines and charges
                  once confirmed.
                </p>
                <div className="mt-8 space-y-6">
                  <div>
                    <p className="mb-1 font-medium text-[14px] text-ink sm:text-[15px]">Destination details</p>
                    <p className="max-w-xl text-[14px] leading-[1.6] text-charcoal sm:text-[15px]">
                      We deliver to [confirmed destinations]. Available
                      delivery options and charges are [shown at checkout /
                      described below].
                    </p>
                  </div>
                  <div>
                    <p className="mb-1 font-medium text-[14px] text-ink sm:text-[15px]">Timing</p>
                    <p className="max-w-xl text-[14px] leading-[1.6] text-charcoal sm:text-[15px]">
                      In-stock pieces: [dispatch and delivery estimates].
                      <br />
                      Made-to-order or bespoke pieces: [how the timeline is
                      agreed].
                      <br />
                      Customs, duties, and taxes: [who pays and how they are
                      shown].
                    </p>
                  </div>
                  <div>
                    <p className="mb-1 font-medium text-[14px] text-ink sm:text-[15px]">Delivery support</p>
                    <p className="max-w-xl text-[14px] leading-[1.6] text-charcoal sm:text-[15px]">
                      For questions about an address, delivery option, or
                      order in transit, contact us with your order number.
                    </p>
                    <Link
                      href="/contact"
                      className="mt-2 inline-block text-[11px] font-medium uppercase leading-[1.2] tracking-[0.08em] text-ink underline underline-offset-4 hover:text-antiquegold sm:text-[12px]"
                    >
                      Contact Client Care
                    </Link>
                  </div>
                </div>
              </div>

              {/* Returns, Exchanges and Aftercare */}
              <div id="returns-exchanges-aftercare">
                <p className="mb-3 text-[10px] font-medium uppercase leading-[1.2] tracking-[0.14em] text-antiquegold sm:text-[11px]">
                  Returns, Exchanges and Aftercare
                </p>
                <h2 className="font-display mb-4 max-w-lg text-[26px] font-medium leading-[1.15] tracking-[-0.01em] text-ink sm:text-[32px]">
                  Choose with clarity.
                </h2>
                <p className="max-w-lg text-[14px] leading-[1.6] text-charcoal sm:text-[15px]">
                  Please review the conditions that apply to your purchase,
                  including the return window, any eligible exchange or
                  resizing service, and the terms for personalised pieces.
                </p>
                <p className="mt-3 max-w-lg text-[12px] italic leading-[1.5] text-charcoal/50">
                  Pending confirmation — the bracketed details below will be
                  replaced with final windows, conditions and warranty terms
                  once confirmed.
                </p>
                <div className="mt-8 space-y-6">
                  <div>
                    <p className="mb-1 font-medium text-[14px] text-ink sm:text-[15px]">Returns</p>
                    <p className="max-w-xl text-[14px] leading-[1.6] text-charcoal sm:text-[15px]">
                      Eligible pieces may be returned within [confirmed
                      period], subject to [condition, packaging, return
                      process and applicable exclusions]. Refunds are
                      processed through [method] within [confirmed timeline].
                    </p>
                  </div>
                  <div>
                    <p className="mb-1 font-medium text-[14px] text-ink sm:text-[15px]">Exchanges and resizing</p>
                    <p className="max-w-xl text-[14px] leading-[1.6] text-charcoal sm:text-[15px]">
                      Exchanges: [eligibility, window, process and any costs].
                      <br />
                      Resizing: [eligible designs, available sizes, charges
                      and expected timing].
                    </p>
                  </div>
                  <div>
                    <p className="mb-1 font-medium text-[14px] text-ink sm:text-[15px]">Warranty and repairs</p>
                    <p className="max-w-xl text-[14px] leading-[1.6] text-charcoal sm:text-[15px]">
                      Warranty: [coverage, duration and exclusions].
                      <br />
                      Repairs and aftercare: [available services and any
                      charges].
                    </p>
                  </div>
                  <div>
                    <p className="mb-1 font-medium text-[14px] text-ink sm:text-[15px]">Start an enquiry</p>
                    <p className="max-w-xl text-[14px] leading-[1.6] text-charcoal sm:text-[15px]">
                      Contact [verified support email or WhatsApp] with your
                      order number and a description of how we can help.
                    </p>
                    <Link
                      href="/contact"
                      className="mt-2 inline-block text-[11px] font-medium uppercase leading-[1.2] tracking-[0.08em] text-ink underline underline-offset-4 hover:text-antiquegold sm:text-[12px]"
                    >
                      Contact Client Care
                    </Link>
                  </div>
                </div>
              </div>

              {/* FAQs */}
              <div id="faqs">
                <p className="mb-3 text-[10px] font-medium uppercase leading-[1.2] tracking-[0.14em] text-antiquegold sm:text-[11px]">
                  Frequently Asked Questions
                </p>
                <h2 className="font-display mb-3 max-w-lg text-[26px] font-medium leading-[1.15] tracking-[-0.01em] text-ink sm:text-[32px]">
                  A little clarity, before you choose.
                </h2>
                <p className="mb-5 max-w-lg text-[12px] italic leading-[1.5] text-charcoal/50">
                  A couple of answers below reference details still pending
                  confirmation — see Delivery and Returns, Exchanges and
                  Aftercare above.
                </p>
                <div className="divide-y divide-line border-t border-line">
                  {FAQS.map((item) => (
                    <div key={item.q} className="py-6">
                      <p className="mb-2 font-medium text-[14px] text-ink sm:text-[15px]">{item.q}</p>
                      <p className="max-w-xl text-[14px] leading-[1.6] text-charcoal sm:text-[15px]">
                        {item.a}
                      </p>
                      {item.ctaLabel && item.ctaHref && (
                        <Link
                          href={item.ctaHref}
                          className="mt-2 inline-block text-[11px] font-medium uppercase leading-[1.2] tracking-[0.08em] text-ink underline underline-offset-4 hover:text-antiquegold sm:text-[12px]"
                        >
                          {item.ctaLabel}
                        </Link>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
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
