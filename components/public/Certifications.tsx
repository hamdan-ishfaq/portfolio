'use client';

import { SectionHeader } from '@/components/public/SectionHeader';
import { FadeIn } from '@/components/ui/FadeIn';
import { StaggerItem } from '@/components/ui/StaggerItem';
import { useLocale } from '@/components/providers/LocaleProvider';
import { pick, PROFILE, type CredentialItem } from '@/lib/content/profile';

function FeaturedCard({ cred, index }: { cred: CredentialItem; index: number }) {
  const { locale, t } = useLocale();
  const isPrimary = index === 0;
  const cardClasses = `group relative flex flex-col gap-4 rounded-md border p-5 sm:p-6 transition-[border-color,background-color,transform] duration-300 ${
    isPrimary
      ? 'md:col-span-2 border-primary/40 bg-primary/[0.05]'
      : 'border-white/10 bg-transparent hover:bg-white/[0.02]'
  }`;

  const issued = cred.issued ? cred.issued[locale] : null;

  const body = (
    <>
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <span
            className={`material-symbols-outlined text-[22px] ${
              isPrimary ? 'text-primary' : 'text-on-surface-variant'
            }`}
          >
            {cred.icon}
          </span>
          <div className="min-w-0">
            <p className="type-process">{cred.credentialType[locale]}</p>
            <p className="mt-1 text-sm text-on-surface-variant">{cred.issuer}</p>
          </div>
        </div>
        {issued ? (
          <span className="font-mono text-[11px] text-on-surface-variant tabular-nums shrink-0">
            {issued}
          </span>
        ) : null}
      </div>

      <h3 className="font-display text-[1rem] sm:text-[1.05rem] font-semibold tracking-tight text-on-surface text-balance leading-snug">
        {cred.title}
      </h3>

      {cred.skills.length > 0 ? (
        <ul className="flex flex-wrap gap-x-3 gap-y-1 mt-auto">
          {cred.skills.map((skill) => (
            <li
              key={skill}
              className="font-mono text-[10px] uppercase tracking-[0.12em] text-on-surface-variant"
            >
              {skill}
            </li>
          ))}
        </ul>
      ) : null}
    </>
  );

  if (!cred.verifyUrl) {
    return (
      <div className={`${cardClasses} border-dashed`} aria-label={cred.title}>
        {body}
      </div>
    );
  }

  return (
    <a
      href={cred.verifyUrl}
      target="_blank"
      rel="noopener noreferrer"
      className={`${cardClasses} hover:border-primary/55 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 active:scale-[0.995]`}
      aria-label={`${cred.title}. ${t('certifications.verify')}`}
    >
      {body}

      <span className="inline-flex items-center gap-1.5 text-sm font-medium text-primary">
        {t('certifications.verify')}
        <span className="material-symbols-outlined text-[16px] transition-transform duration-300 group-hover:translate-x-0.5">
          open_in_new
        </span>
      </span>
    </a>
  );
}

function CredentialLedger({
  items,
  label,
  hint,
}: {
  items: CredentialItem[];
  label: string;
  hint?: string;
}) {
  if (items.length === 0) return null;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <p className="type-label">{label}</p>
        {hint ? (
          <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-on-surface-variant">
            {hint}
          </p>
        ) : null}
      </div>

      <ul className="border-y border-white/10 divide-y divide-white/8">
        {items.map((item, index) => (
          <StaggerItem key={item.id} index={index} variant="wipe">
            <li>
              {item.verifyUrl ? (
                <a
                  href={item.verifyUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 py-3.5 px-1 transition-colors hover:bg-white/[0.02] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
                >
                  <span className="inline-flex items-center gap-3 min-w-0">
                    <span className="material-symbols-outlined text-[18px] text-on-surface-variant">
                      {item.icon}
                    </span>
                    <span className="text-sm font-medium text-on-surface truncate">
                      {item.title}
                    </span>
                  </span>
                  <span className="inline-flex items-center gap-2 text-xs text-on-surface-variant sm:pl-0 pl-9">
                    {item.issuer}
                    <span className="material-symbols-outlined text-[14px] text-primary">
                      open_in_new
                    </span>
                  </span>
                </a>
              ) : (
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 py-3.5 px-1">
                  <span className="inline-flex items-center gap-3 min-w-0">
                    <span className="material-symbols-outlined text-[18px] text-on-surface-variant">
                      {item.icon}
                    </span>
                    <span className="text-sm font-medium text-on-surface truncate">
                      {item.title}
                    </span>
                  </span>
                  <span className="text-xs text-on-surface-variant sm:pl-0 pl-9">
                    {item.issuer}
                  </span>
                </div>
              )}
            </li>
          </StaggerItem>
        ))}
      </ul>
    </div>
  );
}

export function Certifications() {
  const { locale } = useLocale();
  const credentials = PROFILE.credentials;
  const title = pick(credentials.title, locale);
  const lead = pick(credentials.lead, locale);
  const aria = pick(credentials.aria, locale);
  const official = credentials.items.filter((c) => c.tier === 'official');
  const development = credentials.items.filter(
    (c) => c.tier === 'specialization' || c.tier === 'certificate'
  );
  const coursework = credentials.items.filter((c) => c.tier === 'coursework');

  return (
    <section className="page-container section-block" id="certifications" aria-label={aria}>
      <SectionHeader title={title} lead={lead} />

      <FadeIn variant="fade">
        <div className="space-y-10">
          <div>
            <p className="type-label mb-4">{pick(credentials.tier1, locale)}</p>
            <div className="grid gap-3 sm:gap-4 md:grid-cols-2">
              {official.map((item, index) => (
                <FeaturedCard key={item.id} cred={item} index={index} />
              ))}
            </div>
          </div>

          <CredentialLedger
            items={development}
            label={pick(credentials.tier2, locale)}
            hint={pick(credentials.tier2Hint, locale)}
          />

          <CredentialLedger items={coursework} label={pick(credentials.tier3, locale)} />
        </div>
      </FadeIn>
    </section>
  );
}
