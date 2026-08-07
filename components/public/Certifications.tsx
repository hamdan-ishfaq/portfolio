'use client';

import { CERTIFICATIONS, type Certification } from '@/lib/content/portfolio';
import { SectionHeader } from '@/components/public/SectionHeader';
import { FadeIn } from '@/components/ui/FadeIn';
import { StaggerItem } from '@/components/ui/StaggerItem';
import { useLocale } from '@/components/providers/LocaleProvider';

function FeaturedCard({ cert, index }: { cert: Certification; index: number }) {
  const { t } = useLocale();
  const isPrimary = index === 0;

  return (
    <a
      href={cert.verifyUrl}
      target="_blank"
      rel="noopener noreferrer"
      className={`group relative flex flex-col gap-4 rounded-md border p-5 sm:p-6 transition-[border-color,background-color,transform] duration-300 hover:border-primary/55 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 active:scale-[0.995] ${
        isPrimary
          ? 'md:col-span-2 border-primary/40 bg-primary/[0.05]'
          : 'border-white/10 bg-transparent hover:bg-white/[0.02]'
      }`}
      aria-label={`${cert.title} — ${t('certifications.verify')}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <span
            className={`material-symbols-outlined text-[22px] ${
              isPrimary ? 'text-primary' : 'text-on-surface-variant'
            }`}
          >
            {cert.icon}
          </span>
          <div className="min-w-0">
            <p className="type-process">{cert.credentialType}</p>
            <p className="mt-1 text-sm text-on-surface-variant">{cert.issuer}</p>
          </div>
        </div>
        <span className="font-mono text-[11px] text-on-surface-variant tabular-nums shrink-0">
          {cert.issued}
        </span>
      </div>

      <h3 className="font-display text-[1rem] sm:text-[1.05rem] font-semibold tracking-tight text-on-surface text-balance leading-snug">
        {cert.title}
      </h3>

      {cert.skills.length > 0 ? (
        <ul className="flex flex-wrap gap-x-3 gap-y-1 mt-auto">
          {cert.skills.map((skill) => (
            <li
              key={skill}
              className="font-mono text-[10px] uppercase tracking-[0.12em] text-on-surface-variant"
            >
              {skill}
            </li>
          ))}
        </ul>
      ) : null}

      <span className="inline-flex items-center gap-1.5 text-sm font-medium text-primary">
        {t('certifications.verify')}
        <span className="material-symbols-outlined text-[16px] transition-transform duration-300 group-hover:translate-x-0.5">
          open_in_new
        </span>
      </span>
    </a>
  );
}

function CourseworkLedger({ items }: { items: Certification[] }) {
  const { t } = useLocale();
  if (items.length === 0) return null;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <p className="type-label">{t('certifications.tier2')}</p>
        <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-on-surface-variant">
          {t('certifications.tier2Hint')}
        </p>
      </div>

      <ul className="border-y border-white/10 divide-y divide-white/8">
        {items.map((cert, index) => (
          <StaggerItem key={cert.id} index={index} variant="wipe">
            <li>
              <a
                href={cert.verifyUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 py-3.5 px-1 transition-colors hover:bg-white/[0.02] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
              >
                <span className="inline-flex items-center gap-3 min-w-0">
                  <span className="material-symbols-outlined text-[18px] text-on-surface-variant">
                    {cert.icon}
                  </span>
                  <span className="text-sm font-medium text-on-surface truncate">{cert.title}</span>
                </span>
                <span className="inline-flex items-center gap-2 text-xs text-on-surface-variant sm:pl-0 pl-9">
                  {cert.issuer}
                  <span className="material-symbols-outlined text-[14px] text-primary">
                    open_in_new
                  </span>
                </span>
              </a>
            </li>
          </StaggerItem>
        ))}
      </ul>
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
      <SectionHeader
        index="04 — Credentials"
        title={t('certifications.title')}
        lead={t('certifications.lead')}
      />

      <FadeIn variant="fade">
        <div className="space-y-10">
          <div>
            <p className="type-label mb-4">{t('certifications.tier1')}</p>
            <div className="grid gap-3 sm:gap-4 md:grid-cols-2">
              {featured.map((cert, index) => (
                <FeaturedCard key={cert.id} cert={cert} index={index} />
              ))}
            </div>
          </div>

          <CourseworkLedger items={coursework} />
        </div>
      </FadeIn>
    </section>
  );
}
