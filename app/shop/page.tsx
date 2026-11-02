import { Suspense } from 'react';
import SiteHeader from '@/components/site-header';
import SiteFooter from '@/components/site-footer';
import ShopContent from '@/components/shop-content';
import { getAllProductsServer } from '@/lib/products-server';

export const dynamic = 'force-dynamic';

// Per-category SEO titles — content brief ("Ecommerce_Mann_2"), Search
// Metadata section (rows 140-143). Categories are a query param here
// (/shop?category=...), not separate routes, so this maps the live
// category values (lib/mock-products.ts) onto the brief's closest matching
// row rather than inventing new ones — "Pendants"/"Pendant Set" both read
// as the brief's "Necklaces and Pendants" row. Anything else (Tanmaniya,
// Nose Pin, Baby Earrings, or no category) falls back to a generic title
// since the brief has no row for it.
const CATEGORY_METADATA: Record<string, { title: string; description: string }> = {
  rings: {
    title: '18K Gold Rings | Norvik Jewels',
    description:
      'Explore Norvik Jewels rings in 18K gold. Discover considered forms and view the materials, dimensions, and details of each piece.',
  },
  pendants: {
    title: '18K Gold Necklaces and Pendants | Norvik Jewels',
    description:
      'Explore 18K gold necklaces and pendants by Norvik Jewels. Find a personal expression through considered form and a quiet kind of light.',
  },
  'pendant set': {
    title: '18K Gold Necklaces and Pendants | Norvik Jewels',
    description:
      'Explore 18K gold necklaces and pendants by Norvik Jewels. Find a personal expression through considered form and a quiet kind of light.',
  },
  earrings: {
    title: '18K Gold Earrings | Norvik Jewels',
    description:
      'Discover Norvik Jewels earrings in 18K gold. Explore clear forms, considered proportions, and the details of your chosen pair.',
  },
  bracelet: {
    title: '18K Gold Bracelets and Bangles | Norvik Jewels',
    description:
      'Explore bracelets and bangles in 18K gold by Norvik Jewels. Find a form that moves naturally into your own expression.',
  },
};

export function generateMetadata({
  searchParams,
}: {
  searchParams: { category?: string };
}) {
  const category = searchParams?.category;
  const match = category ? CATEGORY_METADATA[category.toLowerCase()] : undefined;
  return (
    match ?? {
      title: 'Shop All Jewellery | Norvik Jewels',
      description:
        'Explore the full Norvik Jewels catalogue — 18K gold rings, earrings, pendants and bracelets, each with considered form and clear material details.',
    }
  );
}

export default async function ShopPage() {
  const products = await getAllProductsServer();
  return (
    <>
      <SiteHeader />
      <Suspense fallback={null}>
        <ShopContent products={products} />
      </Suspense>
      <SiteFooter />
    </>
  );
}
