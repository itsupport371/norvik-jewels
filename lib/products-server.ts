// Norvik Jewels — Admin Panel, Phase 5
// Server-only helpers that read the real, admin-managed catalogue
// (Supabase `products`, Draft/Publish workflow) for the storefront. Only
// ever import this from a Server Component (it uses lib/supabase/server.ts,
// which reads cookies) — Client Components that need the product list get
// it passed down as a prop from their page.tsx instead (same pattern
// already used for NewArrivalsRow before this phase).
//
// 22 Sep 2026 — client asked to remove the old static/placeholder showcase
// products from the live storefront before the Vercel push, so the site
// shows the real catalogue only. This file now reads ONLY
// `status = 'published'` rows from the database — the static `products`
// array in lib/mock-products.ts is no longer merged in here. That file
// itself is untouched: its `Product` type and shared pricing constants
// (CLARITY_GRADES, calculatePrice, getDisplayPrice, etc.) are still used
// across the codebase (product-configurator.tsx, product-specifications.tsx,
// this file), so it stays in place — it just isn't shown to shoppers anymore.
import { createClient } from '@/lib/supabase/server';
import type { Product } from '@/lib/mock-products';

type ProductRow = {
  slug: string;
  name: string;
  category: string;
  images: string[] | null;
  metal_images: Record<string, string> | null;
  base_price: number | string | null;
  compare_at_price: number | string | null;
  currency: string | null;
  metal_options: Product['metalOptions'] | null;
  size_options: Product['sizeOptions'] | null;
  diamond: Product['diamond'] | null;
  description: string | null;
  gold_weight_grams: number | string | null;
  diamond_piece_count: number | null;
  diamond_carat_total: number | string | null;
  is_signature: boolean | null;
};

function mapDbRowToProduct(row: ProductRow): Product {
  return {
    slug: row.slug,
    name: row.name,
    category: row.category as Product['category'],
    images: row.images ?? [],
    metalImages: row.metal_images ?? undefined,
    basePrice: Number(row.base_price ?? 0),
    compareAtPrice: row.compare_at_price != null ? Number(row.compare_at_price) : undefined,
    currency: row.currency ?? '₹',
    metalOptions: row.metal_options ?? [],
    sizeOptions: row.size_options ?? [],
    diamond: row.diamond ?? undefined,
    description: row.description ?? '',
    goldWeightGrams: Number(row.gold_weight_grams ?? 0),
    diamondPieceCount: row.diamond_piece_count ?? undefined,
    diamondCaratTotal:
      row.diamond_carat_total != null ? Number(row.diamond_carat_total) : undefined,
    isSignature: Boolean(row.is_signature),
  };
}

const PRODUCT_COLUMNS =
  'slug, name, category, images, metal_images, base_price, compare_at_price, currency, metal_options, size_options, diamond, description, gold_weight_grams, diamond_piece_count, diamond_carat_total, is_signature';

async function fetchPublishedDbProducts(): Promise<Product[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('products')
    .select(PRODUCT_COLUMNS)
    .eq('status', 'published');
  if (error || !data) return [];
  return (data as ProductRow[]).map(mapDbRowToProduct);
}

/** Full catalogue for listing pages (Home/New Arrivals, Shop, Search, Wishlist, Header/Search suggestions, Checkout). */
export async function getAllProductsServer(): Promise<Product[]> {
  return fetchPublishedDbProducts();
}

/** Single product lookup for the product detail page — direct DB lookup by slug. */
export async function getProductBySlugServer(slug: string): Promise<Product | undefined> {
  const supabase = createClient();
  const { data } = await supabase
    .from('products')
    .select(PRODUCT_COLUMNS)
    .eq('slug', slug)
    .eq('status', 'published')
    .maybeSingle();
  return data ? mapDbRowToProduct(data as ProductRow) : undefined;
}

/** "You May Also Like" — same category, excluding the current product. */
export async function getRelatedServer(category: string, slug: string): Promise<Product[]> {
  const supabase = createClient();
  const { data } = await supabase
    .from('products')
    .select(PRODUCT_COLUMNS)
    .eq('category', category)
    .eq('status', 'published')
    .neq('slug', slug)
    .limit(4);
  return ((data as ProductRow[] | null) ?? []).map(mapDbRowToProduct);
}
