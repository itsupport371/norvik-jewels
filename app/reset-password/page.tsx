'use client';

import { useState, type FormEvent } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';

export default function ResetPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (!email.trim()) {
      setError('Enter the email on your account.');
      return;
    }

    setLoading(true);
    const supabase = createClient();
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(
      email.trim(),
      {
        redirectTo: `${window.location.origin}/auth/callback?redirect=/reset-password/confirm`,
      }
    );
    setLoading(false);

    // Always show the same success message, whether or not the email
    // exists — this avoids leaking which emails have accounts.
    if (resetError) {
      setError(resetError.message);
      return;
    }
    setSent(true);
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-ivory px-6 py-16">
      <div className="w-full max-w-sm">
        <h1 className="font-display text-[26px] font-medium leading-[1.05] tracking-[-0.01em] text-ink sm:text-[36px]">
          Reset your password
        </h1>
        <p className="mt-2 text-[14px] leading-[1.6] text-muted">
          <Link href="/login" className="text-ink underline underline-offset-4">
            Back to sign in
          </Link>
        </p>

        {sent ? (
          <div className="mt-8 border border-line bg-ivory px-5 py-4 text-[14px] leading-[1.6] text-charcoal">
            If an account exists for <span className="font-medium">{email}</span>,
            a reset link has been sent. Check your inbox.
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            <div>
              <label
                htmlFor="email"
                className="mb-1.5 block text-[10px] font-medium uppercase leading-[1.2] tracking-[0.14em] text-antiquegold sm:text-[11px]"
              >
                Email
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
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
              disabled={loading}
              className="w-full bg-ink py-3.5 text-[11px] font-medium uppercase leading-[1.2] tracking-[0.08em] text-white transition-opacity hover:opacity-90 disabled:opacity-50 sm:text-[12px]"
            >
              {loading ? 'Sending…' : 'Send reset link'}
            </button>
          </form>
        )}
      </div>
    </main>
  );
}
