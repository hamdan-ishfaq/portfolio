'use server';

import { z } from 'zod';
import { adminSupabase } from '@/lib/supabase/admin';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { verifyAdminSession } from '@/lib/auth/verify-session';
import { checkRateLimit, hashIp } from '@/lib/rate-limit';
import { logAuditEvent } from '@/lib/audit';
import { revalidatePath } from 'next/cache';
import { headers } from 'next/headers';
import type { ProjectComment } from '@/types';

const CommentSchema = z.object({
  author_name: z.string().min(1).max(100),
  content: z.string().min(20).max(1000),
});

export async function submitComment(projectId: string, formData: z.infer<typeof CommentSchema>) {
  const headersList = await headers();
  const ip = headersList.get('x-forwarded-for') ?? 'unknown';

  const rateCheck = await checkRateLimit(ip, 'comment', 3, 3600, 3600);
  if (!rateCheck.allowed) return { success: false, error: 'rate_limited' as const };

  const parsed = CommentSchema.safeParse(formData);
  if (!parsed.success) return { success: false, error: 'validation_failed' as const };

  const { error } = await adminSupabase.from('project_comments').insert([
    {
      project_id: projectId,
      ...parsed.data,
      status: 'pending',
      ip_hash: hashIp(ip),
    },
  ]);

  if (error) return { success: false, error: 'db_error' as const };
  return { success: true };
}

export async function getApprovedComments(projectId: string): Promise<ProjectComment[]> {
  const supabase = await createServerSupabaseClient();

  const { data, error } = await supabase
    .from('project_comments')
    .select('*')
    .eq('project_id', projectId)
    .eq('status', 'approved')
    .order('created_at', { ascending: false });

  if (error) return [];
  return (data || []) as ProjectComment[];
}

export async function getAllPendingComments(): Promise<ProjectComment[]> {
  await verifyAdminSession();

  const { data, error } = await adminSupabase
    .from('project_comments')
    .select('*')
    .eq('status', 'pending')
    .order('created_at', { ascending: true });

  if (error) return [];
  return (data || []) as ProjectComment[];
}

export async function approveComment(commentId: string, projectSlug: string) {
  const decoded = await verifyAdminSession();

  const { error } = await adminSupabase
    .from('project_comments')
    .update({ status: 'approved' })
    .eq('id', commentId);

  if (error) return { success: false, error: error.message };

  await logAuditEvent({
    event: 'comment_approved',
    adminUid: decoded.uid,
    metadata: { commentId },
  });
  revalidatePath(`/projects/${projectSlug}`);
  return { success: true };
}

export async function rejectComment(commentId: string) {
  const decoded = await verifyAdminSession();

  const { error } = await adminSupabase
    .from('project_comments')
    .update({ status: 'rejected' })
    .eq('id', commentId);

  if (error) return { success: false, error: error.message };

  await logAuditEvent({
    event: 'comment_deleted',
    adminUid: decoded.uid,
    metadata: { commentId, action: 'rejected' },
  });
  return { success: true };
}

export async function bulkUpdateCommentStatus(
  commentIds: string[],
  status: 'approved' | 'rejected',
  projectSlugs: string[]
) {
  await verifyAdminSession();

  if (commentIds.length === 0) return { success: true };

  const { error } = await adminSupabase
    .from('project_comments')
    .update({ status })
    .in('id', commentIds);

  if (error) return { success: false, error: error.message };

  for (const slug of [...new Set(projectSlugs)]) {
    revalidatePath(`/projects/${slug}`);
  }

  return { success: true };
}

export async function deleteComment(commentId: string) {
  const decoded = await verifyAdminSession();

  const { error } = await adminSupabase.from('project_comments').delete().eq('id', commentId);

  if (error) return { success: false, error: error.message };

  await logAuditEvent({ event: 'comment_deleted', adminUid: decoded.uid, metadata: { commentId } });
  return { success: true };
}
