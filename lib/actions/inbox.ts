'use server';

import { adminSupabase } from '@/lib/supabase/admin';
import { verifyAdminSession } from '@/lib/auth/verify-session';
import type { ContactSubmission, DemoRequest } from '@/types';

export type DemoRequestWithProject = DemoRequest & {
  project_title: string;
};

export async function getContactSubmissionsAdmin(): Promise<ContactSubmission[]> {
  await verifyAdminSession();

  const { data, error } = await adminSupabase
    .from('contact_submissions')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error(error);
    return [];
  }
  return (data ?? []) as ContactSubmission[];
}

export async function updateContactSubmissionStatus(
  id: string,
  status: ContactSubmission['status']
) {
  await verifyAdminSession();

  const { error } = await adminSupabase.from('contact_submissions').update({ status }).eq('id', id);

  if (error) return { success: false, error: error.message };
  return { success: true };
}

export async function getDemoRequestsAdmin(): Promise<DemoRequestWithProject[]> {
  await verifyAdminSession();

  const { data, error } = await adminSupabase
    .from('demo_requests')
    .select(
      `
      *,
      projects ( title )
    `
    )
    .order('created_at', { ascending: false });

  if (error) {
    console.error(error);
    return [];
  }

  type Row = DemoRequest & { projects: { title: string } | null };

  return (data as Row[]).map(({ projects, ...row }) => ({
    ...row,
    project_title: projects?.title ?? 'Unknown project',
  }));
}

export async function updateDemoRequestStatus(id: string, status: DemoRequest['status']) {
  await verifyAdminSession();

  const { error } = await adminSupabase.from('demo_requests').update({ status }).eq('id', id);

  if (error) return { success: false, error: error.message };
  return { success: true };
}
