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
  const firstName = displayName.split(' ')[0] ?? displayName;

  return (
    <section
      className="page-container relative flex flex-col justify-center min-h-[100dvh] py-8 sm:py-10"
      id="home"
    >
      <FadeIn immediate variant="fade">
        <div className="ops-shell__bar rounded-md border border-white/10 mb-8 sm:mb-10">
          <span className="ops-shell__title">{t('hero.metaRole')}</span>
          <span className="type-label inline-flex items-center gap-2">
            <span className="inline-flex h-1.5 w-1.5 rounded-full bg-secondary" />
            {t('hero.openTo')}
          </span>
        </div>
      </FadeIn>

      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] gap-10 lg:gap-12 xl:gap-16 items-end lg:items-center">
        <div className="space-y-7 lg:pb-4">
          <FadeIn immediate variant="clip" delay={0.04}>
            <p className="type-process mb-4">{t('hero.metaDomain')}</p>
            <h1 className="type-hero max-w-[14ch]">
              {displayName.includes(' ') ? (
                <>
                  <span className="block text-on-surface">{firstName}</span>
                  <span className="block text-on-surface/85">
                    {displayName.slice(firstName.length).trim()}
                  </span>
                </>
              ) : (
                displayName
              )}
            </h1>
          </FadeIn>

          <FadeIn immediate variant="wipe" delay={0.08}>
            <p className="font-mono text-[11px] sm:text-[12px] leading-relaxed tracking-[0.05em] text-primary/90 max-w-[48ch] border-l-2 border-primary/50 pl-4">
              {t('hero.credentialLine')}
            </p>
          </FadeIn>

          <FadeIn immediate variant="fade" delay={0.12}>
            <p className="text-[1.15rem] sm:text-[1.3rem] font-medium leading-snug tracking-tight text-on-surface max-w-[28ch]">
              {t('hero.headline')}
            </p>
            <p className="mt-3 text-sm sm:text-[0.95rem] leading-relaxed text-on-surface-variant max-w-[46ch]">
              {t('hero.defaultSubhead')}
            </p>
          </FadeIn>

          <FadeIn immediate variant="rise" delay={0.16}>
            <DocumentFlowTicker />
          </FadeIn>

          <FadeIn immediate variant="rise" delay={0.2}>
            <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-3 pt-1">
              {cvUrl ? (
                <a
                  className="btn-primary min-h-11 px-6 py-3 rounded-md font-semibold inline-flex items-center justify-center gap-2 w-full sm:w-auto transition-transform duration-150 active:scale-[0.97]"
                  href={cvUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <span className="material-symbols-outlined text-[18px]">download</span>
                  {t('common.downloadCv')}
                </a>
              ) : contactEmail ? (
                <a
                  className="btn-primary min-h-11 px-6 py-3 rounded-md font-semibold inline-flex items-center justify-center gap-2 w-full sm:w-auto transition-transform duration-150 active:scale-[0.97]"
                  href={`mailto:${contactEmail}`}
                >
                  {t('common.emailMe')}
                </a>
              ) : null}

              <a
                className="btn-secondary min-h-11 px-5 py-3 rounded-md font-semibold inline-flex items-center justify-center gap-2 w-full sm:w-auto transition-transform duration-150 active:scale-[0.97]"
                href="#projects"
              >
                {t('hero.seeWork')}
                <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
              </a>
            </div>
          </FadeIn>
        </div>

        <FadeIn immediate variant="fade" delay={0.1} className="lg:-mr-2 xl:-mr-4">
          <div className="ops-shell shadow-[0_0_0_1px_rgba(59,130,168,0.12)]">
            <div className="ops-shell__bar">
              <span className="ops-shell__title">TXN · Document flow</span>
              <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-on-surface-variant">
                P2P · O2C · LIVE
              </span>
            </div>
            <SupplyChainNetwork framed={false} />
          </div>
        </FadeIn>
      </div>
    </section>
  );
}
