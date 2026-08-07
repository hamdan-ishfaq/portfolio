'use client';

import { FadeIn } from '@/components/ui/FadeIn';

type SectionHeaderProps = {
  title: React.ReactNode;
  lead?: string;
  aside?: React.ReactNode;
  /** Mono process code, e.g. 02 — EXPERIENCE */
  index?: string;
  className?: string;
};

/** Section header with optional process index — breaks identical resume-block rhythm. */
export function SectionHeader({ title, lead, aside, index, className = '' }: SectionHeaderProps) {
  return (
    <FadeIn variant="wipe">
      <div
        className={`mb-10 sm:mb-14 grid gap-5 ${
          aside ? 'lg:grid-cols-[minmax(0,1.4fr)_minmax(0,0.6fr)] lg:items-end' : ''
        } ${className}`}
      >
        <div className="max-w-2xl">
          {index ? <p className="type-process mb-3">{index}</p> : null}
          <h2 className="type-section mb-3 sm:mb-4 border-l-2 border-primary/50 pl-4">{title}</h2>
          {lead ? <p className="type-lead pl-4">{lead}</p> : null}
        </div>
        {aside ? (
          <div className="lg:justify-self-end lg:text-right text-on-surface-variant">{aside}</div>
        ) : null}
      </div>
    </FadeIn>
  );
}
