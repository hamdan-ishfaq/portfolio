'use client';

import { SKILL_CATEGORIES } from '@/lib/content/portfolio';
import { SectionHeader } from '@/components/public/SectionHeader';
import { FadeIn } from '@/components/ui/FadeIn';
import { useLocale } from '@/components/providers/LocaleProvider';

/** Capability matrix — domain rows, hairline separated, table-like and scannable. */
export function Skills() {
  const { t } = useLocale();

  return (
    <section className="page-container section-block" id="skills" aria-label={t('skills.aria')}>
      <SectionHeader title={t('skills.title')} lead={t('skills.lead')} />

      <FadeIn>
        <div className="lab-frame rounded-lg overflow-hidden">
          {SKILL_CATEGORIES.map((category, index) => (
            <div
              key={category.id}
              className="grid gap-4 md:grid-cols-[minmax(0,17rem)_1fr] md:gap-10 px-5 sm:px-7 py-5 sm:py-6 border-t border-white/8 first:border-t-0"
            >
              <div className="flex gap-3">
                <span className="font-mono text-[11px] text-on-surface-variant pt-1 tabular-nums">
                  {String(index + 1).padStart(2, '0')}
                </span>
                <div>
                  <h3 className="text-[0.95rem] font-semibold tracking-tight text-on-surface">
                    {category.title}
                  </h3>
                  <p className="mt-1.5 text-xs leading-relaxed text-on-surface-variant">
                    {category.context}
                  </p>
                </div>
              </div>

              <ul className="flex flex-wrap gap-2 content-start">
                {category.items.map((item) => (
                  <li
                    key={item}
                    className="rounded border border-white/12 bg-white/[0.03] px-2.5 py-1.5 text-[0.8125rem] text-on-surface"
                  >
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </FadeIn>
    </section>
  );
}
