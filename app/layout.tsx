import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import localFont from 'next/font/local';
import { Analytics } from '@vercel/analytics/react';
import { SiteBackdrop } from '@/components/public/SiteBackdrop';
import { ClientProviders } from '@/components/providers/ClientProviders';
import { SkipLink } from '@/components/ui/SkipLink';
import { LOCALE_COOKIE, parseLocale, parseTheme, THEME_COOKIE } from '@/lib/preferences';
import './globals.css';

/**
 * Financial Trust pairing (ui-ux-pro-max) — same family for UI + display, mono for audit data.
 * Bundled locally (OFL-licensed IBM Plex) so builds never depend on Google Fonts serving
 * flaky extensionless woff2 URLs (vercel/next.js#99114).
 */
const plexSans = localFont({
  variable: '--font-plex-sans',
  src: [
    { path: './fonts/ibm-plex-sans-latin-400-normal.woff2', weight: '400', style: 'normal' },
    { path: './fonts/ibm-plex-sans-latin-400-italic.woff2', weight: '400', style: 'italic' },
    { path: './fonts/ibm-plex-sans-latin-500-normal.woff2', weight: '500', style: 'normal' },
    { path: './fonts/ibm-plex-sans-latin-500-italic.woff2', weight: '500', style: 'italic' },
    { path: './fonts/ibm-plex-sans-latin-600-normal.woff2', weight: '600', style: 'normal' },
    { path: './fonts/ibm-plex-sans-latin-600-italic.woff2', weight: '600', style: 'italic' },
    { path: './fonts/ibm-plex-sans-latin-700-normal.woff2', weight: '700', style: 'normal' },
    { path: './fonts/ibm-plex-sans-latin-700-italic.woff2', weight: '700', style: 'italic' },
  ],
  display: 'swap',
});

const plexMono = localFont({
  variable: '--font-plex-mono',
  src: [
    { path: './fonts/ibm-plex-mono-latin-400-normal.woff2', weight: '400', style: 'normal' },
    { path: './fonts/ibm-plex-mono-latin-500-normal.woff2', weight: '500', style: 'normal' },
    { path: './fonts/ibm-plex-mono-latin-600-normal.woff2', weight: '600', style: 'normal' },
  ],
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: 'Muhammad Hamdan Ishfaq | SAP S/4HANA MM · SD · BTP',
    template: '%s | Muhammad Hamdan Ishfaq',
  },
  description:
    'SAP techno-functional consultant — S/4HANA Materials Management, Sales & Distribution, and BTP. Ex-SAP Intern @ FFC · BS Data Science NUST.',
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? 'https://localhost:3000'),
  openGraph: {
    type: 'website',
    locale: 'en_US',
    siteName: 'Muhammad Hamdan Ishfaq — SAP S/4HANA MM · SD · BTP',
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
        className={`${plexSans.variable} ${plexMono.variable} ds-body mesh-bg min-h-screen flex flex-col selection:bg-primary/25 selection:text-on-surface`}
        style={{
          fontFamily:
            'var(--font-plex-sans), "IBM Plex Sans", ui-sans-serif, system-ui, sans-serif',
        }}
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
