import SiteHeader from '@/components/site-header';
import SiteFooter from '@/components/site-footer';
import ContactForm from '@/components/contact-form';

// Contact page (10 Oct 2026) — the footer's "Contact" link
// (components/site-footer.tsx) pointed at /contact, which didn't exist
// until now (a dead link). Email, phone/WhatsApp, and address below are
// the same real details already used sitewide (app/api/chat/route.ts,
// app/policies/terms/page.tsx, components/chat-widget.tsx) — not new
// ones invented for this page.
export default function ContactPage() {
  return (
    <>
      <SiteHeader />
      <main>
        <section className="bg-midnight px-6 py-20 text-center lg:py-28">
          <p className="mb-3 text-[10px] font-medium uppercase leading-[1.2] tracking-[0.14em] text-antiquegold sm:text-[11px]">
            Get in Touch
          </p>
          <h1 className="font-display mx-auto max-w-2xl text-[30px] font-medium leading-[1.08] tracking-[-0.01em] text-softwhite sm:text-[40px]">
            We&apos;d love to hear from you.
          </h1>
          <p className="mx-auto mt-4 max-w-lg text-[14px] leading-[1.6] text-warmstone sm:text-[15px]">
            Questions about an order, a bespoke piece, or anything else — our team typically
            replies within 1–2 business days.
          </p>
        </section>

        <section className="bg-scandi px-6 py-16 lg:px-10 lg:py-20">
          <div className="mx-auto grid max-w-5xl grid-cols-1 gap-12 lg:grid-cols-[320px_1fr] lg:gap-16">
            {/* Contact details */}
            <div>
              <h2 className="font-display mb-6 text-[20px] font-medium leading-[1.1] tracking-[-0.01em] text-inknavy">
                Contact Details
              </h2>

              <div className="space-y-6">
                <div>
                  <p className="text-[11px] font-medium uppercase leading-[1.2] tracking-[0.14em] text-antiquegold">
                    Email
                  </p>
                  <a href="mailto:info@norvikgold.com" className="mt-1 block text-[14px] text-inknavy/80 hover:text-antiquegold">
                    info@norvikgold.com
                  </a>
                </div>

                <div>
                  <p className="text-[11px] font-medium uppercase leading-[1.2] tracking-[0.14em] text-antiquegold">
                    Phone / WhatsApp
                  </p>
                  <a href="tel:+971585622369" className="mt-1 block text-[14px] text-inknavy/80 hover:text-antiquegold">
                    +971 585 622 369
                  </a>
                </div>

                <div>
                  <p className="text-[11px] font-medium uppercase leading-[1.2] tracking-[0.14em] text-antiquegold">
                    Studio
                  </p>
                  <p className="mt-1 text-[14px] leading-[1.6] text-inknavy/80">
                    Down Town, Business Bay
                    <br />
                    sweden, United Arab Emirates
                  </p>
                </div>
              </div>
            </div>

            {/* Form */}
            <div>
              <h2 className="font-display mb-6 text-[20px] font-medium leading-[1.1] tracking-[-0.01em] text-inknavy">
                Send a Message
              </h2>
              <ContactForm />
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
