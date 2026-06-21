import type { Locale } from '@/lib/i18n';

export const THEME_COOKIE = 'theme';
export const LOCALE_COOKIE = 'locale';

export type ThemePreference = 'dark' | 'light';

export function parseLocale(value: string | undefined | null): Locale {
  return value === 'de' ? 'de' : 'en';
}

export function parseTheme(value: string | undefined | null): ThemePreference {
  return value === 'light' ? 'light' : 'dark';
}

/** Client-only — persist locale for SSR + hydration. */
export function persistLocale(locale: Locale) {
  document.cookie = `${LOCALE_COOKIE}=${locale};path=/;max-age=31536000;SameSite=Lax`;
  try {
    localStorage.setItem('locale', locale);
  } catch {
    /* ignore */
  }
  document.documentElement.lang = locale;
}

/** Client-only — persist theme for SSR + hydration. */
export function persistTheme(theme: ThemePreference) {
  document.cookie = `${THEME_COOKIE}=${theme};path=/;max-age=31536000;SameSite=Lax`;
  try {
    localStorage.setItem('theme', theme);
  } catch {
    /* ignore */
  }
  document.documentElement.classList.toggle('dark', theme === 'dark');
}
