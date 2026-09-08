'use client';

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import {
  CURRENCIES,
  DEFAULT_CURRENCY,
  detectCurrencyFromBrowser,
  formatCurrency,
  type CurrencyCode,
} from '@/lib/currency';

// Curated shortlist for the switcher UI — Google Translate itself supports
// 100+ languages, so more can be added here later without touching the
// translation mechanism at all. Picked for Norvik's actual customer base:
// India (English/Hindi), Gulf/NRI (Arabic), and Europe/US export markets.
export type LanguageOption = { code: string; label: string };

export const LANGUAGES: LanguageOption[] = [
  { code: 'en', label: 'English' },
  { code: 'hi', label: 'हिन्दी' },
  { code: 'ar', label: 'العربية' },
  { code: 'fr', label: 'Français' },
  { code: 'es', label: 'Español' },
  { code: 'de', label: 'Deutsch' },
  { code: 'zh-CN', label: '中文' },
];

const DEFAULT_LANGUAGE = 'en';
const CURRENCY_STORAGE_KEY = 'norvik-currency';
const LANGUAGE_STORAGE_KEY = 'norvik-language';
const AUTO_DETECTED_KEY = 'norvik-locale-auto-detected';

type LocaleContextValue = {
  currency: CurrencyCode;
  setCurrency: (code: CurrencyCode) => void;
  language: string;
  setLanguage: (code: string) => void;
  formatPrice: (amountInInr: number) => string;
  currencies: typeof CURRENCIES;
  languages: LanguageOption[];
};

const LocaleContext = createContext<LocaleContextValue | null>(null);

// ---- Google Translate wiring -------------------------------------------
// We drive Google's own translation engine (loaded in app/layout.tsx) but
// hide its default banner/dropdown and present our own styled switcher
// instead. Google reads the target language off a `googtrans` cookie when
// the widget mounts, so switching language = set the cookie + reload once.

function applyGoogleTranslateCookie(code: string) {
  // Clearing the cookie (by setting it to the "no translation" value) is how
  // you get back to the original English text — there's no "off" API.
  const value = code === DEFAULT_LANGUAGE ? '/en/en' : `/en/${code}`;
  const hostname = typeof window !== 'undefined' ? window.location.hostname : '';
  const maxAge = 'max-age=31536000'; // 1 year — matches how long the localStorage choice sticks
  document.cookie = `googtrans=${value};path=/;${maxAge}`;
  if (hostname) {
    document.cookie = `googtrans=${value};path=/;domain=${hostname};${maxAge}`;
    document.cookie = `googtrans=${value};path=/;domain=.${hostname};${maxAge}`;
  }
}

export function LocaleProvider({ children }: { children: ReactNode }) {
  const [currency, setCurrencyState] = useState<CurrencyCode>(DEFAULT_CURRENCY);
  const [language, setLanguageState] = useState<string>(DEFAULT_LANGUAGE);

  // Load saved preference, or auto-detect once, on first mount (client only —
  // localStorage/navigator aren't available during server render).
  useEffect(() => {
    const savedCurrency = localStorage.getItem(CURRENCY_STORAGE_KEY) as CurrencyCode | null;
    const savedLanguage = localStorage.getItem(LANGUAGE_STORAGE_KEY);
    const alreadyAutoDetected = localStorage.getItem(AUTO_DETECTED_KEY) === '1';

    if (savedCurrency && CURRENCIES.some((c) => c.code === savedCurrency)) {
      setCurrencyState(savedCurrency);
    } else if (!alreadyAutoDetected) {
      setCurrencyState(detectCurrencyFromBrowser());
    }

    if (savedLanguage) {
      setLanguageState(savedLanguage);
    } else if (!alreadyAutoDetected) {
      // Language auto-detect only from the browser's own language list — we
      // don't reload/translate on a first visit just because of a guess, to
      // avoid a jarring flash for the vast majority of (English-browsing)
      // visitors. The visitor can always switch manually via the picker.
    }

    if (!alreadyAutoDetected) {
      localStorage.setItem(AUTO_DETECTED_KEY, '1');
    }
  }, []);

  function setCurrency(code: CurrencyCode) {
    setCurrencyState(code);
    localStorage.setItem(CURRENCY_STORAGE_KEY, code);
  }

  function setLanguage(code: string) {
    setLanguageState(code);
    localStorage.setItem(LANGUAGE_STORAGE_KEY, code);
    applyGoogleTranslateCookie(code);
    // Google Translate reads the cookie at widget-init time, so the cleanest
    // way to apply a change is a reload — trying to drive the hidden
    // <select> live is flakier (it isn't always mounted yet).
    window.location.reload();
  }

  const value = useMemo<LocaleContextValue>(
    () => ({
      currency,
      setCurrency,
      language,
      setLanguage,
      formatPrice: (amountInInr: number) => formatCurrency(amountInInr, currency),
      currencies: CURRENCIES,
      languages: LANGUAGES,
    }),
    [currency, language],
  );

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

export function useLocale(): LocaleContextValue {
  const ctx = useContext(LocaleContext);
  if (!ctx) {
    throw new Error('useLocale must be used within a LocaleProvider');
  }
  return ctx;
}
