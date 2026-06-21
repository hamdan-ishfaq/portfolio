'use client';

import { useCallback, useContext, useMemo, useState } from 'react';
import { translate, type Locale } from '@/lib/i18n';
import { persistLocale } from '@/lib/preferences';
import { LocaleContext, type LocaleContextValue } from '@/components/providers/locale-context';

type LocaleProviderProps = {
  children: React.ReactNode;
  initialLocale: Locale;
};

export function LocaleProvider({ children, initialLocale }: LocaleProviderProps) {
  const [locale, setLocaleState] = useState<Locale>(initialLocale);

  const setLocale = useCallback((next: Locale) => {
    setLocaleState(next);
    persistLocale(next);
  }, []);

  const t = useCallback(
    (key: string, vars?: Record<string, string | number>) => translate(locale, key, vars),
    [locale]
  );

  const value = useMemo<LocaleContextValue>(
    () => ({ locale, setLocale, t }),
    [locale, setLocale, t]
  );

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

function getDocumentLocale(): Locale {
  if (typeof document === 'undefined') return 'en';
  return document.documentElement.lang === 'de' ? 'de' : 'en';
}

/** Safe when rendered outside LocaleProvider during Next.js client-rendering bailouts. */
export function useLocale(): LocaleContextValue {
  const ctx = useContext(LocaleContext);
  if (ctx) return ctx;

  const locale = getDocumentLocale();
  return {
    locale,
    setLocale: () => {},
    t: (key, vars) => translate(locale, key, vars),
  };
}
