'use client';

import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export default function SignOutButton() {
  const router = useRouter();

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  }

  return (
    <button
      onClick={handleSignOut}
      className="border border-line px-5 py-3 text-sm font-medium tracking-wide2 text-ink transition-colors hover:border-gold"
    >
      Sign out
    </button>
  );
}
