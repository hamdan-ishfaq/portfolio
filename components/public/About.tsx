'use client';

import { ABOUT_COPY } from '@/lib/content/portfolio';
import { FadeIn } from '@/components/ui/FadeIn';

export function About() {
  const sentences = ABOUT_COPY.body.split(/(?<=\.)\s+/);
  const pull = sentences[0] ?? ABOUT_COPY.body;
  const rest = sentences.slice(1).join(' ');

  return (
    <section className="page-container section-block section-band" id="about">
      <FadeIn variant="wipe">
        <p className="type-process mb-3">01 — About</p>
        <h2 className="type-section mb-3 max-w-[16ch]">{ABOUT_COPY.title}</h2>
        <p className="type-lead mb-10">{ABOUT_COPY.lead}</p>
      </FadeIn>

      <div className="grid gap-10 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)] lg:gap-16 items-start">
        <FadeIn variant="clip" delay={0.04}>
          <blockquote className="relative pl-5 border-l-2 border-primary">
            <p className="text-[1.2rem] sm:text-[1.4rem] font-medium italic leading-[1.45] tracking-tight text-on-surface text-pretty">
              {pull}
            </p>
          </blockquote>
        </FadeIn>

        <FadeIn variant="fade" delay={0.08}>
          <p className="text-[0.98rem] sm:text-[1.05rem] leading-[1.8] text-on-surface-variant text-pretty">
            {rest}
          </p>
        </FadeIn>
      </div>
    </section>
  );
}
