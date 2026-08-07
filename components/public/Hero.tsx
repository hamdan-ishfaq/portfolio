'use client';

import type { GlobalSettings } from '@/types';
import { FadeIn } from '@/components/ui/FadeIn';
import { SupplyChainNetwork } from '@/components/public/SupplyChainNetwork';
import { DocumentFlowTicker } from '@/components/public/DocumentFlowTicker';
import { useLocale } from '@/components/providers/LocaleProvider';

type HeroProps = {
  settings: GlobalSettings | null;
};

export function Hero({ settings }: HeroProps) {
  const { t } = useLocale();
  const displayName = settings?.display_name?.trim() || 'Muhammad Hamdan Ishfaq';
  const cvUrl = settings?.cv_file_url?.trim();
  const contactEmail = settings?.email?.trim();

  return (
    <section
      className="page-container relative flex flex-col justify-center min-h-[calc(100vh-8rem)] py-6 sm:py-8"
      id="home"
    >
      <FadeIn immediate variant="fade">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-5">
          <span className="type-label">{t('hero.metaRole')}</span>
          <span className="type-label inline-flex items-center gap-2">
            <span className="inline-flex h-1.5 w-1.5 rounded-full bg-secondary animate-pulse" />
            {t('hero.openTo')}
          </span>
        </div>
      </FadeIn>

      <div className="grid grid-cols-1 lg:grid-cols-[1.05fr_0.95fr] gap-10 lg:gap-14 items-center py-10 lg:py-14">
        <div className="space-y-6">
          <FadeIn immediate variant="clip" delay={0.04}>
            <p className="type-process mb-3">{t('hero.metaDomain')}</p>
            <h1 className="type-hero max-w-[18ch]">{displayName}</h1>
            <p className="mt-4 font-mono text-[11px] sm:text-[12px] leading-relaxed tracking-[0.04em] text-on-surface-variant max-w-[52ch]">
              {t('hero.credentialLine')}
            </p>
          </FadeIn>

          <FadeIn immediate variant="fade" delay={0.1}>
            <p className="type-lead max-w-[42ch] text-on-surface/90">{t('hero.headline')}</p>
            <p className="mt-3 text-sm sm:text-[0.95rem] leading-relaxed text-on-surface-variant max-w-[48ch]">
              {t('hero.defaultSubhead')}
            </p>
          </FadeIn>

          <FadeIn immediate variant="rise" delay={0.14}>
            <DocumentFlowTicker className="pt-1" />
          </FadeIn>

          <FadeIn immediate variant="rise" delay={0.18}>
            <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-3 pt-1">
              {cvUrl ? (
                <a
                  className="btn-primary min-h-11 px-6 py-3 rounded-md font-body-base font-semibold flex items-center justify-center gap-2 w-full sm:w-auto active:scale-[0.98] transition-transform"
                  href={cvUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <span className="material-symbols-outlined text-[18px]">download</span>
                  {t('common.downloadCv')}
                </a>
              ) : contactEmail ? (
                <a
                  className="btn-primary min-h-11 px-6 py-3 rounded-md font-body-base font-semibold flex items-center justify-center gap-2 w-full sm:w-auto active:scale-[0.98] transition-transform"
                  href={`mailto:${contactEmail}`}
                >
                  {t('common.emailMe')}
                </a>
              ) : null}

              <a
                className="btn-secondary min-h-11 px-5 py-3 rounded-md font-body-base font-semibold inline-flex items-center justify-center gap-2 w-full sm:w-auto active:scale-[0.98] transition-transform"
                href="#projects"
              >
                {t('hero.seeWork')}
                <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
              </a>
            </div>
          </FadeIn>
        </div>

        <FadeIn immediate variant="fade" delay={0.12}>
          <SupplyChainNetwork />
        </FadeIn>
      </div>
    </section>
  );
}
