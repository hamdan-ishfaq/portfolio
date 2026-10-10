'use client';

import { FadeIn } from '@/components/ui/FadeIn';
import { useLocale } from '@/components/providers/LocaleProvider';
import { pick, PROFILE } from '@/lib/content/profile';

export function About() {
  const { locale } = useLocale();
  const title = pick(PROFILE.about.title, locale);
  const paragraphs = PROFILE.about.paragraphs[locale];

  return (
    <section className="page-container section-block" id="about">
      <FadeIn variant="wipe">
        <h2 className="type-section mb-10">{title}</h2>
      </FadeIn>

      <FadeIn variant="fade" delay={0.05}>
        <div className="max-w-3xl space-y-5 text-[1.05rem] sm:text-[1.1rem] leading-[1.75] text-on-surface/90">
          {paragraphs.map((paragraph) => (
            <p key={paragraph.slice(0, 48)} className="text-pretty">
              {paragraph}
            </p>
          ))}
        </div>
      </FadeIn>
    </section>
  );
}
