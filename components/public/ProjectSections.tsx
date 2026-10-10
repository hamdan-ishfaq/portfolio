'use client';

import { ProjectCard } from './ProjectCard';
import { SectionHeader } from '@/components/public/SectionHeader';
import { StaggerItem } from '@/components/ui/StaggerItem';
import { useLocale } from '@/components/providers/LocaleProvider';
import { PROFILE, getCaseStudies } from '@/lib/content/profile';

/**
 * Homepage case studies resolve from the bilingual profile source of truth,
 * so recruiters always see honest, approved copy — independent of CMS drafts.
 */
export function ProjectSections() {
  const { locale, t } = useLocale();
  const featured = getCaseStudies(locale);
  const section = PROFILE.caseStudies;

  return (
    <section className="page-container section-block section-band relative" id="projects">
      <SectionHeader
        title={
          <>
            {section.titleBefore[locale]}{' '}
            <span className="type-accent-serif">{section.titleAccent[locale]}</span>
            {section.titleAfter[locale]}
          </>
        }
        lead={section.lead[locale]}
        aside={
          <p className="font-mono text-[11px] uppercase tracking-[0.18em]">
            {String(featured.length).padStart(2, '0')} {t('projects.caseStudies')}
          </p>
        }
      />

      <div className="space-y-8 sm:space-y-10">
        {featured.map((project, i) => (
          <StaggerItem key={project.id} index={i}>
            <ProjectCard project={project} tier={project.tier} index={i} />
          </StaggerItem>
        ))}
      </div>
    </section>
  );
}
