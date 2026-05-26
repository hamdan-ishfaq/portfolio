'use server';

import { z } from 'zod';
import { adminSupabase } from '@/lib/supabase/admin';
import { checkRateLimit, hashIp } from '@/lib/rate-limit';
import { headers } from 'next/headers';
import { logAuditEvent } from '@/lib/audit';

const DemoRequestSchema = z.object({
  project_id: z.string().uuid(),
  name: z.string().min(1).max(100),
  email: z.string().email(),
  message: z.string().max(2000).optional().nullable(),
});

export async function submitDemoRequest(formData: z.infer<typeof DemoRequestSchema>) {
  const headersList = await headers();
  const ip = headersList.get('x-forwarded-for') ?? 'unknown';

  const rateCheck = await checkRateLimit(ip, 'demo_request', 3, 86400, 86400); // 3 per day
  if (!rateCheck.allowed) return { success: false, error: 'rate_limited' as const };

  const parsed = DemoRequestSchema.safeParse(formData);
  if (!parsed.success) return { success: false, error: 'validation_failed' as const };

  const { error } = await adminSupabase.from('demo_requests').insert([
    {
      ...parsed.data,
      status: 'pending',
      ip_hash: hashIp(ip),
    },
  ]);

  if (error) {
    console.error('[demo] insert error:', error);
    return { success: false, error: 'db_error' as const, message: error.message };
  }

  await logAuditEvent({
    event: 'demo_request_submitted',
    adminUid: null,
    ipHash: hashIp(ip),
    userAgent: headersList.get('user-agent') ?? '',
    metadata: { project_id: parsed.data.project_id },
  });

  return { success: true };
}
