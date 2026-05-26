'use client';

import type { GlobalSettings } from '@/types';
import { FadeIn } from '@/components/ui/FadeIn';

type HeroProps = {
  settings: GlobalSettings | null;
};

export function Hero({ settings }: HeroProps) {
  const firstName = settings?.display_name?.split(' ')[0] ?? 'Alex Chen';

  const techStack = [
    { icon: 'code', label: 'Python', hoverClass: 'group-hover:text-primary' },
    { icon: 'schema', label: 'PyTorch', hoverClass: 'group-hover:text-secondary' },
    { icon: 'database', label: 'PostgreSQL', hoverClass: 'group-hover:text-primary' },
    { icon: 'memory', label: 'CUDA', hoverClass: 'group-hover:text-secondary' },
    { icon: 'cloud', label: 'AWS', hoverClass: 'group-hover:text-primary' },
    { icon: 'box', label: 'Docker', hoverClass: 'group-hover:text-secondary' },
    { icon: 'api', label: 'FastAPI', hoverClass: 'group-hover:text-primary' },
    { icon: 'analytics', label: 'TensorFlow', hoverClass: 'group-hover:text-secondary' },
  ];

  return (
    /* Exactly matches Stitch: max-w-container-max mx-auto px-lg min-h-[921px] flex flex-col justify-center relative */
    <section
      className="page-container min-h-[70vh] sm:min-h-[80vh] lg:min-h-[921px] flex flex-col justify-center relative py-12 sm:py-0"
      id="home"
    >
      {/* Ambient glow blobs */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 right-1/4 w-[280px] sm:w-[500px] h-[280px] sm:h-[500px] bg-primary/5 rounded-full blur-[80px] sm:blur-[100px]"></div>
        <div className="absolute bottom-1/4 left-1/4 w-[220px] sm:w-[400px] h-[220px] sm:h-[400px] bg-secondary/5 rounded-full blur-[60px] sm:blur-[80px]"></div>
      </div>

      <div className="z-10 relative grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-2xl items-center">
        <FadeIn immediate>
          <div>
            <div className="inline-block px-3 py-1 rounded-full border border-white/10 bg-white/5 font-label-caps text-label-caps text-primary mb-4 sm:mb-md">
              AVAILABLE FOR HIRE
            </div>

            <h1 className="font-display-lg-mobile md:font-display-lg text-display-lg-mobile md:text-display-lg text-on-surface mb-3 sm:mb-sm">
              Hello, I&apos;m{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">
                {firstName}
              </span>
            </h1>

            <div className="font-code-base text-code-base text-secondary mb-6 sm:mb-lg min-h-[1.5rem]">
              <span className="typewriter inline-block max-w-full">
                {settings?.tagline ?? 'AI Engineer | Builder of Intelligent Systems_'}
              </span>
            </div>

            <p className="font-body-base text-body-base text-on-surface-variant mb-8 sm:mb-xl max-w-prose">
              {settings?.sub_headline ??
                'Architecting scalable machine learning pipelines and deploying state-of-the-art models for real-world impact. Specializing in LLMs, Computer Vision, and high-performance inference.'}
            </p>

            {/* Buttons — Stitch: flex flex-wrap gap-md */}
            <div className="flex flex-col sm:flex-row flex-wrap gap-3 sm:gap-md">
              <a
                className="btn-primary px-6 py-3 rounded-lg font-body-base font-semibold flex items-center justify-center gap-2 w-full sm:w-auto"
                href={settings?.cv_file_url || '#'}
                target={settings?.cv_file_url ? '_blank' : undefined}
                rel="noopener noreferrer"
              >
                {/* Stitch: material-symbols-outlined text-sm */}
                <span className="material-symbols-outlined text-sm">download</span>
                Download CV
              </a>

              {/* View Projects — Stitch: btn-secondary px-6 py-3 rounded-lg font-body-base font-semibold flex items-center gap-2 */}
              <a
                className="btn-secondary px-6 py-3 rounded-lg font-body-base font-semibold flex items-center justify-center gap-2 w-full sm:w-auto"
                href="#projects"
              >
                View Projects
                <span className="material-symbols-outlined text-sm">arrow_forward</span>
              </a>
            </div>
          </div>
        </FadeIn>

        <FadeIn immediate delay={0.15}>
          <div className="glass-card rounded-xl p-4 sm:p-lg relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-secondary"></div>

            <h3 className="font-label-caps text-label-caps text-on-surface-variant mb-4 sm:mb-md flex items-center gap-2">
              <span className="material-symbols-outlined text-sm">terminal</span>
              Tech Stack
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-sm">
              {techStack.map((tech) => (
                <div
                  key={tech.label}
                  className="aspect-square rounded-lg bg-surface-container flex flex-col items-center justify-center border border-white/5 hover-glow transition-all duration-300 cursor-default group"
                >
                  <span
                    className={`material-symbols-outlined text-on-surface-variant ${tech.hoverClass} text-2xl mb-1`}
                  >
                    {tech.icon}
                  </span>
                  <span className="text-[10px] text-on-surface-variant font-code-base">
                    {tech.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}
