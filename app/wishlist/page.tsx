import SiteHeader from '@/components/site-header';
import SiteFooter from '@/components/site-footer';
import WishlistContent from '@/components/wishlist-content';
import { getAllProductsServer } from '@/lib/products-server';

export const dynamic = 'force-dynamic';

export default async function WishlistPage() {
  const products = await getAllProductsServer();
  return (
    <>
      <SiteHeader />
      <WishlistContent products={products} />
      <SiteFooter />
    </>
  );
}
