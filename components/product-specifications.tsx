'use client';

import { useState } from 'react';
import type { Product } from '@/lib/mock-products';

// Redesigned 8 Oct 2026 — client asked for the Specifications accordion to
// be replaced with a CaratLane-style "Product Details" card: SKU with a
// copy button, a one-line "Set in X KT Metal (Y g) with diamonds (Z ct)"
// summary, and two boxed info panels (Gold / Diamond) instead of the old
// price-breakdown table (Gold value / Diamond charge / Making / GST /
// Grand Total). That breakdown isn't lost — the grand total is already
// shown right under the product name above (see product-configurator.tsx),
// this card is purely descriptive now, matching the reference screenshot.
//
// Two things CaratLane's reference has that this does NOT reproduce, by
// the client's own choice (asked 8 Oct 2026):
//  - No "Manufactured by ..." legal/company line — Norvik hasn't given one.
//  - No BIS/Hallmark/"Trust of ..." badge row — those are real regulatory/
//    partnership claims CaratLane can make and Norvik can't (yet), so
//    showing them would be a false certification claim.
// Also no "Dimensions" box — the catalogue doesn't capture piece width/
// height/gross weight anywhere in the admin import pipeline yet, so rather
// than invent numbers, it's left out until that data actually exists.
export default function ProductSpecifications({
  product,
  colorKey,
  karat,
  goldWeightGrams,
  metalLabel,
}: {
  product: Product;
  colorKey?: string;
  karat: number;
  goldWeightGrams: number;
  metalLabel: string;
}) {
  const [open, setOpen] = useState(true);
  const [copied, setCopied] = useState(false);
  // Deliberately NOT gated on `product.diamond` (the customizable Diamond
  // Details config) — a fixed pavé/cluster design (many small stones, no
  // swappable center stone) correctly has no `diamond` config at all, but
  // still has real diamondCaratTotal/diamondPieceCount data that belongs on
  // the spec sheet. Whether a product offers Diamond Quality customization
  // and whether it *has* diamonds worth listing here are separate facts.
  const hasDiamond = (product.diamondCaratTotal ?? 0) > 0;

  // "18 KT Yellow Gold" -> "Yellow Gold" (metalLabel always starts with the
  // karat number + "KT", stripped here since karat is shown separately).
  const metalColorLabel = metalLabel.replace(/^\d+\s*KT\s*/i, '').trim();

  function copySku() {
    if (!product.norvikSku) return;
    navigator.clipboard.writeText(product.norvikSku).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  }

  return (
    <div className="mt-10 border-t border-line pt-6">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between text-left"
      >
        <h3 className="font-display text-lg font-medium leading-[1.05] tracking-[-0.01em] text-ink">Product Details</h3>
        <span className="text-xl text-charcoal">{open ? '−' : '+'}</span>
      </button>

      {open && (
        <div className="mt-4 space-y-4">
          {product.norvikSku && (
            <button
              onClick={copySku}
              className="flex items-center gap-1.5 text-[12px] font-medium uppercase tracking-[0.06em] text-antiquegold"
              title="Copy SKU"
            >
              SKU {product.norvikSku}
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="9" y="9" width="13" height="13" rx="2" />
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
              </svg>
              {copied && <span className="normal-case tracking-normal text-charcoal">Copied</span>}
            </button>
          )}

          <p className="text-[13px] leading-[1.5] text-charcoal">
            Set in {karat} KT {metalColorLabel} ({goldWeightGrams.toFixed(2)} g)
            {hasDiamond && (
              <>
                {' '}with diamonds ({product.diamondCaratTotal} ct{colorKey ? `, ${colorKey}` : ''})
              </>
            )}
          </p>

          <div className={`grid gap-4 ${hasDiamond ? 'grid-cols-2' : 'grid-cols-1'}`}>
            <div className="border border-line bg-softwhite px-4 py-3.5">
              <p className="text-[11px] font-semibold uppercase leading-[1.2] tracking-[0.08em] text-antiquegold">Gold</p>
              <dl className="mt-2 space-y-1 text-[13px] leading-[1.4] text-ink">
                <div className="flex justify-between gap-2">
                  <dt className="text-charcoal">Purity</dt>
                  <dd>{karat} KT</dd>
                </div>
                <div className="flex justify-between gap-2">
                  <dt className="text-charcoal">Colour</dt>
                  <dd>{metalColorLabel}</dd>
                </div>
                <div className="flex justify-between gap-2">
                  <dt className="text-charcoal">Net weight</dt>
                  <dd>{goldWeightGrams.toFixed(2)} g</dd>
                </div>
              </dl>
            </div>

            {hasDiamond && (
              <div className="border border-line bg-softwhite px-4 py-3.5">
                <p className="text-[11px] font-semibold uppercase leading-[1.2] tracking-[0.08em] text-antiquegold">Diamond</p>
                <dl className="mt-2 space-y-1 text-[13px] leading-[1.4] text-ink">
                  {colorKey && (
                    <div className="flex justify-between gap-2">
                      <dt className="text-charcoal">Colour · Clarity</dt>
                      <dd>{colorKey}</dd>
                    </div>
                  )}
                  <div className="flex justify-between gap-2">
                    <dt className="text-charcoal">Total weight</dt>
                    <dd>{product.diamondCaratTotal} ct</dd>
                  </div>
                  {Boolean(product.diamondPieceCount) && (
                    <div className="flex justify-between gap-2">
                      <dt className="text-charcoal">Diamonds</dt>
                      <dd>{product.diamondPieceCount}</dd>
                    </div>
                  )}
                </dl>
              </div>
            )}
          </div>

          <p className="text-[12px] leading-[1.35] text-muted">
            *Weight may vary in the final product. Differential amount if any, will be charged extra.
          </p>
        </div>
      )}
    </div>
  );
}
