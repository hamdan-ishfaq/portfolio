'use client';

import { useState, useEffect } from 'react';
import type { GlobalSettings } from '@/types';

type NavbarProps = {
  settings: GlobalSettings | null;
};

export function Navbar({ settings }: NavbarProps) {
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
      const sections = ['home', 'projects', 'contact'];
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
    const html = document.documentElement;
    const next = html.classList.toggle('dark');
    localStorage.setItem('theme', next ? 'dark' : 'light');
    setIsDark(next);
  }

  const navLinks = [
    { label: 'Home', href: '#home', id: 'home' },
    { label: 'Projects', href: '#projects', id: 'projects' },
    { label: 'Contact', href: '#contact', id: 'contact' },
  ];

  const brandName = settings?.display_name ?? 'AIEngineer.io';

  return (
    <>
      {/* Exactly matches Stitch: bg-surface/70 backdrop-blur-xl border-b border-white/5 fixed top-0 w-full z-50 */}
      <header className="bg-surface/70 backdrop-blur-xl border-b border-white/5 fixed top-0 w-full z-50">
        <nav
          className="page-container flex justify-between items-center gap-3 py-3 sm:py-md"
          aria-label="Main navigation"
        >
          <a
            href="#home"
            className="font-display-lg tracking-tighter text-on-surface text-lg sm:text-2xl font-bold hover:text-primary transition-colors truncate min-w-0 max-w-[55vw] sm:max-w-none"
          >
            {brandName}
          </a>

          {/* Desktop nav — matches Stitch: hidden md:flex items-center space-x-lg font-body-base text-body-base */}
          <div className="hidden md:flex items-center space-x-lg font-body-base text-body-base">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className={
                  activeSection === link.id
                    ? 'text-primary font-bold border-b-2 border-primary pb-1'
                    : 'text-on-surface-variant hover:text-primary transition-all duration-200'
                }
              >
                {link.label}
              </a>
            ))}
          </div>

          {/* Right controls — matches Stitch: flex items-center space-x-md */}
          <div className="flex items-center gap-2 sm:gap-md shrink-0">
            {/* Dark mode toggle — Stitch uses material-symbols-outlined dark_mode */}
            <button
              type="button"
              onClick={toggleTheme}
              aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
              className="text-on-surface-variant hover:text-primary transition-colors p-sm"
            >
              <span
                className="material-symbols-outlined"
                style={{ fontVariationSettings: "'FILL' 0" }}
              >
                {isDark ? 'light_mode' : 'dark_mode'}
              </span>
            </button>

            {/* Download CV — Stitch: hidden md:inline-flex btn-primary px-4 py-2 rounded-lg font-body-sm text-body-sm font-semibold */}
            <a
              href={settings?.cv_file_url || '#'}
              target={settings?.cv_file_url ? '_blank' : undefined}
              rel="noopener noreferrer"
              id="navbar-cv-download"
              className="hidden md:inline-flex btn-primary px-4 py-2 rounded-lg font-body-sm text-body-sm font-semibold"
            >
              Download CV
            </a>

            {/* Mobile menu button — Stitch uses material-symbols-outlined menu */}
            <button
              type="button"
              onClick={() => setMobileOpen((o) => !o)}
              aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={mobileOpen}
              className="md:hidden text-on-surface-variant p-sm"
            >
              <span className="material-symbols-outlined">{mobileOpen ? 'close' : 'menu'}</span>
            </button>
          </div>
        </nav>
      </header>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-[60] md:hidden" onClick={() => setMobileOpen(false)}>
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" aria-hidden="true" />
          <nav
            className="absolute top-0 right-0 w-64 h-full glass-panel flex flex-col pt-20 px-lg gap-lg"
            onClick={(e) => e.stopPropagation()}
            aria-label="Mobile navigation"
          >
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className={`font-body-base text-body-base py-sm border-b border-white/5 ${
                  activeSection === link.id
                    ? 'text-primary font-bold'
                    : 'text-on-surface hover:text-primary transition-colors'
                }`}
              >
                {link.label}
              </a>
            ))}
            <a
              href={settings?.cv_file_url || '#'}
              target={settings?.cv_file_url ? '_blank' : undefined}
              rel="noopener noreferrer"
              className="btn-primary px-md py-sm rounded-lg font-body-sm text-body-sm font-semibold text-center mt-sm"
            >
              Download CV
            </a>
          </nav>
        </div>
      )}
    </>
  );
}
