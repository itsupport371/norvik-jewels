import { Suspense } from 'react';
import AuthForm from '@/components/auth-form';

// Separate login screen for /admin — deliberately plain (no hero photo),
// so it reads as an internal tool rather than the customer-facing site.
// Reuses the same AuthForm/Supabase auth as the shopper login; the
// difference is enforced in lib/supabase/middleware.ts (ADMIN_EMAILS
// allow-list), not here — this page only presents the form.
export default function AdminLoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-ink px-6 py-14">
      <div className="w-full max-w-[360px]">
        <p className="mb-6 text-center text-[11px] font-semibold uppercase tracking-[0.2em] text-antiquegold">
          Norvik Jewels — Admin
        </p>
        <Suspense fallback={null}>
          <AuthForm mode="login" />
        </Suspense>
      </div>
    </main>
  );
}
