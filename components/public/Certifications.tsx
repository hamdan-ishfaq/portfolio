'use client';

import { useReducedMotion } from 'framer-motion';
import { CERTIFICATIONS, type Certification } from '@/lib/content/portfolio';
import { SectionHeader } from '@/components/public/SectionHeader';
import { FadeIn } from '@/components/ui/FadeIn';
import { useLocale } from '@/components/providers/LocaleProvider';

function FeaturedCard({ cert, index }: { cert: Certification; index: number }) {
  const { t } = useLocale();
  const isPrimary = index === 0;

  return (
    <a
      href={cert.verifyUrl}
      target="_blank"
      rel="noopener noreferrer"
      className={`group lab-frame rounded-lg p-5 sm:p-6 flex flex-col gap-4 transition-colors hover:border-primary/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 ${
        isPrimary ? 'md:col-span-2 border-primary/35 bg-primary/[0.04]' : ''
      }`}
      aria-label={`${cert.title} — ${t('certifications.verify')}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-md border ${
            isPrimary
              ? 'border-primary/40 bg-primary/15 text-primary'
              : 'border-white/12 bg-white/[0.04] text-on-surface-variant'
          }`}
        >
          <span className="material-symbols-outlined text-[22px]">{cert.icon}</span>
        </div>
        <span className="type-label text-on-surface-variant tabular-nums">{cert.issued}</span>
      </div>

      <div className="space-y-1.5 min-w-0">
        <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-primary">
          {cert.credentialType}
        </p>
        <h3 className="text-[0.95rem] sm:text-base font-semibold tracking-tight text-on-surface text-balance leading-snug">
          {cert.title}
        </h3>
        <p className="text-sm text-on-surface-variant">{cert.issuer}</p>
      </div>

      {cert.skills.length > 0 ? (
        <ul className="flex flex-wrap gap-1.5 mt-auto">
          {cert.skills.map((skill) => (
            <li
              key={skill}
              className="rounded border border-white/12 bg-white/[0.03] px-2 py-1 text-[0.75rem] text-on-surface"
            >
              {skill}
            </li>
          ))}
        </ul>
      ) : null}

      <span className="inline-flex items-center gap-1.5 text-sm font-medium text-primary">
        {t('certifications.verify')}
        <span className="material-symbols-outlined text-[16px] transition-transform group-hover:translate-x-0.5">
          open_in_new
        </span>
      </span>
    </a>
  );
}

function CourseworkMarquee({ items }: { items: Certification[] }) {
  const prefersReducedMotion = useReducedMotion();
  const { t } = useLocale();

  if (items.length === 0) return null;

  const track = prefersReducedMotion ? items : [...items, ...items, ...items];

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-3 px-1">
        <p className="type-label">{t('certifications.tier2')}</p>
        <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-on-surface-variant">
          {t('certifications.tier2Hint')}
        </p>
      </div>

      <div
        className={`lab-frame rounded-lg overflow-hidden ${
          prefersReducedMotion ? '' : 'cert-marquee-mask'
        }`}
      >
        <ul
          className={
            prefersReducedMotion
              ? 'flex flex-wrap gap-2 p-4'
              : 'cert-marquee-track flex w-max gap-3 py-4 pl-4'
          }
          aria-label={t('certifications.tier2')}
        >
          {track.map((cert, i) => (
            <li key={`${cert.id}-${i}`} className="shrink-0" aria-hidden={i >= items.length}>
              <a
                href={cert.verifyUrl}
                target="_blank"
                rel="noopener noreferrer"
                tabIndex={i >= items.length ? -1 : undefined}
                className="inline-flex items-center gap-2.5 rounded-md border border-white/12 bg-white/[0.03] px-3.5 py-2.5 text-sm text-on-surface transition-colors hover:border-primary/45 hover:bg-primary/[0.06] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
              >
                <span className="material-symbols-outlined text-[16px] text-on-surface-variant">
                  {cert.icon}
                </span>
                <span className="font-medium whitespace-nowrap">{cert.title}</span>
                <span className="text-on-surface-variant whitespace-nowrap">· {cert.issuer}</span>
                <span className="material-symbols-outlined text-[14px] text-primary">
                  open_in_new
                </span>
              </a>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export function Certifications() {
  const { t } = useLocale();
  const featured = CERTIFICATIONS.filter((c) => c.tier === 'featured');
  const coursework = CERTIFICATIONS.filter((c) => c.tier === 'coursework');

  return (
    <section
      className="page-container section-block"
      id="certifications"
      aria-label={t('certifications.aria')}
    >
      <SectionHeader title={t('certifications.title')} lead={t('certifications.lead')} />

      <FadeIn>
        <div className="space-y-8">
          <div>
            <p className="type-label mb-3 px-1">{t('certifications.tier1')}</p>
            <div className="grid gap-3 sm:gap-4 md:grid-cols-2">
              {featured.map((cert, index) => (
                <FeaturedCard key={cert.id} cert={cert} index={index} />
              ))}
            </div>
          </div>

          <CourseworkMarquee items={coursework} />
        </div>
      </FadeIn>
    </section>
  );
}
