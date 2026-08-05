'use client';

import { ABOUT_COPY } from '@/lib/content/portfolio';
import { SectionHeader } from '@/components/public/SectionHeader';
import { FadeIn } from '@/components/ui/FadeIn';

export function About() {
  return (
    <section className="page-container section-block" id="about">
      <FadeIn>
        <SectionHeader title={ABOUT_COPY.title} lead={ABOUT_COPY.lead} />
        <div className="lab-frame rounded-lg p-6 sm:p-8 max-w-4xl">
          <p className="text-base sm:text-[1.05rem] leading-[1.75] text-on-surface-variant text-pretty">
            {ABOUT_COPY.body}
          </p>
        </div>
      </FadeIn>
    </section>
  );
}
