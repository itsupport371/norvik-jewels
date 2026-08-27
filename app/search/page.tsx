import { Suspense } from 'react';
import SiteHeader from '@/components/site-header';
import SiteFooter from '@/components/site-footer';
import SearchContent from '@/components/search-content';

export default function SearchPage() {
  return (
    <>
      <SiteHeader />
      <Suspense fallback={null}>
        <SearchContent />
      </Suspense>
      <SiteFooter />
    </>
  );
}
