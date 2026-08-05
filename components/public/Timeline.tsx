'use client';

import type { TimelineEvent } from '@/types';
import { SectionHeader } from '@/components/public/SectionHeader';
import { StaggerItem } from '@/components/ui/StaggerItem';
import { useLocale } from '@/components/providers/LocaleProvider';

type TimelineProps = {
  events: TimelineEvent[];
};

export function Timeline({ events }: TimelineProps) {
  const { t } = useLocale();
  if (!events || events.length === 0) return null;

  return (
    <section className="page-container section-block relative" id="experience">
      <SectionHeader title={t('experience.title')} lead={t('experience.lead')} />

      <div className="relative pl-8 md:pl-0">
        <div className="absolute left-[39px] md:left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-primary/40 via-white/10 to-transparent transform md:-translate-x-1/2" />

        <div className="space-y-xl">
          {events.map((event, index) => {
            const isEven = index % 2 === 0;
            const isAcademic = event.type === 'academic';
            const accentText = isAcademic ? 'text-on-surface-variant' : 'text-primary';
            const accentBorder = isAcademic ? 'border-white/30' : 'border-primary';

            return (
              <StaggerItem key={event.id} index={index}>
                <div
                  id={`experience-${event.id}`}
                  className={`relative flex flex-col md:flex-row items-center md:justify-between group scroll-mt-28 ${
                    !isEven ? 'md:flex-row-reverse' : ''
                  }`}
                >
                  <div
                    className={`md:w-[45%] ${isEven ? 'md:text-right pr-lg' : 'md:text-left pl-lg'} mb-sm md:mb-0 hidden md:block`}
                  >
                    <h3 className="font-body-base text-body-base text-on-surface font-semibold">
                      {event.title}
                    </h3>
                    <p className={`font-body-sm text-body-sm ${accentText}`}>
                      {event.organization}
                    </p>
                    <p className="font-code-base text-[12px] text-on-surface-variant mt-1">
                      {event.date_range}
                    </p>
                  </div>

                  <div
                    className={`absolute left-0 md:left-1/2 w-6 h-6 rounded-full bg-surface border-2 ${accentBorder} z-10 transform md:-translate-x-1/2 flex items-center justify-center`}
                  >
                    {!isAcademic ? (
                      <div className="w-2 h-2 rounded-full bg-primary" />
                    ) : (
                      <span className="material-symbols-outlined text-[10px] text-on-surface-variant">
                        school
                      </span>
                    )}
                  </div>

                  <div
                    className={`md:w-[45%] w-full pl-lg md:pl-0 ${isEven ? 'md:pr-0' : 'md:pr-lg text-left md:text-right'}`}
                  >
                    <div className="md:hidden mb-2">
                      <h3 className="font-body-base text-body-base text-on-surface font-semibold">
                        {event.title}
                      </h3>
                      <p className={`font-body-sm text-body-sm ${accentText}`}>
                        {event.organization} · {event.date_range}
                      </p>
                    </div>

                    <div className="lab-frame p-md rounded-lg relative overflow-hidden">
                      <div className="font-body-sm text-body-sm text-on-surface-variant space-y-xs">
                        {event.description.map((desc, i) => (
                          <p key={i}>{desc}</p>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </StaggerItem>
            );
          })}
        </div>
      </div>
    </section>
  );
}
