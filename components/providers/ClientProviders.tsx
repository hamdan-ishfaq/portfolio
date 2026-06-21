'use client';

import type { Locale } from '@/lib/i18n';
import { LocaleProvider } from '@/components/providers/LocaleProvider';
import { ToastProvider } from '@/components/ui/Toast';

type ClientProvidersProps = {
  children: React.ReactNode;
  initialLocale: Locale;
};

export function ClientProviders({ children, initialLocale }: ClientProvidersProps) {
  return (
    <LocaleProvider initialLocale={initialLocale}>
      <ToastProvider>{children}</ToastProvider>
    </LocaleProvider>
  );
}
