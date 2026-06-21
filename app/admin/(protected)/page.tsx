import { verifyAdminSession } from '@/lib/auth/verify-session';
import { adminSupabase } from '@/lib/supabase/admin';
import { AdminDashboardClient } from './AdminDashboardClient';

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
      labelKey: 'admin.projects',
      value: projectsRes.count ?? 0,
      icon: 'folder_open',
      iconClass: 'text-primary',
    },
    {
      labelKey: 'admin.comments',
      value: commentsRes.count ?? 0,
      icon: 'chat_bubble',
      iconClass: 'text-error',
    },
    {
      labelKey: 'admin.inbox',
      value: inboxRes.count ?? 0,
      icon: 'inbox',
      iconClass: 'text-secondary',
    },
    {
      labelKey: 'admin.demoRequests',
      value: demosRes.count ?? 0,
      icon: 'waving_hand',
      iconClass: 'text-tertiary',
    },
  ];

  return <AdminDashboardClient stats={stats} />;
}
