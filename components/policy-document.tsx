import Link from "next/link";

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
          className="text-xs uppercase tracking-wide2 text-muted underline underline-offset-4"
        >
          ← Back to Norvik Jewels
        </Link>

        <h1 className="font-display mt-8 text-3xl font-medium text-ink">
          {title}
        </h1>
        <p className="mt-2 text-sm text-muted">
          Norvik Jewels — Last updated: {lastUpdated}
        </p>
        <p className="mt-1 text-xs italic text-muted">
          Draft for client review — not yet legally finalized.
        </p>

        <div className="mt-10 space-y-9">
          {sections.map((s, i) => (
            <section key={i}>
              <h2 className="font-display border-b border-line pb-2 text-lg font-medium text-ink">
                {s.heading}
              </h2>
              {s.paragraphs?.map((p, j) => (
                <p
                  key={j}
                  className="mt-3 text-sm leading-relaxed text-charcoal"
                >
                  {p}
                </p>
              ))}
              {s.list && (
                <ul className="mt-3 list-disc space-y-1.5 pl-5 text-sm leading-relaxed text-charcoal">
                  {s.list.map((item, k) => (
                    <li key={k}>{item}</li>
                  ))}
                </ul>
              )}
            </section>
          ))}
        </div>

        <div className="mt-14 space-y-2 border-t border-line pt-6">
          <p className="text-sm text-charcoal">
            Questions? Contact us at{" "}
            <a
              href="mailto:info@norvikgold.com"
              className="underline underline-offset-4"
            >
              info@norvikgold.com
            </a>{" "}
            or +971 585 622 369.
          </p>
          <p className="text-xs italic text-muted">
            This document is a draft prepared for internal review and client
            approval. It is not a substitute for advice from a qualified lawyer
            licensed in the UAE and India.
          </p>
        </div>
      </div>
    </main>
  );
}
