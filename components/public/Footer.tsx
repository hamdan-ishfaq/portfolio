import type { GlobalSettings } from '@/types';

type FooterProps = {
  settings: GlobalSettings | null;
};

export function Footer({ settings }: FooterProps) {
  const year = new Date().getFullYear();
  const brandName = settings?.display_name ?? 'AIEngineer.io';

  return (
    <footer className="bg-surface-container-lowest py-10 sm:py-xl border-t border-white/5 mt-12 sm:mt-2xl">
      <div className="page-container flex flex-col gap-6 md:flex-row md:justify-between md:items-center">
        <p className="font-body-sm text-body-sm text-on-surface-variant text-center md:text-left">
          © {year} {brandName}
        </p>

        <div className="flex items-center justify-center flex-wrap gap-4 sm:gap-md">
          {settings?.github && (
            <a
              className="text-on-surface-variant hover:text-secondary transition-colors font-body-sm text-body-sm"
              href={settings.github}
              target="_blank"
              rel="noopener noreferrer"
            >
              GitHub
            </a>
          )}
          {settings?.linkedin && (
            <a
              className="text-on-surface-variant hover:text-secondary transition-colors font-body-sm text-body-sm"
              href={settings.linkedin}
              target="_blank"
              rel="noopener noreferrer"
            >
              LinkedIn
            </a>
          )}
          {settings?.twitter && (
            <a
              className="text-on-surface-variant hover:text-secondary transition-colors font-body-sm text-body-sm"
              href={settings.twitter}
              target="_blank"
              rel="noopener noreferrer"
            >
              Twitter
            </a>
          )}
        </div>

        <div className="font-label-caps text-label-caps text-on-surface text-center md:text-right">
          {brandName}
        </div>
      </div>
    </footer>
  );
}
