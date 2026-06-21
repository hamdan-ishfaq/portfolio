'use client';

import { useLocale } from '@/components/providers/LocaleProvider';

export function SkipLink() {
  const { t } = useLocale();
  return (
    <a
      href="#main-content"
      className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[200] focus:px-4 focus:py-2 focus:rounded-lg focus:bg-primary focus:text-on-primary focus:font-semibold focus:outline-none focus:ring-2 focus:ring-secondary"
    >
      {t('common.skipToContent')}
    </a>
  );
}
