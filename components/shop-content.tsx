"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { products, getDisplayPrice } from "@/lib/mock-products";

type SortOption = "featured" | "price-low" | "price-high";

const CATEGORIES = [
  "All",
  "Rings",
  "Earrings",
  "Necklaces",
  "Nose Pin",
] as const;

export default function ShopContent() {
  const searchParams = useSearchParams();
  const initialCategory = searchParams.get("category");
  const normalizedInitial =
    CATEGORIES.find(
      (c) => c.toLowerCase() === initialCategory?.toLowerCase(),
    ) ?? "All";

  const [category, setCategory] =
    useState<(typeof CATEGORIES)[number]>(normalizedInitial);
  const [sort, setSort] = useState<SortOption>("featured");

  const filtered = useMemo(() => {
    let list = products;
    if (category !== "All") {
      list = list.filter((p) => p.category === category);
    }
    if (sort === "price-low") {
      list = [...list].sort((a, b) => getDisplayPrice(a) - getDisplayPrice(b));
    } else if (sort === "price-high") {
      list = [...list].sort((a, b) => getDisplayPrice(b) - getDisplayPrice(a));
    }
    return list;
  }, [category, sort]);

  return (
    <main className="mx-auto max-w-7xl px-6 py-12 lg:px-10 lg:py-16">
      <div className="mb-8">
        <h1 className="font-display text-3xl font-medium text-ink sm:text-4xl">
          Shop All
        </h1>
        <p className="mt-2 text-sm text-muted">{filtered.length} pieces</p>
      </div>

      <div className="mb-10 flex flex-wrap items-center justify-between gap-4 border-b border-line pb-5">
        <div className="flex gap-2">
          {CATEGORIES.map((c) => (
            <button
              key={c}
              onClick={() => setCategory(c)}
              className={`border px-4 py-2 text-xs font-medium uppercase tracking-wide2 transition-colors ${
                category === c
                  ? "border-ink bg-ink text-white"
                  : "border-line text-charcoal hover:border-ink"
              }`}
            >
              {c}
            </button>
          ))}
        </div>

        <select
          value={sort}
          onChange={(e) => setSort(e.target.value as SortOption)}
          className="border border-line bg-ivory px-3 py-2 text-xs font-medium uppercase tracking-wide2 text-charcoal outline-none focus:border-ink"
        >
          <option value="featured">Featured</option>
          <option value="price-low">Price: Low to High</option>
          <option value="price-high">Price: High to Low</option>
        </select>
      </div>

      {filtered.length === 0 ? (
        <p className="py-20 text-center text-sm text-muted">
          No pieces found in this category yet.
        </p>
      ) : (
        <div className="grid grid-cols-2 gap-x-5 gap-y-10 sm:grid-cols-3 lg:grid-cols-4">
          {filtered.map((product) => (
            <Link
              href={`/product/${product.slug}`}
              key={product.slug}
              className="group block"
            >
              <div className="relative aspect-square overflow-hidden bg-[#F7F5F2]">
                <Image
                  src={product.images[0]}
                  alt={product.name}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                  sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
                />
              </div>
              <p className="mt-3 text-xs uppercase tracking-wide2 text-muted">
                {product.category}
              </p>
              <p className="mt-1 text-sm font-medium text-ink">
                {product.name}
              </p>
              <p className="mt-1 text-xs text-muted">
                {product.currency}
                {getDisplayPrice(product).toLocaleString("en-IN")}
              </p>
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}
