import { Suspense } from 'react';
import SiteHeader from '@/components/site-header';
import SiteFooter from '@/components/site-footer';
import ShopContent from '@/components/shop-content';
import { getAllProductsServer } from '@/lib/products-server';

export const dynamic = 'force-dynamic';

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
