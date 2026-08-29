import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import SignOutButton from './sign-out-button';

export default async function AccountPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login?redirect=/account');
  }

  return (
    <main className="min-h-screen bg-ivory px-6 py-16">
      <div className="mx-auto max-w-lg">
        <h1 className="font-display text-[26px] font-medium leading-[1.05] tracking-[-0.01em] text-ink sm:text-[36px]">
          Your account
        </h1>
        <p className="mt-2 text-[14px] leading-[1.6] text-muted">Signed in as {user.email}</p>

        <div className="mt-8 border border-line bg-paper p-6 text-[14px] leading-[1.6]">
          <p className="text-muted">
            Order history, saved addresses, and wishlist will live here once
            the commerce backend is connected.
          </p>
        </div>

        <div className="mt-6">
          <SignOutButton />
        </div>
      </div>
    </main>
  );
}
