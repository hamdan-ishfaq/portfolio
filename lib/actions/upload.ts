'use server';

import { adminSupabase } from '@/lib/supabase/admin';
import { verifyAdminSession } from '@/lib/auth/verify-session';
import { logAuditEvent } from '@/lib/audit';

export async function uploadAdminFile(
  formData: FormData,
  bucket: string,
  path: string
): Promise<{ success: true; url: string } | { success: false; error: string }> {
  const { uid } = await verifyAdminSession();

  const file = formData.get('file');
  if (!(file instanceof File)) {
    return { success: false, error: 'No file provided' };
  }

  const { error } = await adminSupabase.storage
    .from(bucket)
    .upload(path, file, { upsert: true, contentType: file.type });

  if (error) return { success: false, error: error.message };

  const { data } = adminSupabase.storage.from(bucket).getPublicUrl(path);

  if (bucket === 'cv') {
    await logAuditEvent({ event: 'cv_uploaded', adminUid: uid });
  }

  return { success: true, url: data.publicUrl };
}
