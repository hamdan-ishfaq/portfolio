import { createServerSupabaseClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export async function verifyAdminSession(): Promise<{ uid: string }> {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    redirect('/admin/login');
  }

  const adminUid = process.env.ADMIN_UID;
  if (adminUid && user.id !== adminUid) {
    redirect('/admin/login');
  }

  return { uid: user.id };
}
