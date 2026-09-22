import { createClient } from '@/lib/supabase/server';
import { getAllProductsServer } from '@/lib/products-server';
import HeaderChrome from '@/components/header-chrome';

export default async function SiteHeader({ transparentOnHero = false }: { transparentOnHero?: boolean }) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const accountHref = user ? '/account' : '/login';
  // Phase 5: the Shop dropdown's category list and the header search
  // suggestions both need the real, admin-managed catalogue too, not just
  // the static showcase list — fetched here (this is already a Server
  // Component) and passed down as a prop.
  const products = await getAllProductsServer();

  return (
    <HeaderChrome
      accountHref={accountHref}
      isLoggedIn={!!user}
      transparentOnHero={transparentOnHero}
      products={products}
    />
  );
}
