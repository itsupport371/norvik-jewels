'use client';

import { useEffect, useState } from 'react';

const STORAGE_KEY = 'norvik-cookie-choice';

// Cookie consent banner — content brief ("Ecommerce_Mann_2"), Site
// Microcopy section, row 129 ("Cookie choice"). Added 2 Nov 2026 content
// recheck — no cookie banner existed anywhere before this, even though the
// footer's Legal column (components/site-footer.tsx) now links to "Cookie
// Preferences" (brief row 135). Mounted once in app/layout.tsx, next to
// ChatWidget. Choice is stored in this browser only (localStorage) — there
// is no server-side consent table, same as every other "remembered on this
// device" preference in the project. The footer's Cookie Preferences link
// (components/cookie-preferences-link.tsx) reopens this via a plain
// window event rather than React context, since the footer that renders it
// is a Server Component and can't hold client state itself.
export default function CookieConsent() {
  const [visible, setVisible] = useState(false);
  const [managing, setManaging] = useState(false);
  const [optedIn, setOptedIn] = useState(true);

  useEffect(() => {
    let stored: string | null = null;
    try {
      stored = window.localStorage.getItem(STORAGE_KEY);
    } catch {
      // Private browsing / blocked storage — just show the banner again.
    }
    if (!stored) {
      setVisible(true);
    } else {
      setOptedIn(stored === 'accepted');
    }

    function openPreferences() {
      setManaging(true);
      setVisible(true);
    }
    window.addEventListener('open-cookie-preferences', openPreferences);
    return () => window.removeEventListener('open-cookie-preferences', openPreferences);
  }, []);

  function choose(choice: 'accepted' | 'rejected') {
    try {
      window.localStorage.setItem(STORAGE_KEY, choice);
    } catch {
      // Best-effort — nothing to fall back to if storage is blocked.
    }
    setOptedIn(choice === 'accepted');
    setVisible(false);
    setManaging(false);
  }

  if (!visible) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 border-t border-line bg-ink px-6 py-5 text-white sm:px-10">
      <div className="mx-auto flex max-w-5xl flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="max-w-xl">
          <p className="text-[13px] leading-[1.6] text-white/80">
            Choose how this website uses optional cookies. You can review the
            purposes and change your preferences.
          </p>
          {managing && (
            <label className="mt-3 flex items-center gap-2 text-[13px] text-white/70">
              <input
                type="checkbox"
                checked={optedIn}
                onChange={(e) => setOptedIn(e.target.checked)}
              />
              Allow optional cookies
            </label>
          )}
        </div>
        <div className="flex flex-shrink-0 flex-wrap gap-3">
          {managing ? (
            <button
              type="button"
              onClick={() => choose(optedIn ? 'accepted' : 'rejected')}
              className="border border-antiquegold px-6 py-2.5 text-[11px] font-medium uppercase leading-[1.2] tracking-[0.08em] text-white hover:bg-antiquegold"
            >
              Save Preferences
            </button>
          ) : (
            <>
              <button
                type="button"
                onClick={() => choose('rejected')}
                className="px-2 py-2.5 text-[11px] font-medium uppercase leading-[1.2] tracking-[0.08em] text-white/70 underline underline-offset-4 hover:text-white"
              >
                Reject Optional Cookies
              </button>
              <button
                type="button"
                onClick={() => setManaging(true)}
                className="px-2 py-2.5 text-[11px] font-medium uppercase leading-[1.2] tracking-[0.08em] text-white/70 underline underline-offset-4 hover:text-white"
              >
                Manage Preferences
              </button>
              <button
                type="button"
                onClick={() => choose('accepted')}
                className="bg-antiquegold px-6 py-2.5 text-[11px] font-medium uppercase leading-[1.2] tracking-[0.08em] text-white hover:opacity-90"
              >
                Accept Optional Cookies
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
