import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import { Geist, Geist_Mono, Instrument_Serif } from 'next/font/google';
import { Analytics } from '@vercel/analytics/react';
import { SiteBackdrop } from '@/components/public/SiteBackdrop';
import { ClientProviders } from '@/components/providers/ClientProviders';
import { SkipLink } from '@/components/ui/SkipLink';
import { LOCALE_COOKIE, parseLocale, parseTheme, THEME_COOKIE } from '@/lib/preferences';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

const instrumentSerif = Instrument_Serif({
  variable: '--font-instrument-serif',
  subsets: ['latin'],
  weight: '400',
  style: ['normal', 'italic'],
});

export const metadata: Metadata = {
  title: {
    default: 'Hamdan Ishfaq | AI Engineer & ML Practitioner',
    template: '%s | Hamdan Ishfaq',
  },
  description:
    'AI Engineer building production-grade machine learning systems. Specializing in LLMs, Computer Vision, and high-performance inference.',
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? 'https://localhost:3000'),
  openGraph: {
    type: 'website',
    locale: 'en_US',
    siteName: 'Hamdan Ishfaq — AI Engineer',
  },
  twitter: {
    card: 'summary_large_image',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const locale = parseLocale(cookieStore.get(LOCALE_COOKIE)?.value);
  const theme = parseTheme(cookieStore.get(THEME_COOKIE)?.value);
  const isDark = theme === 'dark';

  return (
    <html
      lang={locale}
      className={isDark ? 'scroll-smooth dark' : 'scroll-smooth'}
      suppressHydrationWarning
      data-scroll-behavior="smooth"
    >
      <head>
        {/* eslint-disable-next-line @next/next/no-page-custom-font -- icon font loaded once in root layout */}
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
          rel="stylesheet"
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${instrumentSerif.variable} ds-body mesh-bg min-h-screen flex flex-col selection:bg-primary/25 selection:text-on-surface`}
        style={{ fontFamily: 'var(--font-geist-sans), ui-sans-serif, system-ui, sans-serif' }}
        suppressHydrationWarning
      >
        <ClientProviders initialLocale={locale}>
          <SiteBackdrop />
          <div className="site-content flex flex-col flex-1 min-h-screen">
            <SkipLink />
            {children}
          </div>
        </ClientProviders>
        <Analytics />
      </body>
    </html>
  );
}
