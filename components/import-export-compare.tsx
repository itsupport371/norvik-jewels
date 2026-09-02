import Image from 'next/image';

// Import vs Export comparison — homepage section, near the top just below the
// header/hero. Client sent two earring designs to place side by side: the
// heart-shaped floral cluster studs ("import") and the three-stone baguette
// hoops ("export"), each in white/rose/yellow gold — matched up tone-by-tone
// (rose vs rose, white vs white, yellow vs yellow) with large images per the
// client's ask. Copy/labels are placeholders — swap "Import" / "Export" for
// whatever the client actually wants these two groups called if it's not
// literally import vs export stock.
const TONE_PAIRS = [
  {
    tone: 'Rose Gold',
    import: '/images/import-earring-rose-gold.jpg',
    export: '/images/export-earring-rose-gold.jpg',
  },
  {
    tone: 'White Gold',
    import: '/images/import-earring-white-gold.jpg',
    export: '/images/export-earring-white-gold.jpg',
  },
  {
    tone: 'Yellow Gold',
    import: '/images/import-earring-yellow-gold.jpg',
    export: '/images/export-earring-yellow-gold.jpg',
  },
];

export default function ImportExportCompare() {
  return (
    <section className="bg-white px-6 py-16 sm:py-20">
      <div className="mx-auto max-w-6xl">
        <div className="mb-10 text-center sm:mb-14">
          <p className="mb-2 text-[10px] font-medium uppercase leading-[1.2] tracking-[0.14em] text-antiquegold sm:text-[11px]">
            Compare
          </p>
          <h2 className="font-display text-[26px] font-medium leading-[1.05] tracking-[-0.01em] text-inknavy sm:text-[36px]">
            Import vs Export
          </h2>
        </div>

        <div className="flex flex-col gap-14 sm:gap-20">
          {TONE_PAIRS.map((pair) => (
            <div key={pair.tone}>
              <p className="mb-5 text-center text-[13px] font-medium uppercase leading-[1.2] tracking-[0.14em] text-inknavy sm:mb-7 sm:text-[14px]">
                {pair.tone}
              </p>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 sm:gap-10">
                <div className="flex flex-col items-center gap-4">
                  <span className="text-[11px] font-medium uppercase leading-[1.2] tracking-[0.14em] text-antiquegold sm:text-[12px]">
                    Import
                  </span>
                  <div className="relative aspect-square w-full overflow-hidden border border-warmstone bg-softwhite">
                    <Image
                      src={pair.import}
                      alt={`Import — ${pair.tone} earrings`}
                      fill
                      className="object-contain p-6 sm:p-10"
                      sizes="(min-width: 640px) 45vw, 90vw"
                    />
                  </div>
                </div>
                <div className="flex flex-col items-center gap-4">
                  <span className="text-[11px] font-medium uppercase leading-[1.2] tracking-[0.14em] text-antiquegold sm:text-[12px]">
                    Export
                  </span>
                  <div className="relative aspect-square w-full overflow-hidden border border-warmstone bg-softwhite">
                    <Image
                      src={pair.export}
                      alt={`Export — ${pair.tone} earrings`}
                      fill
                      className="object-contain p-6 sm:p-10"
                      sizes="(min-width: 640px) 45vw, 90vw"
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
