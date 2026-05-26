import { verifyAdminSession } from '@/lib/auth/verify-session';
import { adminSupabase } from '@/lib/supabase/admin';
import { AdminShell } from '@/components/admin/AdminShell';

export default async function AdminProtectedLayout({ children }: { children: React.ReactNode }) {
  await verifyAdminSession();

  const [commentsRes, inboxRes] = await Promise.all([
    adminSupabase
      .from('project_comments')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'pending'),
    adminSupabase
      .from('contact_submissions')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'unread'),
  ]);

  return (
    <AdminShell pendingComments={commentsRes.count ?? 0} unreadInbox={inboxRes.count ?? 0}>
      {children}
    </AdminShell>
  );
}
