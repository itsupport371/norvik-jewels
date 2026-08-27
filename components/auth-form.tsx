"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type Mode = "login" | "signup";

const GOOGLE_ICON = (
  <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true">
    <path
      fill="#4285F4"
      d="M23.52 12.27c0-.85-.08-1.67-.22-2.45H12v4.64h6.47a5.53 5.53 0 0 1-2.4 3.63v3h3.87c2.27-2.09 3.58-5.17 3.58-8.82z"
    />
    <path
      fill="#34A853"
      d="M12 24c3.24 0 5.96-1.07 7.94-2.9l-3.87-3.02c-1.08.72-2.46 1.15-4.07 1.15-3.13 0-5.78-2.11-6.73-4.95H1.27v3.11A12 12 0 0 0 12 24z"
    />
    <path
      fill="#FBBC05"
      d="M5.27 14.28A7.2 7.2 0 0 1 4.89 12c0-.79.14-1.56.38-2.28V6.61H1.27A12 12 0 0 0 0 12c0 1.94.46 3.77 1.27 5.39l4-3.11z"
    />
    <path
      fill="#EA4335"
      d="M12 4.77c1.76 0 3.34.6 4.58 1.79l3.44-3.44C17.95 1.19 15.24 0 12 0A12 12 0 0 0 1.27 6.61l4 3.11C6.22 6.88 8.87 4.77 12 4.77z"
    />
  </svg>
);

const FACEBOOK_ICON = (
  <svg
    viewBox="0 0 24 24"
    className="h-4 w-4"
    fill="#1877F2"
    aria-hidden="true"
  >
    <path d="M24 12.07C24 5.4 18.6 0 12 0S0 5.4 0 12.07C0 18.1 4.39 23.09 10.13 24v-8.44H7.08v-3.49h3.05V9.41c0-3.02 1.79-4.69 4.53-4.69 1.31 0 2.68.24 2.68.24v2.97h-1.51c-1.49 0-1.96.93-1.96 1.89v2.25h3.33l-.53 3.49h-2.8V24C19.61 23.09 24 18.1 24 12.07z" />
  </svg>
);

export default function AuthForm({ mode }: { mode: Mode }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect") ?? "/";

  // Phone/OTP is built but hidden until Twilio (SMS provider) is configured.
  // Flip this to true to bring the Phone tab back — the rest of the logic
  // below is untouched and ready to go.
  const PHONE_AUTH_ENABLED = false;

  const [tab, setTab] = useState<"email" | "phone">("email");
  const [agreed, setAgreed] = useState(false);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  function requireAgreement() {
    if (!agreed) {
      setError("Accept the Terms and Privacy Policy to continue.");
      return false;
    }
    return true;
  }

  // ---------- Email + password ----------
  async function handleEmailSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setNotice(null);
    if (!requireAgreement()) return;

    if (mode === "signup" && !name.trim()) {
      setError("Enter your name.");
      return;
    }
    if (!email.trim() || password.length < (mode === "signup" ? 8 : 1)) {
      setError(
        mode === "signup"
          ? "Enter a valid email and a password of at least 8 characters."
          : "Enter your email and password.",
      );
      return;
    }

    setLoading(true);
    const supabase = createClient();

    if (mode === "signup") {
      const { error: signUpError } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: { full_name: name.trim() },
          emailRedirectTo: `${window.location.origin}/auth/callback?redirect=/account`,
        },
      });
      setLoading(false);
      if (signUpError) {
        setError(
          signUpError.message.includes("already registered")
            ? "An account already exists with this email."
            : signUpError.message,
        );
        return;
      }
      setNotice(`We sent a confirmation link to ${email.trim()}.`);
    } else {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });
      setLoading(false);
      if (signInError) {
        setError(
          signInError.message === "Invalid login credentials"
            ? "Incorrect email or password."
            : signInError.message,
        );
        return;
      }
      router.push(redirectTo);
      router.refresh();
    }
  }

  // ---------- Phone + OTP ----------
  async function handleSendOtp(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setNotice(null);
    if (!requireAgreement()) return;

    if (!/^\+?[0-9]{10,15}$/.test(phone.trim())) {
      setError(
        "Enter a valid phone number with country code, e.g. +91XXXXXXXXXX.",
      );
      return;
    }

    setLoading(true);
    const supabase = createClient();
    const { error: otpError } = await supabase.auth.signInWithOtp({
      phone: phone.trim(),
    });
    setLoading(false);

    if (otpError) {
      setError(otpError.message);
      return;
    }
    setOtpSent(true);
    setNotice(`Enter the code sent to ${phone.trim()}.`);
  }

  async function handleVerifyOtp(e: FormEvent) {
    e.preventDefault();
    setError(null);
    if (!otp.trim() || otp.trim().length < 4) {
      setError("Enter the code you received.");
      return;
    }

    setLoading(true);
    const supabase = createClient();
    const { error: verifyError } = await supabase.auth.verifyOtp({
      phone: phone.trim(),
      token: otp.trim(),
      type: "sms",
    });
    setLoading(false);

    if (verifyError) {
      setError(verifyError.message);
      return;
    }
    router.push(redirectTo);
    router.refresh();
  }

  // ---------- OAuth ----------
  async function handleOAuth(provider: "google" | "facebook") {
    setError(null);
    if (!requireAgreement()) return;

    const supabase = createClient();
    await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/auth/callback?redirect=${redirectTo}`,
      },
    });
  }

  const heading = mode === "login" ? "Sign in" : "Create an account";

  return (
    <div className="w-full max-w-sm">
      <h1 className="font-display text-3xl font-medium text-ink">{heading}</h1>
      <p className="mt-2 text-sm text-muted">
        {mode === "login" ? (
          <>
            New here?{" "}
            <Link
              href="/signup"
              className="text-ink underline underline-offset-4"
            >
              Create an account
            </Link>
          </>
        ) : (
          <>
            Already have one?{" "}
            <Link
              href="/login"
              className="text-ink underline underline-offset-4"
            >
              Sign in
            </Link>
          </>
        )}
      </p>

      {/* Email / Phone tabs — Phone hidden until Twilio is configured */}
      {PHONE_AUTH_ENABLED && (
        <div className="mt-8 flex border border-line">
          <button
            type="button"
            onClick={() => {
              setTab("email");
              setError(null);
              setNotice(null);
            }}
            className={`flex-1 py-2.5 text-xs font-medium uppercase tracking-wide2 transition-colors ${
              tab === "email" ? "bg-ink text-white" : "bg-ivory text-muted"
            }`}
          >
            Email
          </button>
          <button
            type="button"
            onClick={() => {
              setTab("phone");
              setError(null);
              setNotice(null);
            }}
            className={`flex-1 py-2.5 text-xs font-medium uppercase tracking-wide2 transition-colors ${
              tab === "phone" ? "bg-ink text-white" : "bg-ivory text-muted"
            }`}
          >
            Phone
          </button>
        </div>
      )}

      {!PHONE_AUTH_ENABLED || tab === "email" ? (
        <form
          onSubmit={handleEmailSubmit}
          className={`space-y-5 ${PHONE_AUTH_ENABLED ? "mt-6" : "mt-8"}`}
        >
          {mode === "signup" && (
            <div>
              <label
                htmlFor="name"
                className="mb-1.5 block text-xs font-medium uppercase tracking-wide2 text-muted"
              >
                Full name
              </label>
              <input
                id="name"
                type="text"
                autoComplete="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Aditi Sharma"
                className="w-full border border-line bg-ivory px-4 py-3 text-base text-ink outline-none sm:text-sm transition-colors focus:border-ink"
              />
            </div>
          )}

          <div>
            <label
              htmlFor="email"
              className="mb-1.5 block text-xs font-medium uppercase tracking-wide2 text-muted"
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

          <div>
            <div className="mb-1.5 flex items-center justify-between">
              <label
                htmlFor="password"
                className="block text-xs font-medium uppercase tracking-wide2 text-muted"
              >
                Password
              </label>
              {mode === "login" && (
                <Link
                  href="/reset-password"
                  className="text-xs text-muted underline underline-offset-4 hover:text-ink"
                >
                  Forgot?
                </Link>
              )}
            </div>
            <input
              id="password"
              type="password"
              autoComplete={
                mode === "signup" ? "new-password" : "current-password"
              }
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={
                mode === "signup" ? "At least 8 characters" : "••••••••"
              }
              className="w-full border border-line bg-ivory px-4 py-3 text-base text-ink outline-none sm:text-sm transition-colors focus:border-ink"
            />
          </div>

          <TermsCheckbox agreed={agreed} setAgreed={setAgreed} />

          {error && (
            <p className="text-sm text-red-700" role="alert">
              {error}
            </p>
          )}
          {notice && <p className="text-sm text-charcoal">{notice}</p>}

          <button
            type="submit"
            disabled={loading || !agreed}
            className="w-full bg-ink py-3.5 text-sm font-medium tracking-wide2 text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-30"
          >
            {loading
              ? "Please wait…"
              : mode === "login"
                ? "Sign in"
                : "Create account"}
          </button>
        </form>
      ) : (
        <div className="mt-6 space-y-5">
          {!otpSent ? (
            <form onSubmit={handleSendOtp} className="space-y-5">
              <div>
                <label
                  htmlFor="phone"
                  className="mb-1.5 block text-xs font-medium uppercase tracking-wide2 text-muted"
                >
                  Phone number
                </label>
                <input
                  id="phone"
                  type="tel"
                  autoComplete="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 98765 43210"
                  className="w-full border border-line bg-ivory px-4 py-3 text-base text-ink outline-none sm:text-sm transition-colors focus:border-ink"
                />
              </div>

              <TermsCheckbox agreed={agreed} setAgreed={setAgreed} />

              {error && (
                <p className="text-sm text-red-700" role="alert">
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={loading || !agreed}
                className="w-full bg-ink py-3.5 text-sm font-medium tracking-wide2 text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-30"
              >
                {loading ? "Sending…" : "Send OTP"}
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp} className="space-y-5">
              <div>
                <label
                  htmlFor="otp"
                  className="mb-1.5 block text-xs font-medium uppercase tracking-wide2 text-muted"
                >
                  Enter OTP
                </label>
                <input
                  id="otp"
                  type="text"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  placeholder="6-digit code"
                  className="w-full border border-line bg-ivory px-4 py-3 text-center text-lg tracking-[0.3em] text-ink outline-none transition-colors focus:border-ink"
                />
              </div>

              {notice && <p className="text-sm text-charcoal">{notice}</p>}
              {error && (
                <p className="text-sm text-red-700" role="alert">
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-ink py-3.5 text-sm font-medium tracking-wide2 text-white transition-opacity hover:opacity-90 disabled:opacity-50"
              >
                {loading ? "Verifying…" : "Verify and continue"}
              </button>

              <button
                type="button"
                onClick={() => {
                  setOtpSent(false);
                  setOtp("");
                  setNotice(null);
                }}
                className="w-full text-xs text-muted underline underline-offset-4"
              >
                Use a different number
              </button>
            </form>
          )}
        </div>
      )}

      <div className="my-6 flex items-center gap-3">
        <span className="h-px flex-1 bg-line" />
        <span className="text-xs uppercase tracking-wide2 text-muted">
          Or continue with
        </span>
        <span className="h-px flex-1 bg-line" />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={() => handleOAuth("google")}
          disabled={!agreed}
          className="flex items-center justify-center gap-2 border border-line py-3 text-sm font-medium text-ink transition-colors hover:border-ink disabled:cursor-not-allowed disabled:opacity-30"
        >
          {GOOGLE_ICON}
          Google
        </button>
        <button
          type="button"
          onClick={() => handleOAuth("facebook")}
          disabled={!agreed}
          className="flex items-center justify-center gap-2 border border-line py-3 text-sm font-medium text-ink transition-colors hover:border-ink disabled:cursor-not-allowed disabled:opacity-30"
        >
          {FACEBOOK_ICON}
          Facebook
        </button>
      </div>
    </div>
  );
}

function TermsCheckbox({
  agreed,
  setAgreed,
}: {
  agreed: boolean;
  setAgreed: (v: boolean) => void;
}) {
  return (
    <label className="flex cursor-pointer items-start gap-2.5 text-xs text-muted">
      <input
        type="checkbox"
        checked={agreed}
        onChange={(e) => setAgreed(e.target.checked)}
        className="mt-0.5 h-4 w-4 shrink-0 cursor-pointer border-line accent-black"
      />
      <span>
        I agree to NORVIK JEWELS&apos;{" "}
        <Link
          href="/policies/terms"
          className="text-ink underline underline-offset-4"
        >
          Terms
        </Link>{" "}
        and{" "}
        <Link
          href="/policies/privacy"
          className="text-ink underline underline-offset-4"
        >
          Privacy Policy
        </Link>
        .
      </span>
    </label>
  );
}
