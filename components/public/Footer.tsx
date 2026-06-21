'use client';

import type { GlobalSettings } from '@/types';
import { useLocale } from '@/components/providers/LocaleProvider';

type FooterProps = {
  settings: GlobalSettings | null;
};

export function Footer({ settings }: FooterProps) {
  const { t } = useLocale();
  const year = new Date().getFullYear();
  const brandName = settings?.display_name?.trim() || 'Hamdan Ishfaq';

  return (
    <footer className="border-t border-white/8 mt-16 sm:mt-24 py-10 sm:py-12">
      <div className="page-container flex flex-col gap-6 md:flex-row md:justify-between md:items-end">
        <div>
          <p className="font-mono text-xs text-on-surface-variant uppercase tracking-widest mb-2">
            {brandName}
          </p>
          <p className="font-body-sm text-body-sm text-on-surface-variant">
            © {year}. {t('footer.builtWith')}
          </p>
        </div>

        <div className="flex items-center flex-wrap gap-5 sm:gap-6">
          {settings?.github && (
            <a
              className="font-body-sm text-body-sm text-on-surface-variant hover:text-primary transition-colors min-h-11 inline-flex items-center"
              href={settings.github}
              target="_blank"
              rel="noopener noreferrer"
            >
              {t('common.github')}
            </a>
          )}
          {settings?.linkedin && (
            <a
              className="font-body-sm text-body-sm text-on-surface-variant hover:text-primary transition-colors min-h-11 inline-flex items-center"
              href={settings.linkedin}
              target="_blank"
              rel="noopener noreferrer"
            >
              {t('common.linkedin')}
            </a>
          )}
          {settings?.email && (
            <a
              className="font-body-sm text-body-sm text-on-surface-variant hover:text-primary transition-colors min-h-11 inline-flex items-center"
              href={`mailto:${settings.email}`}
            >
              {t('common.email')}
            </a>
          )}
        </div>
      </div>
    </footer>
  );
}
