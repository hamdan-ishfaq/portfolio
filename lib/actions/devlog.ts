'use server';

import { z } from 'zod';
import { adminSupabase } from '@/lib/supabase/admin';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { verifyAdminSession } from '@/lib/auth/verify-session';
import { logAuditEvent } from '@/lib/audit';
import { revalidatePath } from 'next/cache';
import type { DevlogEntry, DevlogEntryVersion } from '@/types';

const DevlogSchema = z.object({
  type: z.enum(['milestone', 'daily_log', 'issue', 'fix', 'architecture', 'reflection']),
  title: z.string().min(1).max(200),
  content: z.string(),
  entry_date: z.string(),
  linked_entry_id: z.string().nullable().optional(),
  published: z.boolean(),
});

export async function getDevlogEntries(
  projectId: string,
  adminView = false
): Promise<DevlogEntry[]> {
  if (adminView) {
    await verifyAdminSession();
  }

  const client = adminView ? adminSupabase : await createServerSupabaseClient();

  let query = client.from('devlog_entries').select('*').eq('project_id', projectId);

  if (!adminView) query = query.eq('published', true);

  const { data, error } = await query.order('entry_date', { ascending: true });
  if (error) return [];
  return (data || []) as DevlogEntry[];
}

export async function upsertDevlogEntry(
  projectId: string,
  formData: z.infer<typeof DevlogSchema>,
  entryId?: string
) {
  const decoded = await verifyAdminSession();

  const parsed = DevlogSchema.safeParse(formData);
  if (!parsed.success) {
    console.error('Validation failed for devlog entry:', parsed.error.format());
    return {
      success: false,
      error: `Validation failed: ${parsed.error.issues.map((e) => `${e.path.join('.')}: ${e.message}`).join(', ')}`,
    };
  }

  if (entryId) {
    // Auto-versioning: save snapshot of current content before overwriting
    const { data: current } = await adminSupabase
      .from('devlog_entries')
      .select('content')
      .eq('id', entryId)
      .single();

    if (current && current.content !== parsed.data.content) {
      // Count existing versions
      const { count } = await adminSupabase
        .from('devlog_versions')
        .select('*', { count: 'exact', head: true })
        .eq('entry_id', entryId);

      // Cap at 50 versions — delete oldest if over limit
      if (count && count >= 50) {
        const { data: oldest } = await adminSupabase
          .from('devlog_versions')
          .select('id')
          .eq('entry_id', entryId)
          .order('saved_at', { ascending: true })
          .limit(1)
          .single();

        if (oldest) {
          await adminSupabase.from('devlog_versions').delete().eq('id', oldest.id);
        }
      }

      // Save version snapshot
      await adminSupabase.from('devlog_versions').insert([
        {
          entry_id: entryId,
          content: current.content,
        },
      ]);
    }

    const { error } = await adminSupabase
      .from('devlog_entries')
      .update({ ...parsed.data, updated_at: new Date().toISOString() })
      .eq('id', entryId);

    if (error) return { success: false, error: error.message };
    await logAuditEvent({
      event: 'devlog_entry_updated',
      adminUid: decoded.uid,
      metadata: { entryId },
    });
  } else {
    const { error } = await adminSupabase
      .from('devlog_entries')
      .insert([{ ...parsed.data, project_id: projectId }]);

    if (error) return { success: false, error: error.message };
    await logAuditEvent({
      event: 'devlog_entry_created',
      adminUid: decoded.uid,
      metadata: { projectId },
    });
  }

  await revalidateProjectDevlog(projectId);
  return { success: true };
}

async function revalidateProjectDevlog(projectId: string) {
  const { data } = await adminSupabase.from('projects').select('slug').eq('id', projectId).single();
  if (data?.slug) {
    revalidatePath(`/projects/${data.slug}`);
  }
  revalidatePath('/');
}

export async function deleteDevlogEntry(entryId: string, projectId: string) {
  const decoded = await verifyAdminSession();

  const { error } = await adminSupabase.from('devlog_entries').delete().eq('id', entryId);

  if (error) return { success: false, error: error.message };

  await logAuditEvent({
    event: 'devlog_entry_deleted',
    adminUid: decoded.uid,
    metadata: { entryId },
  });
  await revalidateProjectDevlog(projectId);
  return { success: true };
}

export async function getDevlogVersions(entryId: string): Promise<DevlogEntryVersion[]> {
  await verifyAdminSession();

  const { data, error } = await adminSupabase
    .from('devlog_versions')
    .select('*')
    .eq('entry_id', entryId)
    .order('saved_at', { ascending: false });

  if (error) return [];
  return (data || []) as DevlogEntryVersion[];
}
