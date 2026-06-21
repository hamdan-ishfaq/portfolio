import { en, type Messages } from './messages/en';
import { de } from './messages/de';

export type Locale = 'en' | 'de';

const catalogs: Record<Locale, Messages> = { en, de };

export function getMessages(locale: Locale): Messages {
  return catalogs[locale] ?? en;
}

type Path = string;

function resolvePath(obj: unknown, path: Path): string | undefined {
  const value = path.split('.').reduce<unknown>((acc, key) => {
    if (acc && typeof acc === 'object' && key in acc) {
      return (acc as Record<string, unknown>)[key];
    }
    return undefined;
  }, obj);
  return typeof value === 'string' ? value : undefined;
}

export function translate(
  locale: Locale,
  key: Path,
  vars?: Record<string, string | number>
): string {
  const template = resolvePath(getMessages(locale), key) ?? key;
  if (!vars) return template;
  return template.replace(/\{(\w+)\}/g, (_, name: string) => String(vars[name] ?? `{${name}}`));
}

export const LOCALE_STORAGE_KEY = 'locale';

export function readStoredLocale(): Locale {
  if (typeof window === 'undefined') return 'en';
  try {
    const stored = localStorage.getItem(LOCALE_STORAGE_KEY);
    return stored === 'de' ? 'de' : 'en';
  } catch {
    return 'en';
  }
}
