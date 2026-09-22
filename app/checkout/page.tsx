import { Suspense } from 'react';
import SiteHeader from '@/components/site-header';
import SiteFooter from '@/components/site-footer';
import CheckoutContent from '@/components/checkout-content';
import { getAllProductsServer } from '@/lib/products-server';

export const dynamic = 'force-dynamic';

export default async function CheckoutPage() {
  const products = await getAllProductsServer();
  return (
    <>
      <SiteHeader />
      <Suspense fallback={null}>
        <CheckoutContent products={products} />
      </Suspense>
      <SiteFooter />
    </>
  );
}
