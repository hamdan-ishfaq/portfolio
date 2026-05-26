'use client';

import Link from 'next/link';
import { useState } from 'react';
import { MarkdownRenderer } from '@/components/ui/MarkdownRenderer';
import { DevlogBadge, StatusBadge, TechBadge, TierBadge } from '@/components/ui/Badge';
import { Tabs } from '@/components/ui/Tabs';
import { DemoRequestModal } from '@/components/public/DemoRequestModal';
import { ProjectCommentForm } from '@/components/public/ProjectCommentForm';
import { LoomVideo } from '@/components/public/LoomVideo';
import { parseLoomVideoId } from '@/lib/loom';
import { formatDate } from '@/lib/format-date';
import type { Project, ProjectComment, DevlogEntry } from '@/types';

type ProjectClientWrapperProps = {
  project: Project;
  comments: ProjectComment[];
  devlogs: DevlogEntry[];
};

export function ProjectClientWrapper({ project, comments, devlogs }: ProjectClientWrapperProps) {
  const [demoModalOpen, setDemoModalOpen] = useState(false);
  const loomVideoId =
    parseLoomVideoId(project.loom_video_id_demo) ?? parseLoomVideoId(project.loom_video_id_arch);

  return (
    <div className="bg-background text-on-background min-h-screen selection:bg-primary-container/30 selection:text-primary-fixed antialiased flex flex-col font-body-base">
      <nav className="w-full border-b border-white/5 bg-surface/70 backdrop-blur-xl sticky top-0 z-40">
        <div className="page-container py-3 sm:py-md flex justify-between items-center gap-3">
          <Link
            className="inline-flex items-center gap-xs text-on-surface-variant hover:text-primary transition-colors duration-200 group font-label-caps text-label-caps min-w-0"
            href="/"
          >
            <span className="material-symbols-outlined text-[18px] shrink-0 group-hover:-translate-x-1 transition-transform">
              arrow_back
            </span>
            <span className="truncate">Back to Home</span>
          </Link>
          <div className="hidden sm:block font-code-base text-code-base text-on-surface-variant/50 truncate">
            /projects/{project.slug}
          </div>
        </div>
      </nav>

      <main id="main-content" className="flex-grow pt-6 sm:pt-xl pb-12 sm:pb-2xl w-full">
        <header className="page-container mb-10 sm:mb-2xl space-y-4 sm:space-y-lg">
          <div className="flex flex-wrap items-center gap-2 text-sm">
            <StatusBadge status={project.project_status} />
            <TierBadge tier={project.tier} />
          </div>

          <div className="space-y-3 sm:space-y-md">
            <h1 className="font-display-lg-mobile md:font-display-lg text-display-lg-mobile md:text-display-lg text-on-surface">
              {project.title}
            </h1>
            <p className="font-body-base text-body-base text-on-surface-variant max-w-2xl">
              {project.short_description}
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            {project.tech_stack.map((tech) => (
              <TechBadge key={tech.tag} tag={tech.tag} category={tech.category} />
            ))}
          </div>

          <div className="flex flex-col sm:flex-row flex-wrap gap-2 sm:gap-sm">
            <button
              type="button"
              onClick={() => setDemoModalOpen(true)}
              className="inline-flex w-full sm:w-auto items-center justify-center gap-sm px-lg py-3 sm:py-sm rounded-lg bg-gradient-to-r from-primary-container to-secondary-container shadow-[inset_0_1px_0_rgba(255,255,255,0.2)] text-on-primary-container font-label-caps text-label-caps hover:scale-[1.02] transition-transform duration-200 ease-out"
            >
              <span className="material-symbols-outlined text-[18px]">play_circle</span>
              Request Live Demo
            </button>
            {project.github_repo && (
              <a
                href={project.github_repo}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex w-full sm:w-auto items-center justify-center gap-xs px-md py-3 sm:py-sm rounded-lg bg-transparent border border-outline-variant text-on-surface-variant hover:text-on-surface hover:bg-surface-container hover:border-outline transition-all duration-200 font-label-caps text-label-caps"
              >
                <span className="material-symbols-outlined text-[18px]">code</span>
                GitHub
              </a>
            )}
            {project.live_demo_url && (
              <a
                href={project.live_demo_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex w-full sm:w-auto items-center justify-center gap-xs px-md py-3 sm:py-sm rounded-lg bg-transparent border border-outline-variant text-on-surface-variant hover:text-on-surface hover:bg-surface-container hover:border-outline transition-all duration-200 font-label-caps text-label-caps"
              >
                <span className="material-symbols-outlined text-[18px]">open_in_new</span>
                Live Demo
              </a>
            )}
            {project.linkedin_url && (
              <a
                href={project.linkedin_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex w-full sm:w-auto items-center justify-center gap-xs px-md py-3 sm:py-sm rounded-lg bg-transparent border border-outline-variant text-on-surface-variant hover:text-on-surface hover:bg-surface-container hover:border-outline transition-all duration-200 font-label-caps text-label-caps"
              >
                <span className="material-symbols-outlined text-[18px]">link</span>
                LinkedIn
              </a>
            )}
          </div>
        </header>

        <section className="page-container mb-10 sm:mb-2xl">
          {loomVideoId ? (
            <LoomVideo videoId={loomVideoId} title={`${project.title} demo`} />
          ) : (
            <div className="aspect-video glass-panel rounded-xl relative overflow-hidden flex items-center justify-center bg-gradient-to-br from-surface-container-low to-surface-container-lowest">
              <div className="text-center px-6 space-y-3">
                <span className="material-symbols-outlined text-4xl text-on-surface-variant">
                  videocam_off
                </span>
                <p className="text-sm text-on-surface-variant">Demo video coming soon.</p>
                <button
                  type="button"
                  onClick={() => setDemoModalOpen(true)}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary-container text-on-primary-container text-sm font-semibold hover:opacity-90 transition-opacity"
                >
                  Request a live walkthrough
                </button>
              </div>
            </div>
          )}
        </section>

        <section className="page-container">
          <Tabs
            defaultTab="overview"
            tabs={[
              {
                id: 'overview',
                label: 'Overview',
                content: (
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-xl">
                    <div className="lg:col-span-2 min-w-0">
                      <MarkdownRenderer content={project.full_description} className="max-w-none" />
                    </div>
                    <div className="space-y-4 sm:space-y-md">
                      <div className="glass-card p-4 sm:p-lg rounded-xl flex flex-col gap-sm">
                        <h3 className="font-label-caps text-label-caps text-on-surface-variant uppercase tracking-wider">
                          Status
                        </h3>
                        <p className="font-body-base text-body-base text-on-surface capitalize">
                          {project.project_status}
                        </p>
                      </div>
                      <div className="glass-card p-4 sm:p-lg rounded-xl flex flex-col gap-sm">
                        <h3 className="font-label-caps text-label-caps text-on-surface-variant uppercase tracking-wider">
                          Timeline
                        </h3>
                        <p className="font-body-base text-body-base text-on-surface">
                          {project.project_start_date
                            ? formatDate(project.project_start_date)
                            : 'Started'}
                          {project.is_ongoing
                            ? ' - Present'
                            : project.project_end_date
                              ? ` - ${formatDate(project.project_end_date)}`
                              : ''}
                        </p>
                      </div>
                    </div>
                  </div>
                ),
              },
              {
                id: 'devlog',
                label: 'Devlog',
                content: (
                  <div className="max-w-3xl space-y-8 sm:space-y-xl relative">
                    <div className="absolute left-[15px] md:left-[23px] top-4 bottom-0 w-[2px] bg-outline-variant/30" />
                    {devlogs.length === 0 ? (
                      <div className="pl-10 sm:pl-xl md:pl-2xl text-on-surface-variant">
                        No updates yet.
                      </div>
                    ) : (
                      devlogs.map((update, index) => (
                        <div
                          key={update.id}
                          className="relative pl-10 sm:pl-xl md:pl-2xl flex gap-3 sm:gap-md"
                        >
                          <div
                            className={`absolute left-[9px] md:left-[17px] top-1 w-[14px] h-[14px] rounded-full bg-surface border-2 z-10 ${index === 0 ? 'border-primary shadow-[0_0_8px_rgba(14,165,233,0.5)]' : 'border-tertiary'}`}
                          />
                          <div className="flex-grow space-y-sm min-w-0">
                            <div className="flex flex-wrap items-center gap-sm">
                              <DevlogBadge type={update.type} />
                              <span className="font-label-caps text-[10px] text-on-surface-variant">
                                {formatDate(update.entry_date || update.created_at)}
                              </span>
                            </div>
                            <div className="glass-card p-4 sm:p-md rounded-xl">
                              <h3 className="font-headline-md text-body-base font-semibold text-on-surface mb-xs">
                                {update.title}
                              </h3>
                              <MarkdownRenderer
                                content={update.content}
                                className="text-on-surface-variant"
                              />
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                ),
              },
              {
                id: 'discussion',
                label: 'Discussion',
                content: (
                  <div className="max-w-3xl space-y-6 sm:space-y-xl">
                    <ProjectCommentForm projectId={project.id} />
                    <div className="space-y-4 sm:space-y-md">
                      {comments.length === 0 ? (
                        <div className="text-on-surface-variant">No comments yet.</div>
                      ) : (
                        comments.map((comment) => (
                          <div key={comment.id} className="flex gap-3 sm:gap-md">
                            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-surface-container-highest flex-shrink-0 border border-white/10 flex items-center justify-center text-on-surface-variant">
                              <span className="material-symbols-outlined text-[20px]">
                                account_circle
                              </span>
                            </div>
                            <div className="flex-grow min-w-0">
                              <div className="glass-card p-4 sm:p-md rounded-xl rounded-tl-none">
                                <div className="flex flex-wrap justify-between items-center gap-2 mb-xs">
                                  <span className="font-headline-md text-[14px] text-on-surface">
                                    {comment.author_name}
                                  </span>
                                  <span className="font-label-caps text-[10px] text-on-surface-variant">
                                    {formatDate(comment.created_at)}
                                  </span>
                                </div>
                                <p className="font-body-sm text-body-sm text-on-surface-variant break-words">
                                  {comment.content}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                ),
              },
            ]}
          />
        </section>
      </main>

      <DemoRequestModal
        isOpen={demoModalOpen}
        onClose={() => setDemoModalOpen(false)}
        projectId={project.id}
        projectTitle={project.title}
      />
    </div>
  );
}
