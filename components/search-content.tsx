"use client";

import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { products, getDisplayPrice } from "@/lib/mock-products";

export default function SearchContent() {
  const searchParams = useSearchParams();
  const q = searchParams.get("q") ?? "";

  const results = q.trim()
    ? products.filter(
        (p) =>
          p.name.toLowerCase().includes(q.toLowerCase()) ||
          p.category.toLowerCase().includes(q.toLowerCase()) ||
          p.description.toLowerCase().includes(q.toLowerCase()),
      )
    : [];

  return (
    <main className="mx-auto max-w-7xl px-6 py-12 lg:px-10 lg:py-16">
      <h1 className="font-display text-3xl font-medium text-ink sm:text-4xl">
        Search results
      </h1>
      <p className="mt-2 text-sm text-muted">
        {q
          ? `${results.length} results for "${q}"`
          : "Type something to search"}
      </p>

      {q && results.length === 0 ? (
        <div className="py-20 text-center">
          <p className="text-sm text-muted">
            No pieces found matching &ldquo;{q}&rdquo;.
          </p>
          <Link
            href="/shop"
            className="mt-4 inline-block bg-ink px-6 py-3 text-xs font-medium uppercase tracking-wide2 text-white"
          >
            Browse All
          </Link>
        </div>
      ) : (
        <div className="mt-10 grid grid-cols-2 gap-x-5 gap-y-10 sm:grid-cols-3 lg:grid-cols-4">
          {results.map((product) => (
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
