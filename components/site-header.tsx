import { createClient } from '@/lib/supabase/server';
import HeaderChrome from '@/components/header-chrome';

export default async function SiteHeader({ transparentOnHero = false }: { transparentOnHero?: boolean }) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const accountHref = user ? '/account' : '/login';

  return <HeaderChrome accountHref={accountHref} isLoggedIn={!!user} transparentOnHero={transparentOnHero} />;
}
