/**
 * Currency support for Norvik Jewels.
 *
 * All prices in the catalogue/pricing engine (lib/pricing.ts) are computed
 * and stored in INR — that never changes. This file only controls how a
 * price is *displayed* to a visitor who has chosen a different currency: we
 * convert INR -> their currency with a fixed rate and format it.
 *
 * IMPORTANT — these are fixed manual rates (checked against live rates in
 * Sep 2026), not a live forex feed. Exchange rates move daily, so revisit
 * these numbers every so often (or wire up a live rates API — e.g.
 * exchangerate.host / Open Exchange Rates — and replace INR_PER_UNIT with a
 * fetched value) rather than assuming they stay accurate forever.
 */

export type CurrencyCode = 'INR' | 'USD' | 'EUR' | 'GBP' | 'AED';

export type CurrencyInfo = {
  code: CurrencyCode;
  label: string;
  symbol: string;
  /** How many INR one unit of this currency is worth (Sep 2026, approx). */
  inrPerUnit: number;
  /** Locale used for Intl.NumberFormat so grouping/symbol placement looks native. */
  locale: string;
};

export const CURRENCIES: CurrencyInfo[] = [
  { code: 'INR', label: 'Indian Rupee', symbol: '₹', inrPerUnit: 1, locale: 'en-IN' },
  { code: 'USD', label: 'US Dollar', symbol: '$', inrPerUnit: 94.5, locale: 'en-US' },
  { code: 'EUR', label: 'Euro', symbol: '€', inrPerUnit: 110, locale: 'de-DE' },
  { code: 'GBP', label: 'British Pound', symbol: '£', inrPerUnit: 128, locale: 'en-GB' },
  { code: 'AED', label: 'UAE Dirham', symbol: 'AED', inrPerUnit: 25.7, locale: 'ar-AE' },
];

export const DEFAULT_CURRENCY: CurrencyCode = 'INR';

export function getCurrencyInfo(code: CurrencyCode): CurrencyInfo {
  return CURRENCIES.find((c) => c.code === code) ?? CURRENCIES[0];
}

/**
 * Converts a price stored in INR to the target currency and formats it as a
 * string, e.g. formatCurrency(125000, 'USD') -> "$1,323".
 * Rounded to whole units (matches the existing site convention of showing
 * whole-rupee prices with no paise).
 */
export function formatCurrency(amountInInr: number, code: CurrencyCode): string {
  const info = getCurrencyInfo(code);
  const converted = amountInInr / info.inrPerUnit;
  try {
    return new Intl.NumberFormat(info.locale, {
      style: 'currency',
      currency: info.code,
      maximumFractionDigits: 0,
      minimumFractionDigits: 0,
    }).format(converted);
  } catch {
    // Fallback in case a browser doesn't recognize a locale/currency pair.
    return `${info.symbol}${Math.round(converted).toLocaleString('en-IN')}`;
  }
}

// ---- Auto-detect a sensible default currency from the visitor's browser ----
// No IP-geolocation call (extra network dependency, can be blocked/rate
// limited) — the browser's own language/region tag is already a reliable,
// zero-latency signal for this. Falls back to INR (the site's home market).

const REGION_TO_CURRENCY: Record<string, CurrencyCode> = {
  IN: 'INR',
  US: 'USD',
  GB: 'GBP',
  AE: 'AED',
  // Eurozone
  DE: 'EUR', FR: 'EUR', IT: 'EUR', ES: 'EUR', NL: 'EUR', BE: 'EUR', IE: 'EUR',
  PT: 'EUR', AT: 'EUR', FI: 'EUR', GR: 'EUR', LU: 'EUR', SK: 'EUR', SI: 'EUR',
  EE: 'EUR', LV: 'EUR', LT: 'EUR', CY: 'EUR', MT: 'EUR', HR: 'EUR',
};

export function detectCurrencyFromBrowser(): CurrencyCode {
  if (typeof navigator === 'undefined') return DEFAULT_CURRENCY;

  try {
    const tag = navigator.languages?.[0] || navigator.language;
    if (tag) {
      // @ts-ignore — Intl.Locale isn't in every TS lib target yet
      const region: string | undefined = new Intl.Locale(tag).maximize().region;
      if (region && REGION_TO_CURRENCY[region]) return REGION_TO_CURRENCY[region];
    }
  } catch {
    // Intl.Locale unsupported/failed — fall through to the timezone guess below.
  }

  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || '';
    if (tz.includes('Dubai') || tz.includes('Abu_Dhabi')) return 'AED';
    if (tz === 'Europe/London') return 'GBP';
    if (tz.startsWith('Europe/')) return 'EUR';
    if (tz.startsWith('America/')) return 'USD';
    if (tz.startsWith('Asia/Kolkata') || tz.startsWith('Asia/Calcutta')) return 'INR';
  } catch {
    // Ignore — default below covers this.
  }

  return DEFAULT_CURRENCY;
}
