'use client';

import { Marquee } from '@/components/ui/Marquee';
import { HeroThreeScene } from '@/components/public/HeroThreeScene';
import { useLocale } from '@/components/providers/LocaleProvider';

type HeroVisualProps = {
  items: string[];
};

export function HeroVisual({ items }: HeroVisualProps) {
  const { t } = useLocale();

  return (
    <div className="hero-visual relative aspect-square max-w-md w-full mx-auto lg:ml-auto">
      <div className="hero-visual__frame glass-card rounded-2xl p-6 sm:p-8 h-full flex flex-col justify-between overflow-hidden">
        <div className="relative flex-1 flex items-center justify-center min-h-[220px]">
          <HeroThreeScene />

          <div className="absolute inset-0 flex items-end justify-center pointer-events-none pb-2">
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-on-surface-variant text-center px-4">
              {t('hero.stackCaption')}
            </p>
          </div>
        </div>

        <div className="pt-4 border-t border-white/8 relative z-10">
          <p className="type-label mb-3 text-center">{t('hero.inTheStack')}</p>
          <Marquee speed="slow">
            <div className="flex gap-3 px-2">
              {items.map((label) => (
                <span
                  key={label}
                  className="marquee-chip shrink-0 px-3 py-1.5 rounded-full border border-white/10 bg-surface-container/80 font-mono text-[10px] uppercase tracking-wider text-on-surface-variant"
                >
                  {label}
                </span>
              ))}
            </div>
          </Marquee>
        </div>
      </div>
    </div>
  );
}
