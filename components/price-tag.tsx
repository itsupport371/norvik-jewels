'use client';

import { useLocale } from '@/lib/locale-context';

/**
 * Tiny client-only wrapper so a price can be shown correctly (in the
 * visitor's chosen currency) from inside a server component — server
 * components can't call the useLocale() hook directly since currency
 * preference only exists in the browser (localStorage + React context).
 */
export default function PriceTag({ amountInInr }: { amountInInr: number }) {
  const { formatPrice } = useLocale();
  return <>{formatPrice(amountInInr)}</>;
}
