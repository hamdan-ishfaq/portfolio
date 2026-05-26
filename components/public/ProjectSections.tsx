'use client';

import { ProjectCard } from './ProjectCard';
import type { Project } from '@/types';

type ProjectSectionsProps = {
  projects: Project[];
};

export function ProjectSections({ projects }: ProjectSectionsProps) {
  // Filter only published projects
  const publishedProjects = projects.filter((p) => p.published);

  const tier0 = publishedProjects.filter((p) => p.tier === 0);
  const tier1 = publishedProjects.filter((p) => p.tier === 1);
  const tier2 = publishedProjects.filter((p) => p.tier === 2);
  const tier3 = publishedProjects.filter((p) => p.tier === 3);

  const featured = [...tier0, ...tier1].sort((a, b) => a.order - b.order);

  const hasProjects = publishedProjects.length > 0;

  return (
    <section className="page-container py-12 sm:py-20 relative" id="projects">
      <div className="absolute top-0 right-0 w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 sm:mb-16 gap-4">
        <div>
          <h2 className="font-headline-md text-headline-md text-on-surface mb-2 flex items-center gap-3">
            <span className="material-symbols-outlined text-secondary">apps</span> Selected Works
          </h2>
          <p className="text-on-surface-variant font-body-base max-w-prose">
            A showcase of production-ready ML systems, agentic architectures, and open-source
            contributions.
          </p>
        </div>
      </div>

      {!hasProjects && (
        <div className="glass-card rounded-xl p-10 text-center border border-white/10">
          <div className="w-14 h-14 rounded-full bg-surface-container-highest border border-white/10 flex items-center justify-center mx-auto mb-4">
            <span className="material-symbols-outlined text-primary text-[28px]">folder_open</span>
          </div>
          <h3 className="font-headline-md text-headline-md text-on-surface mb-2">
            Projects are loading
          </h3>
          <p className="text-on-surface-variant font-body-base max-w-prose mx-auto">
            Portfolio projects will appear here once the database is populated. The section is ready
            for Tier 1 to Tier 3 layouts.
          </p>
        </div>
      )}

      {hasProjects && (
        <>
          {/* Featured Projects (Tier 0 & 1) */}
          {featured.length > 0 && (
            <div className="space-y-12 mb-24">
              {featured.map((project) => (
                <ProjectCard key={project.id} project={project} tier={project.tier as 0 | 1} />
              ))}
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
            {/* Tier 2: Specialized Solutions */}
            {tier2.length > 0 && (
              <div className="lg:col-span-2">
                <h3 className="font-body-base text-lg font-semibold text-on-surface mb-8 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
                  Specialized Solutions
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {tier2.map((project) => (
                    <ProjectCard key={project.id} project={project} tier={2} />
                  ))}
                </div>
              </div>
            )}

            {/* Tier 3: Experiments & Scripts */}
            {tier3.length > 0 && (
              <div className="lg:col-span-1">
                <h3 className="font-body-base text-lg font-semibold text-on-surface mb-8 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-secondary"></span>
                  Experiments &amp; Scripts
                </h3>
                <div className="glass-card rounded-xl p-6">
                  <div className="flex flex-col gap-2">
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
