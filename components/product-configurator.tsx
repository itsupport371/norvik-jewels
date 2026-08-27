"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import { useRouter, usePathname } from "next/navigation";
import type { Product, OptionChoice } from "@/lib/mock-products";
import {
  CLARITY_ALLOWED_COLORS,
  stockFor,
  COLOR_CHARGE_PERCENT,
} from "@/lib/mock-products";
import ProductSpecifications from "@/components/product-specifications";
import { createClient } from "@/lib/supabase/client";
import { calculatePrice, TEST_GOLD_RATE_24K_PER_10G } from "@/lib/pricing";
import { useWishlist } from "@/lib/wishlist-context";
import { useCart } from "@/lib/cart-context";

const FIXED_CLARITY = "SI1";

function extractKarat(metalLabel: string): 9 | 14 | 18 {
  const match = metalLabel.match(/^(\d+)/);
  const num = match ? parseInt(match[1], 10) : 18;
  if (num === 9 || num === 14 || num === 18) return num;
  return 18;
}

function CardGrid({
  label,
  cards,
  selected,
  onSelect,
}: {
  label: string;
  cards: {
    key: string;
    title: string;
    sublabel?: string;
    stock: string;
    selected: boolean;
  }[];
  selected: string;
  onSelect: (key: string) => void;
}) {
  return (
    <div>
      <label className="mb-2.5 block text-xs font-medium uppercase tracking-wide2 text-muted">
        {label}
      </label>
      <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
        {cards.map((card) => (
          <button
            key={card.key}
            type="button"
            onClick={() => onSelect(card.key)}
            className={`flex flex-col items-center gap-1.5 border px-2 py-3 text-center transition-colors ${
              card.key === selected
                ? "border-ink bg-ink text-white"
                : "border-line bg-ivory text-charcoal hover:border-ink"
            }`}
          >
            <span className="text-sm font-semibold leading-tight">
              {card.title}
            </span>
            {card.sublabel && (
              <span
                className={`text-[10px] leading-tight ${
                  card.key === selected ? "text-white/70" : "text-muted"
                }`}
              >
                {card.sublabel}
              </span>
            )}
            {card.stock && (
              <span
                className={`mt-1 rounded-full px-2 py-0.5 text-[10px] ${
                  card.key === selected
                    ? "bg-ivory/15 text-white"
                    : "bg-[#F1EEE8] text-charcoal"
                }`}
              >
                {card.stock}
              </span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}

export default function ProductConfigurator({ product }: { product: Product }) {
  const router = useRouter();
  const pathname = usePathname();
  const [activeImage, setActiveImage] = useState(0);
  const [metalKey, setMetalKey] = useState(product.metalOptions[0].label);
  const [sizeKey, setSizeKey] = useState<string | null>(
    () => product.sizeOptions.find((o) => o.label === "9")?.label ?? null,
  );
  const [added, setAdded] = useState(false);
  const { isWishlisted, toggleWishlist } = useWishlist();
  const { addToCart } = useCart();
  const wishlisted = isWishlisted(product.slug);
  const [customizing, setCustomizing] = useState(false);
  const [sizeGuideOpen, setSizeGuideOpen] = useState(false);
  const [buyLoading, setBuyLoading] = useState(false);

  const hasDiamond = Boolean(product.diamond);
  const [colorKey, setColorKey] = useState("D-F");

  const allowedColors = useMemo(
    () => CLARITY_ALLOWED_COLORS[FIXED_CLARITY] ?? [],
    [],
  );

  useMemo(() => {
    if (!product.metalImages) return;
    const metalColor = product.metalOptions.find(
      (m) => m.label === metalKey,
    )?.metalColor;
    if (metalColor && product.metalImages[metalColor]) {
      const idx = product.images.indexOf(product.metalImages[metalColor]);
      if (idx !== -1) setActiveImage(idx);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [metalKey]);

  // ---------- Single source of truth for pricing ----------
  // Both the price shown at the top and the Specifications table below use
  // this exact same calculation, so they can never disagree. Every
  // selectable option (metal, size, diamond quality) feeds into it.
  const needsSize = product.sizeOptions.length > 1;
  const karat = extractKarat(metalKey);

  // Ring size changes gold weight slightly — larger sizes use a bit more
  // metal. Placeholder ratio (grams per mm difference from size 9, the
  // default) — pending real per-size weight data from the client.
  function parseMM(sublabel?: string): number {
    if (!sublabel) return 0;
    const match = sublabel.match(/[\d.]+/);
    return match ? parseFloat(match[0]) : 0;
  }
  const baselineMM = parseMM(
    product.sizeOptions.find((o) => o.label === "9")?.sublabel,
  );
  const selectedMM = parseMM(
    product.sizeOptions.find((o) => o.label === sizeKey)?.sublabel,
  );
  const sizeWeightDelta = needsSize ? (selectedMM - baselineMM) * 0.03 : 0;
  const effectiveGoldWeight = Math.max(
    0.1,
    product.goldWeightGrams + sizeWeightDelta,
  );

  const colorChargePercent = hasDiamond
    ? (COLOR_CHARGE_PERCENT[colorKey] ?? 0)
    : 0;

  const rawPricing = calculatePrice({
    goldRate24kPer10g: TEST_GOLD_RATE_24K_PER_10G,
    desiredKarat: karat,
    goldWeightGrams: effectiveGoldWeight,
    makingChargePercent: 12, // placeholder — pending client confirmation
    diamondCaratRequired: product.diamondCaratTotal ?? 0,
    diamondBaseRatePerCarat: 100000, // placeholder — pending client confirmation
    colorChargePercent, // now reacts to selected Diamond Quality — placeholder %s
    clarityChargePercent: 0,
    cutChargePercent: 0,
    gstPercent: 3,
  });
  const goldValue = Math.round(rawPricing.goldValue);
  const diamondCharge = Math.round(rawPricing.diamondCharge);
  const makingCharge = Math.round(rawPricing.makingCharge);
  const subtotal = goldValue + diamondCharge + makingCharge;
  const gstAmount = Math.round(subtotal * 0.03);
  const grandTotal = subtotal + gstAmount;

  const canAddToBag = !needsSize || sizeKey !== null;

  function handleAddToBag() {
    if (!canAddToBag) return;
    const id = [
      product.slug,
      metalKey,
      hasDiamond ? colorKey : "",
      sizeKey ?? "",
    ].join("|");
    addToCart({
      id,
      slug: product.slug,
      name: product.name,
      image: product.images[0],
      currency: product.currency,
      metalKey,
      colorKey: hasDiamond ? colorKey : undefined,
      sizeKey: sizeKey ?? undefined,
      price: grandTotal,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  }

  async function handleBuyNow() {
    if (!canAddToBag || buyLoading) return;
    setBuyLoading(true);

    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      router.push(`/login?redirect=${encodeURIComponent(pathname)}`);
      return;
    }

    const params = new URLSearchParams({
      slug: product.slug,
      metal: metalKey,
      price: String(grandTotal),
    });
    if (hasDiamond) params.set("color", colorKey);
    if (sizeKey) params.set("size", sizeKey);

    router.push(`/checkout?${params.toString()}`);
  }

  async function handleShare() {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({ title: product.name, url });
      } catch {
        // user cancelled — ignore
      }
    } else {
      await navigator.clipboard.writeText(url);
      alert("Link copied to clipboard");
    }
  }

  function toCards(options: OptionChoice[], selectedLabel: string) {
    return options.map((o) => ({
      key: o.label,
      title: o.label,
      sublabel: o.sublabel,
      stock: o.stock,
      selected: o.label === selectedLabel,
    }));
  }

  const diamondSummary = hasDiamond ? colorKey : null;

  return (
    <div className="grid grid-cols-1 gap-10 lg:grid-cols-2 lg:gap-16">
      {/* Image gallery */}
      <div>
        <div className="relative aspect-square overflow-hidden bg-[#F7F5F2]">
          <Image
            src={product.images[activeImage]}
            alt={product.name}
            fill
            priority
            className="object-cover"
            sizes="(min-width: 1024px) 45vw, 100vw"
          />
        </div>
        {product.images.length > 1 && (
          <div className="mt-3 flex gap-3">
            {product.images.map((img, i) => (
              <button
                key={img}
                onClick={() => setActiveImage(i)}
                className={`relative h-20 w-20 overflow-hidden bg-[#F7F5F2] transition-opacity ${
                  activeImage === i
                    ? "opacity-100 ring-1 ring-black"
                    : "opacity-60 hover:opacity-90"
                }`}
              >
                <Image
                  src={img}
                  alt=""
                  fill
                  className="object-cover"
                  sizes="80px"
                />
              </button>
            ))}
          </div>
        )}

        <ProductSpecifications
          product={product}
          colorKey={hasDiamond ? colorKey : undefined}
          karat={karat}
          goldWeightGrams={effectiveGoldWeight}
          goldValue={goldValue}
          diamondCharge={diamondCharge}
          makingCharge={makingCharge}
          subtotal={subtotal}
          gstAmount={gstAmount}
          grandTotal={grandTotal}
        />
      </div>

      {/* Details & configurator */}
      <div>
        <div className="flex items-start justify-between gap-4">
          <h1 className="font-display text-2xl font-medium text-ink sm:text-3xl">
            {product.name}
          </h1>
        </div>

        <div className="mt-3 flex items-center justify-between gap-3">
          <span className="text-xl font-medium text-ink">
            {product.currency}
            {grandTotal.toLocaleString("en-IN")}
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => toggleWishlist(product.slug)}
              aria-label="Add to wishlist"
              className="flex h-10 w-10 items-center justify-center border border-line text-ink transition-colors hover:border-ink"
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill={wishlisted ? "#B8935A" : "none"}
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
              </svg>
            </button>
            <button
              onClick={handleShare}
              aria-label="Share this product"
              className="flex h-10 w-10 items-center justify-center border border-line text-ink transition-colors hover:border-ink"
            >
              <svg
                width="17"
                height="17"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.6"
              >
                <circle cx="18" cy="5" r="3" />
                <circle cx="6" cy="12" r="3" />
                <circle cx="18" cy="19" r="3" />
                <line x1="8.6" y1="10.5" x2="15.4" y2="6.5" />
                <line x1="8.6" y1="13.5" x2="15.4" y2="17.5" />
              </svg>
            </button>
          </div>
        </div>

        <p className="mt-5 max-w-md text-sm leading-relaxed text-charcoal">
          {product.description}
        </p>

        {/* Compact summary bar — default view */}
        {!customizing && (
          <div className="mt-8 flex divide-x divide-line border border-line">
            {needsSize && (
              <div className="flex-1 px-3 py-3">
                <p className="text-[10px] uppercase tracking-wide2 text-muted">
                  Size
                </p>
                <p className="mt-0.5 text-sm font-medium text-ink">
                  {sizeKey ?? "Select"}
                </p>
              </div>
            )}
            <div className="flex-1 px-3 py-3">
              <p className="text-[10px] uppercase tracking-wide2 text-muted">
                Metal
              </p>
              <p className="mt-0.5 truncate text-sm font-medium text-ink">
                {metalKey}
              </p>
            </div>
            {hasDiamond && (
              <div className="flex-1 px-3 py-3">
                <p className="text-[10px] uppercase tracking-wide2 text-muted">
                  Diamond Quality
                </p>
                <p className="mt-0.5 text-sm font-medium text-ink">
                  {diamondSummary}
                </p>
              </div>
            )}
            <button
              onClick={() => setCustomizing(true)}
              className="bg-[#B8935A] px-5 text-xs font-semibold uppercase tracking-wide2 text-ink transition-opacity hover:opacity-90"
            >
              Customise
            </button>
          </div>
        )}

        {/* Size guide banner */}
        {!customizing && needsSize && (
          <div className="mt-3 flex items-center justify-between bg-[#F3EFFB] px-4 py-3">
            <p className="text-sm text-charcoal">
              Not sure about your ring size?
            </p>
            <button
              onClick={() => setSizeGuideOpen(true)}
              className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide2 text-[#7C5CBF] transition-opacity hover:opacity-75"
            >
              Learn How
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
              >
                <circle cx="12" cy="12" r="9" />
                <path
                  d="M10 8.5l5 3.5-5 3.5z"
                  fill="currentColor"
                  stroke="none"
                />
              </svg>
            </button>
          </div>
        )}

        {/* Ring size guide modal */}
        {sizeGuideOpen && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-ink/60 p-4"
            onClick={() => setSizeGuideOpen(false)}
          >
            <div
              className="relative max-h-[90vh] max-w-3xl overflow-auto bg-ivory p-2"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setSizeGuideOpen(false)}
                aria-label="Close"
                className="absolute right-3 top-3 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-ivory text-ink shadow"
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
              <Image
                src="/images/ring-size-guide.jpg"
                alt="Norvik Jewels ring size guide"
                width={1819}
                height={865}
                className="h-auto w-full"
              />
            </div>
          </div>
        )}

        {/* Expanded configurator */}
        {customizing && (
          <div className="mt-8 space-y-7">
            <CardGrid
              label="Choice of Metal"
              cards={toCards(product.metalOptions, metalKey)}
              selected={metalKey}
              onSelect={setMetalKey}
            />

            {hasDiamond && product.diamond && (
              <div className="border-t border-line pt-7">
                <p className="mb-5 text-xs font-medium uppercase tracking-wide2 text-[#B8935A]">
                  Diamond Details
                </p>
                <div className="space-y-6">
                  <CardGrid
                    label="Diamond Quality"
                    cards={allowedColors.map((colorValue) => ({
                      key: colorValue,
                      title: colorValue,
                      stock: stockFor(FIXED_CLARITY, colorValue),
                      selected: colorValue === colorKey,
                    }))}
                    selected={colorKey}
                    onSelect={setColorKey}
                  />
                </div>
              </div>
            )}

            {needsSize && (
              <div className="border-t border-line pt-7">
                <label className="mb-2.5 block text-xs font-medium uppercase tracking-wide2 text-muted">
                  Select Size
                </label>
                <div className="grid grid-cols-4 gap-2 sm:grid-cols-5">
                  {product.sizeOptions.map((opt) => (
                    <button
                      key={opt.label}
                      onClick={() => setSizeKey(opt.label)}
                      className={`flex flex-col items-center gap-1 border px-2 py-2.5 text-center transition-colors ${
                        sizeKey === opt.label
                          ? "border-ink bg-ink text-white"
                          : "border-line text-charcoal hover:border-ink"
                      }`}
                    >
                      <span className="text-sm font-semibold">{opt.label}</span>
                      {opt.sublabel && (
                        <span
                          className={`text-[10px] ${
                            sizeKey === opt.label
                              ? "text-white/70"
                              : "text-muted"
                          }`}
                        >
                          {opt.sublabel}
                        </span>
                      )}
                    </button>
                  ))}
                </div>
                {sizeKey === null && (
                  <p className="mt-2 text-xs text-muted">
                    Select a size to continue.
                  </p>
                )}
              </div>
            )}

            <button
              onClick={() => setCustomizing(false)}
              className="w-full border border-ink py-3 text-xs font-semibold uppercase tracking-wide2 text-ink transition-colors hover:bg-ink/90 hover:text-white"
            >
              Done
            </button>
          </div>
        )}

        <button
          onClick={handleBuyNow}
          disabled={!canAddToBag || buyLoading}
          className="mt-6 w-full bg-ink py-4 text-sm font-medium uppercase tracking-wide2 text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-30"
        >
          {buyLoading ? "Please wait…" : "Buy Now"}
        </button>

        <button
          onClick={handleAddToBag}
          disabled={!canAddToBag}
          className={`mt-3 w-full py-3.5 text-sm font-medium uppercase tracking-wide2 transition-colors ${
            added
              ? "border border-[#1F4D3D] text-[#1F4D3D]"
              : "border border-ink text-ink hover:bg-ink/90 hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
          }`}
        >
          {added ? "Added to Bag ✓" : "Add to Bag"}
        </button>

        <p className="mt-4 text-xs text-muted">
          Certified 18K gold · Free insured shipping · 15-day returns on ready
          pieces
        </p>
      </div>
    </div>
  );
}
