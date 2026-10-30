import SiteHeader from '@/components/site-header';
import SiteFooter from '@/components/site-footer';
import BespokeForm from '@/components/bespoke-form';

// Bespoke enquiry page (30 Oct 2026) — content brief ("Ecommerce_Mann_2",
// 28 Oct 2026) section 7. The footer's "Bespoke" link
// (components/site-footer.tsx) already pointed at /bespoke, which didn't
// exist until now (same dead-link situation /contact was in before 10 Oct
// 2026 — see app/contact/page.tsx). The brief gated publishing this on the
// enquiry service being available; client confirmed to build it (30 Oct
// 2026, "ha bana de na no worries"). "Heirloom redesign" (the brief's
// optional sub-section) is NOT included — its own implementation note gates
// it on redesign-of-customer-owned-jewellery being an actually offered,
// defined service, which hasn't been confirmed.
export default function BespokePage() {
  return (
    <>
      <SiteHeader />
      <main>
        <section className="bg-midnight px-6 py-20 text-center lg:py-28">
          <p className="mb-3 text-[10px] font-medium uppercase leading-[1.2] tracking-[0.14em] text-antiquegold sm:text-[11px]">
            Bespoke
          </p>
          <h1 className="font-display mx-auto max-w-2xl text-[30px] font-medium leading-[1.08] tracking-[-0.01em] text-softwhite sm:text-[40px]">
            Some stories ask for their own shape.
          </h1>
          <p className="mx-auto mt-4 max-w-lg text-[14px] leading-[1.6] text-warmstone sm:text-[15px]">
            A memory. A promise. A detail only you would recognise. Tell us what
            you would like your piece to hold, and we will explore how that
            feeling could take form in gold.
          </p>
        </section>

        {/* The conversation / The design / The next step — content brief's
            3-step outline, kept deliberately general (no promised deposit,
            production or delivery timeline) per its own implementation note:
            "Do not promise a specific workflow that is not offered." */}
        <section className="bg-scandi px-6 py-16 lg:px-10 lg:py-20">
          <div className="mx-auto grid max-w-5xl grid-cols-1 gap-10 sm:grid-cols-3">
            <div>
              <p className="mb-2 text-[10px] font-medium uppercase leading-[1.2] tracking-[0.14em] text-antiquegold sm:text-[11px]">
                01 — The Conversation
              </p>
              <p className="text-[14px] leading-[1.6] text-inknavy/80">
                We begin by listening. Share the occasion, the feeling, and the
                way you imagine wearing your piece.
              </p>
            </div>
            <div>
              <p className="mb-2 text-[10px] font-medium uppercase leading-[1.2] tracking-[0.14em] text-antiquegold sm:text-[11px]">
                02 — The Design
              </p>
              <p className="text-[14px] leading-[1.6] text-inknavy/80">
                Your ideas become a direction to explore. We discuss the form,
                gold, stones, and practical details with you before moving
                forward.
              </p>
            </div>
            <div>
              <p className="mb-2 text-[10px] font-medium uppercase leading-[1.2] tracking-[0.14em] text-antiquegold sm:text-[11px]">
                03 — The Next Step
              </p>
              <p className="text-[14px] leading-[1.6] text-inknavy/80">
                Once the design is agreed, we confirm the scope, price, and
                expected timeline for your piece.
              </p>
            </div>
          </div>
        </section>

        {/* Consultation form */}
        <section className="bg-white px-6 py-16 lg:px-10 lg:py-20">
          <div className="mx-auto max-w-2xl">
            <h2 className="font-display mb-6 text-center text-[22px] font-medium leading-[1.1] tracking-[-0.01em] text-inknavy sm:text-[26px]">
              Tell Us About Your Piece
            </h2>
            <BespokeForm />
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
