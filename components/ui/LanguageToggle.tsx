'use client';

import { useLocale } from '@/components/providers/LocaleProvider';
import type { Locale } from '@/lib/i18n';

export function LanguageToggle({ className = '' }: { className?: string }) {
  const { locale, setLocale, t } = useLocale();

  const options: { id: Locale; label: string }[] = [
    { id: 'en', label: 'EN' },
    { id: 'de', label: 'DE' },
  ];

  return (
    <div
      className={`inline-flex items-center rounded-lg border border-white/10 p-0.5 bg-black/10 ${className}`}
      role="group"
      aria-label={t('common.language')}
    >
      {options.map((opt) => (
        <button
          key={opt.id}
          type="button"
          onClick={() => setLocale(opt.id)}
          aria-pressed={locale === opt.id}
          aria-label={`${opt.id === 'en' ? t('common.switchToEn') : t('common.switchToDe')} (${opt.label})`}
          className={`min-h-9 min-w-9 px-2.5 rounded-md text-xs font-semibold tracking-wide transition-colors ${
            locale === opt.id
              ? 'bg-primary/20 text-primary border border-primary/30'
              : 'text-on-surface-variant hover:text-on-surface'
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
