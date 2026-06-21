'use client';

import type { GlobalSettings } from '@/types';
import { DEFAULT_HERO_TECH_STACK } from '@/lib/defaults/hero-tech-stack';
import { FadeIn } from '@/components/ui/FadeIn';
import { HeroVisual } from '@/components/public/HeroVisual';
import { useLocale } from '@/components/providers/LocaleProvider';

type HeroProps = {
  settings: GlobalSettings | null;
};

export function Hero({ settings }: HeroProps) {
  const { t } = useLocale();
  const displayName = settings?.display_name?.trim() || 'Hamdan Ishfaq';
  const cvUrl = settings?.cv_file_url?.trim();
  const contactEmail = settings?.email?.trim();

  const storedStack = settings?.hero_tech_stack?.filter((item) => item.label?.trim());
  const techStack = storedStack && storedStack.length > 0 ? storedStack : DEFAULT_HERO_TECH_STACK;
  const techLabels = techStack.map((item) => item.label);

  return (
    <section
      className="page-container min-h-[80vh] lg:min-h-[90vh] flex flex-col justify-center relative py-16 sm:py-24"
      id="home"
    >
      <div className="z-10 relative grid grid-cols-1 lg:grid-cols-2 gap-14 lg:gap-20 items-center">
        <FadeIn immediate>
          <div className="space-y-6 sm:space-y-8">
            <p className="type-label">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-primary mr-2 align-middle animate-pulse" />
              {t('hero.openTo')}
            </p>

            <h1 className="type-hero max-w-[14ch]">
              {t('hero.headlinePrefix', { name: displayName })}{' '}
              <span className="type-accent-serif">{t('hero.headlineAccent')}</span>{' '}
              {t('hero.headlineSuffix')}
            </h1>

            <p className="font-mono text-sm text-on-surface-variant tracking-wide border-l-2 border-primary/40 pl-4">
              {settings?.tagline?.trim() || t('hero.defaultTagline')}
            </p>

            <p className="type-lead">
              {settings?.sub_headline?.trim() || t('hero.defaultSubhead')}
            </p>

            <div className="flex flex-col sm:flex-row flex-wrap gap-3 pt-2">
              {cvUrl ? (
                <a
                  className="btn-primary min-h-11 px-6 py-3 rounded-lg font-body-base font-semibold flex items-center justify-center gap-2 w-full sm:w-auto"
                  href={cvUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {t('common.downloadCv')}
                </a>
              ) : contactEmail ? (
                <a
                  className="btn-primary min-h-11 px-6 py-3 rounded-lg font-body-base font-semibold flex items-center justify-center gap-2 w-full sm:w-auto"
                  href={`mailto:${contactEmail}`}
                >
                  {t('common.emailMe')}
                </a>
              ) : null}

              <a
                className="btn-secondary min-h-11 px-6 py-3 rounded-lg font-body-base font-semibold flex items-center justify-center gap-2 w-full sm:w-auto"
                href="#projects"
              >
                {t('hero.seeWork')}
              </a>
            </div>
          </div>
        </FadeIn>

        <FadeIn immediate delay={0.15}>
          <HeroVisual items={techLabels} />
        </FadeIn>
      </div>
    </section>
  );
}
