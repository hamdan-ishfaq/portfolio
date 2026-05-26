'use server';

import { createServerSupabaseClient } from '@/lib/supabase/server';
import { logAuditEvent } from '@/lib/audit';
import { checkRateLimit, hashIp } from '@/lib/rate-limit';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';

export async function loginAction(
  email: string,
  password: string
): Promise<{ success: false; error: 'rate_limited' | 'invalid_credentials' } | never> {
  const headersList = await headers();
  const ip = headersList.get('x-forwarded-for') ?? 'unknown';
  const userAgent = headersList.get('user-agent') ?? '';

  // Rate limit: 5 attempts per IP per 15 minutes
  const rateCheck = await checkRateLimit(ip, 'login', 5, 900, 900);
  if (!rateCheck.allowed) {
    await logAuditEvent({
      event: 'login_failure',
      ipHash: hashIp(ip),
      userAgent,
      metadata: { reason: 'rate_limited' },
    });
    return { success: false, error: 'rate_limited' as const };
  }

  const supabase = await createServerSupabaseClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    await logAuditEvent({
      event: 'login_failure',
      ipHash: hashIp(ip),
      userAgent,
      metadata: { reason: error.message },
    });
    return { success: false, error: 'invalid_credentials' as const };
  }

  await logAuditEvent({
    event: 'login_success',
    adminUid: process.env.ADMIN_UID ?? null,
    ipHash: hashIp(ip),
    userAgent,
  });

  redirect('/admin/dashboard');
}

export async function logoutAction() {
  const supabase = await createServerSupabaseClient();
  const headersList = await headers();
  const ip = headersList.get('x-forwarded-for') ?? 'unknown';

  await supabase.auth.signOut();
  await logAuditEvent({
    event: 'logout',
    adminUid: process.env.ADMIN_UID ?? null,
    ipHash: hashIp(ip),
  });

  redirect('/admin/login');
}
