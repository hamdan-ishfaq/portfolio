'use client';

import type { TimelineEvent } from '@/types';
import { SectionHeader } from '@/components/public/SectionHeader';
import { StaggerItem } from '@/components/ui/StaggerItem';
import { useLocale } from '@/components/providers/LocaleProvider';

type TimelineProps = {
  events: TimelineEvent[];
};

/** Vertical posting log — audit-trail layout, not a zig-zag timeline template. */
export function Timeline({ events }: TimelineProps) {
  const { t } = useLocale();
  if (!events || events.length === 0) return null;

  return (
    <section className="page-container section-block section-band relative" id="experience">
      <SectionHeader
        index="02 — Experience"
        title={t('experience.title')}
        lead={t('experience.lead')}
      />

      <div className="relative">
        <div
          className="absolute left-[7px] sm:left-[9px] top-2 bottom-2 w-px bg-gradient-to-b from-primary/50 via-white/12 to-transparent timeline-spine"
          aria-hidden="true"
        />

        <ol className="space-y-8 sm:space-y-10">
          {events.map((event, index) => {
            const isAcademic = event.type === 'academic';

            return (
              <StaggerItem key={event.id} index={index} variant="wipe">
                <li
                  id={`experience-${event.id}`}
                  className="relative grid gap-4 sm:grid-cols-[minmax(0,11rem)_1fr] sm:gap-10 pl-8 sm:pl-10 scroll-mt-28"
                >
                  <div
                    className={`absolute left-0 top-1.5 w-[15px] h-[15px] sm:w-[19px] sm:h-[19px] rounded-full border-2 bg-surface z-10 flex items-center justify-center ${
                      isAcademic ? 'border-white/35' : 'border-primary'
                    }`}
                  >
                    {!isAcademic ? (
                      <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                    ) : (
                      <span className="material-symbols-outlined text-[9px] text-on-surface-variant">
                        school
                      </span>
                    )}
                  </div>

                  <div className="sm:pt-0.5">
                    <p className="font-mono text-[11px] tabular-nums text-primary tracking-wide">
                      {event.date_range}
                    </p>
                    {event.location ? (
                      <p className="mt-1.5 text-[11px] leading-snug text-on-surface-variant">
                        {event.location}
                      </p>
                    ) : null}
                  </div>

                  <div className="min-w-0">
                    <h3 className="font-display text-[1.05rem] sm:text-lg font-semibold tracking-tight text-on-surface">
                      {event.title}
                    </h3>
                    <p
                      className={`mt-1 text-sm ${isAcademic ? 'text-on-surface-variant' : 'text-primary'}`}
                    >
                      {event.organization}
                    </p>

                    <ul className="mt-4 space-y-2.5">
                      {event.description.map((desc, i) => (
                        <li
                          key={i}
                          className="text-sm leading-relaxed text-on-surface-variant pl-3 border-l border-white/12"
                        >
                          {desc}
                        </li>
                      ))}
                    </ul>
                  </div>
                </li>
              </StaggerItem>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
