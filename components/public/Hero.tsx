'use client';

import type { GlobalSettings } from '@/types';
import { FadeIn } from '@/components/ui/FadeIn';
import { SupplyChainNetwork } from '@/components/public/SupplyChainNetwork';
import { useLocale } from '@/components/providers/LocaleProvider';

type HeroProps = {
  settings: GlobalSettings | null;
};

export function Hero({ settings }: HeroProps) {
  const { t } = useLocale();
  const displayName = settings?.display_name?.trim() || 'Hamdan Ishfaq';
  const cvUrl = settings?.cv_file_url?.trim();
  const contactEmail = settings?.email?.trim();

  return (
    <section
      className="page-container relative flex flex-col justify-center min-h-[calc(100vh-8rem)] py-6 sm:py-8"
      id="home"
    >
      <FadeIn immediate>
        <div className="flex items-center justify-between gap-4 border-b border-white/10 pb-5">
          <span className="type-label">{t('hero.metaRole')}</span>
          <span className="type-label inline-flex items-center gap-2">
            <span className="inline-flex h-1.5 w-1.5 rounded-full bg-secondary" />
            {t('hero.openTo')}
          </span>
        </div>
      </FadeIn>

      <div className="grid grid-cols-1 lg:grid-cols-[1.05fr_0.95fr] gap-10 lg:gap-14 items-center py-10 lg:py-14">
        <div className="space-y-6">
          <FadeIn immediate delay={0.05}>
            <p className="type-label text-primary">{displayName}</p>
            <h1 className="type-hero max-w-[20ch] mt-3">{t('hero.headline')}</h1>
          </FadeIn>

          <FadeIn immediate delay={0.1}>
            <p className="type-lead max-w-[56ch]">{t('hero.defaultSubhead')}</p>
          </FadeIn>

          <FadeIn immediate delay={0.15}>
            <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-3 pt-1">
              {cvUrl ? (
                <a
                  className="btn-primary min-h-11 px-6 py-3 rounded-md font-body-base font-semibold flex items-center justify-center gap-2 w-full sm:w-auto"
                  href={cvUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <span className="material-symbols-outlined text-[18px]">download</span>
                  {t('common.downloadCv')}
                </a>
              ) : contactEmail ? (
                <a
                  className="btn-primary min-h-11 px-6 py-3 rounded-md font-body-base font-semibold flex items-center justify-center gap-2 w-full sm:w-auto"
                  href={`mailto:${contactEmail}`}
                >
                  {t('common.emailMe')}
                </a>
              ) : null}

              <a
                className="btn-secondary min-h-11 px-5 py-3 rounded-md font-body-base font-semibold inline-flex items-center justify-center gap-2 w-full sm:w-auto"
                href="#projects"
              >
                {t('hero.seeWork')}
                <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
              </a>
            </div>
          </FadeIn>
        </div>

        <FadeIn immediate delay={0.12}>
          <SupplyChainNetwork />
        </FadeIn>
      </div>
    </section>
  );
}
