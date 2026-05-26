import Link from 'next/link';
import { verifyAdminSession } from '@/lib/auth/verify-session';
import { adminSupabase } from '@/lib/supabase/admin';

export default async function AdminDashboardPage() {
  await verifyAdminSession();

  const [projectsRes, commentsRes, inboxRes, demosRes] = await Promise.all([
    adminSupabase.from('projects').select('id', { count: 'exact', head: true }),
    adminSupabase
      .from('project_comments')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'pending'),
    adminSupabase
      .from('contact_submissions')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'unread'),
    adminSupabase
      .from('demo_requests')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'pending'),
  ]);

  const stats = [
    {
      label: 'Total Projects',
      value: projectsRes.count ?? 0,
      icon: 'folder_open',
      iconClass: 'text-primary',
    },
    {
      label: 'Pending Comments',
      value: commentsRes.count ?? 0,
      icon: 'chat_bubble',
      iconClass: 'text-error',
    },
    {
      label: 'Unread Messages',
      value: inboxRes.count ?? 0,
      icon: 'inbox',
      iconClass: 'text-secondary',
    },
    {
      label: 'Demo Requests',
      value: demosRes.count ?? 0,
      icon: 'waving_hand',
      iconClass: 'text-tertiary',
    },
  ];

  return (
    <div className="max-w-[1200px] mx-auto p-md md:p-xl space-y-2xl">
      <section className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="font-display-lg-mobile md:font-display-lg text-display-lg-mobile md:text-display-lg text-on-surface tracking-tighter mb-2">
            Overview
          </h2>
          <p className="font-body-base text-body-base text-on-surface-variant">
            Here&apos;s what&apos;s happening with your portfolio today.
          </p>
        </div>
        <Link
          href="/admin/projects/new"
          className="bg-gradient-to-r from-primary to-secondary text-on-primary font-body-sm text-body-sm px-4 py-2 rounded-lg border-t border-white/20 hover:scale-[1.02] transition-transform"
        >
          New Project
        </Link>
      </section>

      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-md">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="bg-surface-container-high/70 backdrop-blur-[16px] border border-white/10 rounded-xl p-lg flex flex-col relative overflow-hidden"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="w-10 h-10 rounded-lg bg-surface-container flex items-center justify-center border border-white/5">
                <span className={`material-symbols-outlined ${stat.iconClass}`}>{stat.icon}</span>
              </div>
            </div>
            <h3 className="font-body-sm text-body-sm text-on-surface-variant mb-1">{stat.label}</h3>
            <p className="font-headline-md text-[32px] font-bold text-on-surface leading-none">
              {stat.value}
            </p>
          </div>
        ))}
      </section>
    </div>
  );
}
