'use server';

import { adminSupabase } from '@/lib/supabase/admin';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { verifyAdminSession } from '@/lib/auth/verify-session';
import { logAuditEvent } from '@/lib/audit';
import { revalidatePath } from 'next/cache';
import type { GlobalSettings } from '@/types';

export async function getGlobalSettings(): Promise<GlobalSettings | null> {
  const supabase = await createServerSupabaseClient();

  const { data, error } = await supabase.from('settings').select('*').single();

  if (error) {
    console.error(error);
    return null;
  }
  return data as GlobalSettings;
}

export async function updateGlobalSettings(formData: Partial<GlobalSettings>) {
  const decoded = await verifyAdminSession();

  const { data: existing } = await adminSupabase.from('settings').select('id').single();

  if (!existing) return { success: false, error: 'No settings record found' };

  const { error } = await adminSupabase
    .from('settings')
    .update({ ...formData, updated_at: new Date().toISOString() })
    .eq('id', existing.id);

  if (error) return { success: false, error: error.message };

  await logAuditEvent({ event: 'settings_updated', adminUid: decoded.uid });
  revalidatePath('/');
  return { success: true };
}
