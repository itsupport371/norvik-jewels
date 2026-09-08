import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import SiteHeader from '@/components/site-header';
import SiteFooter from '@/components/site-footer';
import AccountDashboard from '@/components/account-dashboard';

export default async function AccountPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login?redirect=/account');
  }

  return (
    <>
      <SiteHeader />
      <main className="min-h-screen bg-ivory px-6 py-12 lg:px-10 lg:py-16">
        <div className="mx-auto max-w-5xl">
          <h1 className="font-display text-[26px] font-medium leading-[1.05] tracking-[-0.01em] text-ink sm:text-[36px]">
            Your Account
          </h1>
          <p className="mt-2 text-[14px] leading-[1.6] text-muted">Signed in as {user.email}</p>

          <div className="mt-8">
            <AccountDashboard email={user.email ?? ''} />
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
