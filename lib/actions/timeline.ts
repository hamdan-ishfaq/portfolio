'use server';

import { adminSupabase } from '@/lib/supabase/admin';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { verifyAdminSession } from '@/lib/auth/verify-session';
import { revalidatePath } from 'next/cache';
import type { TimelineEvent } from '@/types';

export async function getTimelineEvents(): Promise<TimelineEvent[]> {
  const supabase = await createServerSupabaseClient();

  const { data, error } = await supabase
    .from('timeline_events')
    .select('*')
    .order('start_date', { ascending: false });

  if (error) {
    console.error(error);
    return [];
  }
  return (data || []) as TimelineEvent[];
}

export async function upsertTimelineEvent(formData: Partial<TimelineEvent>, eventId?: string) {
  await verifyAdminSession();

  const payload = { ...formData, updated_at: new Date().toISOString() };

  if (eventId) {
    const { error } = await adminSupabase.from('timeline_events').update(payload).eq('id', eventId);
    if (error) return { success: false, error: error.message };
  } else {
    const { error } = await adminSupabase.from('timeline_events').insert([payload]);
    if (error) return { success: false, error: error.message };
  }

  revalidatePath('/');
  return { success: true };
}

export async function deleteTimelineEvent(eventId: string) {
  await verifyAdminSession();

  const { error } = await adminSupabase.from('timeline_events').delete().eq('id', eventId);

  if (error) return { success: false, error: error.message };
  revalidatePath('/');
  return { success: true };
}
