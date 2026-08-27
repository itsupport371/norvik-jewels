'use client';

import { useState } from 'react';
import type { Product } from '@/lib/mock-products';

export default function ProductSpecifications({
  product,
  colorKey,
  karat,
  goldWeightGrams,
  goldValue,
  diamondCharge,
  makingCharge,
  subtotal,
  gstAmount,
  grandTotal,
}: {
  product: Product;
  colorKey?: string;
  karat: number;
  goldWeightGrams: number;
  goldValue: number;
  diamondCharge: number;
  makingCharge: number;
  subtotal: number;
  gstAmount: number;
  grandTotal: number;
}) {
  const [open, setOpen] = useState(true);
  const hasDiamond = Boolean(product.diamond) && (product.diamondCaratTotal ?? 0) > 0;

  return (
    <div className="mt-10 border-t border-line pt-6">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between text-left"
      >
        <h3 className="font-display text-lg font-medium text-ink">Specifications</h3>
        <span className="text-xl text-charcoal">{open ? '−' : '+'}</span>
      </button>

      {open && (
        <div className="mt-4 overflow-hidden border border-line">
          <div className="border-b border-line bg-[#F7F5F2] py-2.5 text-center text-xs font-semibold uppercase tracking-wide2 text-charcoal">
            Product Details
          </div>

          <div className="grid grid-cols-3 divide-x divide-line border-b border-line text-center text-sm">
            <div className="px-3 py-3 font-medium text-ink">Gold ({karat}K)</div>
            <div className="px-3 py-3 text-charcoal">{goldWeightGrams.toFixed(2)}gm</div>
            <div className="px-3 py-3 text-charcoal">
              {product.currency}
              {goldValue.toLocaleString('en-IN')}
            </div>
          </div>

          {hasDiamond && (
            <div className="grid grid-cols-3 divide-x divide-line border-b border-line text-center text-sm">
              <div className="px-3 py-3 font-medium text-ink">
                {colorKey ?? 'Diamond'}
                {product.diamondPieceCount ? ` (${product.diamondPieceCount} Nos.)` : ''}
              </div>
              <div className="px-3 py-3 text-charcoal">
                Lab Diamond
                <br />
                {product.diamondCaratTotal} ct
              </div>
              <div className="px-3 py-3 text-charcoal">
                {product.currency}
                {diamondCharge.toLocaleString('en-IN')}
              </div>
            </div>
          )}

          <div className="grid grid-cols-3 divide-x divide-line border-b border-line text-center text-sm">
            <div className="px-3 py-3 font-medium text-ink">Making</div>
            <div className="px-3 py-3 text-charcoal">-</div>
            <div className="px-3 py-3 text-charcoal">
              {product.currency}
              {makingCharge.toLocaleString('en-IN')}
            </div>
          </div>

          <div className="grid grid-cols-3 divide-x divide-line border-b border-line text-center text-sm">
            <div className="px-3 py-3 font-medium text-ink">Subtotal</div>
            <div className="px-3 py-3 text-charcoal">-</div>
            <div className="px-3 py-3 text-charcoal">
              {product.currency}
              {subtotal.toLocaleString('en-IN')}
            </div>
          </div>

          <div className="grid grid-cols-3 divide-x divide-line border-b border-line text-center text-sm">
            <div className="px-3 py-3 font-medium text-ink">GST (3%)</div>
            <div className="px-3 py-3 text-charcoal">-</div>
            <div className="px-3 py-3 text-charcoal">
              {product.currency}
              {gstAmount.toLocaleString('en-IN')}
            </div>
          </div>

          <div className="grid grid-cols-3 divide-x divide-line text-center text-sm">
            <div className="px-3 py-3 font-semibold text-ink">Grand Total</div>
            <div className="px-3 py-3 text-charcoal">-</div>
            <div className="px-3 py-3 font-semibold text-ink">
              {product.currency}
              {grandTotal.toLocaleString('en-IN')}
            </div>
          </div>

          <p className="border-t border-line px-3 py-2 text-[11px] text-muted">
            *Weight may vary in the final product. Differential amount if any, will be charged extra.
          </p>
        </div>
      )}
    </div>
  );
}
