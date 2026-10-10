'use client';

import { SectionHeader } from '@/components/public/SectionHeader';
import { FadeIn } from '@/components/ui/FadeIn';
import { useLocale } from '@/components/providers/LocaleProvider';
import { pick, PROFILE } from '@/lib/content/profile';

/** Capability matrix — hairline definition rows, not chip clouds. */
export function Skills() {
  const { locale } = useLocale();
  const title = pick(PROFILE.capabilities.title, locale);
  const lead = pick(PROFILE.capabilities.lead, locale);
  const aria = pick(PROFILE.capabilities.aria, locale);
  const groups = PROFILE.capabilities.groups;

  return (
    <section className="page-container section-block section-band" id="skills" aria-label={aria}>
      <SectionHeader title={title} lead={lead} />

      <FadeIn variant="fade">
        <div className="overflow-hidden border-y border-white/10">
          {groups.map((group) => (
            <div
              key={group.id}
              className="group grid gap-4 md:grid-cols-[minmax(0,17rem)_1fr] md:gap-12 px-1 py-5 sm:py-6 border-t border-white/8 first:border-t-0 transition-colors hover:bg-white/[0.02]"
            >
              <div>
                <h3 className="text-[0.95rem] font-semibold tracking-tight text-on-surface font-display">
                  {group.title[locale]}
                </h3>
              </div>

              <ul className="grid gap-x-8 gap-y-2 sm:grid-cols-2 content-start">
                {group.items.map((item) => (
                  <li
                    key={item}
                    className="flex items-baseline gap-2 border-b border-white/6 pb-2 last:border-0 sm:last:border-b"
                  >
                    <span className="text-[0.875rem] text-on-surface leading-snug">{item}</span>
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
