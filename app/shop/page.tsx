import { Suspense } from 'react';
import SiteHeader from '@/components/site-header';
import SiteFooter from '@/components/site-footer';
import ShopContent from '@/components/shop-content';

export default function ShopPage() {
  return (
    <>
      <SiteHeader />
      <Suspense fallback={null}>
        <ShopContent />
      </Suspense>
      <SiteFooter />
    </>
  );
}
