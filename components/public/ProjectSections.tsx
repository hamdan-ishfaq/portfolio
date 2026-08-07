'use client';

import { ProjectCard } from './ProjectCard';
import { PORTFOLIO_CASE_STUDIES } from '@/lib/content/portfolio';
import { SectionHeader } from '@/components/public/SectionHeader';
import { StaggerItem } from '@/components/ui/StaggerItem';
import { useLocale } from '@/components/providers/LocaleProvider';

/**
 * Homepage case studies use curated static content for the SAP rebrand
 * so recruiters always see honest, approved copy — independent of CMS drafts.
 */
export function ProjectSections() {
  const { t } = useLocale();
  const featured = PORTFOLIO_CASE_STUDIES.filter((p) => p.published).sort(
    (a, b) => a.order - b.order
  );

  return (
    <section className="page-container section-block section-band relative" id="projects">
      <SectionHeader
        index="05 — Case studies"
        title={
          <>
            {t('projects.titleBefore')}{' '}
            <span className="type-accent-serif">{t('projects.titleAccent')}</span>
            {t('projects.titleAfter')}
          </>
        }
        lead={t('projects.lead')}
        aside={
          <p className="font-mono text-[11px] uppercase tracking-[0.18em]">
            {String(featured.length).padStart(2, '0')} {t('projects.caseStudies')}
          </p>
        }
      />

      <div className="space-y-8 sm:space-y-10">
        {featured.map((project, i) => (
          <StaggerItem key={project.id} index={i}>
            <ProjectCard project={project} tier={project.tier as 0 | 1} index={i} />
          </StaggerItem>
        ))}
      </div>
    </section>
  );
}
