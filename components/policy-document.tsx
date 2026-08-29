import Link from 'next/link';

type Section = {
  heading: string;
  paragraphs?: string[];
  list?: string[];
};

export default function PolicyDocument({
  title,
  lastUpdated,
  sections,
}: {
  title: string;
  lastUpdated: string;
  sections: Section[];
}) {
  return (
    <main className="min-h-screen bg-ivory">
      <div className="mx-auto max-w-2xl px-6 py-16">
        <Link
          href="/"
          className="text-[11px] font-medium uppercase leading-[1.2] tracking-[0.08em] text-muted underline underline-offset-4 sm:text-[12px]"
        >
          ← Back to Norvik Jewels
        </Link>

        <h1 className="font-display mt-8 text-[26px] font-medium leading-[1.05] tracking-[-0.01em] text-ink sm:text-[36px]">
          {title}
        </h1>
        <p className="mt-2 text-[14px] leading-[1.6] text-muted">
          Norvik Jewels — Last updated: {lastUpdated}
        </p>
        <p className="mt-1 text-[12px] leading-[1.35] italic text-muted">
          Draft for client review — not yet legally finalized.
        </p>

        <div className="mt-10 space-y-9">
          {sections.map((s, i) => (
            <section key={i}>
              <h2 className="font-display border-b border-line pb-2 text-lg font-medium leading-[1.05] tracking-[-0.01em] text-ink">
                {s.heading}
              </h2>
              {s.paragraphs?.map((p, j) => (
                <p
                  key={j}
                  className="mt-3 text-[14px] leading-[1.6] text-charcoal sm:text-[15px]"
                >
                  {p}
                </p>
              ))}
              {s.list && (
                <ul className="mt-3 list-disc space-y-1.5 pl-5 text-[14px] leading-[1.6] text-charcoal sm:text-[15px]">
                  {s.list.map((item, k) => (
                    <li key={k}>{item}</li>
                  ))}
                </ul>
              )}
            </section>
          ))}
        </div>

        <div className="mt-14 space-y-2 border-t border-line pt-6">
          <p className="text-[14px] leading-[1.6] text-charcoal">
            Questions? Contact us at{' '}
            <a href="mailto:info@norvikgold.com" className="underline underline-offset-4">
              info@norvikgold.com
            </a>{' '}
            or +971 585 622 369.
          </p>
          <p className="text-[12px] leading-[1.35] italic text-muted">
            This document is a draft prepared for internal review and client
            approval. It is not a substitute for advice from a qualified
            lawyer licensed in the UAE and India.
          </p>
        </div>
      </div>
    </main>
  );
}
