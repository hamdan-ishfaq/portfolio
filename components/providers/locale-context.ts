'use client';

import { createContext } from 'react';
import type { Locale } from '@/lib/i18n';

export type LocaleContextValue = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string, vars?: Record<string, string | number>) => string;
};

export const LocaleContext = createContext<LocaleContextValue | null>(null);
