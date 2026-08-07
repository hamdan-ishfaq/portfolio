'use client';

import Link from 'next/link';
import type { Project } from '@/types';
import type { PortfolioCaseStudy } from '@/lib/content/portfolio';
import { TechBadge } from '@/components/ui/Badge';
import { useLocale } from '@/components/providers/LocaleProvider';

type ProjectCardProps = {
  project: Project | PortfolioCaseStudy;
  tier: 0 | 1 | 2 | 3;
  index?: number;
};

function getMetrics(project: Project | PortfolioCaseStudy): string[] {
  if ('metrics' in project && Array.isArray(project.metrics)) return project.metrics;
  return [];
}

function getCredit(project: Project | PortfolioCaseStudy): string | undefined {
  if ('credit' in project && typeof project.credit === 'string') return project.credit;
  return undefined;
}

export function ProjectCard({ project, tier, index = 0 }: ProjectCardProps) {
  const { t } = useLocale();
  const metrics = getMetrics(project);
  const credit = getCredit(project);
  const href = `/projects/${project.slug}`;

  if (tier === 0 || tier === 1) {
    const hasImage = Boolean(project.cover_image_url);
    return (
      <article className="lab-frame rounded-lg overflow-hidden group relative">
        <div className="grid md:grid-cols-[auto_1fr] relative">
          <div className="flex items-center md:items-start gap-4 px-6 pt-6 md:py-10 md:pl-8 md:pr-0">
            <span
              className="leading-none text-on-surface-variant/40 tabular-nums text-[2.5rem] md:text-[3.25rem] font-semibold"
              aria-hidden="true"
            >
              {String(index + 1).padStart(2, '0')}
            </span>
          </div>

          <div className="p-6 md:p-10 md:pl-8 flex flex-col">
            <div className="flex flex-wrap items-center gap-3 mb-4">
              <span className="type-label text-primary">
                {tier === 0 ? t('projects.featured') : t('projects.caseStudy')}
              </span>
              {project.is_ongoing ? (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-secondary/15 text-secondary border border-secondary/25">
                  <span className="w-1.5 h-1.5 rounded-full bg-secondary" />
                  {t('common.ongoing')}
                </span>
              ) : null}
            </div>

            <h3 className="type-card-title mb-3">
              <Link href={href} className="hover:text-primary transition-colors">
                {project.title}
              </Link>
            </h3>

            <p className="text-on-surface-variant mb-5 max-w-[68ch] leading-relaxed">
              {project.short_description}
            </p>

            {credit ? (
              <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-on-surface-variant mb-5">
                {credit}
              </p>
            ) : null}

            {metrics.length > 0 ? (
              <ul className="mb-6 grid gap-2 border-y border-white/10 py-3">
                {metrics.map((metric) => (
                  <li
                    key={metric}
                    className="flex items-start gap-3 py-1.5 text-sm text-on-surface"
                  >
                    <span className="mt-2 h-px w-4 shrink-0 bg-primary/60" aria-hidden="true" />
                    <span className="leading-relaxed">{metric}</span>
                  </li>
                ))}
              </ul>
            ) : null}

            {hasImage ? (
              <div className="relative mb-6 rounded-md overflow-hidden border border-white/10 aspect-[16/7]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={project.cover_image_url ?? ''}
                  alt={project.title}
                  className="w-full h-full object-cover"
                />
              </div>
            ) : null}

            <div className="flex flex-wrap gap-2 mb-6">
              {(project.tech_stack || []).slice(0, 6).map((tech) => (
                <TechBadge key={tech.tag} tag={tech.tag} category={tech.category} />
              ))}
            </div>

            <div className="mt-auto pt-4 border-t border-white/10 flex flex-wrap gap-4">
              <Link
                href={href}
                className="inline-flex items-center gap-2 text-sm font-semibold text-on-surface hover:text-primary transition-colors"
              >
                {t('projects.viewCaseStudy')}
                <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
              </Link>
              {project.live_demo_url ? (
                <a
                  href={project.live_demo_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-sm font-semibold text-on-surface-variant hover:text-on-surface transition-colors"
                >
                  {t('projectPage.liveDemo')}
                  <span className="material-symbols-outlined text-[16px]">open_in_new</span>
                </a>
              ) : null}
              {project.github_repo ? (
                <a
                  href={project.github_repo}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-sm font-semibold text-on-surface-variant hover:text-on-surface transition-colors"
                >
                  {t('common.github')}
                  <span className="material-symbols-outlined text-[16px]">code</span>
                </a>
              ) : null}
            </div>
          </div>
        </div>
      </article>
    );
  }

  if (tier === 2) {
    return (
      <Link
        href={href}
        className="lab-frame rounded-lg p-5 card-interactive group flex flex-col h-full"
      >
        <h3 className="type-card-title mb-2 group-hover:text-primary transition-colors text-xl">
          {project.title}
        </h3>
        <p className="text-sm text-on-surface-variant mb-5 line-clamp-3 flex-grow">
          {project.short_description}
        </p>
        <div className="flex flex-wrap gap-2">
          {(project.tech_stack || []).slice(0, 4).map((tech) => (
            <TechBadge key={tech.tag} tag={tech.tag} category={tech.category} />
          ))}
        </div>
      </Link>
    );
  }

  return (
    <Link
      href={href}
      className="flex items-center justify-between py-4 border-b border-white/8 hover:bg-white/[0.03] px-3 -mx-3 rounded-md transition-colors group"
    >
      <div>
        <h4 className="text-base font-semibold text-on-surface group-hover:text-primary transition-colors leading-snug">
          {project.title}
        </h4>
        <p className="text-xs text-on-surface-variant line-clamp-1 mt-1">
          {project.short_description}
        </p>
      </div>
      <span className="material-symbols-outlined text-[18px] text-on-surface-variant opacity-0 group-hover:opacity-100 transition-opacity">
        chevron_right
      </span>
    </Link>
  );
}
