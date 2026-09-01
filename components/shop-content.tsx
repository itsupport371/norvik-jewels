"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { products, getDisplayPrice, type Product } from "@/lib/mock-products";

type SortOption = "featured" | "price-low" | "price-high";

// ---------- Price buckets ----------
// Fixed ranges (like a real storefront's price filter), but every count
// next to them is computed live from whatever is in `products` — so as
// SKUs are added the counts move on their own, no manual upkeep needed.
const PRICE_RANGES = [
  { key: "u25", label: "Under ₹25,000", min: 0, max: 25000 },
  { key: "25-50", label: "₹25,000 – ₹50,000", min: 25000, max: 50000 },
  { key: "50-75", label: "₹50,000 – ₹75,000", min: 50000, max: 75000 },
  { key: "75-100", label: "₹75,000 – ₹1,00,000", min: 75000, max: 100000 },
  { key: "100plus", label: "Above ₹1,00,000", min: 100000, max: Infinity },
] as const;

function priceInRange(price: number, key: string) {
  const range = PRICE_RANGES.find((r) => r.key === key);
  if (!range) return false;
  return price >= range.min && price < range.max;
}

type Filters = {
  categories: string[];
  metals: string[];
  priceRanges: string[];
  sizes: string[];
  diamondOnly: boolean;
  signatureOnly: boolean;
};

const EMPTY_FILTERS: Filters = {
  categories: [],
  metals: [],
  priceRanges: [],
  sizes: [],
  diamondOnly: false,
  signatureOnly: false,
};

function toggleInArray(list: string[], value: string) {
  return list.includes(value) ? list.filter((v) => v !== value) : [...list, value];
}

// Checks a product against every filter group EXCEPT the one named in
// `ignoreGroup` — used to compute each filter option's own count against
// "everything else you've already picked," the way real storefront filter
// counts work (pick a category, and the metal counts update to match it).
function productMatches(p: Product, f: Filters, ignoreGroup?: keyof Filters) {
  const price = getDisplayPrice(p);

  const categoryOk =
    ignoreGroup === "categories" || f.categories.length === 0 || f.categories.includes(p.category);

  const metalOk =
    ignoreGroup === "metals" ||
    f.metals.length === 0 ||
    p.metalOptions.some((m) => f.metals.includes(m.label));

  const priceOk =
    ignoreGroup === "priceRanges" ||
    f.priceRanges.length === 0 ||
    f.priceRanges.some((key) => priceInRange(price, key));

  const sizeOk =
    ignoreGroup === "sizes" ||
    f.sizes.length === 0 ||
    (p.category === "Rings" && p.sizeOptions.some((s) => f.sizes.includes(s.label)));

  const diamondOk = ignoreGroup === "diamondOnly" || !f.diamondOnly || Boolean(p.diamond);

  const signatureOk = ignoreGroup === "signatureOnly" || !f.signatureOnly || Boolean(p.isSignature);

  return categoryOk && metalOk && priceOk && sizeOk && diamondOk && signatureOk;
}

// Derives every filter option straight from the live catalogue — a new
// product with a new metal, a new category, or a new ring size shows up as
// a new filter automatically, nothing here names today's SKUs.
function deriveFilterOptions() {
  const categories: string[] = [];
  const metals: string[] = [];
  const sizesSet = new Set<number>();
  for (const p of products) {
    if (!categories.includes(p.category)) categories.push(p.category);
    for (const m of p.metalOptions) {
      if (!metals.includes(m.label)) metals.push(m.label);
    }
    if (p.category === "Rings") {
      for (const s of p.sizeOptions) {
        const n = Number(s.label);
        if (!Number.isNaN(n)) sizesSet.add(n);
      }
    }
  }
  return {
    categories,
    metals,
    sizes: Array.from(sizesSet).sort((a, b) => a - b),
  };
}

export default function ShopContent() {
  const searchParams = useSearchParams();
  const initialCategory = searchParams.get("category");
  const collectionParam = searchParams.get("collection");
  const sortParam = searchParams.get("sort");
  const isSignatureCollection = collectionParam === "signature";
  const isBestsellers = sortParam === "bestsellers";
  const isNewArrivals = sortParam === "new";

  const options = useMemo(deriveFilterOptions, []);

  const normalizedInitialCategory =
    options.categories.find((c) => c.toLowerCase() === initialCategory?.toLowerCase()) ?? null;

  const [filters, setFilters] = useState<Filters>({
    ...EMPTY_FILTERS,
    categories: normalizedInitialCategory ? [normalizedInitialCategory] : [],
    signatureOnly: isSignatureCollection || isBestsellers,
  });
  const [sort, setSort] = useState<SortOption>("featured");
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  // Re-sync whenever the URL itself changes (e.g. clicking a homepage
  // banner while already sitting on /shop) — see the note in productMatches
  // above: Next.js reuses this component instance across /shop?... navigations,
  // so state seeded only at first mount would otherwise go stale.
  useEffect(() => {
    setFilters((prev) => ({
      ...prev,
      categories: normalizedInitialCategory ? [normalizedInitialCategory] : [],
      signatureOnly: isSignatureCollection || isBestsellers,
    }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [normalizedInitialCategory, isSignatureCollection, isBestsellers]);

  const filtered = useMemo(() => {
    let list = products.filter((p) => productMatches(p, filters));
    if (sort === "price-low") {
      list = [...list].sort((a, b) => getDisplayPrice(a) - getDisplayPrice(b));
    } else if (sort === "price-high") {
      list = [...list].sort((a, b) => getDisplayPrice(b) - getDisplayPrice(a));
    }
    return list;
  }, [filters, sort]);

  const heading = isSignatureCollection
    ? "The Signature Collection"
    : isBestsellers
      ? "Best Sellers"
      : isNewArrivals
        ? "New Arrivals"
        : "Shop All";

  const activeFilterCount =
    filters.categories.length +
    filters.metals.length +
    filters.priceRanges.length +
    filters.sizes.length +
    (filters.diamondOnly ? 1 : 0) +
    (filters.signatureOnly ? 1 : 0);

  function clearAll() {
    setFilters(EMPTY_FILTERS);
  }

  const sidebar = (
    <div>
      <div className="flex items-center justify-between">
        <p className="flex items-center gap-2 text-[13px] font-semibold uppercase leading-[1.2] tracking-[0.1em] text-ink">
          Filters
          {activeFilterCount > 0 && (
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-antiquegold text-[11px] font-medium text-softwhite">
              {activeFilterCount}
            </span>
          )}
        </p>
        {activeFilterCount > 0 && (
          <button
            onClick={clearAll}
            className="text-[11px] font-medium uppercase leading-[1.2] tracking-[0.08em] text-antiquegold underline underline-offset-4"
          >
            Clear All
          </button>
        )}
      </div>

      <FilterGroup title="Product Type">
        {options.categories.map((cat) => {
          const count = products.filter(
            (p) => p.category === cat && productMatches(p, filters, "categories")
          ).length;
          return (
            <FilterCheckbox
              key={cat}
              checked={filters.categories.includes(cat)}
              onChange={() =>
                setFilters((f) => ({ ...f, categories: toggleInArray(f.categories, cat) }))
              }
              label={cat}
              count={count}
            />
          );
        })}
      </FilterGroup>

      <FilterGroup title="Metal">
        {options.metals.map((metal) => {
          const count = products.filter(
            (p) =>
              p.metalOptions.some((m) => m.label === metal) &&
              productMatches(p, filters, "metals")
          ).length;
          return (
            <FilterCheckbox
              key={metal}
              checked={filters.metals.includes(metal)}
              onChange={() => setFilters((f) => ({ ...f, metals: toggleInArray(f.metals, metal) }))}
              label={metal}
              count={count}
            />
          );
        })}
      </FilterGroup>

      <FilterGroup title="Price">
        {PRICE_RANGES.map((range) => {
          const count = products.filter(
            (p) =>
              priceInRange(getDisplayPrice(p), range.key) &&
              productMatches(p, filters, "priceRanges")
          ).length;
          return (
            <FilterCheckbox
              key={range.key}
              checked={filters.priceRanges.includes(range.key)}
              onChange={() =>
                setFilters((f) => ({ ...f, priceRanges: toggleInArray(f.priceRanges, range.key) }))
              }
              label={range.label}
              count={count}
            />
          );
        })}
      </FilterGroup>

      {options.sizes.length > 0 && (
        <FilterGroup title="Ring Size">
          {options.sizes.map((size) => {
            const label = String(size);
            const count = products.filter(
              (p) =>
                p.category === "Rings" &&
                p.sizeOptions.some((s) => s.label === label) &&
                productMatches(p, filters, "sizes")
            ).length;
            return (
              <FilterCheckbox
                key={label}
                checked={filters.sizes.includes(label)}
                onChange={() => setFilters((f) => ({ ...f, sizes: toggleInArray(f.sizes, label) }))}
                label={label}
                count={count}
              />
            );
          })}
        </FilterGroup>
      )}

      <FilterGroup title="Diamond">
        <FilterCheckbox
          checked={filters.diamondOnly}
          onChange={() => setFilters((f) => ({ ...f, diamondOnly: !f.diamondOnly }))}
          label="With Diamond"
          count={products.filter((p) => Boolean(p.diamond) && productMatches(p, filters, "diamondOnly")).length}
        />
      </FilterGroup>

      <FilterGroup title="Collections">
        <FilterCheckbox
          checked={filters.signatureOnly}
          onChange={() => setFilters((f) => ({ ...f, signatureOnly: !f.signatureOnly }))}
          label="Signature Collection"
          count={
            products.filter((p) => Boolean(p.isSignature) && productMatches(p, filters, "signatureOnly"))
              .length
          }
        />
      </FilterGroup>
    </div>
  );

  return (
    <main className="mx-auto max-w-7xl px-6 py-12 lg:px-10 lg:py-16">
      <div className="mb-8">
        <h1 className="font-display text-[26px] font-medium leading-[1.05] tracking-[-0.01em] text-ink sm:text-[36px]">
          {heading}
        </h1>
        <p className="mt-2 text-[14px] leading-[1.6] text-muted">{filtered.length} pieces</p>
      </div>

      <div className="mb-6 flex items-center justify-between gap-4 border-b border-line pb-5 lg:hidden">
        <button
          onClick={() => setMobileFiltersOpen(true)}
          className="flex items-center gap-2 border border-line px-4 py-2.5 text-[11px] font-medium uppercase leading-[1.2] tracking-[0.08em] text-ink"
        >
          Filters
          {activeFilterCount > 0 && (
            <span className="flex h-4 w-4 items-center justify-center rounded-full bg-antiquegold text-[10px] text-softwhite">
              {activeFilterCount}
            </span>
          )}
        </button>
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value as SortOption)}
          className="border border-line bg-ivory px-3 py-2 text-[11px] font-medium uppercase leading-[1.2] tracking-[0.08em] text-charcoal outline-none focus:border-ink"
        >
          <option value="featured">Featured</option>
          <option value="price-low">Price: Low to High</option>
          <option value="price-high">Price: High to Low</option>
        </select>
      </div>

      <div className="lg:grid lg:grid-cols-[240px_1fr] lg:gap-10">
        {/* Sidebar — desktop */}
        <aside className="hidden lg:block">{sidebar}</aside>

        {/* Sidebar — mobile drawer */}
        {mobileFiltersOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <div
              className="absolute inset-0 bg-ink/40"
              onClick={() => setMobileFiltersOpen(false)}
            />
            <div className="absolute inset-y-0 left-0 w-[85vw] max-w-sm overflow-y-auto bg-white p-6 shadow-xl">
              <div className="mb-6 flex items-center justify-between">
                <p className="text-[13px] font-semibold uppercase leading-[1.2] tracking-[0.1em] text-ink">
                  Filters
                </p>
                <button
                  onClick={() => setMobileFiltersOpen(false)}
                  aria-label="Close filters"
                  className="text-2xl leading-none text-charcoal"
                >
                  ×
                </button>
              </div>
              {sidebar}
              <button
                onClick={() => setMobileFiltersOpen(false)}
                className="mt-8 w-full bg-ink py-3.5 text-[11px] font-medium uppercase leading-[1.2] tracking-[0.08em] text-white"
              >
                Show {filtered.length} Results
              </button>
            </div>
          </div>
        )}

        {/* Results */}
        <div>
          <div className="mb-6 hidden items-center justify-end lg:flex">
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as SortOption)}
              className="border border-line bg-ivory px-3 py-2 text-[11px] font-medium uppercase leading-[1.2] tracking-[0.08em] text-charcoal outline-none focus:border-ink sm:text-[12px]"
            >
              <option value="featured">Featured</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
            </select>
          </div>

          {filtered.length === 0 ? (
            <p className="py-20 text-center text-[14px] leading-[1.6] text-muted">
              No pieces found. Try clearing a few filters.
            </p>
          ) : (
            <div className="grid grid-cols-2 gap-x-5 gap-y-10 sm:grid-cols-3">
              {filtered.map((product) => (
                <Link
                  href={`/product/${product.slug}`}
                  key={product.slug}
                  className="group relative block aspect-square overflow-hidden border border-warmstone bg-white p-2 transition-colors hover:border-antiquegold sm:p-3"
                >
                  <div className="relative h-[calc(100%-88px)] overflow-hidden sm:h-[calc(100%-104px)]">
                    <Image
                      src={product.images[0]}
                      alt={product.name}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                      sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
                    />
                  </div>
                  <div className="flex h-[88px] flex-col items-center justify-center overflow-hidden px-1 text-center sm:h-[104px]">
                    <p className="text-[10px] font-medium uppercase leading-[1.2] tracking-[0.14em] text-antiquegold sm:text-[11px]">
                      {product.category}
                    </p>
                    <p className="mt-1 line-clamp-2 w-full text-[13px] font-medium leading-[1.35] text-ink sm:text-[14px]">
                      {product.name}
                    </p>
                    <p className="mt-1 text-[13px] leading-[1.35] text-muted">
                      {product.currency}
                      {getDisplayPrice(product).toLocaleString("en-IN")}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

function FilterGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mt-6 border-t border-line pt-6 first:mt-6 first:border-t-0 first:pt-0">
      <p className="mb-3 font-display text-[16px] font-medium leading-[1.1] text-ink">{title}</p>
      <div className="space-y-3">{children}</div>
    </div>
  );
}

function FilterCheckbox({
  checked,
  onChange,
  label,
  count,
}: {
  checked: boolean;
  onChange: () => void;
  label: string;
  count: number;
}) {
  return (
    <label
      className={`flex cursor-pointer items-center gap-2.5 text-[14px] leading-[1.35] ${
        count === 0 && !checked ? "text-muted/50" : "text-charcoal"
      }`}
    >
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        disabled={count === 0 && !checked}
        className="h-4 w-4 shrink-0 cursor-pointer border-line accent-[#B48851]"
      />
      <span>
        {label} <span className="text-muted">({count})</span>
      </span>
    </label>
  );
}
