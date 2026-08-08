import type { Metadata, Viewport } from 'next';
import { Sora, Inter } from 'next/font/google';
import { NextIntlClientProvider } from 'next-intl';
import { getLocale, getMessages } from 'next-intl/server';

import IconSprite from '@/components/IconSprite';
import { DemoBadge } from '@/components/shared/DemoBadge';
import { QueryProvider } from '@/components/shared/Providers';
import './globals.css';

// ─── Fonts ────────────────────────────────────────────────────────────────────
const sora = Sora({
  subsets: ['latin'],
  variable: '--font-sora',
  display: 'swap',
  weight: ['400', '500', '600', '700'],
});

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
  weight: ['400', '500', '600'],
});

// ─── Metadata ─────────────────────────────────────────────────────────────────
export const metadata: Metadata = {
  title: {
    default: 'YaMo Deals',
    template: '%s | YaMo Deals',
  },
  description: 'Livraison de nourriture à Yaoundé — vos restaurants préférés, livrés chez vous.',
  icons: { icon: '/favicon.ico' },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: '#E63927',
};

// ─── Root Layout ──────────────────────────────────────────────────────────────
export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const locale = await getLocale();
  const messages = await getMessages();

  return (
    <html lang={locale} className={`${sora.variable} ${inter.variable}`}>
      <body>
        {/*
          IconSprite inlined once at root — solves Safari's cross-file <use> issue.
          All 16 YaMo icons are available as #id references anywhere in the tree.
        */}
        <IconSprite />

        {/* DÉMO watermark — remove at production */}
        <DemoBadge />

        {/* 430px mobile shell — centered on desktop, full-width on mobile */}
        <div className="relative mx-auto w-full max-w-[430px] min-h-dvh bg-yamo-cream sm:shadow-[0_0_0_1px_rgba(0,0,0,0.06),0_8px_48px_rgba(0,0,0,0.14)]">
          <NextIntlClientProvider messages={messages} locale={locale}>
            <QueryProvider>{children}</QueryProvider>
          </NextIntlClientProvider>
        </div>
      </body>
    </html>
  );
}
