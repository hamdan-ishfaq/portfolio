import { adminSupabase } from '@/lib/supabase/admin';
import { verifyAdminSession } from '@/lib/auth/verify-session';
import { TimelineClientWrapper } from './TimelineClientWrapper';
import type { TimelineEvent } from '@/types';

export default async function AdminTimelinePage() {
  await verifyAdminSession();

  const { data, error } = await adminSupabase
    .from('timeline_events')
    .select('*')
    .order('order', { ascending: true })
    .order('start_date', { ascending: false });

  if (error) console.error(error);

  return <TimelineClientWrapper initialEvents={(data ?? []) as TimelineEvent[]} />;
}
