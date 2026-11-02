import type { Metadata } from 'next';
import { Cormorant_Garamond, Manrope } from 'next/font/google';
import Script from 'next/script';
import './globals.css';
import ChatWidget from '@/components/chat-widget';
import CookieConsent from '@/components/cookie-consent';
import { WishlistProvider } from '@/lib/wishlist-context';
import { CartProvider } from '@/lib/cart-context';
import { LocaleProvider } from '@/lib/locale-context';

const display = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-display',
  display: 'swap',
});

const sans = Manrope({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-sans',
  display: 'swap',
});

// Title/description — content brief ("Ecommerce_Mann_2"), Search Metadata
// section, row 139 ("Home"). This is the sitewide default/fallback; pages
// with their own `metadata` export (contact, our-world, bespoke) or
// `generateMetadata` (shop) override it per the brief's per-page rows.
export const metadata: Metadata = {
  title: 'Norvik Jewels | Born Between Two Suns',
  description:
    'Discover 18K gold jewellery where Scandinavian restraint meets Dubai brilliance. Explore the Norvik collections and find a piece that feels personal.',
  icons: {
    icon: [
      { url: '/favicon.ico' },
      { url: '/icon-32.png', sizes: '32x32', type: 'image/png' },
      { url: '/icon-16.png', sizes: '16x16', type: 'image/png' },
    ],
    apple: '/apple-touch-icon.png',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${display.variable} ${sans.variable}`}>
      <body className="font-sans antialiased">
        {/* Language switcher — Google's own translation engine does the actual
            translating (100+ languages, zero manual copy work); the custom
            globe dropdown in the header drives it, so the default Google
            banner/toolbar is hidden and never shown to visitors.
            See lib/locale-context.tsx for how the switcher talks to this. */}
        <div id="google_translate_element" className="hidden" />
        <Script id="google-translate-init" strategy="afterInteractive">
          {`
            function googleTranslateElementInit() {
              new google.translate.TranslateElement(
                { pageLanguage: 'en', autoDisplay: false },
                'google_translate_element'
              );
            }
          `}
        </Script>
        <Script
          src="https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit"
          strategy="afterInteractive"
        />

        <LocaleProvider>
          <WishlistProvider>
            <CartProvider>
              {children}
              <ChatWidget />
              <CookieConsent />
            </CartProvider>
          </WishlistProvider>
        </LocaleProvider>
      </body>
    </html>
  );
}
