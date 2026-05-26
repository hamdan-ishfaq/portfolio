'use client';

import Link from 'next/link';
import type { Project } from '@/types';
import { TechBadge } from '@/components/ui/Badge';

type ProjectCardProps = {
  project: Project;
  tier: 0 | 1 | 2 | 3;
};

export function ProjectCard({ project, tier }: ProjectCardProps) {
  // Flagship / Tier 1 (Large Featured Card)
  if (tier === 0 || tier === 1) {
    return (
      <div className="glass-card rounded-2xl overflow-hidden hover-glow transition-all duration-300 group flex flex-col md:flex-row">
        {project.cover_image_url && (
          <div className="md:w-1/2 relative overflow-hidden aspect-video md:aspect-auto">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={project.cover_image_url}
              alt={project.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent md:bg-gradient-to-r md:from-transparent md:to-background"></div>
          </div>
        )}
        <div
          className={`p-8 md:p-10 flex flex-col justify-center ${project.cover_image_url ? 'md:w-1/2' : 'w-full'}`}
        >
          <div className="flex items-center gap-3 mb-4">
            {project.is_ongoing && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                Ongoing
              </span>
            )}
            <span className="text-xs font-code-base text-primary uppercase tracking-wider">
              {tier === 0 ? 'Flagship' : 'Tier 1'}
            </span>
          </div>
          <h3 className="text-2xl md:text-3xl font-bold text-on-surface mb-3 group-hover:text-primary transition-colors">
            {project.title}
          </h3>
          <p className="text-on-surface-variant mb-6 line-clamp-3">{project.short_description}</p>
          <div className="flex flex-wrap gap-2 mb-8">
            {project.tech_stack.slice(0, 4).map((tech) => (
              <TechBadge key={tech.tag} tag={tech.tag} category={tech.category} />
            ))}
            {project.tech_stack.length > 4 && (
              <span className="text-xs text-on-surface-variant px-2 py-1 flex items-center">
                +{project.tech_stack.length - 4} more
              </span>
            )}
          </div>
          <div className="mt-auto">
            <Link
              href={`/projects/${project.slug}`}
              className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:text-secondary transition-colors"
            >
              Explore Architecture
              <svg
                className="w-4 h-4 group-hover:translate-x-1 transition-transform"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3"
                />
              </svg>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Tier 2 (Standard Grid Card)
  if (tier === 2) {
    return (
      <Link
        href={`/projects/${project.slug}`}
        className="glass-card rounded-xl p-6 hover-glow transition-all duration-300 group flex flex-col h-full"
      >
        <h3 className="text-xl font-bold text-on-surface mb-2 group-hover:text-primary transition-colors">
          {project.title}
        </h3>
        <p className="text-sm text-on-surface-variant mb-6 line-clamp-2 flex-grow">
          {project.short_description}
        </p>
        <div className="flex flex-wrap gap-2 mb-4">
          {project.tech_stack.slice(0, 3).map((tech) => (
            <TechBadge key={tech.tag} tag={tech.tag} category={tech.category} />
          ))}
        </div>
      </Link>
    );
  }

  // Tier 3 (Compact List Item)
  return (
    <Link
      href={`/projects/${project.slug}`}
      className="flex items-center justify-between py-4 border-b border-white/5 hover:bg-white/5 px-4 -mx-4 rounded-lg transition-colors group"
    >
      <div>
        <h4 className="text-base font-semibold text-on-surface group-hover:text-primary transition-colors">
          {project.title}
        </h4>
        <p className="text-xs text-on-surface-variant line-clamp-1 mt-1">
          {project.short_description}
        </p>
      </div>
      <svg
        className="w-5 h-5 text-on-surface-variant group-hover:text-primary opacity-0 group-hover:opacity-100 transition-all transform group-hover:translate-x-1"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={2}
        stroke="currentColor"
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
      </svg>
    </Link>
  );
}
