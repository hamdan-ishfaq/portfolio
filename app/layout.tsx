import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import { IBM_Plex_Sans, IBM_Plex_Serif, Geist_Mono } from 'next/font/google';
import { Analytics } from '@vercel/analytics/react';
import { SiteBackdrop } from '@/components/public/SiteBackdrop';
import { ClientProviders } from '@/components/providers/ClientProviders';
import { SkipLink } from '@/components/ui/SkipLink';
import { LOCALE_COOKIE, parseLocale, parseTheme, THEME_COOKIE } from '@/lib/preferences';
import './globals.css';

const plexSans = IBM_Plex_Sans({
  variable: '--font-plex-sans',
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  display: 'swap',
});

const plexSerif = IBM_Plex_Serif({
  variable: '--font-plex-serif',
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  style: ['normal', 'italic'],
  display: 'swap',
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: {
    default: 'Muhammad Hamdan Ishfaq | SAP S/4HANA MM & Supply Chain',
    template: '%s | Muhammad Hamdan Ishfaq',
  },
  description:
    'SAP S/4HANA MM · Supply Chain Data Analyst · Ex-SAP Intern @ FFC & AI Intern @ Nexpred · BS Data Science NUST.',
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? 'https://localhost:3000'),
  openGraph: {
    type: 'website',
    locale: 'en_US',
    siteName: 'Muhammad Hamdan Ishfaq — SAP S/4HANA & Supply Chain',
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
        className={`${plexSans.variable} ${plexSerif.variable} ${geistMono.variable} ds-body mesh-bg min-h-screen flex flex-col selection:bg-primary/25 selection:text-on-surface`}
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
