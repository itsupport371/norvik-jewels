'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

// 30 Oct 2026 (client): the homepage "Philosophy" section (added from the
// content brief, 28 Oct 2026, "Ecommerce_Mann_2") was a single static block.
// Client sent 3 reference texts and asked for them in a 3-slide carousel
// instead of one fixed block — this covers the brief's own caution ("use
// one complete hero direction rather than mixing slogans") by rotating
// between the directions over time instead of mixing them in one block.
// Slide 1 is the brief's approved "Philosophy" copy; slides 2 and 3 are its
// "Alternative hero one" / "Alternative hero two" copy (originally meant as
// alternatives to the main hero, not this section — repurposed here since
// the client specifically asked for all three together, sliding).
type Slide = {
  heading: string;
  body: string;
};

const SLIDES: Slide[] = [
  {
    heading: 'Some things are felt before they are seen.',
    body: 'The ease of a well-balanced form. The warmth of gold against the skin. A detail that feels right without asking why. At Norvik, restraint leaves room for feeling. We give each piece enough presence to be itself, and enough simplicity to become yours.',
  },
  {
    heading: 'Where two kinds of light become one.',
    body: "The long light of a Swedish summer. The gold of an Arabian evening. Between them, Norvik finds its language: clean lines, warm light, and 18K gold that becomes part of your own story.",
  },
  {
    heading: 'The North in its lines. The East in its light.',
    body: 'Sweden gives us a sense of stillness. Dubai gives us a love of gold. We bring them together in pieces that feel quietly expressive, with room for the life you will wear them in.',
  },
];

export default function PhilosophySlider() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setIndex((i) => (i + 1) % SLIDES.length);
    }, 5000);
    return () => clearInterval(id);
  }, []);

  return (
    <section className="bg-softwhite px-6 py-20 text-center lg:px-10">
      <div className="relative mx-auto min-h-[180px] max-w-xl sm:min-h-[150px]">
        {SLIDES.map((slide, i) => (
          <div
            key={slide.heading}
            className="absolute inset-0 transition-opacity duration-700"
            style={{ opacity: i === index ? 1 : 0, pointerEvents: i === index ? 'auto' : 'none' }}
          >
            <h2 className="font-display text-[26px] font-medium leading-[1.15] tracking-[-0.01em] text-inknavy sm:text-[34px]">
              {slide.heading}
            </h2>
            <p className="mx-auto mt-5 max-w-lg text-[14px] leading-[1.6] text-charcoal sm:text-[15px]">
              {slide.body}
            </p>
          </div>
        ))}
      </div>

      <Link
        href="/our-world"
        className="mt-7 inline-block text-[11px] font-medium uppercase leading-[1.2] tracking-[0.08em] text-inknavy underline underline-offset-4 transition-colors hover:text-antiquegold sm:text-[12px]"
      >
        Enter our world
      </Link>

      <div className="mt-8 flex justify-center gap-2">
        {SLIDES.map((_, i) => (
          <button
            key={i}
            type="button"
            onClick={() => setIndex(i)}
            aria-label={`Go to slide ${i + 1}`}
            className={`h-1.5 rounded-full transition-all ${
              i === index ? 'w-6 bg-antiquegold' : 'w-1.5 bg-inknavy/20'
            }`}
          />
        ))}
      </div>
    </section>
  );
}
