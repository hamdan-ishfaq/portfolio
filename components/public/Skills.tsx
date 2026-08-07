'use client';

import { SKILL_CATEGORIES } from '@/lib/content/portfolio';
import { SectionHeader } from '@/components/public/SectionHeader';
import { FadeIn } from '@/components/ui/FadeIn';
import { useLocale } from '@/components/providers/LocaleProvider';

/** Capability matrix — hairline definition rows, not chip clouds. */
export function Skills() {
  const { t } = useLocale();

  return (
    <section className="page-container section-block" id="skills" aria-label={t('skills.aria')}>
      <SectionHeader index="03 — Capabilities" title={t('skills.title')} lead={t('skills.lead')} />

      <FadeIn variant="fade">
        <div className="overflow-hidden border-y border-white/10">
          {SKILL_CATEGORIES.map((category, index) => (
            <div
              key={category.id}
              className="group grid gap-4 md:grid-cols-[minmax(0,17rem)_1fr] md:gap-12 px-1 py-5 sm:py-6 border-t border-white/8 first:border-t-0 transition-colors hover:bg-white/[0.02]"
            >
              <div className="flex gap-3">
                <span className="font-mono text-[11px] text-primary/80 pt-1 tabular-nums transition-colors group-hover:text-primary">
                  {String(index + 1).padStart(2, '0')}
                </span>
                <div>
                  <h3 className="text-[0.95rem] font-semibold tracking-tight text-on-surface font-display">
                    {category.title}
                  </h3>
                  <p className="mt-1.5 text-xs leading-relaxed text-on-surface-variant">
                    {category.context}
                  </p>
                </div>
              </div>

              <dl className="grid gap-x-8 gap-y-2 sm:grid-cols-2 content-start">
                {category.items.map((item) => (
                  <div
                    key={item}
                    className="flex items-baseline gap-2 border-b border-white/6 pb-2 last:border-0 sm:last:border-b"
                  >
                    <dt className="sr-only">{category.title}</dt>
                    <dd className="text-[0.875rem] text-on-surface leading-snug">{item}</dd>
                  </div>
                ))}
              </dl>
            </div>
          ))}
        </div>
      </FadeIn>
    </section>
  );
}
