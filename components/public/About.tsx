'use client';

import { ABOUT_COPY } from '@/lib/content/portfolio';
import { FadeIn } from '@/components/ui/FadeIn';

export function About() {
  return (
    <section className="page-container section-block" id="about">
      <FadeIn variant="wipe">
        <h2 className="type-section mb-4">{ABOUT_COPY.title}</h2>
        <p className="type-lead mb-10 max-w-[52ch]">{ABOUT_COPY.lead}</p>
      </FadeIn>

      <FadeIn variant="fade" delay={0.05}>
        <div className="max-w-3xl space-y-5 text-[1.05rem] sm:text-[1.1rem] leading-[1.75] text-on-surface/90">
          {ABOUT_COPY.paragraphs.map((paragraph) => (
            <p key={paragraph.slice(0, 48)} className="text-pretty">
              {paragraph}
            </p>
          ))}
        </div>
      </FadeIn>

      <FadeIn variant="wipe" delay={0.08}>
        <div className="mt-10 max-w-3xl">
          <h3 className="text-base sm:text-lg font-semibold tracking-tight text-on-surface mb-4">
            {ABOUT_COPY.competenciesTitle}
          </h3>
          <ul className="space-y-4 border-t border-white/10 pt-4">
            {ABOUT_COPY.competencies.map((item) => (
              <li
                key={item.title}
                className="grid gap-1 sm:grid-cols-[minmax(0,14rem)_1fr] sm:gap-6"
              >
                <p className="font-semibold text-on-surface text-[0.95rem]">{item.title}</p>
                <p className="text-[0.95rem] leading-relaxed text-on-surface-variant">
                  {item.detail}
                </p>
              </li>
            ))}
          </ul>
          <p className="mt-8 text-[1rem] leading-relaxed text-on-surface-variant text-pretty">
            {ABOUT_COPY.close}
          </p>
        </div>
      </FadeIn>
    </section>
  );
}
