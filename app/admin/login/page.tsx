import Image from 'next/image';
import { Suspense } from 'react';
import AuthForm from '@/components/auth-form';

// Login screen for /admin — reuses the same diamond-halo-ring background as
// the customer /login and /signup pages (Sep 2026 request), so it still
// reads as Norvik rather than a bare internal tool. The actual admin check
// happens in lib/supabase/middleware.ts (ADMIN_EMAILS allow-list) — this
// page only presents the form.
export default function AdminLoginPage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-ink">
      <div className="absolute inset-0">
        <Image
          src="/images/auth-visual-desktop.jpg"
          alt="NORVIK JEWELS diamond halo ring"
          fill
          priority
          className="hidden object-cover object-[76%_46%] sm:block"
          sizes="100vw"
        />
        <Image
          src="/images/auth-visual-mobile.jpg"
          alt="NORVIK JEWELS diamond halo ring"
          fill
          priority
          className="object-cover object-[69%_55%] sm:hidden"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_65%_55%_at_50%_50%,rgba(5,8,18,0.85)_0%,rgba(5,8,18,0.6)_55%,rgba(5,8,18,0.2)_100%)]" />
      </div>

      <div className="relative z-10 flex min-h-screen items-center justify-center px-6 py-14">
        <div className="w-full max-w-[360px]">
          <p className="mb-6 text-center text-[11px] font-semibold uppercase tracking-[0.2em] text-antiquegold">
            Norvik Jewels — Admin
          </p>
          <Suspense fallback={null}>
            <AuthForm mode="login" />
          </Suspense>
        </div>
      </div>
    </main>
  );
}
