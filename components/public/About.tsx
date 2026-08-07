'use client';

import { ABOUT_COPY } from '@/lib/content/portfolio';
import { FadeIn } from '@/components/ui/FadeIn';

export function About() {
  return (
    <section className="page-container section-block" id="about">
      <FadeIn variant="wipe">
        <p className="type-process mb-3">01 — About</p>
        <h2 className="type-section mb-4 max-w-[18ch]">{ABOUT_COPY.title}</h2>
        <p className="type-lead mb-8">{ABOUT_COPY.lead}</p>
      </FadeIn>

      <FadeIn variant="fade" delay={0.06}>
        <div className="relative max-w-3xl pl-5 sm:pl-6 border-l border-primary/40">
          <p className="font-display text-[1.05rem] sm:text-[1.15rem] leading-[1.8] text-on-surface/90 text-pretty">
            {ABOUT_COPY.body}
          </p>
        </div>
      </FadeIn>
    </section>
  );
}
