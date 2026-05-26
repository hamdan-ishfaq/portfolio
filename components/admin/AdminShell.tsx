'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useTransition } from 'react';
import { logoutAction } from '@/lib/actions/auth';
import { ToastProvider } from '@/components/ui/Toast';

type NavLink = {
  label: string;
  href: string;
  icon: string;
  fill?: boolean;
  badge?: number;
  badgeClass?: string;
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
  const isActive = pathname === link.href || pathname.startsWith(`${link.href}/`);

  return (
    <Link
      href={link.href}
      onClick={onNavigate}
      className={
        isActive
          ? 'bg-secondary-container text-on-secondary-container rounded-lg font-semibold flex items-center gap-3 px-3 py-2 transition-colors duration-200'
          : 'text-on-surface-variant hover:bg-surface-container-high flex items-center gap-3 px-3 py-2 rounded-lg transition-colors duration-200 group'
      }
    >
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <span
          className={`material-symbols-outlined shrink-0 ${!isActive && 'group-hover:text-primary transition-colors'}`}
          style={link.fill && isActive ? { fontVariationSettings: "'FILL' 1" } : undefined}
        >
          {link.icon}
        </span>
        <span className="font-body-sm text-body-sm truncate">{link.label}</span>
      </div>
      {link.badge !== undefined && link.badge > 0 && (
        <span
          className={`${link.badgeClass} font-label-caps text-[10px] px-2 py-0.5 rounded-full shrink-0`}
        >
          {link.badge}
        </span>
      )}
    </Link>
  );
}

export function AdminShell({ children, pendingComments, unreadInbox }: AdminShellProps) {
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();
  const [mobileOpen, setMobileOpen] = useState(false);

  const navLinks: NavLink[] = [
    { label: 'Dashboard', href: '/admin', icon: 'dashboard', fill: true },
    { label: 'Projects', href: '/admin/projects', icon: 'folder_open' },
    {
      label: 'Comments',
      href: '/admin/comments',
      icon: 'chat_bubble',
      badge: pendingComments || undefined,
      badgeClass: 'bg-error text-on-error',
    },
    { label: 'Timeline', href: '/admin/timeline', icon: 'timeline' },
    {
      label: 'Inbox',
      href: '/admin/inbox',
      icon: 'inbox',
      badge: unreadInbox || undefined,
      badgeClass: 'bg-primary text-on-primary',
    },
    { label: 'CV Upload', href: '/admin/cv', icon: 'upload_file' },
  ];

  const handleLogout = () => {
    startTransition(async () => {
      await logoutAction();
    });
  };

  const sidebarContent = (onNavigate?: () => void) => (
    <>
      <nav className="flex-1 space-y-1 overflow-y-auto">
        {navLinks.map((link) => (
          <NavItem key={link.href} link={link} pathname={pathname} onNavigate={onNavigate} />
        ))}
        <Link
          href="/admin/settings"
          onClick={onNavigate}
          className="text-on-surface-variant hover:bg-surface-container-high flex items-center gap-3 px-3 py-2 rounded-lg transition-colors duration-200 group mt-4"
        >
          <span className="material-symbols-outlined group-hover:text-primary transition-colors">
            settings
          </span>
          <span className="font-body-sm text-body-sm">Settings</span>
        </Link>
      </nav>

      <div className="pt-4 mt-auto border-t border-white/5 space-y-2">
        <Link
          href="/"
          onClick={onNavigate}
          className="w-full bg-transparent border border-outline-variant text-on-surface font-body-sm text-body-sm py-2 px-4 rounded-lg hover:bg-primary/10 transition-colors flex items-center justify-center gap-2"
        >
          <span className="material-symbols-outlined text-[18px]">open_in_new</span>
          View Live Site
        </Link>
        <button
          type="button"
          onClick={handleLogout}
          disabled={isPending}
          className="w-full bg-transparent border border-outline-variant/50 text-on-surface-variant hover:text-error hover:border-error/30 font-body-sm text-body-sm py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
        >
          <span className="material-symbols-outlined text-[18px]">logout</span>
          {isPending ? 'Signing out…' : 'Logout'}
        </button>
      </div>
    </>
  );

  return (
    <ToastProvider>
      <div className="bg-background text-on-background min-h-screen flex flex-col md:flex-row font-body-base">
        {/* Mobile top bar */}
        <header className="md:hidden sticky top-0 z-50 bg-surface-container-low border-b border-white/5 px-4 py-3 flex items-center justify-between">
          <div className="min-w-0">
            <p className="font-headline-md text-primary truncate leading-none">Admin Console</p>
            <p className="font-label-caps text-[10px] text-on-surface-variant mt-1">
              System Overview
            </p>
          </div>
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            aria-label="Open admin menu"
            className="p-2 rounded-lg border border-white/10 text-on-surface-variant"
          >
            <span className="material-symbols-outlined">menu</span>
          </button>
        </header>

        {/* Desktop sidebar */}
        <aside className="bg-surface-container-low h-screen w-[240px] sticky left-0 top-0 border-r border-white/5 shadow-md flex-col p-md space-y-sm flex-shrink-0 z-40 hidden md:flex">
          <div className="mb-xl flex items-center gap-md px-2 pt-4">
            <div className="w-10 h-10 rounded-full bg-primary-container overflow-hidden flex-shrink-0 flex items-center justify-center text-on-primary-container">
              <span className="material-symbols-outlined">person</span>
            </div>
            <div className="min-w-0">
              <h1 className="font-headline-md text-headline-md text-primary truncate leading-none">
                Admin Console
              </h1>
              <p className="font-label-caps text-label-caps text-on-surface-variant mt-1">
                System Overview
              </p>
            </div>
          </div>
          {sidebarContent()}
        </aside>

        {/* Mobile drawer */}
        {mobileOpen && (
          <div className="fixed inset-0 z-[70] md:hidden">
            <div
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setMobileOpen(false)}
            />
            <aside className="absolute top-0 left-0 h-full w-[min(280px,85vw)] bg-surface-container-low border-r border-white/5 p-md flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <p className="font-headline-md text-primary">Menu</p>
                <button
                  type="button"
                  onClick={() => setMobileOpen(false)}
                  aria-label="Close menu"
                  className="p-1 text-on-surface-variant"
                >
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>
              {sidebarContent(() => setMobileOpen(false))}
            </aside>
          </div>
        )}

        <main className="flex-1 overflow-y-auto min-w-0">{children}</main>
      </div>
    </ToastProvider>
  );
}
