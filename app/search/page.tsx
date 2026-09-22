import { Suspense } from 'react';
import SiteHeader from '@/components/site-header';
import SiteFooter from '@/components/site-footer';
import SearchContent from '@/components/search-content';
import { getAllProductsServer } from '@/lib/products-server';

export const dynamic = 'force-dynamic';

export default async function SearchPage() {
  const products = await getAllProductsServer();
  return (
    <>
      <SiteHeader />
      <Suspense fallback={null}>
        <SearchContent products={products} />
      </Suspense>
      <SiteFooter />
    </>
  );
}
