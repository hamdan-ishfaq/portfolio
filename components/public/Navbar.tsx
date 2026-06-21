'use client';

import { useState, useEffect } from 'react';
import type { GlobalSettings } from '@/types';
import { useLocale } from '@/components/providers/LocaleProvider';
import { LanguageToggle } from '@/components/ui/LanguageToggle';
import { persistTheme, type ThemePreference } from '@/lib/preferences';

type NavbarProps = {
  settings: GlobalSettings | null;
};

export function Navbar({ settings }: NavbarProps) {
  const { t } = useLocale();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isDark, setIsDark] = useState(true);
  const [activeSection, setActiveSection] = useState('home');

  useEffect(() => {
    const syncTheme = () => {
      setIsDark(document.documentElement.classList.contains('dark'));
    };
    syncTheme();
    const observer = new MutationObserver(syncTheme);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const handler = () => {
      const sections = ['home', 'projects', 'experience', 'contact'];
      for (const id of sections) {
        const el = document.getElementById(id);
        if (el) {
          const rect = el.getBoundingClientRect();
          if (rect.top <= 100 && rect.bottom > 100) {
            setActiveSection(id);
            break;
          }
        }
      }
    };
    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  }, []);

  useEffect(() => {
    const handler = () => {
      if (window.innerWidth >= 768) setMobileOpen(false);
    };
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);

  function toggleTheme() {
    const nextDark = !document.documentElement.classList.contains('dark');
    const theme: ThemePreference = nextDark ? 'dark' : 'light';
    persistTheme(theme);
    setIsDark(nextDark);
  }

  const navLinks = [
    { label: t('nav.work'), href: '#projects', id: 'projects' },
    { label: t('nav.experience'), href: '#experience', id: 'experience' },
    { label: t('nav.contact'), href: '#contact', id: 'contact' },
  ];

  const brandName = settings?.display_name?.trim() || 'Hamdan Ishfaq';
  const cvUrl = settings?.cv_file_url?.trim();

  return (
    <>
      <header className="fixed top-0 w-full z-50 border-b border-white/8 backdrop-blur-xl supports-[padding:max(0px)]:pt-[env(safe-area-inset-top)] bg-[var(--ds-nav-bg)]">
        <nav
          className="page-container flex justify-between items-center gap-3 py-3 sm:py-4"
          aria-label="Main navigation"
        >
          <a
            href="#home"
            className="font-sans text-base sm:text-lg font-semibold text-on-surface hover:text-primary transition-colors truncate min-w-0 max-w-[55vw] sm:max-w-none tracking-tight"
          >
            {brandName}
          </a>

          <div className="hidden md:flex items-center gap-8 font-body-sm text-body-sm">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className={
                  activeSection === link.id
                    ? 'text-on-surface font-medium'
                    : 'text-on-surface-variant hover:text-on-surface transition-colors'
                }
              >
                {link.label}
              </a>
            ))}
          </div>

          <div className="flex items-center gap-1 sm:gap-2 shrink-0">
            <LanguageToggle className="hidden sm:inline-flex" />

            <button
              type="button"
              onClick={toggleTheme}
              aria-label={isDark ? t('common.switchToLight') : t('common.switchToDark')}
              className="min-h-11 min-w-11 flex items-center justify-center text-on-surface-variant hover:text-on-surface transition-colors rounded-lg"
            >
              <span className="material-symbols-outlined text-[20px]">
                {isDark ? 'light_mode' : 'dark_mode'}
              </span>
            </button>

            {cvUrl ? (
              <a
                href={cvUrl}
                target="_blank"
                rel="noopener noreferrer"
                id="navbar-cv-download"
                className="hidden md:inline-flex btn-primary min-h-11 px-4 py-2 rounded-lg font-body-sm text-body-sm font-semibold"
              >
                {t('common.cv')}
              </a>
            ) : null}

            <button
              type="button"
              onClick={() => setMobileOpen((o) => !o)}
              aria-label={mobileOpen ? t('common.closeMenu') : t('common.openMenu')}
              aria-expanded={mobileOpen}
              className="md:hidden min-h-11 min-w-11 flex items-center justify-center text-on-surface-variant rounded-lg"
            >
              <span className="material-symbols-outlined">{mobileOpen ? 'close' : 'menu'}</span>
            </button>
          </div>
        </nav>
      </header>

      {mobileOpen && (
        <div className="fixed inset-0 z-[60] md:hidden" onClick={() => setMobileOpen(false)}>
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" aria-hidden="true" />
          <nav
            className="absolute top-0 right-0 w-[min(100vw,18rem)] h-full glass-panel flex flex-col pt-20 px-6 gap-1 border-l border-white/10"
            onClick={(e) => e.stopPropagation()}
            aria-label="Mobile navigation"
          >
            <div className="mb-4 sm:hidden">
              <LanguageToggle />
            </div>
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className={`min-h-11 flex items-center font-body-base text-body-base border-b border-white/5 ${
                  activeSection === link.id
                    ? 'text-on-surface font-medium'
                    : 'text-on-surface-variant hover:text-on-surface transition-colors'
                }`}
              >
                {link.label}
              </a>
            ))}
            {cvUrl ? (
              <a
                href={cvUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary min-h-11 px-4 py-2.5 rounded-lg font-body-sm text-body-sm font-semibold text-center mt-4"
              >
                {t('common.downloadCv')}
              </a>
            ) : null}
          </nav>
        </div>
      )}
    </>
  );
}
