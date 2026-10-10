'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import { motion, useReducedMotion } from 'framer-motion';
import type { GlobalSettings } from '@/types';
import { BridgeGraph } from '@/components/public/BridgeGraph';
import { useLocale } from '@/components/providers/LocaleProvider';
import { pick, PROFILE } from '@/lib/content/profile';

const P2PSimulator = dynamic(
  () => import('@/components/public/P2PSimulator').then((m) => m.P2PSimulator),
  { ssr: false }
);

type HeroProps = {
  settings: GlobalSettings | null;
};

const EASE = [0.22, 1, 0.36, 1] as const;

/**
 * Two-lane hero: supply chain analytics + AI engineering, with SAP S/4HANA exposure.
 * Badge states availability; subline states the two lanes; statement is the thesis;
 * proof bullets carry the evidence; BridgeGraph stays as the supporting process figure.
 */
export function Hero({ settings }: HeroProps) {
  const { locale, t } = useLocale();
  const prefersReducedMotion = useReducedMotion();
  const reduced = Boolean(prefersReducedMotion);
  const [simulatorOpen, setSimulatorOpen] = useState(false);

  const displayName = settings?.display_name?.trim() || PROFILE.name;
  const cvUrl = settings?.cv_file_url?.trim();
  const contactEmail = settings?.email?.trim();
  const parts = displayName.split(/\s+/);
  const first = parts[0] ?? displayName;
  const rest = parts.slice(1).join(' ');

  const badge = pick(PROFILE.badge, locale);
  const subline = pick(PROFILE.hero.subline, locale);
  const statement = pick(PROFILE.hero.statement, locale);
  const proof = PROFILE.hero.proof[locale];

  const enter = (delay: number, y = 18) =>
    reduced
      ? { initial: false as const }
      : {
          initial: { opacity: 0, y },
          animate: { opacity: 1, y: 0 },
          transition: { duration: 0.55, delay, ease: EASE },
        };

  return (
    <section
      className="page-container relative flex flex-col justify-center min-h-[100dvh] py-10 sm:py-14"
      id="home"
    >
      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] gap-12 lg:gap-16 items-center">
        <div className="space-y-8">
          <motion.div {...enter(0.02, 10)}>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-on-surface-variant">
              <span className="inline-flex items-center gap-2 font-medium text-secondary">
                <span className="h-2 w-2 rounded-full bg-secondary" aria-hidden="true" />
                {badge}
              </span>
            </div>
          </motion.div>

          <motion.h1 className="type-hero max-w-[12ch]" {...enter(0.08)}>
            <span className="block">{first}</span>
            {rest ? <span className="block text-on-surface/90">{rest}</span> : null}
          </motion.h1>

          <motion.p
            className="text-[1.2rem] sm:text-[1.45rem] md:text-[1.6rem] font-semibold tracking-tight leading-snug text-primary max-w-[30ch]"
            {...enter(0.16, 14)}
          >
            {subline}
          </motion.p>

          <motion.p
            className="text-[1.05rem] sm:text-[1.15rem] leading-relaxed text-on-surface max-w-[40ch] font-medium"
            {...enter(0.22, 12)}
          >
            {statement}
          </motion.p>

          <motion.ul
            className="grid gap-2 max-w-md"
            {...enter(0.28, 10)}
            aria-label={t('a11y.experienceHighlights')}
          >
            {proof.map((item) => (
              <li
                key={item}
                className="flex gap-3 text-[0.9rem] sm:text-[0.95rem] text-on-surface border-l-2 border-primary/50 pl-3"
              >
                {item}
              </li>
            ))}
          </motion.ul>

          <motion.div
            className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-3 pt-2"
            {...enter(0.34, 10)}
          >
            {cvUrl ? (
              <a
                className="btn-primary min-h-12 px-7 py-3.5 rounded-md text-base font-semibold inline-flex items-center justify-center gap-2 w-full sm:w-auto transition-transform duration-150 active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
                href={cvUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                <span className="material-symbols-outlined text-[20px]">download</span>
                {t('common.downloadCv')}
              </a>
            ) : contactEmail ? (
              <a
                className="btn-primary min-h-12 px-7 py-3.5 rounded-md text-base font-semibold inline-flex items-center justify-center gap-2 w-full sm:w-auto transition-transform duration-150 active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
                href={`mailto:${contactEmail}`}
              >
                {t('common.emailMe')}
              </a>
            ) : null}

            <a
              className="btn-secondary min-h-12 px-6 py-3.5 rounded-md text-base font-semibold inline-flex items-center justify-center gap-2 w-full sm:w-auto transition-transform duration-150 active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
              href="#projects"
            >
              {t('hero.seeWork')}
              <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
            </a>
          </motion.div>
        </div>

        <motion.div className="space-y-3 lg:pt-4" {...enter(0.18, 22)}>
          <BridgeGraph />
          <button
            type="button"
            onClick={() => setSimulatorOpen(true)}
            className="w-full inline-flex items-center justify-center gap-2 rounded-md border border-white/12 px-4 py-3 text-sm font-medium text-on-surface transition-colors hover:border-primary/50 hover:bg-primary/[0.06] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
          >
            <span className="material-symbols-outlined text-[18px] text-primary">open_in_full</span>
            {t('hero.openLab')}
          </button>
        </motion.div>
      </div>

      {simulatorOpen ? <P2PSimulator isOpen onClose={() => setSimulatorOpen(false)} /> : null}
    </section>
  );
}
