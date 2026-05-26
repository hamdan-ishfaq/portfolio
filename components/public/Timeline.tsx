'use client';

import type { TimelineEvent } from '@/types';
import { FadeIn } from '@/components/ui/FadeIn';

type TimelineProps = {
  events: TimelineEvent[];
};

export function Timeline({ events }: TimelineProps) {
  if (!events || events.length === 0) return null;

  return (
    /* Stitch: max-w-container-max mx-auto px-lg py-2xl relative */
    <section className="page-container py-12 sm:py-2xl relative">
      {/* Stitch: font-headline-md text-headline-md text-on-surface mb-xl flex items-center gap-3 */}
      <h2 className="font-headline-md text-headline-md text-on-surface mb-xl flex items-center gap-3">
        <span className="material-symbols-outlined text-primary">timeline</span> Experience
      </h2>

      {/* Stitch: relative pl-8 md:pl-0 */}
      <div className="relative pl-8 md:pl-0">
        {/* Timeline Line — Stitch: absolute left-[39px] md:left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-primary/50 via-white/10 to-transparent transform md:-translate-x-1/2 */}
        <div className="absolute left-[39px] md:left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-primary/50 via-white/10 to-transparent transform md:-translate-x-1/2"></div>

        {/* Stitch: space-y-xl */}
        <div className="space-y-xl">
          {events.map((event, index) => {
            const isEven = index % 2 === 0;
            const isAcademic = event.type === 'academic';
            const accentText = isAcademic ? 'text-secondary' : 'text-primary';
            const accentBorder = isAcademic ? 'border-secondary' : 'border-primary';
            const accentBg = isAcademic ? 'bg-secondary' : 'bg-primary';
            const nodeShadow = isAcademic ? '' : 'shadow-[0_0_10px_rgba(137,206,255,0.5)]';

            return (
              <FadeIn key={event.id} delay={index * 0.08}>
                <div
                  /* Corporate: relative flex flex-col md:flex-row items-center md:justify-between group */
                  /* Academic: adds md:flex-row-reverse */
                  className={`relative flex flex-col md:flex-row items-center md:justify-between group ${!isEven ? 'md:flex-row-reverse' : ''}`}
                >
                  {/* Desktop label side */}
                  {/* Corporate: md:w-[45%] md:text-right pr-lg mb-sm md:mb-0 hidden md:block */}
                  {/* Academic: md:w-[45%] md:text-left pl-lg mb-sm md:mb-0 hidden md:block */}
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

                  {/* Center node — Stitch: absolute left-0 md:left-1/2 w-6 h-6 rounded-full bg-surface border-2 border-[color] z-10 transform md:-translate-x-1/2 flex items-center justify-center group-hover:scale-125 transition-transform duration-300 */}
                  <div
                    className={`absolute left-0 md:left-1/2 w-6 h-6 rounded-full bg-surface border-2 ${accentBorder} z-10 transform md:-translate-x-1/2 flex items-center justify-center group-hover:scale-125 transition-transform duration-300 ${nodeShadow}`}
                  >
                    {!isAcademic ? (
                      <div className="w-2 h-2 rounded-full bg-primary"></div>
                    ) : (
                      <span className="material-symbols-outlined text-[10px] text-secondary">
                        school
                      </span>
                    )}
                  </div>

                  {/* Content card side */}
                  {/* Corporate: md:w-[45%] w-full pl-lg md:pl-0 md:pr-0 */}
                  {/* Academic: md:w-[45%] w-full pl-lg md:pl-0 md:pr-lg text-left md:text-right */}
                  <div
                    className={`md:w-[45%] w-full pl-lg md:pl-0 ${isEven ? 'md:pr-0' : 'md:pr-lg text-left md:text-right'}`}
                  >
                    {/* Mobile header — Stitch: md:hidden mb-2 */}
                    <div className="md:hidden mb-2">
                      <h3 className="font-body-base text-body-base text-on-surface font-semibold">
                        {event.title}
                      </h3>
                      <p className={`font-body-sm text-body-sm ${accentText}`}>
                        {event.organization} • {event.date_range}
                      </p>
                    </div>

                    {/* Card — Stitch: glass-card p-md rounded-lg hover-glow transition-all duration-300 relative overflow-hidden */}
                    <div className="glass-card p-md rounded-lg hover-glow transition-all duration-300 relative overflow-hidden">
                      {/* Corporate: left bar */}
                      {isEven && (
                        <div className={`absolute top-0 left-0 w-1 h-full ${accentBg}`}></div>
                      )}
                      {/* Academic: right bar desktop, left bar mobile */}
                      {!isEven && (
                        <div
                          className={`absolute top-0 right-0 w-1 h-full ${accentBg} md:block hidden`}
                        ></div>
                      )}
                      {!isEven && (
                        <div
                          className={`absolute top-0 left-0 w-1 h-full ${accentBg} md:hidden block`}
                        ></div>
                      )}

                      {/* Description text */}
                      <div className="font-body-sm text-body-sm text-on-surface-variant space-y-xs pl-sm">
                        {event.description.map((desc, i) => (
                          <p key={i}>{desc}</p>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </FadeIn>
            );
          })}
        </div>
      </div>
    </section>
  );
}
