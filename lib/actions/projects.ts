'use server';

import { z } from 'zod';
import { adminSupabase } from '@/lib/supabase/admin';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { verifyAdminSession } from '@/lib/auth/verify-session';
import { logAuditEvent } from '@/lib/audit';
import { revalidatePath } from 'next/cache';
import type { Project } from '@/types';

// ── Zod Schema ─────────────────────────────────────────
const ProjectFormSchema = z.object({
  title: z.string().min(1).max(200),
  slug: z
    .string()
    .min(1)
    .max(200)
    .regex(/^[a-z0-9-]+$/),
  short_description: z.string().max(300).optional(),
  full_description: z.string().optional(),
  cover_image_url: z.string().nullable().optional(),
  tech_stack: z.array(z.object({ tag: z.string(), category: z.string() })).optional(),
  github_repo: z.string().nullable().optional(),
  loom_video_id_demo: z.string().nullable().optional(),
  loom_video_id_arch: z.string().nullable().optional(),
  linkedin_url: z.string().nullable().optional(),
  live_demo_url: z.string().nullable().optional(),
  project_start_date: z.string().nullable().optional(),
  project_end_date: z.string().nullable().optional(),
  is_ongoing: z.boolean().optional(),
  project_status: z.enum(['active', 'completed', 'archived']).optional(),
  tier: z.union([z.literal(0), z.literal(1), z.literal(2), z.literal(3)]),
  order: z.number().optional(),
  featured: z.boolean().optional(),
  published: z.boolean().optional(),
});

// ── Public Queries ─────────────────────────────────────

export async function getPublishedProjects(tier?: 0 | 1 | 2 | 3): Promise<Project[]> {
  const supabase = await createServerSupabaseClient();

  let query = supabase.from('projects').select('*').eq('published', true);

  if (tier !== undefined) {
    query = query.eq('tier', tier);
  }

  const { data, error } = await query.order('order', { ascending: true });
  if (error) {
    console.error(error);
    return [];
  }
  return (data || []) as Project[];
}

export async function getProjectBySlug(slug: string): Promise<Project | null> {
  const supabase = await createServerSupabaseClient();

  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('slug', slug)
    .eq('published', true)
    .single();

  if (error) return null;
  return data as Project;
}

export async function getAllProjectSlugs(): Promise<{ slug: string }[]> {
  const supabase = await createServerSupabaseClient();

  const { data, error } = await supabase.from('projects').select('slug').eq('published', true);

  if (error) return [];
  return data || [];
}

// ── Admin Queries ──────────────────────────────────────

export async function getAllProjectsAdmin(): Promise<Project[]> {
  await verifyAdminSession();
  const { data, error } = await adminSupabase
    .from('projects')
    .select('*')
    .order('order', { ascending: true });

  if (error) throw error;
  return (data || []) as Project[];
}

export async function getProjectByIdAdmin(id: string): Promise<Project | null> {
  await verifyAdminSession();

  const { data, error } = await adminSupabase.from('projects').select('*').eq('id', id).single();

  if (error) return null;
  return data as Project;
}

export async function upsertProject(
  formData: z.infer<typeof ProjectFormSchema>,
  projectId?: string
) {
  const decoded = await verifyAdminSession();

  const parsed = ProjectFormSchema.safeParse(formData);
  if (!parsed.success) return { success: false, error: 'validation_failed' };

  const payload = { ...parsed.data, updated_at: new Date().toISOString() };

  if (projectId) {
    const { data: existing } = await adminSupabase
      .from('projects')
      .select('tier, slug')
      .eq('id', projectId)
      .single();

    const { error } = await adminSupabase.from('projects').update(payload).eq('id', projectId);

    if (error) return { success: false, error: error.message };

    if (existing && existing.tier !== parsed.data.tier) {
      await logAuditEvent({
        event: 'project_tier_changed',
        adminUid: decoded.uid,
        metadata: { projectId, fromTier: existing.tier, toTier: parsed.data.tier },
      });
    } else {
      await logAuditEvent({
        event: 'project_updated',
        adminUid: decoded.uid,
        metadata: { projectId },
      });
    }

    revalidatePath('/');
    revalidatePath(`/projects/${existing?.slug}`);
    return { success: true, projectId };
  } else {
    const { data, error } = await adminSupabase
      .from('projects')
      .insert([payload])
      .select('id')
      .single();

    if (error) return { success: false, error: error.message };
    await logAuditEvent({
      event: 'project_created',
      adminUid: decoded.uid,
      metadata: { projectId: data.id },
    });
    revalidatePath('/');
    revalidatePath(`/projects/${parsed.data.slug}`);
    return { success: true, projectId: data.id };
  }
}

export async function changeProjectTier(projectId: string, newTier: 0 | 1 | 2 | 3) {
  const decoded = await verifyAdminSession();

  const { data: existing } = await adminSupabase
    .from('projects')
    .select('tier')
    .eq('id', projectId)
    .single();

  const { error } = await adminSupabase
    .from('projects')
    .update({ tier: newTier, updated_at: new Date().toISOString() })
    .eq('id', projectId);

  if (error) return { success: false, error: error.message };

  await logAuditEvent({
    event: 'project_tier_changed',
    adminUid: decoded.uid,
    metadata: { projectId, fromTier: existing?.tier, toTier: newTier },
  });

  revalidatePath('/');
  return { success: true };
}

export async function toggleProjectPublished(projectId: string, published: boolean) {
  const decoded = await verifyAdminSession();

  const { data: existing } = await adminSupabase
    .from('projects')
    .select('slug')
    .eq('id', projectId)
    .single();

  const { error } = await adminSupabase
    .from('projects')
    .update({ published, updated_at: new Date().toISOString() })
    .eq('id', projectId);

  if (error) return { success: false, error: error.message };

  await logAuditEvent({
    event: 'project_updated',
    adminUid: decoded.uid,
    metadata: { projectId, slug: existing?.slug, published },
  });

  revalidatePath('/');
  revalidatePath('/admin/projects');
  if (existing?.slug) {
    revalidatePath(`/projects/${existing.slug}`);
  }

  return { success: true };
}

export async function deleteProject(projectId: string) {
  const decoded = await verifyAdminSession();

  const { data: existing } = await adminSupabase
    .from('projects')
    .select('slug')
    .eq('id', projectId)
    .single();

  const { error } = await adminSupabase.from('projects').delete().eq('id', projectId);

  if (error) return { success: false, error: error.message };

  await logAuditEvent({ event: 'project_deleted', adminUid: decoded.uid, metadata: { projectId } });
  revalidatePath('/');
  revalidatePath('/admin/projects');
  if (existing?.slug) {
    revalidatePath(`/projects/${existing.slug}`);
  }
  return { success: true };
}
