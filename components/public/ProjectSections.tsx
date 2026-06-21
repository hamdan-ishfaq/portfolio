'use client';

import { ProjectCard } from './ProjectCard';
import type { Project } from '@/types';
import { StaggerItem } from '@/components/ui/StaggerItem';
import { FadeIn } from '@/components/ui/FadeIn';
import { useLocale } from '@/components/providers/LocaleProvider';

type ProjectSectionsProps = {
  projects: Project[];
};

export function ProjectSections({ projects }: ProjectSectionsProps) {
  const { t } = useLocale();
  const publishedProjects = projects.filter((p) => p.published);

  const tier0 = publishedProjects.filter((p) => p.tier === 0);
  const tier1 = publishedProjects.filter((p) => p.tier === 1);
  const tier2 = publishedProjects.filter((p) => p.tier === 2);
  const tier3 = publishedProjects.filter((p) => p.tier === 3);

  const featured = [...tier0, ...tier1].sort((a, b) => a.order - b.order);

  const hasProjects = publishedProjects.length > 0;

  return (
    <section className="page-container section-block relative" id="projects">
      <div className="section-divider mb-12 sm:mb-16" />

      <FadeIn>
        <div className="mb-10 sm:mb-14 max-w-2xl">
          <p className="type-label mb-4">{t('projects.label')}</p>
          <h2 className="type-section mb-4">
            {t('projects.titleBefore')}{' '}
            <span className="type-accent-serif">{t('projects.titleAccent')}</span>
            {t('projects.titleAfter')}
          </h2>
          <p className="type-lead">{t('projects.lead')}</p>
        </div>
      </FadeIn>

      {!hasProjects && (
        <div className="glass-card rounded-2xl p-10 sm:p-12 text-center border border-white/10 max-w-xl">
          <p className="type-label mb-3">{t('projects.emptyLabel')}</p>
          <h3 className="type-card-title mb-3">{t('projects.emptyTitle')}</h3>
          <p className="type-lead mx-auto text-center">{t('projects.emptyLead')}</p>
        </div>
      )}

      {hasProjects && (
        <>
          {featured.length > 0 && (
            <div className="space-y-10 sm:space-y-14 mb-16 sm:mb-20">
              {featured.map((project, i) => (
                <StaggerItem key={project.id} index={i}>
                  <ProjectCard project={project} tier={project.tier as 0 | 1} />
                </StaggerItem>
              ))}
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
            {tier2.length > 0 && (
              <div className="lg:col-span-2">
                <p className="type-label mb-6">{t('projects.moreBuilds')}</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
                  {tier2.map((project, i) => (
                    <StaggerItem key={project.id} index={i}>
                      <ProjectCard project={project} tier={2} />
                    </StaggerItem>
                  ))}
                </div>
              </div>
            )}

            {tier3.length > 0 && (
              <div className="lg:col-span-1">
                <p className="type-label mb-6">{t('projects.experiments')}</p>
                <div className="glass-card rounded-xl p-4 sm:p-5 border border-white/10">
                  <div className="flex flex-col">
                    {tier3.map((project) => (
                      <ProjectCard key={project.id} project={project} tier={3} />
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </section>
  );
}
