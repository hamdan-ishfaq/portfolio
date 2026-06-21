'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useTransition } from 'react';
import { logoutAction } from '@/lib/actions/auth';
import { ToastProvider } from '@/components/ui/Toast';
import { useLocale } from '@/components/providers/LocaleProvider';
import { LanguageToggle } from '@/components/ui/LanguageToggle';

type NavLink = {
  label: string;
  href: string;
  icon: string;
  fill?: boolean;
  badge?: number;
  badgeVariant?: 'error' | 'accent';
};

type AdminShellProps = {
  children: React.ReactNode;
  pendingComments: number;
  unreadInbox: number;
};

function NavItem({
  link,
  pathname,
  onNavigate,
}: {
  link: NavLink;
  pathname: string;
  onNavigate?: () => void;
}) {
  const isActive =
    link.href === '/admin'
      ? pathname === '/admin' || pathname === '/admin/dashboard'
      : pathname === link.href || pathname.startsWith(`${link.href}/`);

  return (
    <Link
      href={link.href}
      onClick={onNavigate}
      className={`admin-nav-item ${isActive ? 'admin-nav-item--active' : ''}`}
    >
      <span
        className="material-symbols-outlined"
        style={link.fill && isActive ? { fontVariationSettings: "'FILL' 1" } : undefined}
      >
        {link.icon}
      </span>
      <span className="truncate">{link.label}</span>
      {link.badge !== undefined && link.badge > 0 && (
        <span
          className={`admin-nav-badge ${
            link.badgeVariant === 'error' ? 'admin-nav-badge--error' : 'admin-nav-badge--accent'
          }`}
        >
          {link.badge}
        </span>
      )}
    </Link>
  );
}

function SidebarBrand() {
  const { t } = useLocale();
  return (
    <div className="admin-sidebar__brand">
      <div className="admin-sidebar__mark">
        <span className="material-symbols-outlined text-[20px]">hub</span>
      </div>
      <div className="min-w-0">
        <p className="admin-sidebar__title">
          {t('admin.consoleBefore')}{' '}
          <span className="type-accent-serif">{t('admin.consoleAccent')}</span>
        </p>
        <p className="admin-sidebar__subtitle">{t('admin.subtitle')}</p>
      </div>
    </div>
  );
}

export function AdminShell({ children, pendingComments, unreadInbox }: AdminShellProps) {
  const { t } = useLocale();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();
  const [mobileOpen, setMobileOpen] = useState(false);

  const navLinks: NavLink[] = [
    { label: t('admin.dashboard'), href: '/admin', icon: 'dashboard', fill: true },
    { label: t('admin.projects'), href: '/admin/projects', icon: 'folder_open' },
    {
      label: t('admin.comments'),
      href: '/admin/comments',
      icon: 'chat_bubble',
      badge: pendingComments || undefined,
      badgeVariant: 'error',
    },
    { label: t('admin.timeline'), href: '/admin/timeline', icon: 'timeline' },
    {
      label: t('admin.inbox'),
      href: '/admin/inbox',
      icon: 'inbox',
      badge: unreadInbox || undefined,
      badgeVariant: 'accent',
    },
    { label: t('admin.cvUpload'), href: '/admin/cv', icon: 'upload_file' },
  ];

  const handleLogout = () => {
    startTransition(async () => {
      await logoutAction();
    });
  };

  const sidebarFooter = (onNavigate?: () => void) => (
    <div className="admin-sidebar__footer">
      <Link
        href="/"
        onClick={onNavigate}
        className="btn-secondary w-full py-2 px-4 rounded-lg text-sm font-medium flex items-center justify-center gap-2"
      >
        <span className="material-symbols-outlined text-[18px]">open_in_new</span>
        {t('admin.viewSite')}
      </Link>
      <button
        type="button"
        onClick={handleLogout}
        disabled={isPending}
        className="btn-ghost w-full py-2 px-4 rounded-lg text-sm flex items-center justify-center gap-2 border border-transparent hover:border-error/20 hover:text-error disabled:opacity-50"
      >
        <span className="material-symbols-outlined text-[18px]">logout</span>
        {isPending ? t('admin.signingOut') : t('admin.logout')}
      </button>
    </div>
  );

  const sidebarNav = (onNavigate?: () => void) => (
    <nav className="admin-nav" aria-label="Admin navigation">
      {navLinks.map((link) => (
        <NavItem key={link.href} link={link} pathname={pathname} onNavigate={onNavigate} />
      ))}
      <NavItem
        link={{ label: t('admin.settings'), href: '/admin/settings', icon: 'settings' }}
        pathname={pathname}
        onNavigate={onNavigate}
      />
    </nav>
  );

  return (
    <ToastProvider>
      <div className="admin-shell font-body-base">
        <header className="admin-topbar">
          <div className="min-w-0">
            <p className="admin-sidebar__title truncate">
              {t('admin.consoleBefore')}{' '}
              <span className="type-accent-serif">{t('admin.consoleAccent')}</span>
            </p>
            <p className="admin-sidebar__subtitle">{t('admin.subtitle')}</p>
          </div>
          <div className="flex items-center gap-2">
            <LanguageToggle />
            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              aria-label={t('common.openMenu')}
              className="btn-secondary min-h-10 min-w-10 flex items-center justify-center rounded-lg p-2"
            >
              <span className="material-symbols-outlined">menu</span>
            </button>
          </div>
        </header>

        <aside className="admin-sidebar">
          <SidebarBrand />
          {sidebarNav()}
          {sidebarFooter()}
        </aside>

        {mobileOpen && (
          <div className="fixed inset-0 z-[70] md:hidden">
            <div className="admin-drawer-backdrop" onClick={() => setMobileOpen(false)} />
            <aside className="admin-drawer">
              <div className="flex items-center justify-between mb-4">
                <p className="admin-sidebar__title">{t('admin.menu')}</p>
                <button
                  type="button"
                  onClick={() => setMobileOpen(false)}
                  aria-label="Close menu"
                  className="btn-ghost p-1 rounded-lg"
                >
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>
              {sidebarNav(() => setMobileOpen(false))}
              {sidebarFooter(() => setMobileOpen(false))}
            </aside>
          </div>
        )}

        <main className="admin-main">{children}</main>
      </div>
    </ToastProvider>
  );
}
