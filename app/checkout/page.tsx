import { Suspense } from 'react';
import SiteHeader from '@/components/site-header';
import SiteFooter from '@/components/site-footer';
import CheckoutContent from '@/components/checkout-content';

export default function CheckoutPage() {
  return (
    <>
      <SiteHeader />
      <Suspense fallback={null}>
        <CheckoutContent />
      </Suspense>
      <SiteFooter />
    </>
  );
}
