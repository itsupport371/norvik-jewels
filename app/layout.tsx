import type { Metadata } from "next";
import { Fraunces, Inter } from "next/font/google";
// @ts-ignore CSS files are handled by Next.js and do not need TypeScript declarations.
import "./globals.css";
import ChatWidget from "@/components/chat-widget";
import { WishlistProvider } from "@/lib/wishlist-context";
import { CartProvider } from "@/lib/cart-context";

const display = Fraunces({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-display",
  display: "swap",
});

const sans = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "NORVIK JEWELS — Fine Jewellery",
  description:
    "Premium gold and diamond jewellery, crafted for everyday luxury.",
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/icon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/icon-16.png", sizes: "16x16", type: "image/png" },
    ],
    apple: "/apple-touch-icon.png",
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
        <WishlistProvider>
          <CartProvider>
            {children}
            <ChatWidget />
          </CartProvider>
        </WishlistProvider>
      </body>
    </html>
  );
}
