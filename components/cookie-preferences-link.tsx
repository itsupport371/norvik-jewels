'use client';

// Small client island so the (Server Component) site-footer can still
// reopen the cookie banner — see components/cookie-consent.tsx for why
// this goes through a window event instead of shared React state.
export default function CookiePreferencesLink({ className }: { className?: string }) {
  return (
    <button
      type="button"
      onClick={() => window.dispatchEvent(new Event('open-cookie-preferences'))}
      className={className}
    >
      Cookie Preferences
    </button>
  );
}
