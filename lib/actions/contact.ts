'use server';

import { z } from 'zod';
import { adminSupabase } from '@/lib/supabase/admin';
import { checkRateLimit, hashIp } from '@/lib/rate-limit';
import { headers } from 'next/headers';

const ContactSchema = z.object({
  name: z.string().min(1).max(100),
  email: z.string().email(),
  company: z.string().optional(),
  message: z.string().min(20).max(2000),
});

export async function submitContactForm(formData: z.infer<typeof ContactSchema>) {
  const headersList = await headers();
  const ip = headersList.get('x-forwarded-for') ?? 'unknown';

  const rateCheck = await checkRateLimit(ip, 'contact', 3, 3600, 3600);
  if (!rateCheck.allowed) return { success: false, error: 'rate_limited' as const };

  const parsed = ContactSchema.safeParse(formData);
  if (!parsed.success) return { success: false, error: 'validation_failed' as const };

  const { error } = await adminSupabase.from('contact_submissions').insert([
    {
      ...parsed.data,
      status: 'unread',
      email_delivered: false,
      ip_hash: hashIp(ip),
      user_agent: headersList.get('user-agent') ?? '',
    },
  ]);

  if (error) return { success: false, error: 'db_error' as const };
  return { success: true };
}
