'use client';

import { useEffect, useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export default function ResetPasswordConfirmPage() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // The recovery link (via /auth/callback) sets a session cookie before
    // landing here. Confirm a session actually exists before showing the form.
    const supabase = createClient();
    supabase.auth.getSession().then(({ data }) => {
      setReady(Boolean(data.session));
      if (!data.session) {
        setError(
          'This reset link is invalid or has expired. Request a new one from the sign-in page.'
        );
      }
    });
  }, []);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    if (password !== confirm) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    const supabase = createClient();
    const { error: updateError } = await supabase.auth.updateUser({
      password,
    });
    setLoading(false);

    if (updateError) {
      setError(updateError.message);
      return;
    }

    router.push('/account');
    router.refresh();
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-ivory px-6 py-16">
      <div className="w-full max-w-sm">
        <h1 className="font-display text-[26px] font-medium leading-[1.05] tracking-[-0.01em] text-ink sm:text-[36px]">
          Set a new password
        </h1>

        {error && !ready ? (
          <p className="mt-6 text-[14px] leading-[1.6] text-red-700">{error}</p>
        ) : (
          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            <div>
              <label
                htmlFor="password"
                className="mb-1.5 block text-[10px] font-medium uppercase leading-[1.2] tracking-[0.14em] text-antiquegold sm:text-[11px]"
              >
                New password
              </label>
              <input
                id="password"
                type="password"
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 8 characters"
                className="w-full border border-line bg-ivory px-4 py-3 text-base text-ink outline-none sm:text-sm transition-colors focus:border-ink"
              />
            </div>

            <div>
              <label
                htmlFor="confirm"
                className="mb-1.5 block text-[10px] font-medium uppercase leading-[1.2] tracking-[0.14em] text-antiquegold sm:text-[11px]"
              >
                Confirm password
              </label>
              <input
                id="confirm"
                type="password"
                autoComplete="new-password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                placeholder="Re-enter password"
                className="w-full border border-line bg-ivory px-4 py-3 text-base text-ink outline-none sm:text-sm transition-colors focus:border-ink"
              />
            </div>

            {error && (
              <p className="text-[14px] leading-[1.6] text-red-700" role="alert">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading || !ready}
              className="w-full bg-ink py-3.5 text-[11px] font-medium uppercase leading-[1.2] tracking-[0.08em] text-white transition-opacity hover:opacity-90 disabled:opacity-50 sm:text-[12px]"
            >
              {loading ? 'Updating…' : 'Update password'}
            </button>
          </form>
        )}
      </div>
    </main>
  );
}
